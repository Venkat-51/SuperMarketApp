"""
fetch_product_images.py  (v2 - ALL PRODUCTS)
---------------------------------------------
Uses LangChain + DuckDuckGo Image Search to find real product image URLs
for ALL products in products.ts, then auto-patches the file in place.

Requirements:
    pip install langchain langchain-community ddgs
"""

import io
import json
import re
import sys
import time
from pathlib import Path

# Force UTF-8 on Windows terminals
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from langchain_community.tools import DuckDuckGoSearchResults

# -- Paths
SCRIPT_DIR  = Path(__file__).parent
PRODUCTS_TS = SCRIPT_DIR.parent / "frontend" / "src" / "app" / "data" / "products.ts"
LOG_FILE    = SCRIPT_DIR / "image_fetch_log.json"

# -- Domains to skip (non-product / unreliable sources)
SKIP_DOMAINS = {
    "unsplash.com", "pexels.com", "pixabay.com", "wallpaperaccess.com",
    "shutterstock.com", "istockphoto.com", "gettyimages.com",
    "wikimedia.org", "wikipedia.org", "twitter.com", "facebook.com",
    "instagram.com", "youtube.com", "pinterest.com",
}

# Trusted Indian e-commerce / product image CDNs (prioritised)
TRUSTED_DOMAINS = {
    "zeptonow.com", "blinkit.com", "swiggy.com", "bigbasket.com",
    "grofers.com", "jiomart.com", "flipkart.com", "amazon.in",
    "imimg.com", "snapdeal.com", "nykaa.com", "1mg.com",
}

# -- LangChain DuckDuckGo Image Search tool
search_tool = DuckDuckGoSearchResults(
    backend="images",
    num_results=10,
    output_format="list",
)


def is_image_url(url: str) -> bool:
    url_lower = url.lower().split("?")[0]
    return any(url_lower.endswith(ext) for ext in (".jpg", ".jpeg", ".png", ".webp", ".gif"))


def domain_of(url: str) -> str:
    m = re.search(r"https?://([^/]+)", url)
    return m.group(1).lower() if m else ""


def score_url(url: str) -> int:
    dom = domain_of(url)
    if any(skip in dom for skip in SKIP_DOMAINS):
        return -1
    score = 0
    if any(trusted in dom for trusted in TRUSTED_DOMAINS):
        score += 10
    if is_image_url(url):
        score += 5
    return score


def extract_best_url(results) -> str | None:
    if isinstance(results, str):
        try:
            results = json.loads(results)
        except json.JSONDecodeError:
            matches = re.findall(r"https?://[^\s\"'<>]+", results)
            results = [{"image": m} for m in matches]

    candidates = []
    if isinstance(results, list):
        for item in results:
            if not isinstance(item, dict):
                continue
            for key in ("image", "thumbnail", "link"):
                url = item.get(key, "")
                if url and url.startswith("http"):
                    candidates.append(url)

    if not candidates:
        return None

    scored = [(score_url(u), u) for u in candidates]
    scored.sort(key=lambda x: -x[0])
    best_score, best_url = scored[0]
    return best_url if best_score >= 0 else None


def search_with_retry(product_name: str, max_retries: int = 3) -> str | None:
    queries = [
        f"{product_name} product image buy online India",
        f"{product_name} official product photo",
        f"{product_name} pack image",
    ]
    for i, query in enumerate(queries[:max_retries]):
        try:
            print(f"   Query [{i+1}]: {query}")
            results = search_tool.run(query)
            url = extract_best_url(results)
            if url:
                return url
            time.sleep(1.0)
        except Exception as exc:
            print(f"   [ERROR] {exc}")
            time.sleep(2.0)
    return None


def parse_products_from_ts(ts_path: Path) -> list[dict]:
    text = ts_path.read_text(encoding="utf-8")
    pattern = re.compile(
        r"\{\s*id:\s*'(\d+)'.*?name:\s*'([^']+)'.*?brand:\s*'([^']+)'",
        re.DOTALL,
    )
    products = []
    for m in pattern.finditer(text):
        products.append({"id": m.group(1), "name": m.group(2), "brand": m.group(3)})
    return products


def patch_products_ts(ts_path: Path, results_map: dict) -> int:
    text = ts_path.read_text(encoding="utf-8")
    count = 0
    for pid, new_url in results_map.items():
        pat = re.compile(
            r"(\{\s*id:\s*'" + re.escape(pid) + r"'[^}]*?image:\s*')(https?://[^']+)(')",
            re.DOTALL,
        )
        new_text, n = pat.subn(lambda m, u=new_url: m.group(1) + u + m.group(3), text)
        if n > 0:
            text = new_text
            count += n
    ts_path.write_text(text, encoding="utf-8")
    return count


def main():
    print("=" * 65)
    print("  SuperMarket APP - Bulk Product Image Fetcher (ALL PRODUCTS)")
    print("  Powered by LangChain + DuckDuckGo")
    print("=" * 65)
    print(f"\n  Source: {PRODUCTS_TS}")
    print(f"  Log:    {LOG_FILE}\n")

    if not PRODUCTS_TS.exists():
        print(f"[FATAL] products.ts not found at: {PRODUCTS_TS}")
        sys.exit(1)

    products = parse_products_from_ts(PRODUCTS_TS)
    print(f"  Found {len(products)} products to process.\n")

    results_map = {}
    failed = []

    for idx, product in enumerate(products, 1):
        pid  = product["id"]
        name = product["name"]
        brand = product["brand"]
        print(f"\n[{idx:02d}/{len(products)}] {name} (brand: {brand})")

        url = search_with_retry(name)
        if url:
            results_map[pid] = url
            print(f"   --> {url}")
        else:
            print(f"   [SKIP] No valid image found for: {name}")
            failed.append(name)

        time.sleep(2.0)

    print("\n" + "=" * 65)
    print("  Patching products.ts ...")
    patched = patch_products_ts(PRODUCTS_TS, results_map)
    print(f"  {patched} image URLs updated in products.ts")

    log = {
        "total": len(products),
        "found": len(results_map),
        "failed": len(failed),
        "results": results_map,
        "failed_products": failed,
    }
    LOG_FILE.write_text(json.dumps(log, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  Log saved to: {LOG_FILE}")

    print("\n" + "=" * 65)
    print("  SUMMARY")
    print("=" * 65)
    print(f"  Total products   : {len(products)}")
    print(f"  Images found     : {len(results_map)}")
    print(f"  Failed / skipped : {len(failed)}")
    if failed:
        print("\n  Products with no image found:")
        for name in failed:
            print(f"    - {name}")

    print("\n  [DONE] products.ts has been updated!\n")


if __name__ == "__main__":
    main()

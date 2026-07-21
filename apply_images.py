"""
Reads product_extra_images.json and patches products.ts to add 
images?: [front, back, side] arrays to each product entry.
"""
import json
import re

JSON_PATH = r"c:\Users\venkat\OneDrive\Desktop\SuperMarket APP\product_extra_images.json"
TS_PATH   = r"c:\Users\venkat\OneDrive\Desktop\SuperMarket APP\frontend\src\app\data\products.ts"

with open(JSON_PATH, encoding="utf-8") as f:
    img_data = json.load(f)

with open(TS_PATH, encoding="utf-8") as f:
    content = f.read()

def escape_ts(url: str) -> str:
    return url.replace("'", "\\'")

patched = 0
for pid, imgs in img_data.items():
    back = escape_ts(imgs.get("back", ""))
    side = escape_ts(imgs.get("side", ""))
    if not back and not side:
        continue

    # Match the product line with this id, e.g.:  { id: '1',  ...inStock: true },
    # We insert  images: ['<front>', '<back>', '<side>'],  before inStock
    pattern = re.compile(
        r"(\{[^}]*?id:\s*'" + re.escape(pid) + r"'[^}]*?)(,\s*inStock:\s*true\s*\})",
        re.DOTALL
    )
    def replacer(m, back=back, side=side):
        body = m.group(1)
        # Extract the front image from the line
        img_match = re.search(r"image:\s*'([^']+)'", body)
        front = img_match.group(1) if img_match else ""
        # Only add if not already there
        if "images:" in body:
            return m.group(0)
        return body + f",  images: ['{escape_ts(front)}', '{back}', '{side}']" + m.group(2)
    
    new_content, n = pattern.subn(replacer, content)
    if n:
        content = new_content
        patched += 1
        print(f"  OK Product {pid}")
    else:
        print(f"  MISS Product {pid}")

with open(TS_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nDone! Patched {patched} products in products.ts")

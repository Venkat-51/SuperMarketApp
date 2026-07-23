import fs from 'fs';

// NOTE: Set this environment variable before running, or paste your key here
const SERPAPI_KEY = process.env.SERPAPI_API_KEY || 'YOUR_SERPAPI_KEY';

// Add the basic details of the products you want to generate
const inputProducts = [
  { name: 'Maggi 2-Minute Noodles', brand: 'Nestle', price: 12, mrp: 14, weight: '70g', category: 'Snacks' },
  { name: 'Lays India\'s Magic Masala', brand: 'Lays', price: 20, mrp: 20, weight: '50g', category: 'Snacks' },
  // Add as many items as you want here!
];

async function fetchImages(productName) {
  try {
    const query = encodeURIComponent(productName);
    const url = `https://serpapi.com/search?engine=google&q=${query}&tbm=isch&api_key=${SERPAPI_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.images_results && data.images_results.length > 0) {
      // Get the first 3 images
      return data.images_results.slice(0, 3).map(res => res.original);
    }
  } catch (error) {
    console.error(`Error fetching images for ${productName}:`, error);
  }
  return [];
}

// Helper to pad strings for neat alignment
function padString(str, length) {
  return (str + ' '.repeat(Math.max(0, length - str.length)));
}

async function generate() {
  if (SERPAPI_KEY === 'YOUR_SERPAPI_KEY') {
    console.error('ERROR: Please set your SERPAPI_KEY in the script or via environment variable.');
    return;
  }

  console.log('Fetching images from SerpAPI and generating formatted code...');
  let output = 'export const generatedProducts = [\n';
  
  for (let i = 0; i < inputProducts.length; i++) {
    const product = inputProducts[i];
    console.log(`[${i+1}/${inputProducts.length}] Fetching: ${product.name}...`);
    
    const images = await fetchImages(product.name);
    const mainImage = images.length > 0 ? images[0] : '';
    
    // Formatting the array like ['url1', 'url2', 'url3']
    const imagesArrayStr = `[${images.map(img => `'${img}'`).join(', ')}]`;
    
    const id = (i + 100).toString(); // Start IDs from 100 or wherever you need
    
    // Formatting exactly as requested
    const idStr = padString(`id: '${id}',`, 12);
    const nameStr = padString(`name: '${product.name}',`, 50);
    const brandStr = padString(`brand: '${product.brand}',`, 25);
    const imageStr = padString(`image: '${mainImage}',`, 120);
    const priceStr = padString(`price: ${product.price},`, 12);
    const mrpStr = padString(`mrp: ${product.mrp},`, 11);
    const weightStr = padString(`weight: '${product.weight}',`, 18);
    const categoryStr = padString(`category: '${product.category}',`, 22);
    const imagesListStr = padString(`images: ${imagesArrayStr},`, 150);
    
    const line = `  { ${idStr} ${nameStr} ${brandStr} ${imageStr} ${priceStr} ${mrpStr} ${weightStr} ${categoryStr} ${imagesListStr} inStock: true },`;
    
    output += line + '\n';
  }
  
  output += '];\n';
  
  fs.writeFileSync('generated_products.ts', output);
  console.log('\n✅ Done! The formatted code has been saved to generated_products.ts');
  console.log('You can now copy its contents into your main products.ts file.');
}

generate();

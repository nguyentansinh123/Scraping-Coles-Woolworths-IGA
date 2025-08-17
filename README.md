🛒 Coles Scraper

This script scrapes product data (title, price, image, and product ID) from Coles online.
It supports both specials (half-price) and normal product searches since the UI structure is the same.

✨ Features

Scrapes all pages of results (from page 1 → last page).

Collects product details:

✅ Title

✅ Price

✅ Image URL

✅ Product ID (from product link)

Handles location prompts automatically using a set geolocation (Sydney by default).

Saves scraped data to items.json.

📦 Requirements

Node.js (>= 16)

npm or yarn

🚀 Setup

Clone this repo or copy the script.

Install dependencies:

npm install puppeteer-extra puppeteer-extra-plugin-stealth


Run the script:

node coles-scraper.js

⚙️ Configuration

URL:

Specials:

await page.goto('https://www.coles.com.au/on-special?...')


Normal search:

await page.goto('https://www.coles.com.au/search/products?q=milk')


Location:
The script sets Sydney by default:

await page.setGeolocation({ latitude: -33.8688, longitude: 151.2093 })


🔹 You can update this to the user’s region or ask for input.

📂 Output

Results are stored in items.json as an array of objects:

[
  {
    "title": "Coles Full Cream Milk 2L",
    "price": "3.10",
    "image": "https://...jpg",
    "productId": "/product/coles-full-cream-milk-2l-123456"
  },
  ...
]


The productId can be used to build links to single product pages.

🔒 Notes

Coles requires a location to show availability & pricing.

For production apps, consider:

✅ Asking the user for their postcode/suburb

✅ Running scrapers periodically and caching results

✅ Respecting Coles’ terms of service
-------------------------------------------------------------------------------------------------------

🛒 Coles Product Detail Scraper

This script scrapes detailed information from a single Coles product page, including:

Product title, price, and savings badge (if on sale)

All images in the thumbnail gallery

Nutritional information per 100g, per serving, and %DI

Ingredients, if listed

Product disclaimers (general & price)

Retail & promotional limits

Product code / ID

It’s built on Puppeteer with StealthPlugin, which helps bypass bot detection.

✨ Features

Scrapes full product details for a single product page.

Handles location prompts automatically (Sydney default).

Returns structured data for nutrition, ingredients, and disclaimers.

Console logs the results (can be saved to JSON for app use).

📦 Requirements

Node.js (>=16)

npm

Install dependencies:

npm install puppeteer-extra puppeteer-extra-plugin-stealth

🚀 Running the Script

Replace the URL in:

await page.goto(
  "https://www.coles.com.au/product/la-espanola-extra-virgin-olive-oil-1l-5833557?pid=homepage_featurerow_halfprice",
  { waitUntil: "load" }
);


with any single product page URL.

Run the script:

node product-detail-scraper.js


Console output will show:

title, price, saveAmount

imageUrls array

nutrition array of objects

ingredients string

Disclaimers, retail limits, promotional limits, and product code

⚙️ Output Example
{
  "title": "La Española Extra Virgin Olive Oil 1L",
  "price": "$15.00",
  "saveAmount": "50% Off",
  "imageUrls": ["https://...", "https://..."],
  "nutrition": [
    { "nutrient": "Energy", "per100g": "3700kJ", "perServing": "1850kJ", "pctDI": "22%" },
    ...
  ],
  "ingredients": "Olive Oil",
  "productDetailDisclaimer": "Always check product labels.",
  "productPriceDisclaimer": "Prices may vary by store.",
  "retailLimit": "4",
  "promotionalLimit": "2",
  "productCode": "5833557"
}

🧩 Notes

The script currently logs data to console, but you can save to JSON for backend integration:

await fs.writeFile('product.json', JSON.stringify(data, null, 2), 'utf8');


Ingredients scraping is currently filtering for “Cheese” as an example; you can adjust the logic for other products.

Can be extended to loop through multiple product links to build a complete database for your app.

Add support for headless mode (headless: true) when stable.

Integrate into your app backend to serve products via API.

********** It is the same concept for woolworth and IGA **********

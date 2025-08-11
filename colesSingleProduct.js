import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { setTimeout } from "node:timers/promises";
import fs from "fs/promises";

puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--enable-features=NetworkService,NetworkServiceInProcess"],
  });
  const page = await browser.newPage();

  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://www.coles.com.au", [
    "geolocation",
  ]);

  await page.setGeolocation({ latitude: -33.8688, longitude: 151.2093 });
  console.log("Running tests…");

  await page.goto(
    "https://www.coles.com.au/product/la-espanola-extra-virgin-olive-oil-1l-5833557?pid=homepage_featurerow_halfprice",
    { waitUntil: "load" }
  );
  await setTimeout(2000);

  const title = await page.$eval('.product__title', el => el.textContent.trim());
  const price = await page.$eval('.price__value',   el => el.textContent.trim());
  const saveAmount = await page.$eval('.badge-label', el => el.textContent.trim());

  const imageUrls = await page.$$eval('.thumbnail-container > img',imgs => imgs.map(img => img.getAttribute('src')));

    const nutrition = await page.$$eval(
    '#nutritional-information-control table tbody tr',
    rows => rows.map(row => {
      const cols = Array.from(
        row.querySelectorAll('th div, td div'),
        div => div.textContent.trim()
      )
      return {
        nutrient: cols[0],
        per100g:   cols[1],
        perServing: cols[2],
        pctDI:     cols[3]
      }
    })
  )

  const ingredients = await page.$$eval(
  '.coles-targeting-AccordionAccordionItemContentContainer > div',
   panels => {
     return panels
       .map(p => p.textContent.trim())
       .find(txt => txt.startsWith('Cheese')) || ''
   }
 )

  // scrape product disclaimers
 const productDetailDisclaimer = await page.$eval(
   '[data-testid="product-detail-disclaimer"]',
   el => el.textContent.trim()
 )
 const productPriceDisclaimer = await page.$eval(
   '[data-testid="product-price-disclaimer"]',
   el => el.textContent.trim()
 )
 const retailLimit = await page.$eval(
   '[data-testid="retail-limit"]',
   el => el.textContent.replace('Retail limit:', '').trim()
 )
 const promotionalLimit = await page.$eval(
   '[data-testid="promotional-limit"]',
   el => el.textContent.replace('Promotional limit:', '').trim()
 )
 const productCode = await page.$eval(
   '[data-testid="product-code"]',
   el => el.textContent.replace('Code:', '').trim()
 )

 console.log('Detail disclaimer:', productDetailDisclaimer)
 console.log('Price disclaimer:',  productPriceDisclaimer)
 console.log('Product code:',       productCode)
 console.log('Retail limit:',       retailLimit)
 console.log('Promo limit:',        promotionalLimit)

 console.log('Ingredients:', ingredients)

  console.log(nutrition)

  console.log(imageUrls);
  console.log(title);
  console.log(price);
  console.log(saveAmount);

  await browser.close();
})();

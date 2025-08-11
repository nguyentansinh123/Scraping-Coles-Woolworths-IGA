import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import {setTimeout} from "node:timers/promises";
import fs from 'fs/promises'

puppeteer.use(StealthPlugin())

;(async () => {
  const browser = await puppeteer.launch({ headless: false ,
    args: [
      '--enable-features=NetworkService,NetworkServiceInProcess'
    ]})
  const page = await browser.newPage()
  
  const context = browser.defaultBrowserContext()
  await context.overridePermissions('https://www.coles.com.au', ['geolocation'])
  
  await page.setGeolocation({ latitude: -33.8688, longitude: 151.2093 })
  console.log('Running tests…')

  await page.goto(
    'https://www.coles.com.au/on-special?pid=homepage_cat_explorer_specials&page=136',
    { waitUntil: 'load' }
  )
  await setTimeout(2000);

  
  let items = []
  
  while (true) {
      const productHandles = await page.$$('[data-testid="product-tile"]');
      let title = "Null";
      let price = "Null";
      let image = "Null";
      let productId = "Null"

  for (const producthandle of productHandles) {
    try {
        title = await page.evaluate((el) =>el.querySelector(".product__title").textContent,producthandle);
    } catch (error) {
        
    }
    try {
        price = await page.evaluate((el) =>el.querySelector(".price__value").textContent,producthandle);
    } catch (error) {
        
    }
    try {
        image = await page.evaluate((el) =>el.querySelector('[data-testid="product-image"]').getAttribute("src"),producthandle);
    } catch (error) {
        
    }
    try {
        productId = await page.evaluate((el) =>el.querySelector(".product__link.product__image").getAttribute("href"),producthandle);
    } catch (error) {
        
    }
    if (title !== "Null") {
        items.push({ title, price, image,productId });
    }
  }
   await page.waitForSelector("#pagination-button-next", { visible: true });
    const isDisabled =await page.$eval(
      "#pagination-button-next",
      el => el.getAttribute('aria-disabled') === 'true'
    )

    if (isDisabled) {
      console.log('Next button is disabled – end of pages')
      break
    }
    await page.click("#pagination-button-next")
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
}

    console.log(items)
    await fs.writeFile(
   'items.json',
   JSON.stringify(items, null, 2),
   'utf8'
 )
    console.log('done')
    await browser.close()
})()
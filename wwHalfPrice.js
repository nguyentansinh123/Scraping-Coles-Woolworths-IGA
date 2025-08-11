import puppeteer from "puppeteer";
import fs from "fs/promises";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  await page.goto(
    "https://www.woolworths.com.au/shop/browse/specials/half-price?icmpid=sm-prnav-sc-halfprice&pageNumber=40",
    { waitUntil: "networkidle2" }
  );

  const nextBtnSelector =
    '#search-content > div > shared-paging > div > div.paging-section > a.paging-next.ng-star-inserted';

  let items = [];

  while (true) {
    await page.waitForSelector("wc-product-tile", {
      visible: true,
      timeout: 10000,
    });

    const productHandles = await page.$$("wc-product-tile");
    for (const productHandle of productHandles) {
      const shadowRoot = await productHandle.evaluateHandle((el) => el.shadowRoot);

      const getText = async (sel) => {
        const h = await shadowRoot.$(sel);
        return h ? h.evaluate((el) => el.textContent.trim()) : null;
      };

      
      const href = await shadowRoot.$eval("section > div > div.product-tile-group.left > div > div > a",el => el.getAttribute("href"));
      const title = await getText("section .product-title-container a");
      const price = await getText("section .label-price-promotion .primary");
      const originalPrice = await getText("section .label-price-promotion .secondary .was-price");
      const image = await page.evaluate(tile => {
        const img = tile.shadowRoot.querySelector(
          "section > div > div.product-tile-group.left > div > div > a > img"
        );
        return img ? img.getAttribute("src") : null;
      }, productHandle);

      const productId = image
        ? image.split('/').pop().split('.')[0]
        : null;

      items.push({ title, price, originalPrice, image, productId,href });
    }

    const nextBtn = await page.$(nextBtnSelector);
    if (!nextBtn) {
      console.log("Reached last page – no more pages to scrape.");
      break;
    }

    await Promise.all([
      nextBtn.click(),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
  }

  await fs.writeFile("products.json", JSON.stringify(items, null, 2), "utf8");
  console.log("Saved products.json");

  await browser.close();
})();

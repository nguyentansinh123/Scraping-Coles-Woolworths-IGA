import fs from "fs";
import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  await page.goto(
    "https://www.igashop.com.au/specials/263",
    { waitUntil: "load" }
  );

  try {
    await page.waitForSelector("button[data-modal-close]", { timeout: 3000 });
    await page.click("button[data-modal-close]");
    await page.waitForSelector("button[data-modal-close]", { hidden: true });
    console.log("click Successfully");
  } catch {
    console.log("No guest modal to dismiss");
  }

  let items = [];

  while (true) {
    const productButtons = await page.$$('[data-add-to-cart-button="true"]');
    for (const btn of productButtons) {
      let title = "Null",
          quantity = "Null",
          price = "Null",
          image = "Null",
          href = "Null";
      const cardSel = '[data-product-card]';

      // extract product name
      try {
        title = await page.evaluate((el, sel) => {
          const card = el.closest(sel);
          const titleEl = card?.querySelector('a[data-variant="link"] span.line-clamp-3');
          return titleEl?.textContent.trim() ?? null;
        }, btn, cardSel);
      } catch (e) {
        console.log("title error:", e);
      }

      try {
        quantity = await page.evaluate((el, sel) => {
          const card = el.closest(sel);
          const qtyEl = card?.querySelector('a[data-variant="link"] span:nth-of-type(2)');
          return qtyEl?.textContent.trim() ?? null;
        }, btn, cardSel);
      } catch (e) {
        console.log("quantity error:", e);
      }

      try {
        price = await page.evaluate((el, sel) => {
          const card = el.closest(sel);
          const priceEl = card?.querySelector('span.font-bold.leading-none');
          return priceEl?.textContent.trim() ?? null;
        }, btn, cardSel);
      } catch (e) {
        console.log("price error:", e);
      }

      try {
        image = await page.evaluate((el, sel) => {
          const card = el.closest(sel);
          const imgEl = card?.querySelector('img');
          return imgEl?.getAttribute('src') ?? null;
        }, btn, cardSel);
      } catch (e) {
        console.log("image error:", e);
      }

      try {
        href = await page.evaluate((el, sel) => {
          const card = el.closest(sel);
          const linkEl = card?.querySelector('a[data-variant="link"]');
          return linkEl?.getAttribute('href') ?? null;
        }, btn, cardSel);
      } catch (e) {
        console.log("href error:", e);
      }

      if (title && title !== "Null") {
        items.push({ title, quantity, price, image, href });
      }
    }

    const nextBtn = await page.$('a[data-pagination-next]');
    if (!nextBtn) break;
    const disabled = await page.evaluate(el =>
      el.getAttribute('aria-disabled') === 'true', nextBtn
    );
    if (disabled) break;

    await Promise.all([
      nextBtn.click(),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
  }

  fs.writeFileSync(
    "items.json",
    JSON.stringify(items, null, 2),
    "utf-8"
  );
  console.log("Wrote", items.length, "items to items.json");

  await browser.close()
})();
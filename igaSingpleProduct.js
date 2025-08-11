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
    "https://www.igashop.com.au/product/white-wings-cake-mix-layered-vanilla-616181",
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

  let title = null;
  try {
    title = await page.$eval(
      ".line-clamp-3",
      (el) => el.textContent.trim()
    );
  } catch (e) {
    console.log("title error:", e);
  }
  console.log("Title:", title);

  let weight = null;
  try {
    weight = await page.$eval(
      'div.flex.flex-col.items-start.font-bold.text-lg.lg\\:text-2xl.leading-tight.gap-3 span.text-base',
      (el) => el.textContent.trim()
    );
  } catch (e) {
    console.log("weight error:", e);
  }
  console.log("Weight:", weight);

  let galleryImages = [];
  try {
    galleryImages = await page.$$eval("figure.iiz", (figs) =>
      figs.map((fig) => ({
        main: fig.querySelector("img.iiz__img")?.src ?? null,
        zoom: fig.querySelector("img.iiz__zoom-img")?.src ?? null,
      }))
    );
  } catch (e) {
    console.log("gallery images error:", e);
  }

  let thumbnails = [];
  try {
    thumbnails = await page.$$eval(
      "div[data-active-index] button img",
      (imgs) => imgs.map((img) => img.src)
    );
  } catch (e) {
    console.log("thumbnails error:", e);
  }

  let details = null;
  try {
    details = await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll("div"));
      const detailDiv = divs.find(d =>
        d.className.includes("[&_h4]:my-5") &&
        d.className.includes("mb-5")
      );
      return detailDiv ? detailDiv.innerText.trim() : null;
    });
  } catch (e) {
    console.log("details error:", e);
  }

  let ingredients = null;
  try {
    ingredients = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('h3'));
      const ingH3 = headers.find(h => h.textContent.trim() === 'Ingredients');
      const ingDiv = ingH3?.nextElementSibling;
      return ingDiv ? ingDiv.innerText.trim() : null;
    });
  } catch (e) {
    console.log("ingredients error:", e);
  }

  let nutrition = null;
  try {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
                      .find(b => b.textContent.trim() === 'Product Details');
      if (btn) btn.click();
    });
    await page.waitForSelector('table tbody tr', { timeout: 3000 });

    nutrition = await page.$$eval('table tbody tr', rows =>
      rows.map(row => {
        const [nutrientEl, perServeEl, per100gEl] = row.querySelectorAll('td');
        return {
          nutrient: nutrientEl?.innerText.trim() ?? null,
          perServe: perServeEl?.innerText.trim() ?? null,
          per100g:  per100gEl?.innerText.trim() ?? null
        };
      })
    );
  } catch (e) {
    console.log("nutrition error:", e);
  }

  const output = {
    title,
    weight,
    gallery: galleryImages,
    thumbnails,
    details,
    nutrition
  };
  await fs.promises.writeFile(
    "igaS.json",
    JSON.stringify(output, null, 2),
    "utf8"
  );
  console.log("Saved igaS.json");

  await browser.close();
})();
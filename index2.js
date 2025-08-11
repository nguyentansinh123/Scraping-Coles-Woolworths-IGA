import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  await page.goto("https://www.amazon.com.au/s?k=amazonbasics");

  const productHandles = await page.$$(
    ".s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item.s-asin"
  );

  let items = []
  for (const producthandle of productHandles) {
    let title = "Null";
    let price = "Null";
    let image = "Null";
    

    try {
      title = await page.evaluate((el) =>el.querySelector(".s-title-instructions-style > a > h2 > span").textContent,producthandle);
    } catch (error) {
      console.log(error);
    }

    try {
      price = await page.evaluate((el) => el.querySelector("a > span > span.a-offscreen").textContent,producthandle);
    } catch (error) {
      console.log(error);
    }

    try {
      image = await page.evaluate((el) => el.querySelector(".s-image").getAttribute("src"),producthandle);
    } catch (error) {
      console.log(error);
    }
    
    if (title !== "Null"){
      items.push({title, price, image})
    }

  }
  console.log(items);
  
})();

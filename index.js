import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  await page.goto(
    "https://www.amazon.com.au/s?k=amazonbasics&xpid=m_8uk8hwV_lZB"
  ,{
    waitUntil: "load"
  });

  
  let items = [];
  
  let isBtnDisabled = false;
  
  while (!isBtnDisabled) {
    await page.waitForSelector('[data-cel-widget="search_result_2"]');
    const productHandles = await page.$$(
        ".s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item.s-asin"
    );
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

      if (title !== "Null") {
        items.push({ title, price, image });
      }

    }
    await page.waitForSelector("a.s-pagination-next", { visible: true });

    const is_diabled =await page.$('span.s-pagination-item.s-pagination-next.s-pagination-disabled ') != null;
    console.log("a", is_diabled);

    isBtnDisabled = is_diabled;

    if (!is_diabled) {
      page.click("a.s-pagination-next");
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    }
  }
  console.log(items);
  await browser.close()
})();
// a.s-pagination-next
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
    "https://www.woolworths.com.au/shop/productdetails/1123902491/6pcs-crumpet-rings-4-inch-double-rolled-stainless-steel-round-cake-tart-cookie-egg-burger-rings-mo",
    { waitUntil: "networkidle2" }
  );

  let title, price, pricePerQuan, imageUrls, productDetails, nutrition, nutritionNote

  try {title = await page.$eval(".product-title_component_product-title__azQKW",el => el.textContent.trim())
  } catch {
    title = null
  }

  try {
    price = await page.$eval(".product-price_component_price-lead__vlm8f",el => el.textContent.trim())
  } catch {
    price = null
  }

  try {
    pricePerQuan = await page.$eval(".product-unit-price_component_price-cup-string__HdxP0",el => el.textContent.trim())
  } catch {
    pricePerQuan = null
  }

  try {
    imageUrls = await page.$$eval(".image-thumbnails_thumbnails__1iOKe img",imgs => imgs.map(img => img.getAttribute("src"))
    )
  } catch {
    imageUrls = null
  }

  try {
    productDetails = await page.$eval(".text_component_text__ErEDp",el => el.innerText.trim())
  } catch {
    productDetails = null
  }

  try {
    nutrition = await page.$$eval(".nutritional-info_component_nutritional-info-panel__jgVXH ul.nutritional-info_component_nutrition-row__IYE_S",rows => rows.slice(2).map(row => {
    const [nutrientEl, perServingEl, per100gEl] = Array.from(row.querySelectorAll("li"))
        return {
          nutrient:   nutrientEl.textContent.trim(),
          perServing: perServingEl.textContent.trim(),
          per100g:    per100gEl.textContent.trim()
        }
      })
    )
  } catch {
    nutrition = null
  }

  try {
    nutritionNote = await page.$eval(
      ".nutritional-info_component_nutrition-note__zPIVr",
      el => el.innerText.trim()
    )
  } catch {
    nutritionNote = null
  }

  const output = {
    title,
    price,
    pricePerQuan,
    images: imageUrls,
    details: productDetails,
    nutrition,
    nutritionNote
  };

  await fs.writeFile("single.json", JSON.stringify(output, null, 2), "utf8");
  console.log("Saved product.json");

  await browser.close();
})();

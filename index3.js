import puppeteer from 'puppeteer';

(async ()=> {
    const browser = await puppeteer.launch({
        headless: false 
    })
    const page = await browser.newPage({
        headless: false
    })

    await page.goto('https://www.amazon.com.au/s?k=amazonbasics&page=7&xpid=m_8uk8hwV_lZB',{
        waitUntil: "load"
    })
    
    const isDisabled = await page.$$('div > div > span > ul > span.s-pagination-item.s-pagination-next.s-pagination-disabled') !== null;
    
    console.log(isDisabled);
    
    

    await browser.close()
})()
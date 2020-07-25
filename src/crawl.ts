import puppeteer from 'puppeteer';

const crawl = async (callback: Function) => {
    try{
        const browser = await puppeteer.launch({
            defaultViewport: {
                height: 1080,
                width: 1920
            }    
        });
    
        const page = await browser.newPage();
    
        await page.goto('https://www.google.com');
        console.log("navigated to google");
        await page.type('input[title="Search"]', 'chandigarh chair');
    
        const [response] = await Promise.all([
            page.waitForNavigation(), // The promise resolves after navigation has finished
            page.click('input[value="Google Search"]'), // Clicking the link will indirectly cause a navigation        
          ]);
        console.log("About to take a pdf");
        page.pdf({path: "./search.pdf"})
        callback()
    }catch(error){
        console.log(error)
        callback(error);
    }
}

export { crawl };
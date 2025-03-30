const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto("https://www.sarkariresult.com/latestjob/", {
    waitUntil: "networkidle2",
  });

  const jobs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".post a")).map((job) => ({
      title: job.textContent.trim(),
      link: job.href,
    }));
  });

  console.log(jobs);
  await browser.close();
})();

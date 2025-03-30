// const puppeteer = require("puppeteer");

// (async () => {
//   // Launch browser
//   const browser = await puppeteer.launch({ headless: true }); // Change to false if you want to see the browser
//   const page = await browser.newPage();

//   // Set User-Agent to bypass bot detection
//   await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");

//   // Open RRB website
//   await page.goto("https://rrbcdg.gov.in", { waitUntil: "networkidle2" });

//   // Extract job links (Modify selector based on site structure)
//   const jobs = await page.evaluate(() => {
//     return Array.from(document.querySelectorAll("a")).map((link) => ({
//       title: link.innerText.trim(),
//       url: link.href,
//     }));
//   });

//   console.log("RRB Job Listings:", jobs);

//   // Close browser
//   await browser.close();
// })();


const puppeteer = require("puppeteer");
const fs = require("fs");
// const { Parser } = require("json2csv");

(async () => {
  // Launch browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the RRB website
  const url = "https://www.sarkariresult.com/latestjob" //"https://rrbcdg.gov.in/";  // Update this to the correct page you want to scrape
  await page.goto(url, { waitUntil: "domcontentloaded" });

  console.log("Scraping data...");

  // Extract job details
  const jobs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a")).map(link => ({
      title: link.innerText.trim(),
      url: link.href
    }));
  });

  // Filter unwanted data
  const filteredJobs = jobs.filter(job => job.title && job.url.startsWith("http"));

  console.log(`Extracted ${filteredJobs.length} job listings.`);

  // Save as JSON
  fs.writeFileSync("rrb_jobs.json", JSON.stringify(filteredJobs, null, 2));
  console.log(" Data saved to rrb_jobs.json");

  // Save as CSV
  // const parser = new Parser();
  // const csv = parser.parse(filteredJobs);
  // fs.writeFileSync("rrb_jobs.csv", csv);
  console.log(" Data saved to rrb_jobs.csv",filteredJobs);

  // Close browser
  await browser.close();
})();

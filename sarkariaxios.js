const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.sarkariresult.com/latestjob/";
const { setupDatabase } = require('./db/setup');
const { parseJobDetails } = require('./utils/dataProcessor');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'script_db'
};

async function getJobLinks(url) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const jobs = [];

    for (const element of $("ul li a")) {
      const title = $(element).text().trim();
      let link = $(element).attr("href");

      if (link && !link.startsWith("http")) {
        link = new URL(link, url).href;
      }

      jobs.push({ title, link });
      
      // Check and insert job using async/await
      const [results] = await connection.query('SELECT * FROM latest_job_data WHERE title = ?', [title]);
      
      if (results.length === 0) {
        await connection.query('INSERT INTO latest_job_data (title, url) VALUES (?, ?)', [title, link]);
      }
    }

    let link_page = jobs//.slice(101, 102);
    
    // Process jobs sequentially using for...of
    for (const element of link_page) {
      await scrapeJobDetails(element.link);
    }

    return jobs;
  } catch (error) {
    console.error("Error fetching job links:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function scrapeJobDetails(url) {
console.log(url,'url');
  let postDate = "";
  let shortInformation = "";
  let importantDates = [];
  let applicationFee = [];
  let ageLimit = [];
  let vacancyDetails = [];
  let eligibility = [];
  let stateWiseVacancy = [];
  let howToApply = "";
  let importantLinks = [];
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const $ = cheerio.load(data);
    // Extract Job Title
    const title = $("h1").text().trim() || $("title").text().trim();
    let details = [];
    $("table").each((index, table) => {
      let sectionData = [];
      $(table)
        .find("tr")
        .each((_, row) => {
          let rowData = [];
          $(row)
            .find("td, th")
            .each((_, cell) => {
              rowData.push($(cell).text().trim());
            });
          if (rowData.length > 0) {
            sectionData.push(rowData);
          }
        });
      if (sectionData.length > 0) {
        details.push(sectionData);
      }
    });
    // Define variables for database insertion
 
    // Parse details array to extract relevant information

    details.forEach(section => {
      section.forEach(row => {
        if (row[0].includes("Post Date / Update:")) {
          postDate = row[1];
        } else if (row[0].includes("Short Information :")) {
          shortInformation = row[1];
        } else if (row[0].includes("Important Dates")) {
          importantDates = section.slice(1);
        } else if (row[0].includes("Application Fee")) {
          applicationFee = section.slice(1);
        } else if (row[0].includes("Age Limit")) {
          ageLimit = section.slice(1);
        } else if (row[0].includes("Vacancy Details")) {
          vacancyDetails = section.slice(1);
        } else if (row[0].includes("Eligibility")) {
          eligibility = section.slice(1);
        } else if (row[0].includes("State Wise Vacancy Details")) {
          stateWiseVacancy = section.slice(1);
        } else if (row[0].includes("How to Fill")) {
          howToApply = row[1];
        } else if (row[0].includes("Some Useful Important Links")) {
          importantLinks = section.slice(1);
        }
      });
    });
    // Process the scraped data
    const jobData = parseJobDetails(details);
    // Save to database
    await saveJobData(jobData);
    
    console.log('Job details processed and saved successfully');
    
  } catch (error) {
    console.error("Erroryyy:", error.message);
  }
}

async function saveJobData(jobData) {
  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.beginTransaction();
    
    // Insert main job post
    const [results] = await connection.query('SELECT * FROM job_posts WHERE title = ?', jobData.title);
console
    if(results.length > 0) {
      return;

    }else{
    await connection.query(
      'INSERT INTO job_posts SET ?',
      {
        title: jobData.title,
        organization: jobData.organization,
        post_date: jobData.postDate,
        short_information: jobData.shortInfo,
        total_vacancies: jobData.totalVacancies,
        min_age: jobData.minAge,
        max_age: jobData.maxAge,
        age_limit_date: jobData.ageLimitDate
      }
    );
  }
    // const jobId = jobResult.insertId;
    
    // Insert state vacancies
    // for (const vacancy of jobData.stateVacancies) {
    //   await connection.query(
    //     'INSERT INTO state_vacancies SET ?',
    //     {
    //       job_post_id: jobId,
    //       state: vacancy.state,
    //       language: vacancy.language,
    //       ur_count: vacancy.ur,
    //       ews_count: vacancy.ews,
    //       obc_count: vacancy.obc,
    //       sc_count: vacancy.sc,
    //       st_count: vacancy.st,
    //       total_count: vacancy.total
    //     }
    //   );
    // }
    
    await connection.commit();
    console.log('Job details saved successfully to the database');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

// Initialize the application
async function init() {
  try {
    await setupDatabase();
    await getJobLinks(url);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

init().catch(console.error);

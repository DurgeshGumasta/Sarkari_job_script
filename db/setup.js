const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'script_db'
};

// Create database tables
async function setupDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS job_posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        organization VARCHAR(255) NOT NULL,
        post_date DATETIME,
        short_information TEXT,
        total_vacancies INT,
        min_age INT,
        max_age INT,
        age_limit_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS important_dates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        job_post_id INT,
        event_name VARCHAR(100),
        event_date DATE,
        FOREIGN KEY (job_post_id) REFERENCES job_posts(id)
      )
    `);

    // Add other table creation queries...

    console.log('Database setup completed successfully');
    await connection.end();
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

module.exports = { setupDatabase }; 
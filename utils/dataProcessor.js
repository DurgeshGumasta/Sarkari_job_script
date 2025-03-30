// Function to parse and clean job details
function parseJobDetails(details) {
  const jobData = {
    title: '',
    organization: '',
    postDate: null,
    shortInfo: '',
    totalVacancies: null,
    minAge: null,
    maxAge: null,
    ageLimitDate: null,
    importantDates: [],
    applicationFees: [],
    vacancyDetails: []
  };

  details.forEach(section => {
    if (Array.isArray(section)) {
      section.forEach(item => {
        if (Array.isArray(item) && item.length >= 2) {
          const header = item[0].trim();
          const content = item[1];
          switch(header) {
            case 'Name of Post:':
              jobData.title = content.trim();
              break;
            case 'Post Date / Update:':
              jobData.postDate = parseDate(content);
              break;
            case 'Short Information :':
              jobData.shortInfo = content.trim();
              break;
          }

          // Parse Important Dates
          if (content && content.includes('Important Dates')) {
            const dates = content.split('\n').filter(line => line.includes(':'));
            jobData.importantDates = dates.map(date => {
              const [name, value] = date.split(':').map(s => s.trim());
              return {
                eventName: name,
                eventDate: parseDate(value)
              };
            });
          }

          // Parse Age Limits
          if (content && content.includes('Age Limit')) {
            const ageLines = content.split('\n');
            ageLines.forEach(line => {
              if (line.includes('Minimum Age')) {
                console.log('min age',line);
                jobData.minAge = parseInt(line.match(/\d+/)[0]);
              }
              if (line.includes('Maximum Age')) {
                console.log('max age',line);
                jobData.maxAge = parseInt(line.match(/\d+/)[0]);
              }
              if (line.includes('as on')) {
                jobData.ageLimitDate = line.match(/\d{2}\/\d{2}\/\d{4}/)[0];
              }
            });
          }

          // Parse Total Vacancies
          if (content && content.includes('Vacancy Details Total')) {
            const match = content.match(/Total\s*:\s*(\d+)/);
            if (match) {
                console.log('vacancy',match);
              jobData.totalVacancies = parseInt(match[1]);
            }
          }
        }
      });
    }
  });

  return jobData;
}

// Helper function to convert month name to number
function getMonthNumber(month) {
  const months = {
    'January': '01',
    'February': '02',
    'March': '03',
    'April': '04',
    'May': '05',
    'June': '06',
    'July': '07',
    'August': '08',
    'September': '09',
    'October': '10',
    'November': '11',
    'December': '12'
  };
  return months[month] || '01';
}

// Helper function to convert 12-hour time to 24-hour format
function convertTime(timeStr) {
  if (!timeStr) return '00:00:00';
  
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  
  hours = parseInt(hours);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}

function parseDate(dateString) {
  try {
    const [date, time] = dateString.split('|').map(s => s.trim());
    const [day, month, year] = date.split(' ');
    return `${year}-${getMonthNumber(month)}-${day.padStart(2, '0')} ${convertTime(time)}`;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

module.exports = { parseJobDetails }; 
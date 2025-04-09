const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    // Scrape from multiple Caribbean event sources
    const sources = [
      {
        name: "Caribbean Events",
        url: "https://www.caribbeanevents.com/upcoming-events/",
        selector: ".event-item"
      },
      {
        name: "Visit Caribbean",
        url: "https://www.visitthecaribbean.com/events/",
        selector: ".event-card"
      }
    ];

    const events = [];
    
    for (const source of sources) {
      const response = await axios.get(source.url);
      const $ = cheerio.load(response.data);
      
      $(source.selector).each((i, el) => {
        const title = $(el).find('.event-title').text().trim();
        const date = $(el).find('.event-date').text().trim();
        const location = $(el).find('.event-location').text().trim();
        const url = $(el).find('a').attr('href');
        
        if (title && date) {
          events.push({
            source: source.name,
            title,
            date,
            location,
            url: url.startsWith('http') ? url : new URL(url, source.url).href
          });
        }
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(events.slice(0, 10)) // Limit to 10 events
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch events" })
    };
  }
};
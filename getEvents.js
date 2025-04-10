const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const parser = new Parser();

exports.handler = async () => {
  try {
    const events = [
      ...await scrapeCaribbeanEvents(),
      ...await fetchRSSEvents()
    ];

    // Sort by date (newest first)
    const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify(sortedEvents.slice(0, 15)) // Return top 15 events
    };
  } catch (error) {
    console.error('Event fetch error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Failed to fetch events",
        details: error.message 
      })
    };
  }
};

// Improved scraping function
async function scrapeCaribbeanEvents() {
  const sources = [
    {
      name: "St. Kitts Tourism",
      url: "https://www.stkittstourism.kn/events",
      selectors: {
        container: ".event-item",
        title: "h3",
        date: ".event-date",
        location: ".event-location",
        link: "a"
      }
    },
    {
      name: "Caribbean Events",
      url: "https://www.caribbeanevents.com/upcoming-events/",
      selectors: {
        container: ".event-item",
        title: ".event-title",
        date: ".event-date",
        location: ".event-location",
        link: "a"
      }
    }
  ];

  const events = [];
  
  for (const source of sources) {
    try {
      const { data } = await axios.get(source.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 5000
      });
      const $ = cheerio.load(data);
      
      $(source.selectors.container).each((i, el) => {
        try {
          const title = $(el).find(source.selectors.title).text().trim();
          const dateText = $(el).find(source.selectors.date).text().trim();
          const location = $(el).find(source.selectors.location).text().trim() || "Caribbean";
          const url = $(el).find(source.selectors.link).attr('href');
          
          if (title && dateText) {
            // Convert date text to ISO format
            const date = parseDate(dateText) || new Date().toISOString();
            
            events.push({
              source: source.name,
              title,
              date,
              location,
              url: url ? (url.startsWith('http') ? url : new URL(url, source.url).href) : source.url,
              type: "scraped"
            });
          }
        } catch (e) {
          console.log(`Error parsing event from ${source.name}:`, e);
        }
      });
    } catch (error) {
      console.error(`Failed to scrape ${source.name}:`, error.message);
      continue;
    }
  }
  
  return events;
}

// RSS feed integration
async function fetchRSSEvents() {
  const feeds = [
    "https://www.caribbeannewsnow.com/events/feed/",
    "https://eventbrite-caribbean.rss.acast.com/events"
  ];

  const events = [];
  
  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      
      feed.items.forEach(item => {
        try {
          // Extract location from categories or content
          const location = item.categories?.[0] || 
                          item.content?.match(/Location: (.*?)(<br|\n|$)/i)?.[1] || 
                          "Caribbean";
                          
          events.push({
            source: feed.title || "Caribbean RSS Feed",
            title: item.title,
            date: item.isoDate || item.pubDate,
            location: location.trim(),
            url: item.link,
            description: item.contentSnippet,
            type: "rss"
          });
        } catch (e) {
          console.log(`Error parsing RSS item from ${feedUrl}:`, e);
        }
      });
    } catch (error) {
      console.error(`Failed to fetch RSS feed ${feedUrl}:`, error.message);
      continue;
    }
  }
  
  return events;
}

// Helper to parse various date formats
function parseDate(dateStr) {
  const formats = [
    'MMMM D, YYYY',    // "January 15, 2023"
    'MMM D, YYYY',     // "Jan 15, 2023"
    'D MMMM YYYY',     // "15 January 2023"
    'YYYY-MM-DD',      // ISO format
    'DD/MM/YYYY'       // European format
  ];
  
  for (const format of formats) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  
  return null;
}

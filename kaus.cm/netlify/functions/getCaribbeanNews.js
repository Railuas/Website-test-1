const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async (event, context) => {
  try {
    // Scrape from multiple Caribbean news sources
    const sources = [
      {
        name: "Caribbean News Global",
        url: "https://www.caribbeannewsglobal.com/category/caribbean-news/",
        selector: ".td_module_10"
      },
      {
        name: "Caribbean National Weekly",
        url: "https://www.caribbeannationalweekly.com/category/caribbean-news/",
        selector: ".mvp-blog-story-wrap"
      },
      {
        name: "Jamaica Observer",
        url: "https://www.jamaicaobserver.com/latest-news/",
        selector: ".main-story, .secondary-story"
      }
    ];

    const articles = [];
    
    for (const source of sources) {
      const response = await axios.get(source.url);
      const $ = cheerio.load(response.data);
      
      $(source.selector).each((i, el) => {
        const title = $(el).find('h3 a').text().trim() || $(el).find('h2 a').text().trim();
        const url = $(el).find('a').attr('href');
        const image = $(el).find('img').attr('src');
        const excerpt = $(el).find('p').first().text().trim();
        
        if (title && url) {
          articles.push({
            source: source.name,
            title,
            url: url.startsWith('http') ? url : new URL(url, source.url).href,
            image: image ? (image.startsWith('http') ? image : new URL(image, source.url).href : null,
            excerpt,
            date: new Date().toISOString()
          });
        }
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(articles.slice(0, 20)) // Limit to 20 articles
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch news" })
    };
  }
};
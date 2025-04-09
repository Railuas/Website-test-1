const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const parser = new Parser();

exports.handler = async () => {
  try {
    // 1. Fetch RSS feeds
    const rssFeeds = [
      'https://jamaica-gleaner.com/rss',
      'https://trinidadexpress.com/rss'
    ];
    const rssResults = await Promise.all(
      rssFeeds.map(url => parser.parseURL(url).catch(e => null))
    );

    // 2. Scrape a news site
    const scrapeUrl = 'https://caribbeannewsnow.com';
    const { data } = await axios.get(scrapeUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const scrapedArticles = $('article').map((i, el) => ({
      title: $(el).find('h2').text().trim(),
      link: new URL($(el).find('a').attr('href'), scrapeUrl).toString()
    })).get();

    // 3. Combine all results
    const allNews = [
      ...rssResults.flatMap(feed => 
        feed?.items.map(item => ({
          type: 'rss',
          source: feed.title,
          title: item.title,
          link: item.link
        })) || []
      ),
      ...scrapedArticles.map(article => ({
        type: 'scraped',
        source: 'Caribbean News Now',
        ...article
      }))
    ];

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify(allNews)
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
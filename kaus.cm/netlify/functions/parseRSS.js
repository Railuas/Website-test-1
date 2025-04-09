const Parser = require('rss-parser');
const parser = new Parser();

exports.handler = async () => {
  try {
    // List of Caribbean news RSS feeds (replace with actual URLs)
    const feeds = [
      'https://jamaica-gleaner.com/rss',
      'https://trinidadexpress.com/rss',
      'https://caribbeannewsglobal.com/feed'
    ];

    // Fetch all feeds in parallel
    const news = await Promise.all(
      feeds.map(url => parser.parseURL(url).catch(e => null))
    );

    // Combine and format results
    const allItems = news.flatMap(feed => 
      feed ? feed.items.map(item => ({
        source: feed.title,
        title: item.title,
        link: item.link,
        date: item.pubDate || new Date().toISOString(),
        snippet: item.contentSnippet?.substring(0, 100) + '...' || ''
      })) : []
    );

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify(allItems)
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
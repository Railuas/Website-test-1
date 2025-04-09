const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async (event) => {
  try {
    const { data } = await axios.get('https://example-news-site.com', {
      headers: { 'User-Agent': 'Netlify Function' },
    });
    const $ = cheerio.load(data);
    const articles = [];
    
    $('article').each((i, el) => {
      articles.push({
        title: $(el).find('h2').text(),
        url: $(el).find('a').attr('href'),
      });
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articles),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
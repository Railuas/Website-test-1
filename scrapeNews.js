const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async () => {
  try {
    // Target news site (replace with actual URL)
    const url = 'https://caribbeannewsnow.com';
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);

    // Extract headlines and links (adjust selectors as needed)
    const articles = [];
    $('article').each((i, el) => {
      articles.push({
        title: $(el).find('h2').text().trim(),
        link: new URL($(el).find('a').attr('href'), url).toString(),
        snippet: $(el).find('p').text().substring(0, 150) + '...'
      });
    });

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify(articles)
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
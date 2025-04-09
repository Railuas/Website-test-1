const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const article = JSON.parse(event.body);
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    
    await client.connect();
    const db = client.db('kaus-news');
    const collection = db.collection('articles');
    
    const result = await collection.insertOne({
      ...article,
      date: new Date(),
      status: 'pending'
    });
    
    await client.close();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: result.insertedId })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to submit article" })
    };
  }
};
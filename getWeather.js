const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    const { city = "Basseterre" } = event.queryStringParameters;
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        location: data.location.name,
        country: data.location.country,
        temp_c: data.current.temp_c,
        condition: data.current.condition.text,
        wind_kph: data.current.wind_kph,
        humidity: data.current.humidity,
        uv: data.current.uv,
        icon: data.current.condition.icon
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch weather data" })
    };
  }
};
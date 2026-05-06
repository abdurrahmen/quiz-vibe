
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API key found');
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);
    console.log('Available models:');
    response.data.models.forEach(m => console.log(m.name));
  } catch (e) {
    console.error('Failed to list models:', e.response ? e.response.data : e.message);
  }
}

listModels();

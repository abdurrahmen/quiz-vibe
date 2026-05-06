const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function listModels(version) {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    const response = await axios.get(url);
    console.log(`--- ${version} models ---`);
    response.data.models.forEach(m => console.log(m.name));
  } catch (e) {
    console.error(`Failed to list models for ${version}`);
  }
}

async function main() {
  await listModels('v1');
  await listModels('v1beta');
}

main();

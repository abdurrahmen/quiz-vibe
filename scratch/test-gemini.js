const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not found');
    return;
  }
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  try {
    // There isn't a direct listModels in the client, but we can try to generate with a common one
    console.log('Testing gemini-pro...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("test");
    console.log('gemini-pro works!');
  } catch (e) {
    console.error('gemini-pro failed:', e.message);
  }

  try {
    console.log('Testing gemini-1.5-flash...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log('gemini-1.5-flash works!');
  } catch (e) {
    console.error('gemini-1.5-flash failed:', e.message);
  }
}

listModels();

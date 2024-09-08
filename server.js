const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const port = 3000;

const apiKey = 'AIzaSyDwBcepibESpnizbmmzxXnY_wczDcX66sI';  // Replace with your actual API key
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.post('/simplify', async (req, res) => {
  const textContent = req.body.text;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: textContent }],
        }
      ],
      generationConfig: {
        maxOutputTokens: 200,  // Adjust as needed
        temperature: 0.5,     // Adjust as needed
        stopSequences: ['\n'],  // Define stop sequences if needed
      },
    });
    res.json({ summary: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

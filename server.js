const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const port = 3000;

// Initialize Google Generative AI client
const client = new GoogleGenerativeAI({ apiKey: 'AIzaSyDwBcepibESpnizbmmzxXnY_wczDcX66sI'});

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to handle text simplification
app.post('/simplify', async (req, res) => {
  const textContent = req.body.text;

  try {
    const response = await client.simplifyText(textContent);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

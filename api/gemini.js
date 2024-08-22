require('dotenv').config(); // Load environment variables from .env file
const { google } = require('googleapis');
const genai = require('google-generative-ai'); // Ensure this package is installed
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json()); // Parse JSON bodies

app.post('/summarize', async (req, res) => {
  const { text } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Initialize Gemini model
    const model = new genai.GenerativeModel("gemini-1.5-flash");

    // Define a prompt to ask Gemini to identify and summarize TOS/PP sections
    const prompt = `
      The following is text extracted from a webpage. Identify and summarize any sections related to Terms of Service, Privacy Policy, or similar legal agreements.

      Text:
      ${text}

      Summary (focusing on TOS, Privacy Policy, etc.):
    `;

    const response = await model.generate_content(
      prompt,
      {
        candidate_count: 1,
        stop_sequences: ["\n"], // End the summary generation at a new line
        max_output_tokens: 500, // Adjust based on expected summary length
        temperature: 0.7 // Adjust creativity level
      }
    );

    // Send the summarized text back to the client
    res.status(200).json({ summary: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

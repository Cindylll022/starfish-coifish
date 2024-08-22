const { google } = require('googleapis');
const axios = require('axios');
const genai = require('google-generative-ai'); // Ensure this package is installed

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { text, client_id, client_secret, redirect_uri, code } = req.body;

      // Initialize OAuth2 client
      const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Initialize Gemini model
      const model = new genai.GenerativeModel("gemini-1.5-flash");

      // Define a prompt to ask Gemini to identify and summarize TOS/PP sections
      const prompt = `
        The following is text extracted from a webpage. Identify and summarize any sections related to Terms of Service, Privacy Policy, or similar legal agreements.

        Text:
        ${text}

        Summary (focusing on TOS, Privacy Policy, etc.):
      `;

      // Make a request to the Gemini API
      const response = await model.generate_content(
        prompt, // Pass the prompt to the Gemini model
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
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }

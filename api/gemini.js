const { google } = require('googleapis');
const axios = require('axios');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { client_id, client_secret, redirect_uri, code } = req.body;
      const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
      
      // Exchange the authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Make a request to the Gemini API
      const geminiResponse = await axios.get('https://gemini.googleapis.com/v1/some-endpoint', {
        headers: {
          Authorization: `Bearer ${oauth2Client.credentials.access_token}`,
        },
      });

      res.status(200).json(geminiResponse.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

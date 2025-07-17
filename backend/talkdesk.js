// /server/routes/talkdesk.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/auth/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send("Missing code or state");
  }

  // Decode the state (contains region and tenant)
  const { region, tenant } = JSON.parse(
    Buffer.from(state, "base64").toString()
  );

  // Exchange code for token
  try {
    const response = await axios.post("https://oauth.talkdesk.com/token", {
      grant_type: "authorization_code",
      code,
      redirect_uri: `https://in-integration.knowmax.ai/v2/ksoft/talkdesk/auth/callback`,
      client_id: process.env.TALKDESK_CLIENT_ID,
      client_secret: process.env.TALKDESK_CLIENT_SECRET,
    });

    const { access_token, refresh_token } = response.data;

    // Store tokens securely (e.g., in a DB)
    // Optionally redirect user to success page
    res.redirect(`https://in-integration.knowmax.ai/v2/ksoft`);
  } catch (err) {
    console.error("Error exchanging token:", err.response?.data || err.message);
    res.status(500).send("OAuth token exchange failed");
  }
});

module.exports = router;

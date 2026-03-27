const axios = require('axios');

router.get('/api/auth/jira/callback', async (req, res) => {
  const { code } = req.query; // This is the temporary code from Jira

  try {
    // 1. Exchange the code for an Access Token
    const response = await axios.post('https://auth.atlassian.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.JIRA_CALLBACK_URL
    });

    const { access_token, refresh_token } = response.data;

    // 2. FOR THE DEMO: Save this token to your database for the user
    // await User.findOneAndUpdate({ _id: req.user.id }, { jiraToken: access_token });

    // 3. Redirect back to your frontend dashboard
    res.redirect('http://localhost:3000/dashboard?status=connected');
    
  } catch (error) {
    console.error('OAuth Error:', error.response?.data || error.message);
    res.status(500).send('Authentication Failed');
  }
});
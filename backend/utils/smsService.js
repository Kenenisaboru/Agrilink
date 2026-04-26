// SMS Integration using Africa's Talking API (Standard for Ethiopia/Africa)
// If credentials are not provided in .env, it simulates sending the SMS in the console.

const axios = require('axios');

/**
 * Send an SMS to a phone number.
 * @param {string} to - The recipient's phone number (e.g., '+251911234567')
 * @param {string} message - The message to send
 */
const sendSMS = async (to, message) => {
  const username = process.env.AFRICASTALKING_USERNAME;
  const apiKey = process.env.AFRICASTALKING_API_KEY;

  if (!username || !apiKey || username === 'sandbox') {
    // ── SIMULATION MODE (No API keys provided) ─────────────────────────────
    console.log('\n┌──────────────────────────────────────────────┐');
    console.log('│ 📱 SIMULATED SMS INTEGRATION (Africa\'s Talking)');
    console.log('├──────────────────────────────────────────────┤');
    console.log(`│ TO:      ${to || 'Unknown Number'}`);
    console.log(`│ MESSAGE: ${message}`);
    console.log('└──────────────────────────────────────────────┘\n');
    return { success: true, simulated: true };
  }

  // ── LIVE MODE (Africa's Talking API) ─────────────────────────────────────
  try {
    const url = 'https://api.africastalking.com/version1/messaging';
    
    // Format parameters as required by Africa's Talking API
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('to', to);
    params.append('message', message);

    const response = await axios.post(url, params.toString(), {
      headers: {
        'apiKey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    console.log(`✅ [SMS SENT] Successfully sent SMS to ${to}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ [SMS ERROR] Failed to send SMS via Africa\'s Talking:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };

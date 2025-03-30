const crypto = require('crypto');

// Generate a secure random API key
const generateApiKey = () => {
  // Generate 32 random bytes and convert to hex
  const apiKey = crypto.randomBytes(32).toString('hex');
  
  // Add a prefix for identification
  const prefixedApiKey = `prod_${apiKey}`;
  
  console.log('\nGenerated Production API Key:');
  console.log('-----------------------------');
  console.log(prefixedApiKey);
  console.log('\nIMPORTANT:');
  console.log('1. Save this key securely - you won\'t be able to see it again!');
  console.log('2. Add it to your production .env file:');
  console.log('   VITE_API_KEY=' + prefixedApiKey);
  console.log('3. Store it in a secure password manager or key management service');
  console.log('4. Never commit it to version control\n');
};

generateApiKey(); 
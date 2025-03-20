// Netlify serverless function to proxy OpenAI API requests
// This keeps the API key secure on the server side

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    // Get the OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("OpenAI API key not found in environment variables");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key not configured" })
      };
    }

    // Parse the request body
    const requestBody = JSON.parse(event.body);
    
    // Make the request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    // Get the response data
    const data = await response.json();

    // Return the response
    return {
      statusCode: response.status,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process request" })
    };
  }
}; 
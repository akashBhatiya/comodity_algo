const { SmartAPI, WebSocket } = require("smartapi-javascript"); // Import SmartAPI and WebSocket

// Your credentials
const API_KEY = "YOUR_API_KEY"; // Replace with your Smart API key
const CLIENT_CODE = "B60364780"; // Replace with your Angel One client code
const PASSWORD = "2504"; // Replace with your account password
const TOTP = "YOUR_TOTP"; // Replace with your TOTP from authenticator

// Function to get live Silver INR prices
async function getSilverPrice() {
  let smart_api = new SmartAPI({
    api_key: API_KEY,
  });

  try {
    // Step 1: Generate session and obtain the JWT token
    let sessionData = await smart_api.generateSession(
      CLIENT_CODE,
      PASSWORD,
      TOTP
    );
    const accessToken = sessionData.data.access_token;

    // Step 2: Search for Silver Token (SILVERMIC)
    let searchData = await smart_api.search({
      exchange: "MCX",
      query: "SILVERMIC",
    });

    if (!searchData.data || searchData.data.length === 0) {
      console.error("Silver token not found!");
      return;
    }

    const silverToken = searchData.data[0].token;
    console.log("Silver Token:", silverToken);

    // Step 3: Setup WebSocket for live prices
    const ws = new WebSocket({
      client_code: CLIENT_CODE,
      feed_token: sessionData.data.feed_token,
      jwt_token: accessToken,
    });

    // Reconnection logic
    function setupWebSocket() {
      ws.connect();
      ws.on("tick", (data) => {
        console.log("Live Silver INR Price Update:", data);
      });

      ws.on("close", () => {
        console.log("WebSocket connection closed, reconnecting...");
        setTimeout(setupWebSocket, 5000); // Retry connection after 5 seconds
      });

      ws.on("error", (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      });
    }

    setupWebSocket();

    // Subscribe to the Silver token for live updates
    ws.subscribe(silverToken);
    console.log("Subscribed to Silver INR live data");
  } catch (error) {
    console.error(
      "Error fetching Silver INR price or setting up WebSocket:",
      error
    );
  }
}

// Run the function
getSilverPrice();

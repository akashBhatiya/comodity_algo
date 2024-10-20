const { SmartAPI, WebSocketClient } = require("smartapi-nodejs");

// Initialize the SmartAPI with your API key
let smart_api = new SmartAPI({
  api_key: "YOUR_API_KEY", // Replace with your actual API key
});

// Step 1: Generate session to get access token
smart_api
  .generateSession("CLIENT_CODE", "PASSWORD", "TOTP")
  .then((data) => {
    console.log("Session generated:", data);

    // Step 2: Search for a scrip
    return smart_api.searchScrip({
      exchange: "NSE", // or "BSE"
      searchscrip: "TITAN",
    });
  })
  .then((searchResult) => {
    console.log("Scrip search result:", searchResult);

    if (searchResult.length === 0) {
      throw new Error("Scrip not found!");
    }

    // Assuming the first result is the desired scrip
    const scrip = searchResult[0];
    const token = scrip.token; // symboltoken
    const tradingSymbol = scrip.tradingsymbol;

    console.log(`Scrip found: ${tradingSymbol} with token ${token}`);

    // Step 3: Get live market data through WebSocket
    const webSocketClient = new WebSocketClient({
      clientcode: "CLIENT_CODE", // Replace with your actual client code
      jwttoken: "JWT_TOKEN", // Provide the JWT token from login
      apikey: "YOUR_API_KEY", // Same API key used above
      feedtype: "marketdata",
    });

    webSocketClient
      .connect()
      .then(() => {
        console.log("WebSocket connected!");

        // Subscribe to live market data for the scrip
        webSocketClient.fetchData("subscribe", "order_feed", {
          tokens: [token],
          exchange: "NSE", // or "BSE"
        });

        // Listen for ticks
        webSocketClient.on("tick", (data) => {
          console.log("Live market data:", data);
        });

        // Optionally, disconnect after some time
        setTimeout(() => {
          webSocketClient.close();
          console.log("WebSocket connection closed.");
        }, 60000); // Keep the connection open for 1 minute
      })
      .catch((err) => {
        console.error("WebSocket connection error:", err);
      });
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });

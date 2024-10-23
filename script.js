const { SmartAPI, WebSocket, WebSocketV2 } = require("smartapi-javascript"); // Import SmartAPI and WebSocket
// Your credentials
const API_KEY = "W0IKOUZO "; // Replace with your Smart API key
const CLIENT_CODE = "B60364780"; // Replace with your Angel One client code
const PASSWORD = "2504"; // Replace with your account password
const TOTP = "507420"; // Replace with your TOTP from authenticator
// Function to get live Silver INR prices
async function getSilverPrice() {
  let smart_api = new SmartAPI({
    api_key: API_KEY,
  });
  try {
    let sessionData = await smart_api.generateSession(
      CLIENT_CODE,
      PASSWORD,
      TOTP
    );
    const jwtToken = sessionData.data.jwtToken;
    const feedToken = sessionData.data.feedToken;
    // console.log("TEst HErer==++>", smart_api)
    let web_socket = new WebSocketV2({
      jwttoken: jwtToken,
      apikey: API_KEY,
      clientcode: CLIENT_CODE,
      feedtype: feedToken,
    });
    web_socket.customError();
    // web_socket.reconnection(reconnectType, delayTime, multiplier);
    web_socket.connect().then(() => {
      let json_req = {
        correlationID: "abcde12345",
        action: 1,
        mode: 1,
        exchangeType: 5,
        tokens: ["426307"],
      };
      web_socket.fetchData(json_req);
      web_socket.on("tick", receiveTick);
      function receiveTick(data) {
        console.log("receiveTick:::::", data);
      }
    }).catch((err) => {
      console.log('Custom error :', err);
    });
    console.log("Subscribed to Silver INR live data");
  } catch (error) {
    console.error(
      "Error",
      error
    );
  }
}
// Run the function
getSilverPrice();
const {Web3} = require("web3");
const WebSocketProvider = require('web3-providers-ws');
const {rpc_node} = require("../config/config");

const options = {
  timeout: 30000, // ms
  reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 20,
      onTimeout: false
  }
};

const provider = new WebSocketProvider(rpc_node, options);

const web3 = new Web3(provider);


provider.on("error", (error) => console.error(`web3 WebSocket error ${error}`));
provider.on("end", (error) => console.log(`web3: WebSocket connection ended, attempting to reconnect... ${error}`));
provider.on("timeout", () => console.error("Web3: WebSocket connection timed out"));
provider.on("close", () => console.log("Web3: WebSocket connection closed"));


module.exports = {web3, provider}
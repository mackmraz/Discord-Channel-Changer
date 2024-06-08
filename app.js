const axios = require("axios");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "config.json");
const FUNCTION_URL = "YOUR_GOOGLE_CLOUD_FUNCTION_URL";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    const data = fs.readFileSync(CONFIG_PATH);
    return JSON.parse(data);
  }
  return null;
}

function promptForConfig(callback) {
  console.log(
    "To get your Guild ID and User ID, enable Developer Mode in Discord. Then, right-click on your server icon to copy the Guild ID and right-click on your username to copy your User ID."
  );
  rl.question("Enter your Guild ID: ", (guildId) => {
    rl.question("Enter your User ID: ", (userId) => {
      const config = { guildId, userId };
      saveConfig(config);
      callback(config);
    });
  });
}

function moveUser(config, channelId) {
  axios
    .post(FUNCTION_URL, {
      guild_id: config.guildId,
      user_id: config.userId,
      channel_id: channelId,
    })
    .then((response) => {
      console.log("User moved successfully!");
    })
    .catch((error) => {
      console.error(
        "Error moving user:",
        error.response ? error.response.data : error.message
      );
    });
}

const config = loadConfig();
if (config) {
  rl.question("Enter the Channel ID to move the user to: ", (channelId) => {
    moveUser(config, channelId);
    rl.close();
  });
} else {
  promptForConfig((config) => {
    rl.question("Enter the Channel ID to move the user to: ", (channelId) => {
      moveUser(config, channelId);
      rl.close();
    });
  });
}

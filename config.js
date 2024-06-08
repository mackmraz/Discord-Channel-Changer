const path = require("path");
const fs = require("fs");

const CONFIG_PATH = path.join(
  require("electron").app.getPath("userData"),
  "config.json"
);

const loadConfig = () => {
  console.log("Loading configuration...");
  if (fs.existsSync(CONFIG_PATH)) {
    const data = fs.readFileSync(CONFIG_PATH);
    const config = JSON.parse(data);
    console.log("Configuration loaded:", config);
    return config;
  } else {
    console.log("No configuration file found. Creating a new one...");
    const defaultConfig = {
      guildId: "",
      userId: "",
      channelId1: "",
      hotkey1: "",
      channelId2: "",
      hotkey2: "",
      channelId3: "",
      hotkey3: "",
      channelId4: "",
      hotkey4: "",
      channelId5: "",
      hotkey5: "",
      channelId6: "",
      hotkey6: "",
      channelId7: "",
      hotkey7: "",
      channelId8: "",
      hotkey8: "",
      channelId9: "",
      hotkey9: "",
      channelId10: "",
      hotkey10: "",
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
};

const saveConfig = (config) => {
  console.log("Saving configuration...", config);
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log("Configuration saved successfully.");
  return "Config saved successfully";
};

module.exports = { loadConfig, saveConfig };

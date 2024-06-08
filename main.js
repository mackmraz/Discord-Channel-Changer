const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const localShortcut = require("electron-localshortcut");

const CONFIG_PATH = path.join(app.getPath("userData"), "config.json");
const FUNCTION_URL =
  "https://us-east4-compact-buckeye-425720-i8.cloudfunctions.net/elysian-radio";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("load-config", () => {
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
});

ipcMain.handle("save-config", (event, config) => {
  console.log("Saving configuration...", config);
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  registerShortcuts(config);
  console.log("Configuration saved successfully.");
  return "Config saved successfully";
});

ipcMain.handle("move-user", async (event, { guildId, userId, channelId }) => {
  console.log(
    `Moving user ${userId} in guild ${guildId} to channel ${channelId}...`
  );
  try {
    await axios.post(FUNCTION_URL, {
      guild_id: guildId,
      user_id: userId,
      channel_id: channelId,
    });
    console.log(`User ${userId} moved to channel ${channelId} successfully.`);
    return "User moved successfully!";
  } catch (error) {
    console.error(
      `Failed to move user ${userId} to channel ${channelId}:`,
      error
    );
    throw new Error(error.response ? error.response.data : error.message);
  }
});

function registerShortcuts(config) {
  if (mainWindow) {
    localShortcut.unregisterAll(mainWindow);
  }
  console.log("Registering shortcuts...");

  for (let i = 1; i <= 10; i++) {
    const channelId = config[`channelId${i}`];
    const hotkey = config[`hotkey${i}`];

    if (channelId && hotkey && mainWindow) {
      localShortcut.register(mainWindow, hotkey, async () => {
        console.log(`Hotkey ${hotkey} pressed for channel ${channelId}`);
        try {
          await axios.post(FUNCTION_URL, {
            guild_id: config.guildId,
            user_id: config.userId,
            channel_id: channelId,
          });
          console.log(
            `Moved user to channel ${channelId} with hotkey ${hotkey}`
          );
        } catch (error) {
          console.error(
            `Failed to move user to channel ${channelId}: ${error.message}`
          );
        }
      });
      console.log(`Shortcut registered: ${hotkey} for channel ${channelId}`);
    }
  }
}

app.on("ready", () => {
  if (fs.existsSync(CONFIG_PATH)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
    registerShortcuts(config);
  }
});

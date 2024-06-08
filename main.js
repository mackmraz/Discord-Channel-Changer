const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const localShortcut = require("electron-localshortcut");

const CONFIG_PATH = path.join(__dirname, "config.json");
const FUNCTION_URL =
  "https://us-east4-compact-buckeye-425720-i8.cloudfunctions.net/elysian-radio";

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");
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
  if (fs.existsSync(CONFIG_PATH)) {
    const data = fs.readFileSync(CONFIG_PATH);
    return JSON.parse(data);
  }
  return null;
});

ipcMain.handle("save-config", (event, config) => {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  registerShortcuts(config);
  return "Config saved successfully";
});

ipcMain.handle("move-user", async (event, { guildId, userId, channelId }) => {
  try {
    await axios.post(FUNCTION_URL, {
      guild_id: guildId,
      user_id: userId,
      channel_id: channelId,
    });
    return "User moved successfully!";
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
});

function registerShortcuts(config) {
  localShortcut.unregisterAll();

  for (let i = 1; i <= 10; i++) {
    const channelId = config[`channelId${i}`];
    const hotkey = config[`hotkey${i}`];

    if (channelId && hotkey) {
      localShortcut.register(hotkey, async () => {
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
    }
  }
}

app.on("ready", () => {
  if (fs.existsSync(CONFIG_PATH)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
    registerShortcuts(config);
  }
});

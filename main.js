const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { loadConfig, saveConfig } = require("./config");

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

app.whenReady().then(() => {
  createWindow();
  const config = loadConfig();
  registerShortcuts(config);
});

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

ipcMain.handle("load-config", () => loadConfig());

ipcMain.handle("save-config", (event, config) => {
  const result = saveConfig(config);
  registerShortcuts(config);
  return result;
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
  globalShortcut.unregisterAll();

  for (let i = 1; i <= 10; i++) {
    const channelId = config[`channelId${i}`];
    const hotkey = config[`hotkey${i}`];

    if (channelId && hotkey) {
      globalShortcut.register(hotkey, async () => {
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
  const config = loadConfig();
  registerShortcuts(config);
});

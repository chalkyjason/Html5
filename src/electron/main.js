const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let steamworks;
let mainWindow;
let isSteamInitialized = false;

// Performance flags for gaming (must be set before app ready)
if (app && app.commandLine) {
  app.commandLine.appendSwitch('ignore-gpu-blacklist');
  app.commandLine.appendSwitch('disable-http-cache');
  app.commandLine.appendSwitch('high-dpi-support', '1');
}

// Initialize Steamworks before creating window
function initializeSteam() {
  try {
    steamworks = require('steamworks.js');

    // Enable Steam Overlay (must be called before BrowserWindow creation)
    if (steamworks.electronEnableSteamOverlay) {
      steamworks.electronEnableSteamOverlay();
    }

    const client = steamworks.init(480); // Use your Steam App ID (480 is Spacewar test app)
    console.log('Steam initialized successfully');
    console.log('Steam Username:', client.localplayer.getName());
    isSteamInitialized = true;

    return client;
  } catch (error) {
    console.error('Failed to initialize Steam:', error);
    console.log('Running without Steam integration');
    return null;
  }
}

function createWindow(steamClient) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    transparent: false, // Required for Steam Overlay
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    },
    backgroundColor: '#000000',
    title: 'Phaser Steam Game'
  });

  // Load the game
  mainWindow.loadFile(path.join(__dirname, '../game/index.html'));

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for Steam API
function setupIpcHandlers() {
  ipcMain.handle('steam:isInitialized', () => {
    return isSteamInitialized;
  });

  ipcMain.handle('steam:getUserName', () => {
    if (!isSteamInitialized || !steamworks) return 'Player';
    try {
      const client = steamworks.init(480);
      return client.localplayer.getName();
    } catch (error) {
      console.error('Error getting username:', error);
      return 'Player';
    }
  });

  ipcMain.handle('steam:unlockAchievement', (event, achievementId) => {
    if (!isSteamInitialized || !steamworks) {
      console.log('Achievement would unlock:', achievementId);
      return false;
    }
    try {
      const client = steamworks.init(480);
      const achievement = client.achievement;
      achievement.activate(achievementId);
      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  });

  ipcMain.handle('steam:isOnSteamDeck', () => {
    if (!isSteamInitialized || !steamworks) return false;
    try {
      const client = steamworks.init(480);
      return client.utils.isSteamRunningOnSteamDeck();
    } catch (error) {
      console.error('Error checking Steam Deck:', error);
      return false;
    }
  });

  ipcMain.handle('steam:showKeyboard', async (event, options) => {
    if (!isSteamInitialized || !steamworks) {
      console.log('Virtual keyboard not available (Steam not initialized)');
      return { dismissed: true, text: '' };
    }

    try {
      const client = steamworks.init(480);
      const result = await new Promise((resolve) => {
        client.utils.showFloatingGamepadTextInput(
          options.mode || 0, // 0 = Single line, 1 = Multi-line
          options.x || 0,
          options.y || 0,
          options.width || 500,
          options.height || 200
        );

        // Listen for dismissal event
        const checkDismissed = setInterval(() => {
          try {
            const text = client.utils.getEnteredGamepadText();
            if (text !== null) {
              clearInterval(checkDismissed);
              resolve({ dismissed: true, text: text });
            }
          } catch (e) {
            clearInterval(checkDismissed);
            resolve({ dismissed: true, text: '' });
          }
        }, 100);

        // Timeout after 60 seconds
        setTimeout(() => {
          clearInterval(checkDismissed);
          resolve({ dismissed: true, text: '' });
        }, 60000);
      });

      return result;
    } catch (error) {
      console.error('Error showing keyboard:', error);
      return { dismissed: true, text: '' };
    }
  });

  ipcMain.handle('steam:setRichPresence', (event, key, value) => {
    if (!isSteamInitialized || !steamworks) return false;
    try {
      const client = steamworks.init(480);
      client.localplayer.setRichPresence(key, value);
      return true;
    } catch (error) {
      console.error('Error setting rich presence:', error);
      return false;
    }
  });
}

// App lifecycle
if (app) {
  app.whenReady().then(() => {
    // Setup IPC handlers
    setupIpcHandlers();

    const steamClient = initializeSteam();
    createWindow(steamClient);
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });

  // Cleanup on exit
  app.on('before-quit', () => {
    if (isSteamInitialized && steamworks) {
      try {
        steamworks.runCallbacks();
      } catch (error) {
        console.error('Error during Steam cleanup:', error);
      }
    }
  });
}

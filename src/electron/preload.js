const { contextBridge, ipcRenderer } = require('electron');

/**
 * Secure IPC bridge for Steam API access
 * Exposes a limited, safe API to the renderer process
 */
contextBridge.exposeInMainWorld('steam', {
  /**
   * Check if Steam is initialized
   * @returns {Promise<boolean>}
   */
  isInitialized: () => ipcRenderer.invoke('steam:isInitialized'),

  /**
   * Get the current Steam user's display name
   * @returns {Promise<string>}
   */
  getUserName: () => ipcRenderer.invoke('steam:getUserName'),

  /**
   * Unlock a Steam achievement
   * @param {string} achievementId - The Steam achievement ID
   * @returns {Promise<boolean>}
   */
  unlockAchievement: (achievementId) => ipcRenderer.invoke('steam:unlockAchievement', achievementId),

  /**
   * Check if running on Steam Deck
   * @returns {Promise<boolean>}
   */
  isOnSteamDeck: () => ipcRenderer.invoke('steam:isOnSteamDeck'),

  /**
   * Show the Steam Deck virtual keyboard
   * @param {Object} options - Keyboard options (mode, x, y, width, height)
   * @returns {Promise<{dismissed: boolean, text: string}>}
   */
  showKeyboard: (options = {}) => ipcRenderer.invoke('steam:showKeyboard', options),

  /**
   * Set Steam Rich Presence
   * @param {string} key - The presence key
   * @param {string} value - The presence value
   * @returns {Promise<boolean>}
   */
  setRichPresence: (key, value) => ipcRenderer.invoke('steam:setRichPresence', key, value)
});

/**
 * Expose a simple API for environment detection
 */
contextBridge.exposeInMainWorld('env', {
  platform: process.platform,
  isDev: process.argv.includes('--dev')
});

console.log('Preload script loaded - Steam API bridge ready');

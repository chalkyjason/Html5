import GameManager from './GameManager.js';

/**
 * SteamDeckUI - Helper for Steam Deck-specific UI elements
 * Shows appropriate input prompts based on device
 */
class SteamDeckUI {
    /**
     * Get input prompt text based on device
     * @param {string} action - The action (e.g., 'shoot', 'move')
     * @returns {string} - Device-appropriate prompt
     */
    static getInputPrompt(action) {
        const gameManager = GameManager.getInstance();
        const isOnDeck = gameManager.isOnSteamDeck;

        const prompts = {
            move: isOnDeck ? 'Left Stick - Move' : 'WASD/Arrows - Move',
            shoot: isOnDeck ? 'A - Shoot' : 'SPACE - Shoot',
            confirm: isOnDeck ? 'Press A' : 'Press SPACE',
            back: isOnDeck ? 'B - Back' : 'ESC - Back'
        };

        return prompts[action] || action;
    }

    /**
     * Show virtual keyboard (Steam Deck only)
     * @param {Phaser.Scene} scene - The scene
     * @param {string} prompt - The prompt text
     * @returns {Promise<string>} - The entered text
     */
    static async showVirtualKeyboard(scene, prompt = 'Enter text:') {
        const gameManager = GameManager.getInstance();

        if (!gameManager.isOnSteamDeck) {
            // Fallback to browser prompt
            return window.prompt(prompt) || '';
        }

        // Show Steam Deck virtual keyboard
        const result = await gameManager.showVirtualKeyboard({
            mode: 0, // Single line
            x: 100,
            y: 100,
            width: 600,
            height: 200
        });

        return result.text || '';
    }

    /**
     * Create input prompt text in scene
     * @param {Phaser.Scene} scene - The scene
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} action - The action type
     * @param {Object} style - Text style
     * @returns {Phaser.GameObjects.Text}
     */
    static createPrompt(scene, x, y, action, style = {}) {
        const defaultStyle = {
            fontSize: '16px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            ...style
        };

        const promptText = SteamDeckUI.getInputPrompt(action);
        return scene.add.text(x, y, promptText, defaultStyle);
    }

    /**
     * Detect controller input (for Steam Deck)
     * @param {Phaser.Scene} scene - The scene
     */
    static setupControllerInput(scene) {
        scene.input.gamepad.once('connected', (pad) => {
            console.log('Gamepad connected:', pad.id);

            const gameManager = GameManager.getInstance();
            if (gameManager.isOnSteamDeck) {
                console.log('Steam Deck controller detected');
            }
        });

        // Enable gamepad polling
        if (scene.input.gamepad.total === 0) {
            scene.input.gamepad.once('connected', () => {
                console.log('Controller support enabled');
            });
        }
    }
}

export default SteamDeckUI;

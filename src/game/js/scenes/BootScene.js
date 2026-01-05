import GameManager from '../core/GameManager.js';
import SteamDeckUI from '../core/SteamDeckUI.js';

/**
 * BootScene - Initial loading and setup scene
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading text
        const width = this.scale.width;
        const height = this.scale.height;

        const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Initialize GameManager
        this.gameManager = GameManager.getInstance();

        // Wait for Steam to initialize
        this.time.delayedCall(500, () => {
            this.checkSteamStatus();
        });
    }

    async checkSteamStatus() {
        const gameManager = GameManager.getInstance();

        // Display Steam status
        const width = this.scale.width;
        const height = this.scale.height;

        let statusText = 'Steam: ';
        if (gameManager.steamInitialized) {
            statusText += `Connected as ${gameManager.steamUserName}`;
            if (gameManager.isOnSteamDeck) {
                statusText += ' (Steam Deck)';
            }
        } else {
            statusText += 'Not Connected';
        }

        this.add.text(width / 2, height / 2 + 50, statusText, {
            fontSize: '18px',
            fill: '#00ff00'
        }).setOrigin(0.5);

        // Instructions - Dynamic based on device
        const instructions = [
            'Controls:',
            SteamDeckUI.getInputPrompt('move'),
            SteamDeckUI.getInputPrompt('shoot'),
            '',
            SteamDeckUI.getInputPrompt('confirm') + ' to Start'
        ];

        this.add.text(width / 2, height / 2 + 120, instructions.join('\n'), {
            fontSize: '16px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Set up controller support
        SteamDeckUI.setupControllerInput(this);

        // Wait for spacebar to start
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('MainScene');
        });
    }
}

export default BootScene;

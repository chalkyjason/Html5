import BootScene from './scenes/BootScene.js';
import MainScene from './scenes/MainScene.js';

/**
 * Phaser 3 Game Configuration
 * Optimized for Electron with Steam integration
 */
const config = {
    type: Phaser.AUTO, // Use WebGL if available, fallback to Canvas
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top-down game, no gravity
            debug: false // Set to true for development
        }
    },
    input: {
        gamepad: true // Enable gamepad support for Steam Deck
    },
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true // Performance optimization
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, MainScene]
};

// Initialize the game
const game = new Phaser.Game(config);

// Make game instance globally accessible for debugging
window.game = game;

console.log('Phaser game initialized');

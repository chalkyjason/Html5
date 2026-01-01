/**
 * GameManager - Singleton pattern for global game state
 * Handles score, lives, Steam integration status, and persistent data
 */
class GameManager {
    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }

        // Game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.isGameOver = false;

        // Steam integration
        this.steamInitialized = false;
        this.steamUserName = 'Player';
        this.isOnSteamDeck = false;

        // Player preferences (would be saved/loaded)
        this.soundEnabled = true;
        this.musicEnabled = true;

        GameManager.instance = this;
        this.initializeSteam();
    }

    /**
     * Initialize Steam API and get user info
     */
    async initializeSteam() {
        if (typeof window.steam !== 'undefined') {
            try {
                this.steamInitialized = await window.steam.isInitialized();

                if (this.steamInitialized) {
                    this.steamUserName = await window.steam.getUserName();
                    this.isOnSteamDeck = await window.steam.isOnSteamDeck();

                    console.log(`Steam initialized: ${this.steamUserName}`);
                    console.log(`Running on Steam Deck: ${this.isOnSteamDeck}`);

                    // Set initial rich presence
                    await window.steam.setRichPresence('status', 'In Menu');
                }
            } catch (error) {
                console.error('Steam initialization error:', error);
            }
        } else {
            console.log('Running without Steam (likely in browser)');
        }
    }

    /**
     * Add to score
     */
    addScore(points) {
        this.score += points;
        console.log(`Score: ${this.score}`);
    }

    /**
     * Lose a life
     */
    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    /**
     * Handle game over
     */
    gameOver() {
        this.isGameOver = true;
        console.log('Game Over! Final Score:', this.score);

        // Update Steam rich presence
        if (this.steamInitialized) {
            window.steam.setRichPresence('status', 'Game Over');
        }
    }

    /**
     * Reset game state
     */
    reset() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.isGameOver = false;
    }

    /**
     * Unlock a Steam achievement
     */
    async unlockAchievement(achievementId) {
        if (this.steamInitialized) {
            const success = await window.steam.unlockAchievement(achievementId);
            if (success) {
                console.log(`Achievement unlocked: ${achievementId}`);
            }
        } else {
            console.log(`Achievement would unlock: ${achievementId} (Steam not available)`);
        }
    }

    /**
     * Show Steam Deck virtual keyboard
     */
    async showVirtualKeyboard(options = {}) {
        if (this.steamInitialized && this.isOnSteamDeck) {
            return await window.steam.showKeyboard(options);
        }
        return { dismissed: false, text: '' };
    }

    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!GameManager.instance) {
            new GameManager();
        }
        return GameManager.instance;
    }
}

export default GameManager;

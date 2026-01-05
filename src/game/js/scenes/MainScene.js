import GameManager from '../core/GameManager.js';
import PlayerFactory from '../factories/PlayerFactory.js';
import EnemyFactory from '../factories/EnemyFactory.js';

/**
 * MainScene - Main gameplay scene
 */
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });

        this.player = null;
        this.enemies = null;
        this.scoreText = null;
        this.livesText = null;
        this.waveNumber = 1;
    }

    create() {
        const gameManager = GameManager.getInstance();
        gameManager.reset();

        // Set rich presence
        if (gameManager.steamInitialized) {
            window.steam.setRichPresence('status', 'Playing');
        }

        // Create world bounds
        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

        // Create player
        this.player = PlayerFactory.create(
            this,
            this.scale.width / 2,
            this.scale.height / 2
        );

        // Create enemies group
        this.enemies = this.add.group();

        // Spawn first wave
        this.spawnWave();

        // Set up collisions
        this.setupCollisions();

        // Create UI
        this.createUI();

        // Wave spawning timer
        this.time.addEvent({
            delay: 15000, // New wave every 15 seconds
            callback: this.spawnWave,
            callbackScope: this,
            loop: true
        });

        console.log('MainScene started');
    }

    /**
     * Spawn a wave of enemies
     */
    spawnWave() {
        const enemyCount = 3 + this.waveNumber;
        const newEnemies = EnemyFactory.createWave(this, enemyCount, this.player);

        newEnemies.forEach(enemy => {
            this.enemies.add(enemy);
        });

        // Show wave notification
        const waveText = this.add.text(
            this.scale.width / 2,
            100,
            `Wave ${this.waveNumber}`,
            {
                fontSize: '48px',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: waveText,
            alpha: 0,
            y: 50,
            duration: 2000,
            onComplete: () => waveText.destroy()
        });

        this.waveNumber++;

        const gameManager = GameManager.getInstance();
        if (gameManager.steamInitialized) {
            window.steam.setRichPresence('wave', this.waveNumber.toString());
        }
    }

    /**
     * Set up collision detection
     */
    setupCollisions() {
        // Player bullets hit enemies
        this.physics.add.overlap(
            this.player.shooting.getBulletGroup(),
            this.enemies,
            this.bulletHitEnemy,
            null,
            this
        );

        // Enemy bullets hit player
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.shooting) {
                this.physics.add.overlap(
                    enemy.shooting.getBulletGroup(),
                    this.player,
                    this.bulletHitPlayer,
                    null,
                    this
                );
            }
        });

        // Continuous collision check for new enemies
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.enemies.getChildren().forEach(enemy => {
                    if (enemy.shooting && enemy.active) {
                        this.physics.add.overlap(
                            enemy.shooting.getBulletGroup(),
                            this.player,
                            this.bulletHitPlayer,
                            null,
                            this
                        );
                    }
                });
            },
            loop: true
        });

        // Player collision with enemies (contact damage)
        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.playerTouchEnemy,
            null,
            this
        );
    }

    /**
     * Player bullet hits enemy
     */
    bulletHitEnemy(bullet, enemy) {
        if (!bullet.active || !enemy.active) return;

        // Deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.setVelocity(0, 0);

        // Damage enemy
        if (enemy.health) {
            enemy.health.takeDamage(bullet.damage || 10);
        }
    }

    /**
     * Enemy bullet hits player
     */
    bulletHitPlayer(bullet, player) {
        if (!bullet.active || bullet.isPlayerBullet) return;

        // Deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.setVelocity(0, 0);

        // Damage player
        if (player.health) {
            player.health.takeDamage(bullet.damage || 10);
        }
    }

    /**
     * Player touches enemy (contact damage)
     */
    playerTouchEnemy(player, enemy) {
        if (!enemy.active) return;

        if (player.health) {
            player.health.takeDamage(15);
        }
    }

    /**
     * Create UI elements
     */
    createUI() {
        const gameManager = GameManager.getInstance();

        // Score
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });

        // Lives
        this.livesText = this.add.text(16, 50, `Lives: ${gameManager.lives}`, {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });

        // FPS (for debugging)
        if (window.env && window.env.isDev) {
            this.fpsText = this.add.text(this.scale.width - 100, 16, 'FPS: 60', {
                fontSize: '18px',
                fill: '#00ff00'
            });
        }
    }

    /**
     * Update loop
     */
    update(time, delta) {
        const gameManager = GameManager.getInstance();

        // Update UI
        this.scoreText.setText(`Score: ${gameManager.score}`);
        this.livesText.setText(`Lives: ${gameManager.lives}`);

        if (this.fpsText) {
            this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
        }

        // Check for game over
        if (gameManager.isGameOver && !this.gameOverShown) {
            this.showGameOver();
        }
    }

    /**
     * Show game over screen
     */
    showGameOver() {
        this.gameOverShown = true;

        const gameManager = GameManager.getInstance();

        // Pause game
        this.physics.pause();

        // Game over text
        const gameOverText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 50,
            'GAME OVER',
            {
                fontSize: '64px',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);

        const scoreText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 20,
            `Final Score: ${gameManager.score}`,
            {
                fontSize: '32px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        const restartText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 80,
            'Press SPACE to Restart',
            {
                fontSize: '24px',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);

        // Restart on spacebar
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart();
            this.gameOverShown = false;
        });

        // Update Steam rich presence
        if (gameManager.steamInitialized) {
            window.steam.setRichPresence('status', 'Game Over');
        }

        // Unlock achievement for first game
        if (gameManager.score > 0) {
            gameManager.unlockAchievement('ACH_FIRST_GAME');
        }
    }
}

export default MainScene;

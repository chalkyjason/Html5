import MovementComponent from '../components/MovementComponent.js';
import HealthComponent from '../components/HealthComponent.js';
import ShootingComponent from '../components/ShootingComponent.js';
import GameManager from '../core/GameManager.js';

/**
 * PlayerFactory - Creates and configures the player entity
 *
 * Uses composition pattern: Sprite + Components
 */
class PlayerFactory {
    /**
     * Create a player entity
     * @param {Phaser.Scene} scene - The scene to create the player in
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Phaser.GameObjects.Sprite} - The player game object
     */
    static create(scene, x, y) {
        // Create player sprite (using placeholder graphics)
        const player = scene.add.rectangle(x, y, 40, 40, 0x00ff00);
        scene.physics.add.existing(player);

        // Set collision properties
        player.body.setCollideWorldBounds(true);
        player.body.setBounce(0, 0);
        player.body.setSize(40, 40);
        player.body.setOffset(0, 0);

        // Add components
        const movement = new MovementComponent(player, scene, {
            speed: 250,
            isPlayer: true
        });

        const health = new HealthComponent(player, scene, {
            maxHealth: 100,
            invincibleTime: 1500,
            onDeath: (gameObject) => {
                PlayerFactory.onPlayerDeath(scene, gameObject);
            }
        });

        const shooting = new ShootingComponent(player, scene, {
            fireRate: 200,
            bulletSpeed: 500,
            damage: 25,
            isPlayer: true
        });

        // Enable all components
        movement.enable();
        health.enable();
        shooting.enable();

        // Store references for easy access
        player.movement = movement;
        player.health = health;
        player.shooting = shooting;

        // Set player tag
        player.isPlayer = true;

        console.log('Player created at', x, y);
        return player;
    }

    /**
     * Handle player death
     */
    static onPlayerDeath(scene, player) {
        console.log('Player died!');

        const gameManager = GameManager.getInstance();
        gameManager.loseLife();

        // Visual feedback
        scene.cameras.main.shake(500, 0.01);

        // Make player temporarily invisible but don't disable physics
        const originalAlpha = player.alpha;
        player.setAlpha(0.3);

        // Respawn or game over after delay
        scene.time.delayedCall(500, () => {
            if (gameManager.lives > 0) {
                // Respawn
                player.setPosition(scene.scale.width / 2, scene.scale.height / 2);
                player.setAlpha(originalAlpha);
                player.health.revive();
                console.log('Player respawned. Lives remaining:', gameManager.lives);
            } else {
                // Game over
                player.setVisible(false);
                player.setActive(false);
                if (player.body) {
                    player.body.setVelocity(0, 0);
                    player.body.setEnable(false);
                }
                scene.showGameOver();
            }
        });
    }
}

export default PlayerFactory;

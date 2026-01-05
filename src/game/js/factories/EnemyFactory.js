import MovementComponent from '../components/MovementComponent.js';
import HealthComponent from '../components/HealthComponent.js';
import ShootingComponent from '../components/ShootingComponent.js';
import EnemyAIComponent from '../components/EnemyAIComponent.js';
import GameManager from '../core/GameManager.js';

/**
 * EnemyFactory - Creates and configures enemy entities
 *
 * Uses composition pattern: Sprite + Components
 */
class EnemyFactory {
    /**
     * Create an enemy entity
     * @param {Phaser.Scene} scene - The scene to create the enemy in
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Phaser.GameObjects.GameObject} player - Player reference for AI
     * @returns {Phaser.GameObjects.Sprite} - The enemy game object
     */
    static create(scene, x, y, player) {
        // Create enemy sprite (using placeholder graphics)
        const enemy = scene.add.rectangle(x, y, 35, 35, 0xff0000);
        scene.physics.add.existing(enemy);

        // Set collision properties
        enemy.body.setCollideWorldBounds(true);
        enemy.body.setSize(35, 35);

        // Add components
        const movement = new MovementComponent(enemy, scene, {
            speed: 120,
            isPlayer: false
        });

        const health = new HealthComponent(enemy, scene, {
            maxHealth: 50,
            invincibleTime: 500,
            onDeath: (gameObject) => {
                EnemyFactory.onEnemyDeath(scene, gameObject);
            }
        });

        const shooting = new ShootingComponent(enemy, scene, {
            fireRate: 1000,
            bulletSpeed: 300,
            damage: 10,
            isPlayer: false
        });

        const ai = new EnemyAIComponent(enemy, scene, {
            player: player,
            chaseDistance: 400,
            shootDistance: 300
        });

        // Enable all components
        movement.enable();
        health.enable();
        shooting.enable();
        ai.enable();

        // Store references
        enemy.movement = movement;
        enemy.health = health;
        enemy.shooting = shooting;
        enemy.ai = ai;

        // Set enemy tag
        enemy.isEnemy = true;

        return enemy;
    }

    /**
     * Handle enemy death
     */
    static onEnemyDeath(scene, enemy) {
        console.log('Enemy destroyed!');

        const gameManager = GameManager.getInstance();
        gameManager.addScore(100);

        // Visual feedback - explosion effect
        const explosion = scene.add.circle(enemy.x, enemy.y, 20, 0xff6600);
        scene.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 2,
            duration: 300,
            onComplete: () => explosion.destroy()
        });

        // Disable all components
        if (enemy.components) {
            enemy.components.forEach(comp => comp.disable());
        }

        // Remove enemy
        enemy.destroy();
    }

    /**
     * Create a wave of enemies
     * @param {Phaser.Scene} scene - The scene
     * @param {number} count - Number of enemies
     * @param {Phaser.GameObjects.GameObject} player - Player reference
     * @returns {Array} - Array of enemy game objects
     */
    static createWave(scene, count, player) {
        const enemies = [];
        const margin = 100;

        for (let i = 0; i < count; i++) {
            // Random position at screen edges
            let x, y;
            if (Math.random() > 0.5) {
                x = Math.random() > 0.5 ? margin : scene.scale.width - margin;
                y = Phaser.Math.Between(margin, scene.scale.height - margin);
            } else {
                x = Phaser.Math.Between(margin, scene.scale.width - margin);
                y = Math.random() > 0.5 ? margin : scene.scale.height - margin;
            }

            const enemy = EnemyFactory.create(scene, x, y, player);
            enemies.push(enemy);
        }

        console.log(`Created wave of ${count} enemies`);
        return enemies;
    }
}

export default EnemyFactory;

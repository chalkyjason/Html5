import BaseComponent from '../core/BaseComponent.js';

/**
 * ShootingComponent - Handles projectile firing
 *
 * Config options:
 * - fireRate: Time between shots in ms (default: 300)
 * - bulletSpeed: Speed of bullets (default: 400)
 * - damage: Damage per bullet (default: 10)
 * - isPlayer: Whether this is the player (enables input) (default: false)
 */
class ShootingComponent extends BaseComponent {
    constructor(gameObject, scene, config = {}) {
        super(gameObject, scene, config);

        this.fireRate = config.fireRate || 300;
        this.bulletSpeed = config.bulletSpeed || 400;
        this.damage = config.damage || 10;
        this.isPlayer = config.isPlayer || false;

        this.lastFired = 0;
        this.bulletGroup = null;

        // Input
        this.shootKey = null;
        if (this.isPlayer) {
            this.shootKey = this.scene.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.SPACE
            );
        }
    }

    onEnable() {
        // Create bullet group with object pooling
        this.bulletGroup = this.scene.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 30,
            runChildUpdate: true
        });
    }

    update(time, delta) {
        if (!this.enabled) return;

        // Auto-fire for player when holding spacebar
        if (this.isPlayer && this.shootKey && this.shootKey.isDown) {
            this.fire();
        }
    }

    /**
     * Fire a bullet
     * @param {number} targetX - Optional target X (for AI)
     * @param {number} targetY - Optional target Y (for AI)
     */
    fire(targetX = null, targetY = null) {
        const now = this.scene.time.now;

        // Check if entity is dead
        if (this.gameObject.health && this.gameObject.health.isDead) {
            return null;
        }

        // Check fire rate
        if (now - this.lastFired < this.fireRate) {
            return null;
        }

        this.lastFired = now;

        // Get bullet from pool
        let bullet = this.bulletGroup.get(this.gameObject.x, this.gameObject.y);

        if (!bullet) {
            // Create new bullet if pool is full
            bullet = this.scene.add.circle(this.gameObject.x, this.gameObject.y, 4, 0xffff00);
            this.scene.physics.add.existing(bullet);
            this.bulletGroup.add(bullet);
        }

        // Position bullet
        bullet.setPosition(this.gameObject.x, this.gameObject.y);
        bullet.setActive(true);
        bullet.setVisible(true);

        // Set bullet properties
        bullet.damage = this.damage;
        bullet.isPlayerBullet = this.isPlayer;

        // Calculate direction
        let angle;
        if (targetX !== null && targetY !== null) {
            // Fire towards target (for AI)
            angle = Phaser.Math.Angle.Between(
                this.gameObject.x,
                this.gameObject.y,
                targetX,
                targetY
            );
        } else {
            // Fire in direction sprite is facing (for player)
            const direction = this.gameObject.flipX ? -1 : 1;
            angle = direction > 0 ? 0 : Math.PI;
        }

        // Set velocity
        bullet.body.setVelocity(
            Math.cos(angle) * this.bulletSpeed,
            Math.sin(angle) * this.bulletSpeed
        );

        // Auto-destroy bullet after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            if (bullet && bullet.active) {
                bullet.setActive(false);
                bullet.setVisible(false);
                bullet.body.setVelocity(0, 0);
            }
        });

        return bullet;
    }

    /**
     * Get the bullet group for collision detection
     */
    getBulletGroup() {
        return this.bulletGroup;
    }

    destroy() {
        if (this.bulletGroup) {
            this.bulletGroup.clear(true, true);
        }
        super.destroy();
    }
}

export default ShootingComponent;

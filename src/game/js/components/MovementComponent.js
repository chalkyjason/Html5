import BaseComponent from '../core/BaseComponent.js';

/**
 * MovementComponent - Handles keyboard/gamepad input and movement
 *
 * Config options:
 * - speed: Movement speed in pixels/second (default: 200)
 * - isPlayer: Whether this is the player (enables input) (default: false)
 */
class MovementComponent extends BaseComponent {
    constructor(gameObject, scene, config = {}) {
        super(gameObject, scene, config);

        this.speed = config.speed || 200;
        this.isPlayer = config.isPlayer || false;

        // Input keys
        this.cursors = null;
        this.wasd = null;

        if (this.isPlayer) {
            this.setupInput();
        }
    }

    /**
     * Set up keyboard input
     */
    setupInput() {
        // Arrow keys
        this.cursors = this.scene.input.keyboard.createCursorKeys();

        // WASD keys
        this.wasd = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    /**
     * Update movement based on input
     */
    update(time, delta) {
        if (!this.enabled || !this.gameObject.body) return;

        if (this.isPlayer) {
            this.handlePlayerInput();
        }
    }

    /**
     * Handle player input and apply velocity
     */
    handlePlayerInput() {
        const body = this.gameObject.body;

        // Reset velocity
        body.setVelocity(0);

        // Horizontal movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            body.setVelocityX(-this.speed);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            body.setVelocityX(this.speed);
        }

        // Vertical movement
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            body.setVelocityY(-this.speed);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            body.setVelocityY(this.speed);
        }

        // Normalize diagonal movement
        body.velocity.normalize().scale(this.speed);
    }

    /**
     * Set velocity directly (for AI or scripted movement)
     */
    setVelocity(x, y) {
        if (this.gameObject.body) {
            this.gameObject.body.setVelocity(x, y);
        }
    }

    /**
     * Move towards a target position
     */
    moveTowards(targetX, targetY, speedOverride = null) {
        if (!this.gameObject.body) return;

        const speed = speedOverride || this.speed;
        const angle = Phaser.Math.Angle.Between(
            this.gameObject.x,
            this.gameObject.y,
            targetX,
            targetY
        );

        this.gameObject.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }

    /**
     * Stop all movement
     */
    stop() {
        if (this.gameObject.body) {
            this.gameObject.body.setVelocity(0, 0);
        }
    }
}

export default MovementComponent;

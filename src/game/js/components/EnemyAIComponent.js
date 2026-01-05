import BaseComponent from '../core/BaseComponent.js';
import MovementComponent from './MovementComponent.js';
import ShootingComponent from './ShootingComponent.js';

/**
 * EnemyAIComponent - Simple AI that chases player and shoots
 *
 * Config options:
 * - player: Reference to player game object
 * - chaseDistance: Distance at which enemy starts chasing (default: 300)
 * - shootDistance: Distance at which enemy starts shooting (default: 200)
 */
class EnemyAIComponent extends BaseComponent {
    constructor(gameObject, scene, config = {}) {
        super(gameObject, scene, config);

        this.player = config.player || null;
        this.chaseDistance = config.chaseDistance || 300;
        this.shootDistance = config.shootDistance || 200;
    }

    update(time, delta) {
        if (!this.enabled || !this.player) return;

        const distance = Phaser.Math.Distance.Between(
            this.gameObject.x,
            this.gameObject.y,
            this.player.x,
            this.player.y
        );

        // Get movement component
        const movement = this.getComponent(MovementComponent);

        // Chase player if within range
        if (distance < this.chaseDistance && distance > 100) {
            if (movement) {
                movement.moveTowards(this.player.x, this.player.y);
            }
        } else if (movement) {
            movement.stop();
        }

        // Shoot at player if within range
        if (distance < this.shootDistance) {
            const shooting = this.getComponent(ShootingComponent);
            if (shooting) {
                shooting.fire(this.player.x, this.player.y);
            }
        }

        // Face player
        if (this.player.x < this.gameObject.x) {
            this.gameObject.setFlipX(true);
        } else {
            this.gameObject.setFlipX(false);
        }
    }

    /**
     * Set the player target
     */
    setPlayer(player) {
        this.player = player;
    }
}

export default EnemyAIComponent;

import BaseComponent from '../core/BaseComponent.js';

/**
 * AnimationComponent - Handles sprite animations based on state
 *
 * Config options:
 * - animations: Object mapping state names to animation keys
 */
class AnimationComponent extends BaseComponent {
    constructor(gameObject, scene, config = {}) {
        super(gameObject, scene, config);

        this.animations = config.animations || {};
        this.currentState = null;
    }

    /**
     * Play animation by state name
     * @param {string} stateName - The state name (e.g., 'idle', 'walk', 'attack')
     * @param {boolean} force - Force restart if already playing
     */
    playState(stateName, force = false) {
        if (!this.animations[stateName]) {
            console.warn(`Animation state '${stateName}' not found`);
            return;
        }

        // Don't restart same animation unless forced
        if (this.currentState === stateName && !force) {
            return;
        }

        this.currentState = stateName;
        const animKey = this.animations[stateName];

        if (this.gameObject.anims) {
            this.gameObject.anims.play(animKey, true);
        }
    }

    /**
     * Update animation based on velocity (for movement-based animations)
     */
    updateFromVelocity() {
        if (!this.gameObject.body) return;

        const body = this.gameObject.body;
        const velocity = body.velocity;
        const isMoving = velocity.x !== 0 || velocity.y !== 0;

        if (isMoving) {
            this.playState('walk');

            // Flip sprite based on direction
            if (velocity.x < 0) {
                this.gameObject.setFlipX(true);
            } else if (velocity.x > 0) {
                this.gameObject.setFlipX(false);
            }
        } else {
            this.playState('idle');
        }
    }

    /**
     * Stop current animation
     */
    stop() {
        if (this.gameObject.anims) {
            this.gameObject.anims.stop();
        }
        this.currentState = null;
    }
}

export default AnimationComponent;

import BaseComponent from '../core/BaseComponent.js';

/**
 * HealthComponent - Handles HP, damage, and death
 *
 * Config options:
 * - maxHealth: Maximum health points (default: 100)
 * - onDeath: Callback function when health reaches 0
 * - invincibleTime: Time in ms of invincibility after taking damage (default: 1000)
 */
class HealthComponent extends BaseComponent {
    constructor(gameObject, scene, config = {}) {
        super(gameObject, scene, config);

        this.maxHealth = config.maxHealth || 100;
        this.currentHealth = this.maxHealth;
        this.onDeathCallback = config.onDeath || null;
        this.invincibleTime = config.invincibleTime || 1000;

        this.isInvincible = false;
        this.invincibleTimer = null;
        this.isDead = false;
    }

    /**
     * Take damage
     * @param {number} amount - Damage amount
     * @returns {boolean} - Whether damage was applied
     */
    takeDamage(amount) {
        if (this.isInvincible || this.isDead) {
            return false;
        }

        this.currentHealth -= amount;
        console.log(`Health: ${this.currentHealth}/${this.maxHealth}`);

        // Emit damage event
        this.gameObject.emit('damage', amount, this.currentHealth);

        // Visual feedback - flash red
        this.flashDamage();

        // Start invincibility
        this.startInvincibility();

        // Check if dead
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.die();
        }

        return true;
    }

    /**
     * Heal
     * @param {number} amount - Heal amount
     */
    heal(amount) {
        if (this.isDead) return;

        this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
        console.log(`Healed! Health: ${this.currentHealth}/${this.maxHealth}`);

        // Emit heal event
        this.gameObject.emit('heal', amount, this.currentHealth);
    }

    /**
     * Start invincibility period
     */
    startInvincibility() {
        this.isInvincible = true;

        // Clear existing timer
        if (this.invincibleTimer) {
            this.invincibleTimer.remove();
        }

        // Set up new timer
        this.invincibleTimer = this.scene.time.delayedCall(this.invincibleTime, () => {
            this.isInvincible = false;
            this.gameObject.clearTint();
        });
    }

    /**
     * Flash damage effect
     */
    flashDamage() {
        if (this.gameObject.setTint) {
            this.gameObject.setTint(0xff0000);

            this.scene.time.delayedCall(100, () => {
                if (this.gameObject && this.gameObject.clearTint) {
                    this.gameObject.clearTint();
                }
            });
        }
    }

    /**
     * Die
     */
    die() {
        if (this.isDead) return;

        this.isDead = true;
        console.log('Entity died');

        // Emit death event
        this.gameObject.emit('death');

        // Call death callback if provided
        if (this.onDeathCallback) {
            this.onDeathCallback(this.gameObject);
        }
    }

    /**
     * Revive the entity
     */
    revive() {
        this.isDead = false;
        this.currentHealth = this.maxHealth;
        this.isInvincible = false;
    }

    /**
     * Get health percentage (0-1)
     */
    getHealthPercent() {
        return this.currentHealth / this.maxHealth;
    }

    /**
     * Check if alive
     */
    isAlive() {
        return !this.isDead;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.invincibleTimer) {
            this.invincibleTimer.remove();
        }
        super.destroy();
    }
}

export default HealthComponent;

/**
 * BaseComponent - Foundation for all game components
 *
 * This implements the Composition Pattern as outlined in the blueprint.
 * Components are attached to GameObjects and handle specific behaviors.
 *
 * Usage:
 * const movement = new MovementComponent(playerSprite, scene, { speed: 200 });
 * movement.enable();
 */
class BaseComponent {
    /**
     * @param {Phaser.GameObjects.GameObject} gameObject - The game object this component is attached to
     * @param {Phaser.Scene} scene - The scene this component belongs to
     * @param {Object} config - Configuration options
     */
    constructor(gameObject, scene, config = {}) {
        this.gameObject = gameObject;
        this.scene = scene;
        this.config = config;
        this.enabled = false;

        // Store reference to this component on the game object
        if (!this.gameObject.components) {
            this.gameObject.components = [];
        }
        this.gameObject.components.push(this);
    }

    /**
     * Enable the component
     * Hooks into the scene's update loop
     */
    enable() {
        if (this.enabled) return;
        this.enabled = true;

        // Hook into scene update event
        this.updateBinding = this.update.bind(this);
        this.scene.events.on('update', this.updateBinding);

        this.onEnable();
    }

    /**
     * Disable the component
     * Unhooks from the scene's update loop
     */
    disable() {
        if (!this.enabled) return;
        this.enabled = false;

        // Unhook from scene update event
        if (this.updateBinding) {
            this.scene.events.off('update', this.updateBinding);
        }

        this.onDisable();
    }

    /**
     * Called when the component is enabled
     * Override in subclasses
     */
    onEnable() {
        // Override in subclass
    }

    /**
     * Called when the component is disabled
     * Override in subclasses
     */
    onDisable() {
        // Override in subclass
    }

    /**
     * Update method called every frame
     * Override in subclasses to implement behavior
     *
     * @param {number} time - Total elapsed time in ms
     * @param {number} delta - Time since last frame in ms
     */
    update(time, delta) {
        // Override in subclass
    }

    /**
     * Destroy the component
     * Clean up references and event listeners
     */
    destroy() {
        this.disable();

        // Remove from game object's component list
        if (this.gameObject.components) {
            const index = this.gameObject.components.indexOf(this);
            if (index > -1) {
                this.gameObject.components.splice(index, 1);
            }
        }

        this.gameObject = null;
        this.scene = null;
        this.config = null;
    }

    /**
     * Get another component attached to the same game object
     * @param {Function} componentClass - The component class to find
     * @returns {BaseComponent|null}
     */
    getComponent(componentClass) {
        if (!this.gameObject.components) return null;

        return this.gameObject.components.find(
            comp => comp instanceof componentClass
        ) || null;
    }
}

export default BaseComponent;

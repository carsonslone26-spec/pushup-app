import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PICKUPS, COLORS, WEAPONS } from '../utils/Constants.js';

export class PickupManager {
    constructor(scene) {
        this.scene = scene;
        this.pickups = scene.physics.add.group();
    }

    dropLoot(x, y, enemyConfig) {
        const rolls = Math.random();
        const luck = this.scene.player.stats.luck;
        
        // Always drop XP
        this.spawnPickup(x + Phaser.Math.Between(-20, 20), y + Phaser.Math.Between(-20, 20), 'xp');
        
        // Chance for currency
        if (rolls < 0.6 * luck) {
            this.spawnPickup(x + Phaser.Math.Between(-20, 20), y + Phaser.Math.Between(-20, 20), 'currency');
        }
        
        // Chance for health (rarer)
        if (Math.random() < 0.15 * luck) {
            this.spawnPickup(x + Phaser.Math.Between(-20, 20), y + Phaser.Math.Between(-20, 20), 'health');
        }
        
        // Chance for shield
        if (Math.random() < 0.1 * luck) {
            this.spawnPickup(x + Phaser.Math.Between(-20, 20), y + Phaser.Math.Between(-20, 20), 'shield');
        }
        
        // Rare chance for weapon pickup (based on score, higher score enemies more likely)
        if (Math.random() < 0.03 * luck && enemyConfig.score >= 200) {
            this.spawnWeaponPickup(x, y);
        }
    }

    spawnWeaponPickup(x, y) {
        const weaponKeys = Object.keys(WEAPONS).filter(k => k !== 'LASER');
        const weaponKey = Phaser.Utils.Array.GetRandom(weaponKeys);
        
        const pickup = this.pickups.create(x, y, 'pickup_currency');
        if (!pickup) return;
        
        pickup.setDepth(6);
        pickup.setData('type', 'weapon');
        pickup.setData('weapon', weaponKey);
        pickup.setData('color', WEAPONS[weaponKey].color);
        pickup.setTint(WEAPONS[weaponKey].color);
        pickup.setScale(1.5);
        pickup.body.setSize(30, 30);
        
        // Pulsing animation for weapon pickups
        this.scene.tweens.add({
            targets: pickup,
            scaleX: 1.8,
            scaleY: 1.8,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });
        
        // Longer timeout for rare drops
        this.scene.time.delayedCall(12000, () => {
            if (pickup && pickup.active) {
                this.scene.tweens.add({
                    targets: pickup,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        if (pickup && pickup.active) pickup.destroy();
                    }
                });
            }
        });
    }

    spawnPickup(x, y, type) {
        const config = PICKUPS[type.toUpperCase()];
        if (!config) return;
        
        const textureMap = {
            health: 'pickup_health',
            shield: 'pickup_shield',
            xp: 'pickup_xp',
            currency: 'pickup_currency',
        };
        
        const pickup = this.pickups.create(x, y, textureMap[type]);
        if (!pickup) return;
        
        pickup.setDepth(4);
        pickup.setData('type', type);
        pickup.setData('value', config.value);
        pickup.setData('color', config.color);
        pickup.body.setSize(24, 24);
        
        // Float animation
        this.scene.tweens.add({
            targets: pickup,
            y: y - 5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        
        // Fade out after some time
        this.scene.time.delayedCall(8000, () => {
            if (pickup && pickup.active) {
                this.scene.tweens.add({
                    targets: pickup,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        if (pickup && pickup.active) pickup.destroy();
                    }
                });
            }
        });
    }

    update(time, delta, playerSprite) {
        if (!playerSprite || !playerSprite.active) return;
        
        const magnetRange = this.scene.player.stats.magnetRange;
        
        // Magnet effect - pull pickups toward player
        this.pickups.getChildren().forEach(pickup => {
            if (!pickup.active) return;
            
            const dist = Phaser.Math.Distance.Between(
                pickup.x, pickup.y,
                playerSprite.x, playerSprite.y
            );
            
            if (dist < magnetRange) {
                const angle = Phaser.Math.Angle.Between(
                    pickup.x, pickup.y,
                    playerSprite.x, playerSprite.y
                );
                const speed = 300 * (1 - dist / magnetRange);
                pickup.body.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }
        });
    }

    clearAll() {
        this.pickups.clear(true, true);
    }
}

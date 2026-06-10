import Phaser from 'phaser';
import { COLORS, PARTICLES } from '../utils/Constants.js';

export class ParticleManager {
    constructor(scene) {
        this.scene = scene;
    }

    createExplosion(x, y, color = COLORS.SECONDARY, size = 30) {
        const count = Math.min(PARTICLES.EXPLOSION_COUNT, Math.floor(size * 1.5));
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Phaser.Math.FloatBetween(-0.3, 0.3);
            const speed = Phaser.Math.Between(100, 300) * (size / 30);
            const particle = this.scene.add.circle(x, y, Phaser.Math.Between(2, 5), color);
            particle.setDepth(15);
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: Phaser.Math.Between(300, 700),
                ease: 'Power2',
                onComplete: () => particle.destroy(),
            });
        }

        // Flash circle
        const flash = this.scene.add.circle(x, y, size * 0.8, 0xffffff, 0.8);
        flash.setDepth(14);
        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy(),
        });
    }

    createBossExplosion(x, y) {
        // Multiple large explosions in sequence
        for (let i = 0; i < 8; i++) {
            this.scene.time.delayedCall(i * 150, () => {
                const ox = x + Phaser.Math.Between(-80, 80);
                const oy = y + Phaser.Math.Between(-60, 60);
                this.createExplosion(ox, oy, 
                    Phaser.Utils.Array.GetRandom([0xff0066, 0xff6600, 0xffcc00, 0xffffff]),
                    50
                );
            });
        }

        // Screen flash
        this.scene.cameras.main.flash(300, 255, 100, 0);
    }

    createHitEffect(x, y, color = COLORS.PRIMARY) {
        for (let i = 0; i < PARTICLES.HIT_COUNT; i++) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = Phaser.Math.Between(50, 150);
            const particle = this.scene.add.circle(x, y, Phaser.Math.Between(1, 3), color);
            particle.setDepth(15);
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: Phaser.Math.Between(200, 400),
                onComplete: () => particle.destroy(),
            });
        }
    }

    createPickupEffect(x, y, color) {
        for (let i = 0; i < PARTICLES.PICKUP_COUNT; i++) {
            const angle = (Math.PI * 2 / PARTICLES.PICKUP_COUNT) * i;
            const particle = this.scene.add.circle(x, y, 3, color || COLORS.XP);
            particle.setDepth(15);
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 40,
                y: y + Math.sin(angle) * 40,
                alpha: 0,
                scale: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => particle.destroy(),
            });
        }
    }

    createEngineTrail(x, y) {
        const particle = this.scene.add.circle(
            x + Phaser.Math.Between(-3, 3),
            y,
            Phaser.Math.Between(2, 4),
            Phaser.Utils.Array.GetRandom([COLORS.PRIMARY, 0x00aaff, 0x0088cc]),
            0.7
        );
        particle.setDepth(3);
        
        this.scene.tweens.add({
            targets: particle,
            y: y + 30,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => particle.destroy(),
        });
    }

    createDashTrail(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const delay = i * 20;
            this.scene.time.delayedCall(delay, () => {
                const trail = this.scene.add.circle(
                    x + Phaser.Math.Between(-10, 10),
                    y + Phaser.Math.Between(-5, 5),
                    Phaser.Math.Between(3, 8),
                    color,
                    0.6
                );
                trail.setDepth(9);
                
                this.scene.tweens.add({
                    targets: trail,
                    alpha: 0,
                    scale: 0,
                    duration: 400,
                    onComplete: () => trail.destroy(),
                });
            });
        }
    }

    createLevelUpEffect(x, y) {
        // Ring expanding outward
        const ring = this.scene.add.circle(x, y, 10, 0x000000, 0);
        ring.setStrokeStyle(3, COLORS.XP);
        ring.setDepth(20);
        
        this.scene.tweens.add({
            targets: ring,
            radius: 80,
            alpha: 0,
            duration: 800,
            onComplete: () => ring.destroy(),
        });

        // Stars flying upward
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const star = this.scene.add.circle(x, y, 4, COLORS.XP);
            star.setDepth(20);
            
            this.scene.tweens.add({
                targets: star,
                x: x + Math.cos(angle) * 60,
                y: y + Math.sin(angle) * 60 - 30,
                alpha: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => star.destroy(),
            });
        }
    }
}

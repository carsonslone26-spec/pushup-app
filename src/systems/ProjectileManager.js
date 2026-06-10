import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';

export class ProjectileManager {
    constructor(scene) {
        this.scene = scene;
        this.playerProjectiles = scene.physics.add.group({
            maxSize: 200,
            classType: Phaser.Physics.Arcade.Sprite,
        });
        this.enemyProjectiles = scene.physics.add.group({
            maxSize: 300,
            classType: Phaser.Physics.Arcade.Sprite,
        });
    }

    firePlayerProjectile(x, y, angleDeg, config) {
        const proj = this.playerProjectiles.get(x, y, config.texture || 'projectile_player');
        if (!proj) return;
        
        proj.setActive(true).setVisible(true);
        proj.setDepth(7);
        proj.setData('damage', config.damage);
        proj.setData('piercing', config.piercing || false);
        proj.setData('homing', config.homing || false);
        
        if (config.homing) {
            proj.setData('speed', config.speed);
        }
        
        const angleRad = Phaser.Math.DegToRad(angleDeg);
        proj.setVelocity(
            Math.cos(angleRad) * config.speed,
            Math.sin(angleRad) * config.speed
        );
        
        proj.setRotation(angleRad + Math.PI / 2);
        
        // Set tint
        if (config.color) {
            proj.setTint(config.color);
        }

        return proj;
    }

    fireEnemyProjectile(x, y, angleDeg, config) {
        const proj = this.enemyProjectiles.get(x, y, 'projectile_enemy');
        if (!proj) return;
        
        proj.setActive(true).setVisible(true);
        proj.setDepth(7);
        proj.setData('damage', config.damage);
        
        const angleRad = Phaser.Math.DegToRad(angleDeg);
        proj.setVelocity(
            Math.cos(angleRad) * config.speed,
            Math.sin(angleRad) * config.speed
        );

        return proj;
    }

    update(time, delta) {
        // Clean up off-screen projectiles
        this.playerProjectiles.getChildren().forEach(proj => {
            if (proj.active) {
                if (proj.y < -50 || proj.y > GAME_HEIGHT + 50 || 
                    proj.x < -50 || proj.x > GAME_WIDTH + 50) {
                    proj.setActive(false).setVisible(false);
                    proj.body.stop();
                }
                
                // Homing behavior
                if (proj.getData('homing')) {
                    this.updateHoming(proj);
                }
            }
        });

        this.enemyProjectiles.getChildren().forEach(proj => {
            if (proj.active) {
                if (proj.y < -50 || proj.y > GAME_HEIGHT + 50 || 
                    proj.x < -50 || proj.x > GAME_WIDTH + 50) {
                    proj.setActive(false).setVisible(false);
                    proj.body.stop();
                }
            }
        });
    }

    updateHoming(proj) {
        const enemies = this.scene.enemyManager.enemies.getChildren().filter(e => e.active);
        if (enemies.length === 0) return;
        
        // Find closest enemy
        let closest = null;
        let closestDist = Infinity;
        
        for (const enemy of enemies) {
            const dist = Phaser.Math.Distance.Between(proj.x, proj.y, enemy.x, enemy.y);
            if (dist < closestDist) {
                closestDist = dist;
                closest = enemy;
            }
        }
        
        if (closest && closestDist < 400) {
            const angle = Phaser.Math.Angle.Between(proj.x, proj.y, closest.x, closest.y);
            const speed = proj.getData('speed') || 500;
            const currentAngle = Math.atan2(proj.body.velocity.y, proj.body.velocity.x);
            
            // Smoothly turn toward target
            const turnRate = 0.05;
            const newAngle = Phaser.Math.Angle.RotateTo(currentAngle, angle, turnRate);
            
            proj.setVelocity(
                Math.cos(newAngle) * speed,
                Math.sin(newAngle) * speed
            );
            proj.setRotation(newAngle + Math.PI / 2);
        }
    }

    clearAll() {
        this.playerProjectiles.clear(true, true);
        this.enemyProjectiles.clear(true, true);
    }
}

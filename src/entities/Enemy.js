import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/Constants.js';

export class Enemy {
    constructor(scene, x, y, config, difficulty = 1) {
        this.scene = scene;
        this.config = { ...config };
        this.difficulty = difficulty;
        
        // Scale stats with difficulty
        this.config.health = Math.floor(config.health * (1 + difficulty * 0.15));
        this.config.damage = Math.floor(config.damage * (1 + difficulty * 0.1));
        this.config.speed = config.speed * (1 + difficulty * 0.05);
        
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.lastFireTime = 0;
        this.behaviorTimer = 0;
        this.targetX = x;
        this.targetY = y;
        this.strafeDirection = 1;
        
        this.createSprite(x, y);
    }

    createSprite(x, y) {
        const textureKey = `enemy_${this.config.behavior === 'chase' ? 'drone' :
            this.config.behavior === 'strafe' ? 'fighter' :
            this.config.behavior === 'bomb' ? 'bomber' :
            this.config.behavior === 'snipe' ? 'sniper' :
            this.config.behavior === 'tank' ? 'tank' : 'swarm'}`;
        
        this.sprite = this.scene.physics.add.sprite(x, y, textureKey);
        this.sprite.setDepth(5);
        this.sprite.setData('entity', this);
        this.sprite.body.setSize(this.config.size * 1.5, this.config.size * 1.5);
        
        // Entry animation
        this.sprite.setAlpha(0);
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 1,
            duration: 300,
        });
    }

    update(time, delta, playerPos) {
        if (!this.sprite || !this.sprite.active) return;
        
        switch (this.config.behavior) {
            case 'chase':
                this.behaviorChase(playerPos, delta);
                break;
            case 'strafe':
                this.behaviorStrafe(playerPos, time, delta);
                break;
            case 'bomb':
                this.behaviorBomb(playerPos, time, delta);
                break;
            case 'snipe':
                this.behaviorSnipe(playerPos, time, delta);
                break;
            case 'tank':
                this.behaviorTank(playerPos, time, delta);
                break;
            case 'swarm':
                this.behaviorSwarm(playerPos, delta);
                break;
        }
        
        // Fire at player
        if (this.config.fireRate > 0 && time - this.lastFireTime > this.config.fireRate) {
            this.lastFireTime = time;
            this.fireAtPlayer(playerPos);
        }
        
        // Keep in bounds (with some margin)
        if (this.sprite.y > GAME_HEIGHT + 100) {
            this.destroy();
        }
    }

    behaviorChase(playerPos, delta) {
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            playerPos.x, playerPos.y
        );
        
        this.sprite.setVelocity(
            Math.cos(angle) * this.config.speed,
            Math.sin(angle) * this.config.speed
        );
        
        this.sprite.setRotation(angle + Math.PI / 2);
    }

    behaviorStrafe(playerPos, time, delta) {
        // Move down and strafe horizontally
        const targetY = Math.min(playerPos.y - 200, GAME_HEIGHT * 0.3);
        const dy = targetY - this.sprite.y;
        
        // Change strafe direction periodically
        if (time - this.behaviorTimer > 2000) {
            this.behaviorTimer = time;
            this.strafeDirection *= -1;
        }
        
        this.sprite.setVelocity(
            this.strafeDirection * this.config.speed,
            dy > 10 ? this.config.speed * 0.5 : (dy < -10 ? -this.config.speed * 0.3 : 0)
        );
        
        // Bounce off walls
        if (this.sprite.x < 50 || this.sprite.x > GAME_WIDTH - 50) {
            this.strafeDirection *= -1;
        }
    }

    behaviorBomb(playerPos, time, delta) {
        // Slowly move toward player's x position, stay high
        const targetY = 150;
        const dx = playerPos.x - this.sprite.x;
        const dy = targetY - this.sprite.y;
        
        this.sprite.setVelocity(
            Phaser.Math.Clamp(dx, -1, 1) * this.config.speed * 0.5,
            dy > 10 ? this.config.speed * 0.3 : 0
        );
    }

    behaviorSnipe(playerPos, time, delta) {
        // Move to a corner/edge and stay there
        if (time - this.behaviorTimer > 4000) {
            this.behaviorTimer = time;
            this.targetX = Phaser.Math.Between(100, GAME_WIDTH - 100);
            this.targetY = Phaser.Math.Between(80, 250);
        }
        
        const dx = this.targetX - this.sprite.x;
        const dy = this.targetY - this.sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 20) {
            this.sprite.setVelocity(
                (dx / dist) * this.config.speed,
                (dy / dist) * this.config.speed
            );
        } else {
            this.sprite.setVelocity(0, 0);
        }
    }

    behaviorTank(playerPos, time, delta) {
        // Slowly advance toward player
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            playerPos.x, playerPos.y
        );
        
        this.sprite.setVelocity(
            Math.cos(angle) * this.config.speed,
            Math.sin(angle) * this.config.speed
        );
    }

    behaviorSwarm(playerPos, delta) {
        // Fast erratic movement toward player
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            playerPos.x, playerPos.y
        );
        
        const wobble = Math.sin(Date.now() * 0.01 + this.sprite.x) * 0.5;
        
        this.sprite.setVelocity(
            Math.cos(angle + wobble) * this.config.speed,
            Math.sin(angle + wobble) * this.config.speed
        );
    }

    fireAtPlayer(playerPos) {
        if (!this.sprite || !this.sprite.active) return;
        
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            playerPos.x, playerPos.y
        );
        
        const angleDeg = Phaser.Math.RadToDeg(angle);
        
        this.scene.projectileManager.fireEnemyProjectile(
            this.sprite.x,
            this.sprite.y,
            angleDeg,
            {
                speed: 400,
                damage: this.config.damage,
            }
        );
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Flash white
        this.sprite.setTint(0xffffff);
        this.scene.time.delayedCall(50, () => {
            if (this.sprite && this.sprite.active) {
                this.sprite.clearTint();
            }
        });
        
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if (!this.sprite || !this.sprite.active) return;
        
        const x = this.sprite.x;
        const y = this.sprite.y;
        
        this.scene.onEnemyKilled(this, x, y);
        this.destroy();
    }

    destroy() {
        if (this.sprite && this.sprite.active) {
            this.sprite.destroy();
        }
    }
}

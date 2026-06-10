import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/Constants.js';

export class Boss {
    constructor(scene, config, difficulty = 1) {
        this.scene = scene;
        this.config = config;
        this.difficulty = difficulty;
        
        this.maxHealth = Math.floor(config.health * (1 + difficulty * 0.2));
        this.health = this.maxHealth;
        this.speed = config.speed;
        this.score = config.score;
        this.phase = 1;
        this.maxPhases = config.phases;
        this.phaseTimer = 0;
        this.attackTimer = 0;
        this.moveTimer = 0;
        this.targetX = GAME_WIDTH / 2;
        this.targetY = 200;
        this.pattern = 0;
        
        this.createSprite();
        this.createHealthBar();
        this.enterAnimation();
    }

    createSprite() {
        const textureMap = {
            'Void Mothership': 'boss_mothership',
            'Star Destroyer': 'boss_destroyer',
            'The Hivemind': 'boss_hivemind',
        };
        
        const texture = textureMap[this.config.name] || 'boss_mothership';
        
        this.sprite = this.scene.physics.add.sprite(GAME_WIDTH / 2, -150, texture);
        this.sprite.setDepth(8);
        this.sprite.setData('entity', this);
        this.sprite.body.setSize(this.config.size * 1.5, this.config.size);
    }

    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(
            GAME_WIDTH / 2, 40, 600, 16, 0x333333, 0.8
        ).setDepth(50);
        
        this.healthBarFill = this.scene.add.rectangle(
            GAME_WIDTH / 2, 40, 600, 16, 0xff0066, 1
        ).setDepth(51);
        
        this.nameText = this.scene.add.text(GAME_WIDTH / 2, 60, this.config.name, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ff6699',
        }).setOrigin(0.5).setDepth(51);
        
        // Initially hidden
        this.healthBarBg.setAlpha(0);
        this.healthBarFill.setAlpha(0);
        this.nameText.setAlpha(0);
    }

    enterAnimation() {
        this.sprite.setAlpha(0);
        
        this.scene.tweens.add({
            targets: this.sprite,
            y: 200,
            alpha: 1,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                this.isActive = true;
                // Show health bar
                this.scene.tweens.add({
                    targets: [this.healthBarBg, this.healthBarFill, this.nameText],
                    alpha: 1,
                    duration: 500,
                });
            }
        });
    }

    update(time, delta, playerPos) {
        if (!this.isActive || !this.sprite || !this.sprite.active) return;
        
        // Movement
        this.updateMovement(time, delta);
        
        // Attack patterns based on phase
        this.updateAttacks(time, delta, playerPos);
        
        // Update health bar
        this.updateHealthBar();
    }

    updateMovement(time, delta) {
        if (time - this.moveTimer > 3000) {
            this.moveTimer = time;
            this.targetX = Phaser.Math.Between(200, GAME_WIDTH - 200);
            this.targetY = Phaser.Math.Between(120, 300);
        }
        
        const dx = this.targetX - this.sprite.x;
        const dy = this.targetY - this.sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 10) {
            this.sprite.setVelocity(
                (dx / dist) * this.speed,
                (dy / dist) * this.speed
            );
        } else {
            this.sprite.setVelocity(0, 0);
        }
    }

    updateAttacks(time, delta, playerPos) {
        const attackRate = 1500 - (this.phase - 1) * 200;
        
        if (time - this.attackTimer > attackRate) {
            this.attackTimer = time;
            this.pattern = (this.pattern + 1) % 4;
            
            switch (this.pattern) {
                case 0:
                    this.attackSpread(playerPos);
                    break;
                case 1:
                    this.attackBurst(playerPos);
                    break;
                case 2:
                    this.attackCircle();
                    break;
                case 3:
                    if (this.phase >= 2) this.attackLaser(playerPos);
                    else this.attackSpread(playerPos);
                    break;
            }
        }
    }

    attackSpread(playerPos) {
        const baseAngle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            playerPos.x, playerPos.y
        );
        
        const count = 3 + this.phase;
        const spread = 30;
        
        for (let i = 0; i < count; i++) {
            const angle = baseAngle + Phaser.Math.DegToRad(-spread * (count - 1) / 2 + spread * i);
            this.scene.projectileManager.fireEnemyProjectile(
                this.sprite.x,
                this.sprite.y,
                Phaser.Math.RadToDeg(angle),
                { speed: 350, damage: this.config.damage }
            );
        }
    }

    attackBurst(playerPos) {
        for (let i = 0; i < 5; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                if (!this.sprite || !this.sprite.active) return;
                const angle = Phaser.Math.Angle.Between(
                    this.sprite.x, this.sprite.y,
                    playerPos.x, playerPos.y
                );
                this.scene.projectileManager.fireEnemyProjectile(
                    this.sprite.x,
                    this.sprite.y,
                    Phaser.Math.RadToDeg(angle) + Phaser.Math.Between(-10, 10),
                    { speed: 450, damage: this.config.damage * 0.7 }
                );
            });
        }
    }

    attackCircle() {
        const count = 12 + this.phase * 4;
        for (let i = 0; i < count; i++) {
            const angle = (360 / count) * i;
            this.scene.projectileManager.fireEnemyProjectile(
                this.sprite.x,
                this.sprite.y,
                angle,
                { speed: 250, damage: this.config.damage * 0.5 }
            );
        }
    }

    attackLaser(playerPos) {
        // Warning line then fast projectiles
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            playerPos.x, playerPos.y
        );
        
        // Warning effect
        const line = this.scene.add.line(
            0, 0,
            this.sprite.x, this.sprite.y,
            this.sprite.x + Math.cos(angle) * 2000,
            this.sprite.y + Math.sin(angle) * 2000,
            0xff0000, 0.3
        ).setDepth(20);
        
        this.scene.tweens.add({
            targets: line,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                line.destroy();
                // Fire fast projectiles along the line
                for (let i = 0; i < 10; i++) {
                    this.scene.time.delayedCall(i * 50, () => {
                        if (!this.sprite || !this.sprite.active) return;
                        this.scene.projectileManager.fireEnemyProjectile(
                            this.sprite.x,
                            this.sprite.y,
                            Phaser.Math.RadToDeg(angle),
                            { speed: 700, damage: this.config.damage * 0.4 }
                        );
                    });
                }
            }
        });
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Check phase transition
        const healthPercent = this.health / this.maxHealth;
        const newPhase = Math.max(1, this.maxPhases - Math.floor(healthPercent * this.maxPhases) + 1);
        
        if (newPhase > this.phase) {
            this.phase = newPhase;
            this.onPhaseChange();
        }
        
        // Flash
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

    onPhaseChange() {
        // Speed increase
        this.speed += 15;
        
        // Flash effect
        this.scene.cameras.main.flash(200, 255, 0, 100);
        
        // Phase change particles
        this.scene.particleManager.createExplosion(
            this.sprite.x, this.sprite.y, 0xff0066, 60
        );
        
        // Phase text
        this.scene.showDamageNumber(
            this.sprite.x, this.sprite.y - 80,
            `PHASE ${this.phase}!`, true
        );
    }

    updateHealthBar() {
        const percent = this.health / this.maxHealth;
        this.healthBarFill.setSize(600 * percent, 16);
        this.healthBarFill.setX(GAME_WIDTH / 2 - (600 * (1 - percent)) / 2);
        
        // Color based on health
        if (percent < 0.25) {
            this.healthBarFill.setFillStyle(0xff0000);
        } else if (percent < 0.5) {
            this.healthBarFill.setFillStyle(0xff6600);
        }
    }

    die() {
        if (!this.sprite || !this.sprite.active) return;
        
        const x = this.sprite.x;
        const y = this.sprite.y;
        
        // Clean up UI
        this.healthBarBg.destroy();
        this.healthBarFill.destroy();
        this.nameText.destroy();
        
        this.scene.onBossKilled(this, x, y);
        this.sprite.destroy();
    }

    destroy() {
        if (this.sprite && this.sprite.active) this.sprite.destroy();
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBarFill) this.healthBarFill.destroy();
        if (this.nameText) this.nameText.destroy();
    }
}

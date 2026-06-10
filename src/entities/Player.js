import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, WEAPONS, COLORS } from '../utils/Constants.js';

export class Player {
    constructor(scene, x, y, upgrades = {}) {
        this.scene = scene;
        this.upgrades = upgrades;
        
        this.setupStats();
        this.createSprite(x, y);
        this.createShield();
        this.createTrailEffect();
        
        this.isFiring = false;
        this.isInvulnerable = false;
        this.isDashing = false;
        this.lastFireTime = 0;
        this.lastDashTime = 0;
        this.currentWeaponIndex = 0;
        this.weapons = [WEAPONS.LASER];
        this.xp = 0;
        this.level = 1;
        this.xpToNext = 50;
    }

    setupStats() {
        const u = this.upgrades;
        this.stats = {
            maxHealth: PLAYER.BASE_HEALTH + (u.health || 0) * 15,
            maxShield: PLAYER.BASE_SHIELD + (u.shield || 0) * 12,
            speed: PLAYER.BASE_SPEED + (u.speed || 0) * 30,
            damageMultiplier: 1 + (u.damage || 0) * 0.12,
            fireRateMultiplier: 1 - (u.fireRate || 0) * 0.08,
            shieldRegen: 2 + (u.shieldRegen || 0) * 0.8,
            dashCooldown: PLAYER.DASH_COOLDOWN - (u.dash || 0) * 200,
            magnetRange: 80 + (u.magnet || 0) * 30,
            critChance: 0.05 + (u.crit || 0) * 0.03,
            luck: 1 + (u.luck || 0) * 0.15,
        };
        
        this.health = this.stats.maxHealth;
        this.shield = this.stats.maxShield;
    }

    createSprite(x, y) {
        this.sprite = this.scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setDepth(10);
        this.sprite.setDrag(800);
        this.sprite.body.setSize(30, 40);
        this.sprite.setData('entity', this);
    }

    createShield() {
        this.shieldSprite = this.scene.add.image(
            this.sprite.x, this.sprite.y, 'player_shield'
        ).setDepth(11).setAlpha(0.5).setScale(1.2);
    }

    createTrailEffect() {
        this.trailTimer = 0;
    }

    get currentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }

    setFiring(firing) {
        this.isFiring = firing;
    }

    update(time, delta, input) {
        this.handleMovement(input, delta);
        this.handleFiring(time);
        this.updateShield(delta);
        this.updateVisuals();
        this.updateTrail(time);
    }

    handleMovement(input, delta) {
        if (this.isDashing) return;

        const speed = this.stats.speed;
        let vx = input.x * speed;
        let vy = input.y * speed;

        // Normalize diagonal movement
        if (input.x !== 0 && input.y !== 0) {
            const factor = 0.707;
            vx *= factor;
            vy *= factor;
        }

        this.sprite.setVelocity(vx, vy);
        
        // Keep in bounds
        const x = Phaser.Math.Clamp(this.sprite.x, 30, GAME_WIDTH - 30);
        const y = Phaser.Math.Clamp(this.sprite.y, 30, GAME_HEIGHT - 30);
        this.sprite.setPosition(x, y);
    }

    handleFiring(time) {
        if (!this.isFiring) return;
        
        const weapon = this.currentWeapon;
        const fireRate = weapon.fireRate * this.stats.fireRateMultiplier;
        
        if (time - this.lastFireTime < fireRate) return;
        this.lastFireTime = time;

        const damage = weapon.damage * this.stats.damageMultiplier;
        
        for (let i = 0; i < weapon.projectiles; i++) {
            let angle = -90; // Up
            if (weapon.spread > 0 && weapon.projectiles > 1) {
                const totalSpread = weapon.spread * (weapon.projectiles - 1);
                angle += -totalSpread / 2 + weapon.spread * i;
            }

            this.scene.projectileManager.firePlayerProjectile(
                this.sprite.x,
                this.sprite.y - 20,
                angle,
                {
                    speed: weapon.speed,
                    damage,
                    color: weapon.color,
                    size: weapon.size,
                    homing: weapon.homing || false,
                    piercing: weapon.piercing || false,
                    texture: this.getProjectileTexture(weapon),
                }
            );
        }

        this.scene.playSound(weapon.sound);
    }

    getProjectileTexture(weapon) {
        if (weapon === WEAPONS.PLASMA) return 'projectile_plasma';
        if (weapon === WEAPONS.MISSILE) return 'projectile_missile';
        return 'projectile_player';
    }

    dash(input) {
        const time = this.scene.time.now;
        if (this.isDashing || time - this.lastDashTime < this.stats.dashCooldown) return;
        
        this.isDashing = true;
        this.isInvulnerable = true;
        this.lastDashTime = time;
        
        const dashSpeed = PLAYER.DASH_SPEED;
        let dx = input.x || 0;
        let dy = input.y || -1;
        
        // Normalize
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
            dx /= len;
            dy /= len;
        }

        this.sprite.setVelocity(dx * dashSpeed, dy * dashSpeed);
        this.sprite.setAlpha(0.5);
        
        // Dash trail
        this.scene.particleManager.createDashTrail(
            this.sprite.x, this.sprite.y, COLORS.PRIMARY
        );
        
        this.scene.playSound('dash1');

        this.scene.time.delayedCall(PLAYER.DASH_DURATION, () => {
            this.isDashing = false;
            this.sprite.setAlpha(1);
            this.scene.time.delayedCall(100, () => {
                this.isInvulnerable = false;
            });
        });
    }

    takeDamage(amount) {
        if (this.isInvulnerable) return;
        
        // Shield absorbs damage first
        if (this.shield > 0) {
            const shieldDamage = Math.min(this.shield, amount);
            this.shield -= shieldDamage;
            amount -= shieldDamage;
            this.scene.playSound('shield_hit');
        }
        
        if (amount > 0) {
            this.health -= amount;
        }
        
        // Invulnerability frames
        this.isInvulnerable = true;
        this.sprite.setAlpha(0.5);
        
        this.scene.time.delayedCall(PLAYER.INVULNERABLE_TIME, () => {
            this.isInvulnerable = false;
            this.sprite.setAlpha(1);
        });

        // Flash effect
        this.scene.tweens.add({
            targets: this.sprite,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => this.sprite.clearTint(),
        });

        if (this.health <= 0) {
            this.health = 0;
            this.scene.onPlayerDeath();
        }
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.stats.maxHealth);
    }

    addShield(amount) {
        this.shield = Math.min(this.shield + amount, this.stats.maxShield);
    }

    addXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xpToNext = Math.floor(50 * Math.pow(1.3, this.level - 1));
        
        // Slight stat boost
        this.stats.damageMultiplier += 0.05;
        this.stats.maxHealth += 5;
        this.health = Math.min(this.health + 10, this.stats.maxHealth);
        
        // Level up effect
        this.scene.particleManager.createLevelUpEffect(this.sprite.x, this.sprite.y);
        this.scene.playSound('level_up');
        
        // Flash text
        this.scene.showDamageNumber(
            this.sprite.x, this.sprite.y - 50,
            'LEVEL UP!', false
        );
    }

    addWeapon(weapon) {
        if (!this.weapons.includes(weapon)) {
            this.weapons.push(weapon);
        }
    }

    switchWeapon() {
        this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
    }

    selectWeapon(index) {
        if (index < this.weapons.length) {
            this.currentWeaponIndex = index;
        }
    }

    updateShield(delta) {
        if (this.shield < this.stats.maxShield) {
            this.shield += this.stats.shieldRegen * (delta / 1000);
            this.shield = Math.min(this.shield, this.stats.maxShield);
        }
    }

    updateVisuals() {
        // Update shield sprite position and visibility
        this.shieldSprite.setPosition(this.sprite.x, this.sprite.y);
        const shieldAlpha = (this.shield / this.stats.maxShield) * 0.5;
        this.shieldSprite.setAlpha(shieldAlpha);
        
        // Slight rotation based on horizontal movement
        const vx = this.sprite.body.velocity.x;
        this.sprite.setRotation(vx * 0.0005);
    }

    updateTrail(time) {
        if (time - this.trailTimer > 50) {
            this.trailTimer = time;
            if (Math.abs(this.sprite.body.velocity.x) > 50 || 
                Math.abs(this.sprite.body.velocity.y) > 50) {
                this.scene.particleManager.createEngineTrail(
                    this.sprite.x, this.sprite.y + 25
                );
            }
        }
    }

    getDashCooldownPercent() {
        const elapsed = this.scene.time.now - this.lastDashTime;
        return Math.min(1, elapsed / this.stats.dashCooldown);
    }
}

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, PLAYER, WEAPONS, ENEMIES, BOSSES, WAVES, PICKUPS } from '../utils/Constants.js';
import { Player } from '../entities/Player.js';
import { EnemyManager } from '../systems/EnemyManager.js';
import { WaveManager } from '../systems/WaveManager.js';
import { ProjectileManager } from '../systems/ProjectileManager.js';
import { ParticleManager } from '../systems/ParticleManager.js';
import { PickupManager } from '../systems/PickupManager.js';
import { SaveManager } from '../systems/SaveManager.js';
import { MusicManager } from '../systems/MusicManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.continueRun = data.continueRun || false;
    }

    create() {
        this.saveManager = new SaveManager();
        this.gameState = {
            wave: 0,
            score: 0,
            kills: 0,
            credits: 0,
            isPaused: false,
            isGameOver: false,
            screenShake: 0,
            combo: 0,
            comboTimer: 0,
            comboMultiplier: 1,
            ultimateCharge: 0,
            maxUltimate: 100,
        };

        this.setupWorld();
        this.createBackground();
        this.createPlayer();
        this.createManagers();
        this.setupInput();
        this.setupCollisions();
        this.setupCamera();
        
        // Launch HUD
        this.scene.launch('HUDScene', { gameScene: this });

        // Start first wave
        this.time.delayedCall(1500, () => {
            this.waveManager.startNextWave();
        });

        // Fade in
        this.cameras.main.fadeIn(500);
    }

    setupWorld() {
        this.physics.world.setBounds(-200, -200, GAME_WIDTH + 400, GAME_HEIGHT + 400);
    }

    createBackground() {
        // Multi-layer parallax starfield
        this.bgLayers = [];
        
        for (let layer = 0; layer < 3; layer++) {
            const stars = [];
            const count = 80 - layer * 20;
            const speed = 0.5 + layer * 0.8;
            
            for (let i = 0; i < count; i++) {
                const x = Phaser.Math.Between(0, GAME_WIDTH);
                const y = Phaser.Math.Between(0, GAME_HEIGHT);
                const size = 1 + layer * 0.5;
                const alpha = 0.3 + layer * 0.2;
                const star = this.add.circle(x, y, size, 0xffffff, alpha).setDepth(-10 + layer);
                star.speed = speed;
                stars.push(star);
            }
            this.bgLayers.push(stars);
        }

        // Nebula clouds
        this.nebulae = [];
        for (let i = 0; i < 3; i++) {
            const neb = this.add.image(
                Phaser.Math.Between(0, GAME_WIDTH),
                Phaser.Math.Between(-200, GAME_HEIGHT),
                'nebula'
            ).setAlpha(0.15).setScale(Phaser.Math.FloatBetween(3, 6)).setDepth(-5);
            neb.speed = 0.3;
            this.nebulae.push(neb);
        }
    }

    createPlayer() {
        const upgrades = this.saveManager.getUpgrades();
        this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 150, upgrades);
    }

    createManagers() {
        this.particleManager = new ParticleManager(this);
        this.projectileManager = new ProjectileManager(this);
        this.enemyManager = new EnemyManager(this);
        this.pickupManager = new PickupManager(this);
        this.waveManager = new WaveManager(this);
        this.musicManager = new MusicManager(this);
        
        // Start music on first user interaction
        this.input.once('pointerdown', () => {
            this.musicManager.start();
        });
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.escKey.on('down', () => {
            this.togglePause();
        });

        // Weapon switch keys
        this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        this.keyQ.on('down', () => { this.player.switchWeapon(); });
        this.key1.on('down', () => { this.player.selectWeapon(0); });
        this.key2.on('down', () => { this.player.selectWeapon(1); });
        this.key3.on('down', () => { this.player.selectWeapon(2); });

        // Ultimate ability (E key or right-click)
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keyE.on('down', () => { this.activateUltimate(); });
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.activateUltimate();
            }
        });

        // Mouse/touch for aiming - auto-fire while held
        this.input.on('pointerdown', () => {
            this.player.setFiring(true);
        });
        this.input.on('pointerup', () => {
            this.player.setFiring(false);
        });
    }

    setupCollisions() {
        // Player projectiles vs enemies
        this.physics.add.overlap(
            this.projectileManager.playerProjectiles,
            this.enemyManager.enemies,
            this.onProjectileHitEnemy,
            null,
            this
        );

        // Enemy projectiles vs player
        this.physics.add.overlap(
            this.projectileManager.enemyProjectiles,
            this.player.sprite,
            this.onEnemyProjectileHitPlayer,
            null,
            this
        );

        // Enemies vs player (collision)
        this.physics.add.overlap(
            this.enemyManager.enemies,
            this.player.sprite,
            this.onEnemyCollidePlayer,
            null,
            this
        );

        // Pickups vs player
        this.physics.add.overlap(
            this.pickupManager.pickups,
            this.player.sprite,
            this.onPickupCollected,
            null,
            this
        );
    }

    setupCamera() {
        this.cameras.main.setBackgroundColor(0x0a0a1a);
    }

    togglePause() {
        if (this.gameState.isGameOver) return;
        this.gameState.isPaused = !this.gameState.isPaused;
        
        if (this.gameState.isPaused) {
            this.physics.pause();
            this.scene.launch('PauseScene', { gameScene: this });
        } else {
            this.physics.resume();
            this.scene.stop('PauseScene');
        }
    }

    resumeGame() {
        this.gameState.isPaused = false;
        this.physics.resume();
    }

    resumeFromReward() {
        this.physics.resume();
        this.time.delayedCall(1000, () => {
            this.waveManager.betweenWaves = false;
            this.waveManager.startNextWave();
        });
    }

    onProjectileHitEnemy(projectile, enemy) {
        if (!projectile.active || !enemy.active) return;
        
        const damage = projectile.getData('damage') || 15;
        const isCrit = Math.random() < (this.player.stats.critChance || 0.05);
        const finalDamage = isCrit ? damage * 2 : damage;
        
        const enemyEntity = enemy.getData('entity');
        if (enemyEntity) {
            enemyEntity.takeDamage(finalDamage);
            
            // Hit particles
            this.particleManager.createHitEffect(
                projectile.x, projectile.y,
                isCrit ? 0xffcc00 : COLORS.PRIMARY
            );
            
            if (isCrit) {
                this.showDamageNumber(enemy.x, enemy.y - 20, finalDamage, true);
            }
        }

        // Destroy projectile unless piercing
        if (!projectile.getData('piercing')) {
            projectile.destroy();
        }
    }

    onEnemyProjectileHitPlayer(player, projectile) {
        if (!projectile.active || this.player.isInvulnerable) return;
        
        const damage = projectile.getData('damage') || 10;
        this.player.takeDamage(damage);
        
        this.particleManager.createHitEffect(
            projectile.x, projectile.y, COLORS.DANGER
        );
        
        projectile.destroy();
        this.shakeScreen(3, 100);
        
        this.playSound('hit1');
    }

    onEnemyCollidePlayer(player, enemy) {
        if (this.player.isInvulnerable || this.player.isDashing) return;
        
        const enemyEntity = enemy.getData('entity');
        if (!enemyEntity) return;
        
        const damage = enemyEntity.config.damage;
        this.player.takeDamage(damage);
        this.shakeScreen(5, 150);
        
        this.playSound('hit1');
    }

    onPickupCollected(player, pickup) {
        if (!pickup.active) return;
        
        const type = pickup.getData('type');
        const value = pickup.getData('value');
        
        switch (type) {
            case 'health':
                this.player.heal(value);
                break;
            case 'shield':
                this.player.addShield(value);
                break;
            case 'xp':
                this.player.addXP(value);
                break;
            case 'currency':
                this.gameState.credits += value;
                break;
            case 'weapon':
                const weaponKey = pickup.getData('weapon');
                if (weaponKey && WEAPONS[weaponKey]) {
                    this.player.addWeapon(WEAPONS[weaponKey]);
                    this.showDamageNumber(
                        pickup.x, pickup.y - 30,
                        `+${WEAPONS[weaponKey].name}!`, true
                    );
                }
                break;
        }

        this.particleManager.createPickupEffect(pickup.x, pickup.y, pickup.getData('color'));
        this.playSound('pickup1');
        pickup.destroy();
    }

    onEnemyKilled(enemy, x, y) {
        this.gameState.kills++;
        
        // Combo system
        this.gameState.combo++;
        this.gameState.comboTimer = 2000; // 2 seconds to maintain combo
        this.gameState.comboMultiplier = 1 + Math.floor(this.gameState.combo / 5) * 0.5;
        
        const scoreGain = Math.floor(enemy.config.score * this.gameState.comboMultiplier);
        this.gameState.score += scoreGain;
        
        // Charge ultimate
        this.gameState.ultimateCharge = Math.min(
            this.gameState.maxUltimate,
            this.gameState.ultimateCharge + 5
        );
        
        // Show combo if high enough
        if (this.gameState.combo >= 5 && this.gameState.combo % 5 === 0) {
            this.showDamageNumber(x, y - 40, `${this.gameState.combo}x COMBO!`, true);
        }
        
        // Drop pickups
        this.pickupManager.dropLoot(x, y, enemy.config);
        
        // Explosion
        this.particleManager.createExplosion(x, y, enemy.config.color, enemy.config.size);
        this.playSound('explosion1');
        this.shakeScreen(2, 80);
        
        // Check wave completion
        this.waveManager.checkWaveComplete();
    }

    onBossKilled(boss, x, y) {
        this.gameState.kills++;
        this.gameState.score += boss.score;
        this.gameState.credits += 50;
        
        // Big explosion
        this.particleManager.createBossExplosion(x, y);
        this.shakeScreen(10, 500);
        this.playSound('explosion2');
        
        // Drop lots of loot
        for (let i = 0; i < 15; i++) {
            const dropX = x + Phaser.Math.Between(-100, 100);
            const dropY = y + Phaser.Math.Between(-100, 100);
            this.pickupManager.dropLoot(dropX, dropY, { score: 500 });
        }
        
        this.waveManager.checkWaveComplete();
    }

    onPlayerDeath() {
        this.gameState.isGameOver = true;
        
        // Save stats
        this.saveManager.endRun(this.gameState);
        
        // Big explosion on player
        this.particleManager.createBossExplosion(this.player.sprite.x, this.player.sprite.y);
        this.shakeScreen(15, 800);
        
        this.time.delayedCall(1500, () => {
            this.scene.stop('HUDScene');
            this.scene.start('GameOverScene', {
                score: this.gameState.score,
                wave: this.gameState.wave,
                kills: this.gameState.kills,
                credits: this.gameState.credits,
            });
        });
    }

    activateUltimate() {
        if (this.gameState.ultimateCharge < this.gameState.maxUltimate) return;
        
        this.gameState.ultimateCharge = 0;
        
        // Screen-wide damage blast
        const px = this.player.sprite.x;
        const py = this.player.sprite.y;
        
        // Visual: expanding ring
        const ring = this.add.circle(px, py, 10, 0x00ffcc, 0.3);
        ring.setStrokeStyle(4, 0x00ffcc);
        ring.setDepth(50);
        
        this.tweens.add({
            targets: ring,
            radius: 800,
            alpha: 0,
            duration: 600,
            onComplete: () => ring.destroy(),
        });
        
        // Flash screen
        this.cameras.main.flash(300, 0, 255, 200);
        this.shakeScreen(8, 300);
        
        // Damage all enemies on screen
        this.enemyManager.activeEnemies.forEach(enemy => {
            if (enemy.sprite && enemy.sprite.active) {
                enemy.takeDamage(80);
                this.particleManager.createHitEffect(
                    enemy.sprite.x, enemy.sprite.y, COLORS.PRIMARY
                );
            }
        });
        
        // Damage boss if present
        if (this.enemyManager.activeBoss && this.enemyManager.activeBoss.sprite) {
            this.enemyManager.activeBoss.takeDamage(150);
        }
        
        this.playSound('explosion2');
    }

    updateCombo(delta) {
        if (this.gameState.comboTimer > 0) {
            this.gameState.comboTimer -= delta;
            if (this.gameState.comboTimer <= 0) {
                this.gameState.combo = 0;
                this.gameState.comboMultiplier = 1;
            }
        }
    }

    showDamageNumber(x, y, damage, isCrit) {
        const color = isCrit ? '#ffcc00' : '#ffffff';
        const size = isCrit ? '22px' : '16px';
        const text = this.add.text(x, y, Math.round(damage).toString(), {
            fontSize: size,
            fontFamily: 'monospace',
            color,
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: text,
            y: y - 40,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => text.destroy(),
        });
    }

    shakeScreen(intensity, duration) {
        this.cameras.main.shake(duration, intensity / 1000);
    }

    playSound(key) {
        try {
            this.sound.play(key, { volume: 0.3 });
        } catch (e) {
            // Sound may not be available
        }
    }

    update(time, delta) {
        if (this.gameState.isPaused || this.gameState.isGameOver) return;

        // Update background
        this.updateBackground(delta);
        
        // Get input
        const input = this.getInput();
        
        // Update player
        this.player.update(time, delta, input);
        
        // Update managers
        this.enemyManager.update(time, delta);
        this.projectileManager.update(time, delta);
        this.pickupManager.update(time, delta, this.player.sprite);
        this.waveManager.update(time, delta);
        this.updateCombo(delta);
        
        // Auto-fire: always fire (space or click enhances, but we auto-fire by default)
        if (this.spaceKey.isDown || this.input.activePointer.isDown) {
            this.player.setFiring(true);
        } else {
            // Auto-fire is on by default for better gameplay feel
            this.player.setFiring(true);
        }
        
        // Update music intensity based on enemy count
        if (this.musicManager && this.musicManager.isPlaying) {
            const intensity = Math.min(1, this.enemyManager.getActiveCount() / 15);
            this.musicManager.setIntensity(intensity);
        }

        // Dash
        if (this.shiftKey.isDown || Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
            this.player.dash(input);
        }
    }

    getInput() {
        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const up = this.cursors.up.isDown || this.wasd.up.isDown;
        const down = this.cursors.down.isDown || this.wasd.down.isDown;

        return {
            x: (right ? 1 : 0) - (left ? 1 : 0),
            y: (down ? 1 : 0) - (up ? 1 : 0),
            pointer: this.input.activePointer,
        };
    }

    updateBackground(delta) {
        const speed = delta / 16;
        
        for (const layer of this.bgLayers) {
            for (const star of layer) {
                star.y += star.speed * speed;
                if (star.y > GAME_HEIGHT + 10) {
                    star.y = -10;
                    star.x = Phaser.Math.Between(0, GAME_WIDTH);
                }
            }
        }

        for (const neb of this.nebulae) {
            neb.y += neb.speed * speed;
            if (neb.y > GAME_HEIGHT + 200) {
                neb.y = -200;
                neb.x = Phaser.Math.Between(0, GAME_WIDTH);
            }
        }
    }
}

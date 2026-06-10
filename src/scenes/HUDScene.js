import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/Constants.js';

export class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUDScene' });
    }

    init(data) {
        this.gameScene = data.gameScene;
    }

    create() {
        this.createHealthBar();
        this.createShieldBar();
        this.createXPBar();
        this.createScoreDisplay();
        this.createWaveDisplay();
        this.createWeaponDisplay();
        this.createDashIndicator();
        this.createMinimap();
        this.createComboDisplay();
        this.createUltimateDisplay();
    }

    createHealthBar() {
        const x = 30;
        const y = GAME_HEIGHT - 60;
        const width = 250;
        const height = 20;
        
        this.healthBarBg = this.add.rectangle(x, y, width, height, 0x333333, 0.8).setOrigin(0, 0.5);
        this.healthBarFill = this.add.rectangle(x, y, width, height, 0x33ff66, 1).setOrigin(0, 0.5);
        this.healthText = this.add.text(x + width + 10, y, '100/100', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#33ff66',
        }).setOrigin(0, 0.5);
        
        this.add.text(x, y - 18, 'HP', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888899',
        });
    }

    createShieldBar() {
        const x = 30;
        const y = GAME_HEIGHT - 90;
        const width = 200;
        const height = 14;
        
        this.shieldBarBg = this.add.rectangle(x, y, width, height, 0x333333, 0.8).setOrigin(0, 0.5);
        this.shieldBarFill = this.add.rectangle(x, y, width, height, 0x3399ff, 1).setOrigin(0, 0.5);
        this.shieldText = this.add.text(x + width + 10, y, '50/50', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#3399ff',
        }).setOrigin(0, 0.5);
        
        this.add.text(x, y - 14, 'SHIELD', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#888899',
        });
    }

    createXPBar() {
        const x = 30;
        const y = GAME_HEIGHT - 30;
        const width = 300;
        const height = 8;
        
        this.xpBarBg = this.add.rectangle(x, y, width, height, 0x222233, 0.8).setOrigin(0, 0.5);
        this.xpBarFill = this.add.rectangle(x, y, width, height, 0xcc66ff, 1).setOrigin(0, 0.5);
        this.levelText = this.add.text(x, y - 12, 'LVL 1', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#cc66ff',
        });
    }

    createScoreDisplay() {
        this.scoreText = this.add.text(GAME_WIDTH - 30, 30, 'SCORE: 0', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff',
        }).setOrigin(1, 0);
        
        this.creditsText = this.add.text(GAME_WIDTH - 30, 55, '💰 0', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffcc00',
        }).setOrigin(1, 0);
        
        this.killsText = this.add.text(GAME_WIDTH - 30, 80, '💀 0', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888899',
        }).setOrigin(1, 0);
    }

    createWaveDisplay() {
        this.waveText = this.add.text(GAME_WIDTH / 2, 30, 'WAVE 1', {
            fontSize: '22px',
            fontFamily: 'monospace',
            color: '#00ffcc',
        }).setOrigin(0.5, 0);
    }

    createWeaponDisplay() {
        const x = 30;
        const y = GAME_HEIGHT - 120;
        
        this.weaponText = this.add.text(x, y, '🔫 Pulse Laser', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#00ffcc',
        });
    }

    createDashIndicator() {
        const x = GAME_WIDTH - 60;
        const y = GAME_HEIGHT - 60;
        
        this.dashBg = this.add.circle(x, y, 20, 0x333333, 0.5);
        this.dashFill = this.add.circle(x, y, 18, COLORS.PRIMARY, 0.8);
        this.add.text(x, y + 28, 'DASH', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#888899',
        }).setOrigin(0.5);
    }

    createMinimap() {
        const x = 80;
        const y = 80;
        const size = 100;
        
        this.minimapBg = this.add.rectangle(x, y, size, size, 0x111122, 0.5).setStrokeStyle(1, 0x333344);
        this.minimapDots = [];
    }

    createComboDisplay() {
        this.comboText = this.add.text(GAME_WIDTH / 2, 70, '', {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setAlpha(0);
    }

    createUltimateDisplay() {
        const x = GAME_WIDTH - 60;
        const y = GAME_HEIGHT - 120;
        
        this.ultBg = this.add.circle(x, y, 22, 0x333333, 0.5);
        this.ultFill = this.add.circle(x, y, 20, 0xcc66ff, 0.3);
        this.ultText = this.add.text(x, y, 'E', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#cc66ff',
        }).setOrigin(0.5);
        this.add.text(x, y + 30, 'ULT', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#888899',
        }).setOrigin(0.5);
    }

    update() {
        if (!this.gameScene || !this.gameScene.player) return;
        
        const player = this.gameScene.player;
        const state = this.gameScene.gameState;
        
        // Update health bar
        const healthPercent = player.health / player.stats.maxHealth;
        this.healthBarFill.setSize(250 * healthPercent, 20);
        this.healthText.setText(`${Math.ceil(player.health)}/${player.stats.maxHealth}`);
        
        // Color change at low health
        if (healthPercent < 0.3) {
            this.healthBarFill.setFillStyle(0xff3333);
        } else if (healthPercent < 0.6) {
            this.healthBarFill.setFillStyle(0xffaa33);
        } else {
            this.healthBarFill.setFillStyle(0x33ff66);
        }
        
        // Update shield bar
        const shieldPercent = player.shield / player.stats.maxShield;
        this.shieldBarFill.setSize(200 * shieldPercent, 14);
        this.shieldText.setText(`${Math.ceil(player.shield)}/${player.stats.maxShield}`);
        
        // Update XP bar
        const xpPercent = player.xp / player.xpToNext;
        this.xpBarFill.setSize(300 * xpPercent, 8);
        this.levelText.setText(`LVL ${player.level}`);
        
        // Update score
        this.scoreText.setText(`SCORE: ${state.score.toLocaleString()}`);
        this.creditsText.setText(`💰 ${state.credits}`);
        this.killsText.setText(`💀 ${state.kills}`);
        
        // Update wave
        this.waveText.setText(`WAVE ${state.wave}`);
        
        // Update weapon
        this.weaponText.setText(`🔫 ${player.currentWeapon.name}`);
        
        // Update dash indicator
        const dashPercent = player.getDashCooldownPercent();
        this.dashFill.setScale(dashPercent);
        this.dashFill.setAlpha(dashPercent >= 1 ? 0.8 : 0.3);
        
        // Update combo display
        if (state.combo >= 3) {
            this.comboText.setText(`${state.combo}x COMBO (${state.comboMultiplier.toFixed(1)}x)`);
            this.comboText.setAlpha(1);
        } else {
            this.comboText.setAlpha(0);
        }
        
        // Update ultimate display
        const ultPercent = state.ultimateCharge / state.maxUltimate;
        this.ultFill.setScale(ultPercent);
        if (ultPercent >= 1) {
            this.ultFill.setFillStyle(0xcc66ff, 0.9);
            this.ultText.setColor('#ffffff');
        } else {
            this.ultFill.setFillStyle(0xcc66ff, 0.3);
            this.ultText.setColor('#cc66ff');
        }
        
        // Update minimap
        this.updateMinimap();
    }

    updateMinimap() {
        // Clean old dots
        this.minimapDots.forEach(d => d.destroy());
        this.minimapDots = [];
        
        const mapX = 80;
        const mapY = 80;
        const mapSize = 100;
        
        // Player dot
        const px = mapX - mapSize / 2 + (this.gameScene.player.sprite.x / GAME_WIDTH) * mapSize;
        const py = mapY - mapSize / 2 + (this.gameScene.player.sprite.y / GAME_HEIGHT) * mapSize;
        const playerDot = this.add.circle(px, py, 3, COLORS.PRIMARY);
        this.minimapDots.push(playerDot);
        
        // Enemy dots
        const enemies = this.gameScene.enemyManager.activeEnemies;
        for (const enemy of enemies) {
            if (!enemy.sprite || !enemy.sprite.active) continue;
            const ex = mapX - mapSize / 2 + (enemy.sprite.x / GAME_WIDTH) * mapSize;
            const ey = mapY - mapSize / 2 + (enemy.sprite.y / GAME_HEIGHT) * mapSize;
            if (ex > mapX - mapSize / 2 && ex < mapX + mapSize / 2 &&
                ey > mapY - mapSize / 2 && ey < mapY + mapSize / 2) {
                const dot = this.add.circle(ex, ey, 2, COLORS.DANGER);
                this.minimapDots.push(dot);
            }
        }
    }
}

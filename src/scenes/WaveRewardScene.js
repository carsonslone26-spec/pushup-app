import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WEAPONS } from '../utils/Constants.js';

export class WaveRewardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WaveRewardScene' });
    }

    init(data) {
        this.gameScene = data.gameScene;
        this.wave = data.wave || 1;
    }

    create() {
        // Dim background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
        
        // Title
        this.add.text(GAME_WIDTH / 2, 150, 'WAVE COMPLETE!', {
            fontSize: '42px',
            fontFamily: 'monospace',
            color: '#00ffcc',
            stroke: '#003322',
            strokeThickness: 3,
        }).setOrigin(0.5);
        
        this.add.text(GAME_WIDTH / 2, 200, 'Choose an upgrade:', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#888899',
        }).setOrigin(0.5);

        // Generate 3 random reward choices
        const rewards = this.generateRewards();
        this.createRewardCards(rewards);
    }

    generateRewards() {
        const allRewards = [
            { name: 'Damage Boost', desc: '+20% weapon damage', icon: '⚔️', effect: 'damage' },
            { name: 'Rapid Fire', desc: '+15% fire rate', icon: '🔥', effect: 'fireRate' },
            { name: 'Speed Boost', desc: '+50 movement speed', icon: '💨', effect: 'speed' },
            { name: 'Max Health +25', desc: 'Increase max HP', icon: '❤️', effect: 'maxHealth' },
            { name: 'Shield Boost', desc: '+20 max shield', icon: '🛡️', effect: 'maxShield' },
            { name: 'Shield Regen', desc: 'Faster shield recovery', icon: '✨', effect: 'shieldRegen' },
            { name: 'Crit Chance', desc: '+5% critical hit', icon: '💥', effect: 'crit' },
            { name: 'Magnet Range', desc: '+40 pickup range', icon: '🧲', effect: 'magnet' },
            { name: 'Heal', desc: 'Restore 30 HP', icon: '💚', effect: 'heal' },
            { name: 'Spread Shot', desc: 'Unlock Spread weapon', icon: '🌟', effect: 'weaponSpread' },
            { name: 'Plasma Cannon', desc: 'Unlock Plasma weapon', icon: '🔮', effect: 'weaponPlasma' },
            { name: 'Homing Missiles', desc: 'Unlock Missiles', icon: '🚀', effect: 'weaponMissile' },
            { name: 'Ion Beam', desc: 'Unlock piercing Beam', icon: '⚡', effect: 'weaponBeam' },
            { name: 'Multi-Shot', desc: '+1 projectile', icon: '➕', effect: 'multishot' },
            { name: 'Ultimate Charge', desc: '+30 ultimate energy', icon: '💜', effect: 'ultCharge' },
        ];
        
        // Shuffle and pick 3
        const shuffled = Phaser.Utils.Array.Shuffle([...allRewards]);
        return shuffled.slice(0, 3);
    }

    createRewardCards(rewards) {
        const cardWidth = 300;
        const cardHeight = 200;
        const spacing = 50;
        const totalWidth = rewards.length * cardWidth + (rewards.length - 1) * spacing;
        const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;
        const y = GAME_HEIGHT / 2 + 30;

        rewards.forEach((reward, i) => {
            const x = startX + i * (cardWidth + spacing);
            this.createCard(x, y, cardWidth, cardHeight, reward);
        });
    }

    createCard(x, y, width, height, reward) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, width, height, 0x1a1a2e, 0.95)
            .setStrokeStyle(2, COLORS.PRIMARY, 0.6);
        
        const icon = this.add.text(0, -50, reward.icon, {
            fontSize: '40px',
        }).setOrigin(0.5);
        
        const name = this.add.text(0, 0, reward.name, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff',
        }).setOrigin(0.5);
        
        const desc = this.add.text(0, 30, reward.desc, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888899',
        }).setOrigin(0.5);
        
        container.add([bg, icon, name, desc]);
        container.setSize(width, height);
        container.setInteractive();
        
        container.on('pointerover', () => {
            bg.setStrokeStyle(3, COLORS.PRIMARY, 1);
            bg.setFillStyle(0x2a2a4e, 0.98);
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
            });
        });
        
        container.on('pointerout', () => {
            bg.setStrokeStyle(2, COLORS.PRIMARY, 0.6);
            bg.setFillStyle(0x1a1a2e, 0.95);
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
            });
        });
        
        container.on('pointerdown', () => {
            this.applyReward(reward);
        });
    }

    applyReward(reward) {
        const player = this.gameScene.player;
        
        switch (reward.effect) {
            case 'damage':
                player.stats.damageMultiplier += 0.2;
                break;
            case 'fireRate':
                player.stats.fireRateMultiplier = Math.max(0.3, player.stats.fireRateMultiplier - 0.1);
                break;
            case 'speed':
                player.stats.speed += 50;
                break;
            case 'maxHealth':
                player.stats.maxHealth += 25;
                player.health += 25;
                break;
            case 'maxShield':
                player.stats.maxShield += 20;
                player.shield += 20;
                break;
            case 'shieldRegen':
                player.stats.shieldRegen += 0.8;
                break;
            case 'crit':
                player.stats.critChance += 0.05;
                break;
            case 'magnet':
                player.stats.magnetRange += 40;
                break;
            case 'heal':
                player.health = Math.min(player.health + 30, player.stats.maxHealth);
                break;
            case 'weaponSpread':
                player.addWeapon(WEAPONS.SPREAD);
                break;
            case 'weaponPlasma':
                player.addWeapon(WEAPONS.PLASMA);
                break;
            case 'weaponMissile':
                player.addWeapon(WEAPONS.MISSILE);
                break;
            case 'weaponBeam':
                player.addWeapon(WEAPONS.BEAM);
                break;
            case 'multishot':
                // Enhance current weapon
                const currentIdx = player.currentWeaponIndex;
                if (player.weapons[currentIdx]) {
                    player.weapons[currentIdx] = { 
                        ...player.weapons[currentIdx], 
                        projectiles: (player.weapons[currentIdx].projectiles || 1) + 1 
                    };
                }
                break;
            case 'ultCharge':
                this.gameScene.gameState.ultimateCharge = Math.min(
                    this.gameScene.gameState.maxUltimate,
                    this.gameScene.gameState.ultimateCharge + 30
                );
                break;
        }
        
        // Resume game first, then close this scene
        const gameScene = this.gameScene;
        this.scene.stop();
        gameScene.resumeFromReward();
    }
}

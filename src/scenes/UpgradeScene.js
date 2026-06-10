import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, UPGRADES } from '../utils/Constants.js';
import { SaveManager } from '../systems/SaveManager.js';

export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradeScene' });
    }

    create() {
        this.saveManager = new SaveManager();
        this.createBackground();
        this.createTitle();
        this.createUpgradeGrid();
        this.createCreditsDisplay();
        this.createBackButton();
    }

    createBackground() {
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);
        
        // Stars
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, GAME_WIDTH);
            const y = Phaser.Math.Between(0, GAME_HEIGHT);
            this.add.circle(x, y, Phaser.Math.Between(1, 2), 0xffffff, Phaser.Math.FloatBetween(0.2, 0.6));
        }
    }

    createTitle() {
        this.add.text(GAME_WIDTH / 2, 60, 'SHIP UPGRADES', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#00ffcc',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 105, 'Spend credits to permanently improve your ship', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#888899',
        }).setOrigin(0.5);
    }

    createUpgradeGrid() {
        const upgrades = Object.entries(UPGRADES);
        const cols = 5;
        const rows = Math.ceil(upgrades.length / cols);
        const startX = 200;
        const startY = 180;
        const spacingX = 320;
        const spacingY = 180;
        
        this.upgradeCards = [];

        upgrades.forEach(([key, config], index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;
            
            this.createUpgradeCard(x, y, key, config);
        });
    }

    createUpgradeCard(x, y, key, config) {
        const currentLevel = this.saveManager.getUpgrades()[key.toLowerCase()] || 0;
        const cost = Math.floor(config.costBase * Math.pow(config.costScale, currentLevel));
        const isMaxed = currentLevel >= config.maxLevel;
        const canAfford = this.saveManager.getData().credits >= cost;
        
        // Card background
        const cardWidth = 280;
        const cardHeight = 140;
        const bg = this.add.rectangle(x, y, cardWidth, cardHeight, 0x1a1a2e, 0.9)
            .setStrokeStyle(2, isMaxed ? 0xffcc00 : (canAfford ? COLORS.PRIMARY : 0x333344), 0.7);
        
        // Icon and name
        this.add.text(x, y - 40, config.icon, { fontSize: '28px' }).setOrigin(0.5);
        this.add.text(x, y - 10, config.name, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
        }).setOrigin(0.5);
        
        // Level indicator
        let levelText = '';
        for (let i = 0; i < config.maxLevel; i++) {
            levelText += i < currentLevel ? '█' : '░';
        }
        this.add.text(x, y + 15, levelText, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: isMaxed ? '#ffcc00' : '#00ffcc',
        }).setOrigin(0.5);
        
        // Cost or MAX text
        const costText = isMaxed ? 'MAXED' : `${cost} credits`;
        const costColor = isMaxed ? '#ffcc00' : (canAfford ? '#33ff66' : '#ff3366');
        this.add.text(x, y + 40, costText, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: costColor,
        }).setOrigin(0.5);
        
        // Make interactive if not maxed
        if (!isMaxed) {
            bg.setInteractive();
            bg.on('pointerover', () => {
                bg.setStrokeStyle(2, COLORS.PRIMARY, 1);
                bg.setFillStyle(0x2a2a4e, 0.95);
            });
            bg.on('pointerout', () => {
                bg.setStrokeStyle(2, canAfford ? COLORS.PRIMARY : 0x333344, 0.7);
                bg.setFillStyle(0x1a1a2e, 0.9);
            });
            bg.on('pointerdown', () => {
                if (this.saveManager.purchaseUpgrade(key.toLowerCase(), cost)) {
                    // Refresh the scene
                    this.scene.restart();
                }
            });
        }
    }

    createCreditsDisplay() {
        const credits = this.saveManager.getData().credits;
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, `💰 Credits: ${credits}`, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffcc00',
        }).setOrigin(0.5);
    }

    createBackButton() {
        const container = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 40);
        
        const text = this.add.text(0, 0, '← BACK TO MENU', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#888899',
        }).setOrigin(0.5);
        
        container.add([text]);
        container.setSize(200, 40);
        container.setInteractive();
        
        container.on('pointerover', () => text.setColor('#00ffcc'));
        container.on('pointerout', () => text.setColor('#888899'));
        container.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
    }
}

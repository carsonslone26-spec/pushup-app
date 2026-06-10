import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/Constants.js';
import { SaveManager } from '../systems/SaveManager.js';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        this.saveManager = new SaveManager();
        this.createBackground();
        this.createTitle();
        this.createMenu();
        this.createStats();
        this.createVersion();
    }

    createBackground() {
        // Animated starfield background
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            const x = Phaser.Math.Between(0, GAME_WIDTH);
            const y = Phaser.Math.Between(0, GAME_HEIGHT);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.3, 1);
            const star = this.add.circle(x, y, size, 0xffffff, alpha);
            star.speed = Phaser.Math.FloatBetween(0.2, 1.5);
            this.stars.push(star);
        }

        // Nebula effect
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(0, GAME_WIDTH);
            const y = Phaser.Math.Between(0, GAME_HEIGHT);
            this.add.image(x, y, 'nebula').setAlpha(0.3).setScale(Phaser.Math.FloatBetween(2, 5));
        }
    }

    createTitle() {
        const cx = GAME_WIDTH / 2;
        
        // Main title with glow effect
        this.titleText = this.add.text(cx, 180, 'STELLAR ROGUE', {
            fontSize: '96px',
            fontFamily: 'monospace',
            color: '#00ffcc',
            stroke: '#004433',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(cx, 270, 'A Roguelite Space Shooter', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#888899',
        }).setOrigin(0.5);

        // Title pulse animation
        this.tweens.add({
            targets: this.titleText,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createMenu() {
        const cx = GAME_WIDTH / 2;
        const startY = 420;
        const spacing = 80;

        const buttons = [
            { text: 'NEW RUN', callback: () => this.startGame(false) },
            { text: 'CONTINUE', callback: () => this.startGame(true), checkSave: true },
            { text: 'UPGRADES', callback: () => this.openUpgrades() },
            { text: 'SETTINGS', callback: () => this.openSettings() },
        ];

        this.menuButtons = [];
        buttons.forEach((btn, i) => {
            const y = startY + i * spacing;
            const container = this.add.container(cx, y);
            
            const bg = this.add.image(0, 0, 'button').setOrigin(0.5);
            const text = this.add.text(0, 0, btn.text, {
                fontSize: '28px',
                fontFamily: 'monospace',
                color: '#ffffff',
            }).setOrigin(0.5);

            container.add([bg, text]);
            container.setSize(300, 60);
            container.setInteractive();

            if (btn.checkSave && !this.saveManager.hasActiveRun()) {
                container.setAlpha(0.4);
            } else {
                container.on('pointerover', () => {
                    bg.setTexture('button_hover');
                    text.setColor('#00ffcc');
                    this.tweens.add({
                        targets: container,
                        scaleX: 1.05,
                        scaleY: 1.05,
                        duration: 100,
                    });
                });

                container.on('pointerout', () => {
                    bg.setTexture('button');
                    text.setColor('#ffffff');
                    this.tweens.add({
                        targets: container,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 100,
                    });
                });

                container.on('pointerdown', btn.callback);
            }

            this.menuButtons.push(container);
        });
    }

    createStats() {
        const save = this.saveManager.getData();
        const statsX = 100;
        const statsY = GAME_HEIGHT - 150;

        this.add.text(statsX, statsY, 'PILOT STATS', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#00ffcc',
        });

        const stats = [
            `Total Runs: ${save.totalRuns || 0}`,
            `Best Wave: ${save.bestWave || 0}`,
            `Total Kills: ${save.totalKills || 0}`,
            `Credits: ${save.credits || 0}`,
        ];

        stats.forEach((stat, i) => {
            this.add.text(statsX, statsY + 30 + i * 25, stat, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#888899',
            });
        });
    }

    createVersion() {
        this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 20, 'v1.0.0', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#444455',
        }).setOrigin(1, 1);
    }

    startGame(continueRun) {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene', { continueRun });
        });
    }

    openUpgrades() {
        this.scene.start('UpgradeScene');
    }

    openSettings() {
        this.scene.start('SettingsScene');
    }

    update() {
        // Animate stars
        for (const star of this.stars) {
            star.y += star.speed;
            if (star.y > GAME_HEIGHT) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, GAME_WIDTH);
            }
        }
    }
}

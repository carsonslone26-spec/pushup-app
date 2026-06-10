import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/Constants.js';
import { SaveManager } from '../systems/SaveManager.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalWave = data.wave || 0;
        this.finalKills = data.kills || 0;
        this.finalCredits = data.credits || 0;
    }

    create() {
        this.cameras.main.fadeIn(500);
        
        // Background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a, 0.95);
        
        // Game Over title
        const title = this.add.text(GAME_WIDTH / 2, 150, 'MISSION FAILED', {
            fontSize: '72px',
            fontFamily: 'monospace',
            color: '#ff3366',
            stroke: '#440011',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 1500,
            yoyo: true,
            repeat: -1,
        });

        // Stats panel
        const panelX = GAME_WIDTH / 2;
        const panelY = GAME_HEIGHT / 2 - 30;
        
        this.add.rectangle(panelX, panelY, 500, 300, 0x1a1a2e, 0.9)
            .setStrokeStyle(2, COLORS.PRIMARY, 0.5);

        const stats = [
            { label: 'FINAL SCORE', value: this.finalScore.toLocaleString(), color: '#ffffff' },
            { label: 'WAVE REACHED', value: this.finalWave.toString(), color: '#00ffcc' },
            { label: 'ENEMIES DEFEATED', value: this.finalKills.toString(), color: '#ff6b35' },
            { label: 'CREDITS EARNED', value: `+${this.finalCredits}`, color: '#ffcc00' },
        ];

        stats.forEach((stat, i) => {
            const y = panelY - 100 + i * 60;
            this.add.text(panelX - 180, y, stat.label, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#888899',
            }).setOrigin(0, 0.5);
            
            this.add.text(panelX + 180, y, stat.value, {
                fontSize: '24px',
                fontFamily: 'monospace',
                color: stat.color,
            }).setOrigin(1, 0.5);
        });

        // Check for new records
        const saveManager = new SaveManager();
        const saveData = saveManager.getData();
        
        if (this.finalScore >= (saveData.bestScore || 0)) {
            this.add.text(panelX, panelY + 130, '🏆 NEW HIGH SCORE! 🏆', {
                fontSize: '20px',
                fontFamily: 'monospace',
                color: '#ffcc00',
            }).setOrigin(0.5);
        }

        // Buttons
        const buttonY = GAME_HEIGHT - 150;
        
        this.createButton(panelX - 160, buttonY, 'TRY AGAIN', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', { continueRun: false });
            });
        });

        this.createButton(panelX + 160, buttonY, 'MAIN MENU', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        });
    }

    createButton(x, y, text, callback) {
        const container = this.add.container(x, y);
        
        const bg = this.add.image(0, 0, 'button').setOrigin(0.5);
        const label = this.add.text(0, 0, text, {
            fontSize: '22px',
            fontFamily: 'monospace',
            color: '#ffffff',
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        container.setSize(300, 60);
        container.setInteractive();
        
        container.on('pointerover', () => {
            bg.setTexture('button_hover');
            label.setColor('#00ffcc');
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
            });
        });
        container.on('pointerout', () => {
            bg.setTexture('button');
            label.setColor('#ffffff');
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
            });
        });
        container.on('pointerdown', callback);
    }
}

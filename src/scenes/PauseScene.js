import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/Constants.js';

export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    init(data) {
        this.gameScene = data.gameScene;
    }

    create() {
        // Dim overlay
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
        
        // Pause title
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, 'PAUSED', {
            fontSize: '64px',
            fontFamily: 'monospace',
            color: '#00ffcc',
        }).setOrigin(0.5);
        
        // Menu options
        const buttons = [
            { text: 'RESUME', callback: () => this.resume() },
            { text: 'SETTINGS', callback: () => this.openSettings() },
            { text: 'QUIT TO MENU', callback: () => this.quitToMenu() },
        ];
        
        buttons.forEach((btn, i) => {
            const y = GAME_HEIGHT / 2 - 30 + i * 70;
            const container = this.add.container(GAME_WIDTH / 2, y);
            
            const bg = this.add.image(0, 0, 'button').setOrigin(0.5);
            const text = this.add.text(0, 0, btn.text, {
                fontSize: '24px',
                fontFamily: 'monospace',
                color: '#ffffff',
            }).setOrigin(0.5);
            
            container.add([bg, text]);
            container.setSize(300, 60);
            container.setInteractive();
            
            container.on('pointerover', () => {
                bg.setTexture('button_hover');
                text.setColor('#00ffcc');
            });
            container.on('pointerout', () => {
                bg.setTexture('button');
                text.setColor('#ffffff');
            });
            container.on('pointerdown', btn.callback);
        });

        // Controls reference
        const controlsY = GAME_HEIGHT - 150;
        this.add.text(GAME_WIDTH / 2, controlsY, 'CONTROLS', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#00ffcc',
        }).setOrigin(0.5);

        const controls = [
            'WASD / Arrows - Move',
            'Left Click / Space - Fire',
            'Shift - Dash',
            'ESC - Pause',
        ];

        controls.forEach((ctrl, i) => {
            this.add.text(GAME_WIDTH / 2, controlsY + 30 + i * 22, ctrl, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#888899',
            }).setOrigin(0.5);
        });
    }

    resume() {
        this.scene.stop();
        this.gameScene.resumeGame();
    }

    openSettings() {
        // Could implement in-game settings here
    }

    quitToMenu() {
        this.scene.stop('HUDScene');
        this.scene.stop('GameScene');
        this.scene.stop();
        this.scene.start('MainMenuScene');
    }
}

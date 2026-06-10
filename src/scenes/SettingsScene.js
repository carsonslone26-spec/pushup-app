import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/Constants.js';
import { SaveManager } from '../systems/SaveManager.js';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    create() {
        this.saveManager = new SaveManager();
        this.settings = { ...this.saveManager.getSettings() };
        
        // Background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);
        
        // Title
        this.add.text(GAME_WIDTH / 2, 80, 'SETTINGS', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#00ffcc',
        }).setOrigin(0.5);

        // Settings items
        const startY = 200;
        const spacing = 70;
        
        this.createSlider(GAME_WIDTH / 2, startY, 'Music Volume', 'musicVolume', this.settings.musicVolume);
        this.createSlider(GAME_WIDTH / 2, startY + spacing, 'SFX Volume', 'sfxVolume', this.settings.sfxVolume);
        this.createToggle(GAME_WIDTH / 2, startY + spacing * 2, 'Screen Shake', 'screenShake', this.settings.screenShake);
        this.createToggle(GAME_WIDTH / 2, startY + spacing * 3, 'Damage Numbers', 'showDamageNumbers', this.settings.showDamageNumbers);
        this.createToggle(GAME_WIDTH / 2, startY + spacing * 4, 'Show FPS', 'showFPS', this.settings.showFPS);
        
        // Reset button
        this.createResetButton(GAME_WIDTH / 2, startY + spacing * 6);
        
        // Back button
        this.createBackButton();
    }

    createSlider(x, y, label, key, value) {
        this.add.text(x - 250, y, label, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff',
        }).setOrigin(0, 0.5);

        const sliderWidth = 200;
        const sliderX = x + 80;
        
        // Track
        this.add.rectangle(sliderX, y, sliderWidth, 6, 0x333344).setOrigin(0, 0.5);
        
        // Fill
        const fill = this.add.rectangle(sliderX, y, sliderWidth * value, 6, COLORS.PRIMARY).setOrigin(0, 0.5);
        
        // Handle
        const handle = this.add.circle(sliderX + sliderWidth * value, y, 10, COLORS.PRIMARY);
        handle.setInteractive({ draggable: true });
        
        // Value text
        const valueText = this.add.text(sliderX + sliderWidth + 30, y, `${Math.round(value * 100)}%`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#888899',
        }).setOrigin(0, 0.5);

        handle.on('drag', (pointer, dragX) => {
            const newX = Phaser.Math.Clamp(dragX, sliderX, sliderX + sliderWidth);
            handle.x = newX;
            const newValue = (newX - sliderX) / sliderWidth;
            fill.setSize(sliderWidth * newValue, 6);
            valueText.setText(`${Math.round(newValue * 100)}%`);
            this.settings[key] = newValue;
            this.saveManager.updateSettings(this.settings);
        });
    }

    createToggle(x, y, label, key, value) {
        this.add.text(x - 250, y, label, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff',
        }).setOrigin(0, 0.5);

        const toggleX = x + 180;
        const bg = this.add.rectangle(toggleX, y, 60, 30, value ? COLORS.PRIMARY : 0x333344, 0.8)
            .setStrokeStyle(2, value ? COLORS.PRIMARY : 0x555566);
        const knob = this.add.circle(toggleX + (value ? 15 : -15), y, 12, 0xffffff);
        
        const statusText = this.add.text(toggleX + 50, y, value ? 'ON' : 'OFF', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: value ? '#00ffcc' : '#666677',
        }).setOrigin(0, 0.5);

        bg.setInteractive();
        bg.on('pointerdown', () => {
            this.settings[key] = !this.settings[key];
            const newVal = this.settings[key];
            
            bg.setFillStyle(newVal ? COLORS.PRIMARY : 0x333344, 0.8);
            bg.setStrokeStyle(2, newVal ? COLORS.PRIMARY : 0x555566);
            knob.x = toggleX + (newVal ? 15 : -15);
            statusText.setText(newVal ? 'ON' : 'OFF');
            statusText.setColor(newVal ? '#00ffcc' : '#666677');
            
            this.saveManager.updateSettings(this.settings);
        });
    }

    createResetButton(x, y) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 250, 50, 0x330011, 0.9)
            .setStrokeStyle(2, 0xff3366, 0.7);
        const text = this.add.text(0, 0, '⚠️ RESET ALL DATA', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ff3366',
        }).setOrigin(0.5);
        
        container.add([bg, text]);
        container.setSize(250, 50);
        container.setInteractive();
        
        container.on('pointerover', () => bg.setFillStyle(0x440011, 0.95));
        container.on('pointerout', () => bg.setFillStyle(0x330011, 0.9));
        container.on('pointerdown', () => {
            // Confirm reset
            this.saveManager.resetAll();
            this.scene.restart();
        });
    }

    createBackButton() {
        const container = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 50);
        
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

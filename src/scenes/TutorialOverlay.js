import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/Constants.js';
import { SaveManager } from '../systems/SaveManager.js';

export class TutorialOverlay extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialOverlay' });
    }

    init(data) {
        this.gameScene = data.gameScene;
    }

    create() {
        // Check if player has played before
        const saveManager = new SaveManager();
        if (saveManager.getData().totalRuns > 0) {
            this.scene.stop();
            return;
        }
        
        // Semi-transparent background
        this.bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
        
        // Title
        this.add.text(GAME_WIDTH / 2, 120, 'HOW TO PLAY', {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: '#00ffcc',
        }).setOrigin(0.5);
        
        // Control hints
        const controls = [
            { key: 'WASD / Arrows', action: 'Move your ship' },
            { key: 'Auto-Fire', action: 'Your ship fires automatically' },
            { key: 'SHIFT', action: 'Dash (invulnerable dodge)' },
            { key: 'Q / 1-2-3', action: 'Switch weapons' },
            { key: 'E', action: 'Ultimate ability (when charged)' },
            { key: 'ESC', action: 'Pause game' },
        ];
        
        const startY = 200;
        controls.forEach((ctrl, i) => {
            const y = startY + i * 50;
            
            // Key
            this.add.text(GAME_WIDTH / 2 - 150, y, ctrl.key, {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#00ffcc',
                backgroundColor: '#1a1a2e',
                padding: { x: 8, y: 4 },
            }).setOrigin(0.5);
            
            // Action
            this.add.text(GAME_WIDTH / 2 + 80, y, ctrl.action, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ccccdd',
            }).setOrigin(0, 0.5);
        });
        
        // Tips
        const tips = [
            '• Kill enemies quickly to build combos for bonus score',
            '• Collect XP orbs to level up and earn credits',
            '• Every 3 waves, choose a powerful upgrade',
            '• Spend credits at the Upgrades shop between runs',
            '• Boss fights every 5 waves - watch for phase changes!',
        ];
        
        const tipsY = 510;
        this.add.text(GAME_WIDTH / 2, tipsY - 30, 'TIPS', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffcc00',
        }).setOrigin(0.5);
        
        tips.forEach((tip, i) => {
            this.add.text(GAME_WIDTH / 2, tipsY + i * 28, tip, {
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#888899',
            }).setOrigin(0.5);
        });
        
        // Dismiss prompt
        const dismissText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Click anywhere or press any key to start', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff',
        }).setOrigin(0.5);
        
        // Pulsing animation
        this.tweens.add({
            targets: dismissText,
            alpha: 0.4,
            duration: 800,
            yoyo: true,
            repeat: -1,
        });
        
        // Dismiss on click or key
        this.input.once('pointerdown', () => this.dismiss());
        this.input.keyboard.once('keydown', () => this.dismiss());
    }

    dismiss() {
        this.cameras.main.fadeOut(300);
        this.time.delayedCall(300, () => {
            this.scene.stop();
        });
    }
}

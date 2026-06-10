import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { HUDScene } from './scenes/HUDScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { UpgradeScene } from './scenes/UpgradeScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { WaveRewardScene } from './scenes/WaveRewardScene.js';
import { TutorialOverlay } from './scenes/TutorialOverlay.js';

const config = {
    type: Phaser.WEBGL,
    parent: 'game-container',
    width: 1920,
    height: 1080,
    backgroundColor: '#0a0a1a',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
    },
    audio: {
        disableWebAudio: false
    },
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        GameScene,
        HUDScene,
        PauseScene,
        GameOverScene,
        UpgradeScene,
        SettingsScene,
        WaveRewardScene,
        TutorialOverlay
    ]
};

const game = new Phaser.Game(config);

export default game;

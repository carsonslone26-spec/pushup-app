import Phaser from 'phaser';
import { WAVES, ENEMIES, BOSSES } from '../utils/Constants.js';

export class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveComplete = false;
        this.spawnedThisWave = 0;
        this.totalThisWave = 0;
        this.isBossWave = false;
        this.waveTimer = 0;
        this.betweenWaves = false;
    }

    startNextWave() {
        this.currentWave++;
        this.scene.gameState.wave = this.currentWave;
        this.isWaveActive = true;
        this.waveComplete = false;
        this.isBossWave = this.currentWave % WAVES.BOSS_EVERY === 0;
        
        if (this.isBossWave) {
            this.startBossWave();
        } else {
            this.startNormalWave();
        }
        
        // Start asteroids from wave 4
        if (this.scene.asteroidManager) {
            this.scene.asteroidManager.start(this.currentWave);
        }
        
        // Announce wave
        this.announceWave();
    }

    startNormalWave() {
        const difficulty = Math.floor((this.currentWave - 1) * WAVES.DIFFICULTY_SCALE);
        const enemyCount = WAVES.ENEMIES_PER_WAVE_BASE + 
            Math.floor(this.currentWave * WAVES.ENEMIES_PER_WAVE_SCALE);
        
        this.totalThisWave = enemyCount;
        this.spawnedThisWave = 0;
        
        const waveConfig = this.generateWaveConfig(enemyCount, difficulty);
        this.scene.enemyManager.spawnWave(waveConfig);
    }

    startBossWave() {
        const bossIndex = Math.floor(this.currentWave / WAVES.BOSS_EVERY) - 1;
        const bossKeys = Object.keys(BOSSES);
        const bossKey = bossKeys[bossIndex % bossKeys.length];
        const bossConfig = BOSSES[bossKey];
        
        const difficulty = Math.floor((this.currentWave - 1) * WAVES.DIFFICULTY_SCALE);
        this.scene.enemyManager.spawnBoss(bossConfig, difficulty);
        
        this.totalThisWave = 1;
    }

    generateWaveConfig(count, difficulty) {
        // Determine available enemy types based on wave
        const availableTypes = this.getAvailableTypes();
        
        // Pick formation
        const formations = ['random', 'line', 'v', 'circle', 'sides'];
        const formation = Phaser.Utils.Array.GetRandom(formations);
        
        return {
            types: availableTypes,
            count: count,
            difficulty: difficulty,
            formation: formation,
        };
    }

    getAvailableTypes() {
        const types = ['DRONE'];
        
        if (this.currentWave >= 2) types.push('SWARM');
        if (this.currentWave >= 3) types.push('FIGHTER');
        if (this.currentWave >= 5) types.push('SNIPER');
        if (this.currentWave >= 7) types.push('BOMBER');
        if (this.currentWave >= 9) types.push('TANK');
        
        return types;
    }

    checkWaveComplete() {
        if (!this.isWaveActive) return;
        
        const activeCount = this.scene.enemyManager.getActiveCount();
        
        if (activeCount <= 0) {
            this.isWaveActive = false;
            this.waveComplete = true;
            this.betweenWaves = true;
            
            // Show reward screen every 3 waves (not on boss waves)
            if (this.currentWave % 3 === 0 && !this.isBossWave) {
                this.scene.physics.pause();
                this.scene.scene.launch('WaveRewardScene', {
                    gameScene: this.scene,
                    wave: this.currentWave,
                });
            } else {
                // Delay before next wave
                this.scene.time.delayedCall(WAVES.WAVE_DELAY, () => {
                    this.betweenWaves = false;
                    this.startNextWave();
                });
            }
        }
    }

    announceWave() {
        const text = this.isBossWave ? 
            `⚠️ BOSS WAVE ${this.currentWave} ⚠️` : 
            `WAVE ${this.currentWave}`;
        
        const color = this.isBossWave ? '#ff3366' : '#00ffcc';
        
        const announcement = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 100,
            text,
            {
                fontSize: this.isBossWave ? '48px' : '36px',
                fontFamily: 'monospace',
                color: color,
                stroke: '#000000',
                strokeThickness: 4,
            }
        ).setOrigin(0.5).setDepth(100).setAlpha(0);

        this.scene.tweens.add({
            targets: announcement,
            alpha: 1,
            y: announcement.y - 20,
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            hold: 1000,
            onComplete: () => announcement.destroy(),
        });
    }

    update(time, delta) {
        // Additional spawn logic for continuous waves could go here
    }

    getCurrentWave() {
        return this.currentWave;
    }
}

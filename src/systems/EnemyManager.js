import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, ENEMIES } from '../utils/Constants.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';

export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.physics.add.group();
        this.activeEnemies = [];
        this.activeBoss = null;
    }

    spawnEnemy(type, x, y, difficulty) {
        const config = ENEMIES[type];
        if (!config) return;
        
        if (x === undefined) x = Phaser.Math.Between(100, GAME_WIDTH - 100);
        if (y === undefined) y = -50;
        
        const enemy = new Enemy(this.scene, x, y, config, difficulty);
        this.enemies.add(enemy.sprite);
        this.activeEnemies.push(enemy);
        
        return enemy;
    }

    spawnBoss(bossConfig, difficulty) {
        this.activeBoss = new Boss(this.scene, bossConfig, difficulty);
        this.enemies.add(this.activeBoss.sprite);
        return this.activeBoss;
    }

    spawnWave(waveConfig) {
        const { types, count, difficulty, formation } = waveConfig;
        
        switch (formation) {
            case 'random':
                this.spawnRandom(types, count, difficulty);
                break;
            case 'line':
                this.spawnLine(types, count, difficulty);
                break;
            case 'v':
                this.spawnV(types, count, difficulty);
                break;
            case 'circle':
                this.spawnCircle(types, count, difficulty);
                break;
            case 'sides':
                this.spawnSides(types, count, difficulty);
                break;
            default:
                this.spawnRandom(types, count, difficulty);
        }
    }

    spawnRandom(types, count, difficulty) {
        for (let i = 0; i < count; i++) {
            this.scene.time.delayedCall(i * 300, () => {
                const type = Phaser.Utils.Array.GetRandom(types);
                const x = Phaser.Math.Between(100, GAME_WIDTH - 100);
                this.spawnEnemy(type, x, -50, difficulty);
            });
        }
    }

    spawnLine(types, count, difficulty) {
        const spacing = (GAME_WIDTH - 200) / (count - 1 || 1);
        for (let i = 0; i < count; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                const type = types[i % types.length];
                const x = 100 + spacing * i;
                this.spawnEnemy(type, x, -50, difficulty);
            });
        }
    }

    spawnV(types, count, difficulty) {
        const cx = GAME_WIDTH / 2;
        for (let i = 0; i < count; i++) {
            this.scene.time.delayedCall(i * 150, () => {
                const type = types[i % types.length];
                const side = i % 2 === 0 ? -1 : 1;
                const offset = Math.floor(i / 2) * 60;
                const x = cx + side * offset;
                const y = -50 - Math.floor(i / 2) * 30;
                this.spawnEnemy(type, x, y, difficulty);
            });
        }
    }

    spawnCircle(types, count, difficulty) {
        const cx = GAME_WIDTH / 2;
        const cy = -100;
        const radius = 150;
        
        for (let i = 0; i < count; i++) {
            this.scene.time.delayedCall(200, () => {
                const type = types[i % types.length];
                const angle = (Math.PI * 2 / count) * i;
                const x = cx + Math.cos(angle) * radius;
                const y = cy + Math.sin(angle) * radius;
                this.spawnEnemy(type, x, y, difficulty);
            });
        }
    }

    spawnSides(types, count, difficulty) {
        const half = Math.floor(count / 2);
        for (let i = 0; i < count; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                const type = types[i % types.length];
                const x = i < half ? -30 : GAME_WIDTH + 30;
                const y = Phaser.Math.Between(50, 300);
                this.spawnEnemy(type, x, y, difficulty);
            });
        }
    }

    update(time, delta) {
        const playerPos = {
            x: this.scene.player.sprite.x,
            y: this.scene.player.sprite.y,
        };

        // Update active enemies
        this.activeEnemies = this.activeEnemies.filter(enemy => {
            if (enemy.sprite && enemy.sprite.active) {
                enemy.update(time, delta, playerPos);
                return true;
            }
            return false;
        });

        // Update boss
        if (this.activeBoss && this.activeBoss.sprite && this.activeBoss.sprite.active) {
            this.activeBoss.update(time, delta, playerPos);
        }
    }

    getActiveCount() {
        return this.activeEnemies.filter(e => e.sprite && e.sprite.active).length + 
               (this.activeBoss && this.activeBoss.sprite && this.activeBoss.sprite.active ? 1 : 0);
    }

    clearAll() {
        this.activeEnemies.forEach(e => e.destroy());
        this.activeEnemies = [];
        if (this.activeBoss) {
            this.activeBoss.destroy();
            this.activeBoss = null;
        }
        this.enemies.clear(true, true);
    }
}

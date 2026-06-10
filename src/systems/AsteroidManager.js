import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/Constants.js';

export class AsteroidManager {
    constructor(scene) {
        this.scene = scene;
        this.asteroids = scene.physics.add.group();
        this.spawnTimer = 0;
        this.spawnRate = 5000; // Every 5 seconds
        this.active = false;
    }

    start(wave) {
        // Asteroids start appearing from wave 4
        if (wave >= 4) {
            this.active = true;
            this.spawnRate = Math.max(2000, 5000 - wave * 200);
        }
    }

    update(time, delta) {
        if (!this.active) return;
        
        this.spawnTimer += delta;
        
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnTimer = 0;
            this.spawnAsteroid();
        }
        
        // Clean up off-screen asteroids
        this.asteroids.getChildren().forEach(ast => {
            if (ast.active && ast.y > GAME_HEIGHT + 100) {
                ast.destroy();
            }
        });
    }

    spawnAsteroid() {
        const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
        const size = Phaser.Math.Between(20, 50);
        
        // Create asteroid graphic
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x665544, 1);
        
        // Irregular shape
        const points = [];
        const numPoints = Phaser.Math.Between(6, 10);
        for (let i = 0; i < numPoints; i++) {
            const angle = (Math.PI * 2 / numPoints) * i;
            const r = size * Phaser.Math.FloatBetween(0.7, 1.0);
            points.push({
                x: size + Math.cos(angle) * r,
                y: size + Math.sin(angle) * r
            });
        }
        
        g.beginPath();
        g.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            g.lineTo(points[i].x, points[i].y);
        }
        g.closePath();
        g.fillPath();
        
        // Surface details
        g.fillStyle(0x554433, 0.6);
        g.fillCircle(size * 0.7, size * 0.6, size * 0.2);
        g.fillCircle(size * 1.2, size * 1.1, size * 0.15);
        
        const key = `asteroid_${Date.now()}_${Math.random()}`;
        g.generateTexture(key, size * 2, size * 2);
        g.destroy();
        
        const asteroid = this.asteroids.create(x, -size * 2, key);
        if (!asteroid) return;
        
        asteroid.setDepth(3);
        asteroid.setData('size', size);
        asteroid.setData('damage', Math.floor(size * 0.5));
        asteroid.body.setSize(size * 1.5, size * 1.5);
        
        // Movement
        const speedY = Phaser.Math.Between(80, 200);
        const speedX = Phaser.Math.Between(-30, 30);
        asteroid.setVelocity(speedX, speedY);
        
        // Rotation
        asteroid.setAngularVelocity(Phaser.Math.Between(-50, 50));
    }

    getAsteroids() {
        return this.asteroids;
    }
}

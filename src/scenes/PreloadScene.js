import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, ENEMIES, WEAPONS } from '../utils/Constants.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    create() {
        this.createLoadingBar();
        this.generateTextures();
        this.generateSounds();
        this.scene.start('MainMenuScene');
    }

    createLoadingBar() {
        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;
        
        this.add.text(cx, cy - 50, 'STELLAR ROGUE', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#00ffcc'
        }).setOrigin(0.5);
        
        this.add.text(cx, cy + 20, 'Initializing systems...', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#888899'
        }).setOrigin(0.5);
    }

    generateTextures() {
        this.generatePlayerShip();
        this.generateEnemyShips();
        this.generateProjectiles();
        this.generateParticles();
        this.generatePickups();
        this.generateUI();
        this.generateStarfield();
        this.generateBossShips();
    }

    generatePlayerShip() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Main ship body - sleek triangular design
        g.fillStyle(0x00ddbb, 1);
        g.beginPath();
        g.moveTo(24, 0);
        g.lineTo(48, 44);
        g.lineTo(40, 40);
        g.lineTo(24, 48);
        g.lineTo(8, 40);
        g.lineTo(0, 44);
        g.closePath();
        g.fillPath();
        
        // Cockpit glow
        g.fillStyle(0x00ffee, 1);
        g.fillCircle(24, 16, 6);
        
        // Engine glow
        g.fillStyle(0x00ffcc, 0.8);
        g.fillRect(10, 40, 6, 8);
        g.fillRect(32, 40, 6, 8);
        
        // Wing details
        g.lineStyle(1, 0x33ffdd, 0.7);
        g.lineBetween(8, 36, 20, 20);
        g.lineBetween(40, 36, 28, 20);
        
        g.generateTexture('player', 48, 56);
        g.destroy();
        
        // Player shield bubble
        const sg = this.make.graphics({ x: 0, y: 0, add: false });
        sg.lineStyle(2, 0x3399ff, 0.6);
        sg.strokeCircle(32, 32, 30);
        sg.lineStyle(1, 0x66bbff, 0.3);
        sg.strokeCircle(32, 32, 28);
        sg.generateTexture('player_shield', 64, 64);
        sg.destroy();
    }

    generateEnemyShips() {
        Object.entries(ENEMIES).forEach(([key, enemy]) => {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const s = enemy.size;
            
            switch (enemy.behavior) {
                case 'chase':
                    // Diamond shape
                    g.fillStyle(enemy.color, 1);
                    g.beginPath();
                    g.moveTo(s, 0);
                    g.lineTo(s * 2, s);
                    g.lineTo(s, s * 2);
                    g.lineTo(0, s);
                    g.closePath();
                    g.fillPath();
                    g.fillStyle(0xffffff, 0.5);
                    g.fillCircle(s, s, s * 0.3);
                    break;
                case 'strafe':
                    // Arrow shape pointing down
                    g.fillStyle(enemy.color, 1);
                    g.beginPath();
                    g.moveTo(s, s * 2);
                    g.lineTo(0, 0);
                    g.lineTo(s * 0.6, s * 0.5);
                    g.lineTo(s, 0);
                    g.lineTo(s * 1.4, s * 0.5);
                    g.lineTo(s * 2, 0);
                    g.closePath();
                    g.fillPath();
                    g.fillStyle(0xffffff, 0.4);
                    g.fillCircle(s, s, s * 0.25);
                    break;
                case 'bomb':
                    // Hexagonal shape
                    g.fillStyle(enemy.color, 1);
                    const hex = [];
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI / 3) * i - Math.PI / 6;
                        hex.push({ x: s + Math.cos(angle) * s, y: s + Math.sin(angle) * s });
                    }
                    g.beginPath();
                    g.moveTo(hex[0].x, hex[0].y);
                    for (let i = 1; i < 6; i++) g.lineTo(hex[i].x, hex[i].y);
                    g.closePath();
                    g.fillPath();
                    g.fillStyle(0xffffff, 0.3);
                    g.fillCircle(s, s, s * 0.4);
                    break;
                case 'snipe':
                    // Thin elongated shape
                    g.fillStyle(enemy.color, 1);
                    g.beginPath();
                    g.moveTo(s, 0);
                    g.lineTo(s * 1.5, s * 0.8);
                    g.lineTo(s * 1.3, s * 2);
                    g.lineTo(s * 0.7, s * 2);
                    g.lineTo(s * 0.5, s * 0.8);
                    g.closePath();
                    g.fillPath();
                    g.fillStyle(0xffffff, 0.6);
                    g.fillCircle(s, s * 0.5, s * 0.2);
                    break;
                case 'tank':
                    // Square-ish heavy shape
                    g.fillStyle(enemy.color, 1);
                    g.fillRoundedRect(s * 0.2, s * 0.2, s * 1.6, s * 1.6, 8);
                    g.fillStyle(Phaser.Display.Color.IntegerToColor(enemy.color).brighten(30).color, 1);
                    g.fillRoundedRect(s * 0.5, s * 0.5, s, s, 4);
                    g.fillStyle(0xffffff, 0.3);
                    g.fillCircle(s, s, s * 0.3);
                    break;
                case 'swarm':
                    // Small circular
                    g.fillStyle(enemy.color, 1);
                    g.fillCircle(s, s, s);
                    g.fillStyle(0xffffff, 0.5);
                    g.fillCircle(s, s, s * 0.4);
                    break;
            }
            
            g.generateTexture(`enemy_${key.toLowerCase()}`, s * 2, s * 2);
            g.destroy();
        });
    }

    generateProjectiles() {
        // Player projectile
        const pg = this.make.graphics({ x: 0, y: 0, add: false });
        pg.fillStyle(COLORS.PRIMARY, 1);
        pg.fillRoundedRect(0, 0, 6, 24, 3);
        pg.fillStyle(0xffffff, 0.7);
        pg.fillRoundedRect(1, 2, 4, 20, 2);
        pg.generateTexture('projectile_player', 6, 24);
        pg.destroy();

        // Enemy projectile
        const eg = this.make.graphics({ x: 0, y: 0, add: false });
        eg.fillStyle(COLORS.DANGER, 1);
        eg.fillCircle(5, 5, 5);
        eg.fillStyle(0xffffff, 0.5);
        eg.fillCircle(5, 5, 2);
        eg.generateTexture('projectile_enemy', 10, 10);
        eg.destroy();

        // Plasma projectile
        const plg = this.make.graphics({ x: 0, y: 0, add: false });
        plg.fillStyle(COLORS.SECONDARY, 1);
        plg.fillCircle(8, 8, 8);
        plg.fillStyle(0xffffff, 0.6);
        plg.fillCircle(8, 8, 4);
        plg.generateTexture('projectile_plasma', 16, 16);
        plg.destroy();

        // Missile projectile
        const mg = this.make.graphics({ x: 0, y: 0, add: false });
        mg.fillStyle(COLORS.DANGER, 1);
        mg.beginPath();
        mg.moveTo(5, 0);
        mg.lineTo(10, 14);
        mg.lineTo(5, 12);
        mg.lineTo(0, 14);
        mg.closePath();
        mg.fillPath();
        mg.fillStyle(0xffaa00, 0.8);
        mg.fillRect(3, 12, 4, 4);
        mg.generateTexture('projectile_missile', 10, 16);
        mg.destroy();
    }

    generateParticles() {
        // Generic particle
        const pg = this.make.graphics({ x: 0, y: 0, add: false });
        pg.fillStyle(0xffffff, 1);
        pg.fillCircle(4, 4, 4);
        pg.generateTexture('particle', 8, 8);
        pg.destroy();

        // Glow particle
        const gg = this.make.graphics({ x: 0, y: 0, add: false });
        gg.fillStyle(0xffffff, 0.3);
        gg.fillCircle(16, 16, 16);
        gg.fillStyle(0xffffff, 0.6);
        gg.fillCircle(16, 16, 8);
        gg.fillStyle(0xffffff, 1);
        gg.fillCircle(16, 16, 3);
        gg.generateTexture('glow', 32, 32);
        gg.destroy();

        // Trail particle
        const tg = this.make.graphics({ x: 0, y: 0, add: false });
        tg.fillStyle(0xffffff, 0.8);
        tg.fillCircle(3, 3, 3);
        tg.generateTexture('trail', 6, 6);
        tg.destroy();

        // Spark particle
        const sg = this.make.graphics({ x: 0, y: 0, add: false });
        sg.fillStyle(0xffffff, 1);
        sg.fillRect(0, 2, 8, 2);
        sg.fillRect(2, 0, 2, 8);
        sg.generateTexture('spark', 8, 8);
        sg.destroy();
    }

    generatePickups() {
        // Health pickup
        const hg = this.make.graphics({ x: 0, y: 0, add: false });
        hg.fillStyle(0x33ff66, 1);
        hg.fillRoundedRect(0, 0, 20, 20, 4);
        hg.fillStyle(0xffffff, 0.8);
        hg.fillRect(8, 4, 4, 12);
        hg.fillRect(4, 8, 12, 4);
        hg.generateTexture('pickup_health', 20, 20);
        hg.destroy();

        // Shield pickup
        const shg = this.make.graphics({ x: 0, y: 0, add: false });
        shg.fillStyle(0x3399ff, 1);
        shg.fillCircle(10, 10, 10);
        shg.lineStyle(2, 0xffffff, 0.7);
        shg.strokeCircle(10, 10, 6);
        shg.generateTexture('pickup_shield', 20, 20);
        shg.destroy();

        // XP pickup
        const xg = this.make.graphics({ x: 0, y: 0, add: false });
        xg.fillStyle(0xcc66ff, 1);
        xg.beginPath();
        const points = 5;
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? 10 : 5;
            const angle = (Math.PI * 2 / (points * 2)) * i - Math.PI / 2;
            if (i === 0) xg.moveTo(10 + Math.cos(angle) * r, 10 + Math.sin(angle) * r);
            else xg.lineTo(10 + Math.cos(angle) * r, 10 + Math.sin(angle) * r);
        }
        xg.closePath();
        xg.fillPath();
        xg.generateTexture('pickup_xp', 20, 20);
        xg.destroy();

        // Currency pickup
        const cg = this.make.graphics({ x: 0, y: 0, add: false });
        cg.fillStyle(0xffcc00, 1);
        cg.fillCircle(10, 10, 10);
        cg.fillStyle(0xffaa00, 1);
        cg.fillCircle(10, 10, 7);
        cg.fillStyle(0xffcc00, 1);
        cg.fillCircle(10, 10, 5);
        cg.generateTexture('pickup_currency', 20, 20);
        cg.destroy();
    }

    generateUI() {
        // Button background
        const bg = this.make.graphics({ x: 0, y: 0, add: false });
        bg.fillStyle(0x1a1a2e, 0.9);
        bg.fillRoundedRect(0, 0, 300, 60, 8);
        bg.lineStyle(2, COLORS.PRIMARY, 0.8);
        bg.strokeRoundedRect(0, 0, 300, 60, 8);
        bg.generateTexture('button', 300, 60);
        bg.destroy();

        // Button hover
        const bh = this.make.graphics({ x: 0, y: 0, add: false });
        bh.fillStyle(0x2a2a4e, 0.95);
        bh.fillRoundedRect(0, 0, 300, 60, 8);
        bh.lineStyle(2, COLORS.PRIMARY, 1);
        bh.strokeRoundedRect(0, 0, 300, 60, 8);
        bh.generateTexture('button_hover', 300, 60);
        bh.destroy();

        // Panel background
        const panel = this.make.graphics({ x: 0, y: 0, add: false });
        panel.fillStyle(0x0d0d1a, 0.95);
        panel.fillRoundedRect(0, 0, 400, 500, 12);
        panel.lineStyle(2, COLORS.PRIMARY, 0.5);
        panel.strokeRoundedRect(0, 0, 400, 500, 12);
        panel.generateTexture('panel', 400, 500);
        panel.destroy();
    }

    generateStarfield() {
        // Small star
        const s1 = this.make.graphics({ x: 0, y: 0, add: false });
        s1.fillStyle(0xffffff, 1);
        s1.fillCircle(1, 1, 1);
        s1.generateTexture('star_small', 3, 3);
        s1.destroy();

        // Medium star
        const s2 = this.make.graphics({ x: 0, y: 0, add: false });
        s2.fillStyle(0xffffff, 1);
        s2.fillCircle(2, 2, 2);
        s2.generateTexture('star_medium', 4, 4);
        s2.destroy();

        // Nebula blob
        const nb = this.make.graphics({ x: 0, y: 0, add: false });
        nb.fillStyle(0x331155, 0.15);
        nb.fillCircle(64, 64, 64);
        nb.fillStyle(0x220044, 0.1);
        nb.fillCircle(64, 64, 48);
        nb.generateTexture('nebula', 128, 128);
        nb.destroy();
    }

    generateBossShips() {
        // Mothership boss
        const bg = this.make.graphics({ x: 0, y: 0, add: false });
        const bs = 120;
        bg.fillStyle(0x660033, 1);
        bg.fillRoundedRect(10, 20, bs * 2 - 20, bs - 20, 20);
        bg.fillStyle(0x990044, 1);
        bg.fillRoundedRect(30, 30, bs * 2 - 60, bs - 40, 15);
        bg.fillStyle(0xff0066, 0.8);
        bg.fillCircle(bs, bs / 2 + 10, 25);
        // Weapon pods
        bg.fillStyle(0xcc0055, 1);
        bg.fillCircle(40, bs / 2 + 10, 12);
        bg.fillCircle(bs * 2 - 40, bs / 2 + 10, 12);
        bg.fillCircle(70, 25, 8);
        bg.fillCircle(bs * 2 - 70, 25, 8);
        bg.generateTexture('boss_mothership', bs * 2, bs);
        bg.destroy();

        // Destroyer boss
        const dg = this.make.graphics({ x: 0, y: 0, add: false });
        const ds = 150;
        dg.fillStyle(0x660000, 1);
        dg.beginPath();
        dg.moveTo(ds, 0);
        dg.lineTo(ds * 2, ds * 0.7);
        dg.lineTo(ds * 1.7, ds);
        dg.lineTo(ds * 0.3, ds);
        dg.lineTo(0, ds * 0.7);
        dg.closePath();
        dg.fillPath();
        dg.fillStyle(0x990000, 1);
        dg.fillRoundedRect(ds * 0.3, ds * 0.2, ds * 1.4, ds * 0.6, 10);
        dg.fillStyle(0xff3300, 0.7);
        dg.fillCircle(ds, ds * 0.5, 20);
        dg.generateTexture('boss_destroyer', ds * 2, ds);
        dg.destroy();

        // Hivemind boss
        const hg = this.make.graphics({ x: 0, y: 0, add: false });
        const hs = 100;
        hg.fillStyle(0x440088, 1);
        hg.fillCircle(hs, hs, hs * 0.9);
        hg.fillStyle(0x6600cc, 1);
        hg.fillCircle(hs, hs, hs * 0.6);
        hg.fillStyle(0x9900ff, 0.8);
        hg.fillCircle(hs, hs, hs * 0.3);
        // Tentacle points
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const x = hs + Math.cos(angle) * hs * 0.85;
            const y = hs + Math.sin(angle) * hs * 0.85;
            hg.fillStyle(0x7700dd, 1);
            hg.fillCircle(x, y, 10);
        }
        hg.generateTexture('boss_hivemind', hs * 2, hs * 2);
        hg.destroy();
    }

    generateSounds() {
        // Generate synth sounds using Web Audio API
        if (!this.sound.context) return;
        
        const ctx = this.sound.context;
        
        this.createSound(ctx, 'laser1', 0.1, 880, 440, 'square');
        this.createSound(ctx, 'laser2', 0.1, 660, 330, 'sawtooth');
        this.createSound(ctx, 'plasma1', 0.2, 220, 110, 'sine');
        this.createSound(ctx, 'missile1', 0.3, 150, 80, 'sawtooth');
        this.createSound(ctx, 'beam1', 0.05, 1200, 1000, 'sine');
        this.createSound(ctx, 'explosion1', 0.4, 100, 20, 'sawtooth');
        this.createSound(ctx, 'explosion2', 0.6, 80, 15, 'square');
        this.createSound(ctx, 'pickup1', 0.15, 880, 1760, 'sine');
        this.createSound(ctx, 'hit1', 0.1, 300, 100, 'square');
        this.createSound(ctx, 'dash1', 0.15, 200, 600, 'sine');
        this.createSound(ctx, 'shield_hit', 0.12, 500, 800, 'sine');
        this.createSound(ctx, 'level_up', 0.3, 440, 880, 'sine');
    }

    createSound(ctx, key, duration, startFreq, endFreq, type) {
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * duration;
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / length;
            const freq = startFreq + (endFreq - startFreq) * t;
            const envelope = Math.pow(1 - t, 2);
            let sample = 0;
            
            switch (type) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * freq * i / sampleRate);
                    break;
                case 'square':
                    sample = Math.sin(2 * Math.PI * freq * i / sampleRate) > 0 ? 1 : -1;
                    break;
                case 'sawtooth':
                    sample = 2 * (freq * i / sampleRate - Math.floor(0.5 + freq * i / sampleRate));
                    break;
            }
            
            data[i] = sample * envelope * 0.3;
        }
        
        this.cache.audio.add(key, { data: buffer, sampleRate });
        this.sound.decodeAudio(key, buffer);
    }
}

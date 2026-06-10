const SAVE_KEY = 'stellar_rogue_save';

export class SaveManager {
    constructor() {
        this.data = this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(SAVE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load save data:', e);
        }
        return this.getDefaultData();
    }

    save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Failed to save data:', e);
        }
    }

    getDefaultData() {
        return {
            credits: 0,
            totalRuns: 0,
            bestWave: 0,
            bestScore: 0,
            totalKills: 0,
            totalPlayTime: 0,
            upgrades: {
                damage: 0,
                fireRate: 0,
                speed: 0,
                health: 0,
                shield: 0,
                shieldRegen: 0,
                dash: 0,
                magnet: 0,
                luck: 0,
                crit: 0,
            },
            unlockedWeapons: ['LASER'],
            settings: {
                musicVolume: 0.5,
                sfxVolume: 0.7,
                screenShake: true,
                showDamageNumbers: true,
                showFPS: false,
            },
            activeRun: null,
        };
    }

    getData() {
        return this.data;
    }

    getUpgrades() {
        return this.data.upgrades;
    }

    getSettings() {
        return this.data.settings;
    }

    updateSettings(settings) {
        this.data.settings = { ...this.data.settings, ...settings };
        this.save();
    }

    purchaseUpgrade(upgradeKey, cost) {
        if (this.data.credits < cost) return false;
        
        this.data.credits -= cost;
        this.data.upgrades[upgradeKey] = (this.data.upgrades[upgradeKey] || 0) + 1;
        this.save();
        return true;
    }

    addCredits(amount) {
        this.data.credits += amount;
        this.save();
    }

    hasActiveRun() {
        return this.data.activeRun !== null;
    }

    saveActiveRun(runData) {
        this.data.activeRun = runData;
        this.save();
    }

    clearActiveRun() {
        this.data.activeRun = null;
        this.save();
    }

    endRun(gameState) {
        this.data.totalRuns++;
        this.data.totalKills += gameState.kills;
        this.data.credits += gameState.credits;
        
        if (gameState.wave > this.data.bestWave) {
            this.data.bestWave = gameState.wave;
        }
        if (gameState.score > this.data.bestScore) {
            this.data.bestScore = gameState.score;
        }
        
        this.data.activeRun = null;
        this.save();
    }

    resetAll() {
        this.data = this.getDefaultData();
        this.save();
    }
}

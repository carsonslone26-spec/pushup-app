export class MusicManager {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = null;
        this.isPlaying = false;
        this.masterGain = null;
        this.nodes = [];
        this.bpm = 140;
        this.currentBeat = 0;
        this.nextNoteTime = 0;
        this.scheduleAheadTime = 0.1;
        this.timerID = null;
        this.volume = 0.3;
    }

    start() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            
            // Add a compressor for better sound
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = -20;
            this.compressor.ratio.value = 4;
            this.compressor.connect(this.masterGain);
            
            this.isPlaying = true;
            this.nextNoteTime = this.audioContext.currentTime;
            this.scheduler();
        } catch (e) {
            console.warn('Music system unavailable:', e);
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            clearTimeout(this.timerID);
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    setVolume(vol) {
        this.volume = vol;
        if (this.masterGain) {
            this.masterGain.gain.value = vol;
        }
    }

    setIntensity(intensity) {
        // Adjust BPM based on game intensity (more enemies = faster)
        this.bpm = 120 + Math.floor(intensity * 40);
    }

    scheduler() {
        if (!this.isPlaying) return;
        
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentBeat, this.nextNoteTime);
            this.advanceNote();
        }
        
        this.timerID = setTimeout(() => this.scheduler(), 25);
    }

    advanceNote() {
        const secondsPerBeat = 60.0 / this.bpm / 4;
        this.nextNoteTime += secondsPerBeat;
        this.currentBeat = (this.currentBeat + 1) % 64;
    }

    scheduleNote(beat, time) {
        // Kick drum on beats 0, 4, 8, 12
        if (beat % 4 === 0) {
            this.playKick(time);
        }
        
        // Hi-hat on every other beat
        if (beat % 2 === 0) {
            this.playHihat(time);
        }
        
        // Snare on 4 and 12
        if (beat % 8 === 4) {
            this.playSnare(time);
        }
        
        // Bass line
        if (beat % 8 === 0 || beat % 8 === 3 || beat % 8 === 6) {
            this.playBass(time, beat);
        }
        
        // Arpeggio melody
        if (beat % 2 === 0 && beat % 4 !== 0) {
            this.playArp(time, beat);
        }
        
        // Pad chord every 16 beats
        if (beat % 16 === 0) {
            this.playPad(time, beat);
        }
    }

    playKick(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
        
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        
        osc.connect(gain);
        gain.connect(this.compressor);
        
        osc.start(time);
        osc.stop(time + 0.15);
    }

    playHihat(time) {
        const bufferSize = this.audioContext.sampleRate * 0.05;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 8);
        }
        
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.compressor);
        
        source.start(time);
    }

    playSnare(time) {
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
        }
        
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        
        source.buffer = buffer;
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        
        source.connect(gain);
        gain.connect(this.compressor);
        
        source.start(time);

        // Tonal component
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.05);
        oscGain.gain.setValueAtTime(0.2, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.connect(oscGain);
        oscGain.connect(this.compressor);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    playBass(time, beat) {
        const notes = [55, 55, 65.41, 73.42, 55, 82.41, 65.41, 55];
        const note = notes[Math.floor(beat / 8) % notes.length];
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.value = note;
        
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.compressor);
        
        osc.start(time);
        osc.stop(time + 0.2);
    }

    playArp(time, beat) {
        const scale = [130.81, 155.56, 174.61, 196, 220, 261.63, 293.66, 329.63];
        const note = scale[(beat * 3 + Math.floor(beat / 16)) % scale.length];
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.value = note * 2;
        
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 5;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.compressor);
        
        osc.start(time);
        osc.stop(time + 0.12);
    }

    playPad(time, beat) {
        const chords = [
            [130.81, 164.81, 196],   // C minor
            [146.83, 174.61, 220],   // D minor
            [110, 130.81, 164.81],   // A minor
            [123.47, 155.56, 185],   // B minor
        ];
        
        const chord = chords[Math.floor(beat / 16) % chords.length];
        
        chord.forEach(freq => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.06, time + 0.5);
            gain.gain.linearRampToValueAtTime(0.04, time + 1.5);
            gain.gain.linearRampToValueAtTime(0, time + 2);
            
            osc.connect(gain);
            gain.connect(this.compressor);
            
            osc.start(time);
            osc.stop(time + 2);
        });
    }
}

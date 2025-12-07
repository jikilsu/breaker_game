// Sound Manager using Web Audio API
class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = this.audioContext.createGain();
        this.masterVolume.connect(this.audioContext.destination);
        this.masterVolume.gain.value = 0.3;

        // Background music oscillators
        this.bgMusic = null;
        this.isMusicPlaying = false;
        this.melodyIndex = 0;
    }

    // Start upbeat, cheerful background music with playful melody
    startBackgroundMusic() {
        if (this.isMusicPlaying) return;

        this.isMusicPlaying = true;
        this.melodyIndex = 0;

        // Cheerful, playful melody - 32 notes
        // Using C major scale with emphasis on happy intervals
        const melodyNotes = [
            // Phrase 1 - bouncy and light
            523.25, // C5
            659.25, // E5
            783.99, // G5
            659.25, // E5
            523.25, // C5
            587.33, // D5
            659.25, // E5
            523.25, // C5

            // Phrase 2 - playful jump
            783.99, // G5
            880.00, // A5
            1046.50, // C6
            880.00, // A5
            783.99, // G5
            659.25, // E5
            783.99, // G5
            659.25, // E5

            // Phrase 3 - cheerful descending
            1046.50, // C6
            880.00, // A5
            783.99, // G5
            659.25, // E5
            587.33, // D5
            659.25, // E5
            523.25, // C5
            587.33, // D5

            // Phrase 4 - happy resolution
            659.25, // E5
            783.99, // G5
            880.00, // A5
            783.99, // G5
            659.25, // E5
            587.33, // D5
            659.25, // E5
            523.25  // C5
        ];

        const playMelodyNote = () => {
            if (!this.isMusicPlaying) return;

            const now = this.audioContext.currentTime;
            const freq = melodyNotes[this.melodyIndex % melodyNotes.length];

            // Melody oscillator with bright, light envelope
            const melody = this.audioContext.createOscillator();
            const melodyGain = this.audioContext.createGain();
            melody.type = 'sine';
            melody.frequency.setValueAtTime(freq, now);

            // Light, bouncy ADSR envelope
            melodyGain.gain.setValueAtTime(0, now);
            melodyGain.gain.linearRampToValueAtTime(0.15, now + 0.01); // Very quick attack
            melodyGain.gain.linearRampToValueAtTime(0.12, now + 0.03); // Quick decay
            melodyGain.gain.setValueAtTime(0.12, now + 0.15); // Short sustain
            melodyGain.gain.linearRampToValueAtTime(0, now + 0.2); // Quick release

            melody.connect(melodyGain);
            melodyGain.connect(this.masterVolume);
            melody.start(now);
            melody.stop(now + 0.2);

            // Harmony note (fifth above for brightness)
            const harmony = this.audioContext.createOscillator();
            const harmonyGain = this.audioContext.createGain();
            harmony.type = 'triangle'; // Softer harmony
            harmony.frequency.setValueAtTime(freq * 1.5, now); // Perfect fifth

            harmonyGain.gain.setValueAtTime(0, now);
            harmonyGain.gain.linearRampToValueAtTime(0.06, now + 0.01);
            harmonyGain.gain.linearRampToValueAtTime(0.05, now + 0.03);
            harmonyGain.gain.setValueAtTime(0.05, now + 0.15);
            harmonyGain.gain.linearRampToValueAtTime(0, now + 0.2);

            harmony.connect(harmonyGain);
            harmonyGain.connect(this.masterVolume);
            harmony.start(now);
            harmony.stop(now + 0.2);

            this.melodyIndex++;
            setTimeout(playMelodyNote, 250); // Faster, more playful tempo
        };


        // Light, bouncy bass line
        const playBassLine = () => {
            if (!this.isMusicPlaying) return;

            const now = this.audioContext.currentTime;

            // Simple, cheerful bass pattern
            const bassPattern = [
                { note: 130.81, duration: 0.12 }, // C3
                { note: 164.81, duration: 0.12 }, // E3
                { note: 196.00, duration: 0.12 }, // G3
                { note: 164.81, duration: 0.12 }, // E3
                { note: 130.81, duration: 0.12 }, // C3
                { note: 146.83, duration: 0.12 }, // D3
                { note: 196.00, duration: 0.12 }, // G3
                { note: 130.81, duration: 0.12 }  // C3
            ];

            const pattern = bassPattern[Math.floor(this.melodyIndex / 2) % bassPattern.length];

            const bass = this.audioContext.createOscillator();
            const bassGain = this.audioContext.createGain();
            bass.type = 'sine';
            bass.frequency.setValueAtTime(pattern.note, now);

            // Light, bouncy bass envelope
            bassGain.gain.setValueAtTime(0, now);
            bassGain.gain.linearRampToValueAtTime(0.08, now + 0.005); // Softer
            bassGain.gain.linearRampToValueAtTime(0.06, now + 0.03);
            bassGain.gain.linearRampToValueAtTime(0, now + pattern.duration);

            bass.connect(bassGain);
            bassGain.connect(this.masterVolume);
            bass.start(now);
            bass.stop(now + pattern.duration + 0.05);

            setTimeout(playBassLine, 500); // Faster, bouncier rhythm
        };


        // Bright pad with chord progression
        const playPad = () => {
            if (!this.isMusicPlaying) return;

            const now = this.audioContext.currentTime;

            // Chord progression: C major -> G major -> A minor -> C major
            const chordProgression = [
                [261.63, 329.63, 392.00], // C major (C4, E4, G4)
                [196.00, 246.94, 293.66], // G major (G3, B3, D4)
                [220.00, 261.63, 329.63], // A minor (A3, C4, E4)
                [261.63, 329.63, 392.00]  // C major (C4, E4, G4)
            ];

            const chordIndex = Math.floor(this.melodyIndex / 8) % chordProgression.length;
            const padFreqs = chordProgression[chordIndex];

            padFreqs.forEach((freq, i) => {
                const pad = this.audioContext.createOscillator();
                const padGain = this.audioContext.createGain();
                const lfo = this.audioContext.createOscillator();
                const lfoGain = this.audioContext.createGain();

                pad.type = 'triangle';
                pad.frequency.setValueAtTime(freq, now);

                // Add subtle vibrato for movement
                lfo.type = 'sine';
                lfo.frequency.setValueAtTime(4 + i, now); // Different rates
                lfoGain.gain.setValueAtTime(1.5, now);
                lfo.connect(lfoGain);
                lfoGain.connect(pad.frequency);

                padGain.gain.setValueAtTime(0, now);
                padGain.gain.linearRampToValueAtTime(0.05, now + 1);
                padGain.gain.setValueAtTime(0.05, now + 4);
                padGain.gain.linearRampToValueAtTime(0, now + 5);

                pad.connect(padGain);
                padGain.connect(this.masterVolume);
                lfo.start(now);
                pad.start(now);
                lfo.stop(now + 5);
                pad.stop(now + 5);
            });

            setTimeout(playPad, 4500); // Overlap for smoothness
        };

        // Add rhythmic hi-hat for energy
        const playHiHat = () => {
            if (!this.isMusicPlaying) return;

            const now = this.audioContext.currentTime;

            // Create hi-hat noise
            const bufferSize = this.audioContext.sampleRate * 0.05;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
            }

            const hihat = this.audioContext.createBufferSource();
            hihat.buffer = buffer;

            const hihatGain = this.audioContext.createGain();
            const hihatFilter = this.audioContext.createBiquadFilter();
            hihatFilter.type = 'highpass';
            hihatFilter.frequency.setValueAtTime(7000, now);

            hihatGain.gain.setValueAtTime(0.08, now);
            hihatGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

            hihat.connect(hihatFilter);
            hihatFilter.connect(hihatGain);
            hihatGain.connect(this.masterVolume);
            hihat.start(now);

            setTimeout(playHiHat, 350); // Match melody tempo
        };

        // Start all layers (removed playPad for cleaner sound)
        playMelodyNote();
        playBassLine();
        playHiHat();
    }

    stopBackgroundMusic() {
        this.isMusicPlaying = false;
    }

    // Brick break sound - sharp, satisfying destruction
    playBrickBreak() {
        const now = this.audioContext.currentTime;

        // Explosion sound with noise
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(800, now);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterVolume);

        noise.start(now);
        noise.stop(now + 0.3);

        // Add a tonal component for musicality
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        oscGain.gain.setValueAtTime(0.2, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(oscGain);
        oscGain.connect(this.masterVolume);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Wall bounce sound - subtle bounce
    playWallBounce() {
        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Paddle bounce sound - distinct from wall bounce
    playPaddleBounce() {
        const now = this.audioContext.currentTime;

        // Lower, more resonant sound
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(300, now);
        osc1.frequency.exponentialRampToValueAtTime(150, now + 0.15);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(450, now);
        osc2.frequency.exponentialRampToValueAtTime(225, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterVolume);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.15);
        osc2.stop(now + 0.15);
    }

    // Resume audio context (needed for browser autoplay policies)
    resume() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

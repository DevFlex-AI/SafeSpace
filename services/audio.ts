// SafeSpace Audio Service — Breathing sounds
import { Audio } from 'expo-av';

let inhaleSound: Audio.Sound | null = null;
let holdSound: Audio.Sound | null = null;
let exhaleSound: Audio.Sound | null = null;
let completionSound: Audio.Sound | null = null;

// Generate simple tone using oscillator via web audio or expo-av
// Since we cannot ship audio files, we use expo-av's built-in tone generation
// via a short silent/beep approach

// We will use a different approach: generate tones programmatically
// For cross-platform, use small inline base64 WAV tones

function createToneWav(frequency: number, duration: number, volume: number = 0.3): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * duration);
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, headerSize + dataSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Generate sine wave with fade in/out
  const fadeLength = Math.min(numSamples * 0.1, sampleRate * 0.05);
  for (let i = 0; i < numSamples; i++) {
    let amplitude = volume;
    if (i < fadeLength) amplitude *= i / fadeLength;
    if (i > numSamples - fadeLength) amplitude *= (numSamples - i) / fadeLength;
    const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * amplitude;
    const intSample = Math.max(-1, Math.min(1, sample)) * 32767;
    view.setInt16(headerSize + i * 2, intSample, true);
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Pre-generate tones
const INHALE_TONE_B64 = createToneWav(432, 0.6, 0.2); // Soft A=432hz chime
const HOLD_TONE_B64 = createToneWav(528, 0.4, 0.15); // Gentle higher tone
const EXHALE_TONE_B64 = createToneWav(396, 0.8, 0.2); // Lower calming tone
const COMPLETE_TONE_B64 = createToneWav(528, 1.0, 0.25); // Completion chime

async function loadSound(base64: string): Promise<Audio.Sound | null> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${base64}` },
      { shouldPlay: false, volume: 0.5 }
    );
    return sound;
  } catch {
    return null;
  }
}

export async function initBreathingSounds() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    inhaleSound = await loadSound(INHALE_TONE_B64);
    holdSound = await loadSound(HOLD_TONE_B64);
    exhaleSound = await loadSound(EXHALE_TONE_B64);
    completionSound = await loadSound(COMPLETE_TONE_B64);
  } catch {
    // Silent fallback
  }
}

export async function playInhale() {
  try {
    if (inhaleSound) {
      await inhaleSound.setPositionAsync(0);
      await inhaleSound.playAsync();
    }
  } catch {}
}

export async function playHold() {
  try {
    if (holdSound) {
      await holdSound.setPositionAsync(0);
      await holdSound.playAsync();
    }
  } catch {}
}

export async function playExhale() {
  try {
    if (exhaleSound) {
      await exhaleSound.setPositionAsync(0);
      await exhaleSound.playAsync();
    }
  } catch {}
}

export async function playCompletion() {
  try {
    if (completionSound) {
      await completionSound.setPositionAsync(0);
      await completionSound.playAsync();
    }
  } catch {}
}

export async function unloadBreathingSounds() {
  try {
    await inhaleSound?.unloadAsync();
    await holdSound?.unloadAsync();
    await exhaleSound?.unloadAsync();
    await completionSound?.unloadAsync();
    inhaleSound = null;
    holdSound = null;
    exhaleSound = null;
    completionSound = null;
  } catch {}
}

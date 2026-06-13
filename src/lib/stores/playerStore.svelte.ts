import { WaveId } from '../schemas/waveSchema';
import { AudioSource } from '../schemas/audioMetaSchema';

class PlayerStore {
  selectedWave = $state<WaveId>('gamma');
  playbackStatus = $state<'stopped' | 'playing' | 'paused' | 'error'>('stopped');
  volume = $state<number>(70);
  loop = $state<boolean>(true);
  currentAudioSource = $state<AudioSource | null>(null);
  operationId = $state<string | null>(null);
  errorMessage = $state<string | null>(null);

  selectWave(waveId: WaveId) {
    this.selectedWave = waveId;
  }

  setVolume(vol: number) {
    this.volume = vol;
  }

  setPlaybackStatus(status: 'stopped' | 'playing' | 'paused' | 'error') {
    this.playbackStatus = status;
  }

  setCurrentAudioSource(source: AudioSource | null) {
    this.currentAudioSource = source;
  }

  setOperationId(id: string | null) {
    this.operationId = id;
  }

  setErrorMessage(message: string | null) {
    this.errorMessage = message;
  }

  toggleLoop() {
    this.loop = !this.loop;
  }
}

export const playerStore = new PlayerStore();

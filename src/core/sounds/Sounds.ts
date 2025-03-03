import { gsap } from "gsap";

/**
 * В PIXI 8.x полностью выпилено все что связанно с аудио. 
 * Теперь по задумке разработчиков PIXI это возлагается на кастомные пользовательские реализации.
 * Данную реализацию частично сделал через аудиоконтекст, но класс компонента с asset-ами реализован
 * со звуками, представленными HTMLAudioElement, в рамках ТЗ не стал его переделывать.
 * Реализована очень простая логика для fadeOut, но это потенциально может привести к проблемам
 */


export class Sounds {
	private static audioContext: AudioContext;
	private static masterGain: GainNode;
	private static readonly tracks: Map<HTMLAudioElement, MediaElementAudioSourceNode> = new Map();
	private static globalVolume: number = 1;
	
	public static async init() {
		if (this.audioContext) return;
		this.audioContext = new AudioContext();
		this.masterGain = this.audioContext.createGain();
		this.masterGain.connect(this.audioContext.destination);
	}

	public static async play(sound: HTMLAudioElement, volume?: number, isLooped?: boolean) {
		if (volume !== undefined) {
			sound.volume = volume;
		}
		
		if(!this.tracks.has(sound)){
			const track = this.audioContext.createMediaElementSource(sound);
			track.connect(this.masterGain);
			this.tracks.set(sound, track)
		}

		if (isLooped) {
			sound.loop = true;
			sound.play();
			return;
		}
				
		await new Promise<void>((resolve, reject) => {
			sound.addEventListener('ended', () => {
				resolve();
			});
			sound.play();
		});		
	}

	public static stop(sound: HTMLAudioElement, needFadeOut?: boolean) {
		if(needFadeOut){
			const volume = sound.volume;
			gsap.to(sound, {delay:1, pixi: {volume: 0}, onComplete:()=>{
				sound.pause();
				sound.currentTime = 0;
				sound.volume = volume;
			}});
		} else {
			sound.pause();
			sound.currentTime = 0;
		}
	}

	public static pause(sound: HTMLAudioElement) {
		sound.pause();
	}

	public static async resume(sound: HTMLAudioElement) {
		await this.play(sound);
	}

	public static mute(sound: HTMLAudioElement) {
		sound.muted = true;
	}

	public static unmute(sound: HTMLAudioElement) {
		sound.muted = false;
	}

	public static stopAll() {
		this.tracks.forEach((_, sound) => {
			this.stop(sound)
		});		
	}

	public static pauseAll() {
		if (this.audioContext.state === 'running') {
			this.audioContext.suspend();
		}
	}

	public static resumeAll() {
		if (this.audioContext.state === 'suspended') {
			this.audioContext.resume();
		}		
	}

	public static muteAll() {
		this.masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
	}

	public static unmuteAll() {
		this.masterGain.gain.setValueAtTime(this.globalVolume, this.audioContext.currentTime);
	}

	static set volume(volume: number) {
		volume = Math.max(0, volume);
		this.globalVolume = volume;
		this.masterGain.gain.setValueAtTime(this.globalVolume, this.audioContext.currentTime);
	}

	static get volume(): number {
		return this.globalVolume;
	}
}

Sounds.init();
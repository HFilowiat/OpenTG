// on the browser the audio only autoplays after some kind of interaction

import { isSoundAllowed, settings } from '$lib/ts/stores/Stores';

import audio1 from '$assets/audio/audio_path1.mp3';
import audio2 from '$assets/audio/audio_path2.mp3';

export namespace AudioMixer {
	export const filenames = [
		'audio_path1.mp3',
		'audio_path2.mp3',
	];

	const mapFilenamesToAsset = {
		'audio_path1.mp3': audio1,
		'audio_path2.mp3': audio2,
	};

	export let isSoundEnabled = <boolean>JSON.parse(localStorage.getItem('sound')) || false;

	let masterVolume = 0.5;
	let audioVolume = 0;
	let audio: HTMLAudioElement = createAudio('', !isSoundEnabled);

	settings.subscribe((setting) => { 
		masterVolume = setting.sound;
		audio.volume = audioVolume * masterVolume;
	})

	function createAudio(src: string, muted?: boolean, loop?: boolean) {
		const audio = new Audio(src);
		loop ??= true;
		muted ??= true;
		audio.loop = loop;
		audio.muted = muted;
		audioVolume = 0;
		audio.volume = audioVolume * masterVolume;
		return audio;
	}

	export function setSoundEnabled(enabled: boolean) {
		isSoundEnabled = enabled;
		audio.muted = !isSoundEnabled;

		if (enabled) audio.play();
		else audio.pause();
	}

	export function playTrack(filename: string) {
		if (audio.src !== filename) {
			scheduleToDestroy(audio);
			audio = createAudio(mapFilenamesToAsset[filename], !isSoundEnabled, true);

			makeAutoplay(audio);
		}
	}

	function scheduleToDestroy(audio: HTMLAudioElement) {
		fadeOut(audio);
	}

	function makeAutoplay(audio: HTMLAudioElement) {
		audio
			.play()
			.then(() => {
				isSoundAllowed.set(true);
				fadeIn(audio);
			})
			.catch((error) => {
				setTimeout(() => {
					makeAutoplay(audio);
				}, 1000);

				if (error.name === 'NotAllowedError') {
					isSoundAllowed.set(false);
				} 
			});
	}

	function fadeIn(audio: HTMLAudioElement) {
		audioVolume = 0; 
		audio.volume = audioVolume * masterVolume;

		const interval = setInterval(() => {
			const newVolume = audioVolume + 0.1;

			if (newVolume < 1) {
				audioVolume = newVolume;
				audio.volume = audioVolume * masterVolume;
			} else {
				clearInterval(interval);
				audioVolume = 1; 
				audio.volume = audioVolume * masterVolume;
			}
		}, 100);
	}

	function fadeOut(audio: HTMLAudioElement) {
		const interval = setInterval(() => {
			const newVolume = audioVolume - 0.1;

			if (newVolume >= 0) {
				audioVolume = newVolume;
				audio.volume = audioVolume * masterVolume;
			} else {
				clearInterval(interval);
				audioVolume = 0;
				audio.volume = audioVolume * masterVolume;
				audio.pause();
				audio.currentTime = 0;
				audio.src = '';
			}
		}, 100);
	}
}

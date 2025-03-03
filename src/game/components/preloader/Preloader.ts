import { Assets, Container } from "pixi.js";
import { BaseController } from "../../../core/commons/BaseController.ts";
import { Component } from "../../../core/components/Component.ts";
import { ProgressBar } from "../progress_bar/ProgressBar.ts";
import { BaseGame } from "../../../core/BaseGame.ts";
import { Sounds } from "../../../core/sounds/Sounds.ts";


export class Preloader extends BaseController {
	private componentView!: Component;
	private progressBar!: ProgressBar;
	private music!: HTMLAudioElement;

	public get view(): Component {
		return this.componentView;
	}

	public override async preload() {
		await Assets.load([
			{ alias: 'preloader', src: './assets/preloader.asset' },
			{ alias: 'progress', src: './assets/progress/progress.png' },
			{ alias: 'progress_background', src: './assets/progress/progress_background.png' },
		]);
	}

	public override async init() {
		this.componentView = Component.from('preloader');

		this.progressBar = new ProgressBar({
			backgroundTexture: 'progress_background',
			sliderTexture: 'progress',
			width: 1000,
		});

		this.progressBar.position.set(
			-this.progressBar.width / 2,
			BaseGame.GAME_HEIGHT * 0.35
		);

		this.componentView.getLayer('root').addChild(this.progressBar);
		this.music = this.componentView.getSound('logo_05');
	}

	public override async start(): Promise<void> {
		Sounds.play(this.music);
		this.componentView.playAnimation('intro');
	}

	public override async stop(): Promise<void> {
		Sounds.stop(this.music, true);
		await this.componentView.playAnimation('out');
		this.componentView.stopAnimation();
	}

	public async initPogressWatcher(): Promise<void> {
		/**
		 * На финале столкнулся с тем, что PIXI 8 никак не отслеживает глобальный 
		 * прогресс загрузки, пришлось изобразить весь этот ужас ниже. 
		 * Пока не вижу как это сделать красиво и быстро для PIXI 8
		 */
		let resolver: (value: void | PromiseLike<void>) => void;
		const promise = new Promise<void>((resolve, _) => {
			resolver = resolve;
		});
		const list = Object.values(Assets.loader.promiseCache);
		let amount = list.length;
		let count = 0;

		const updateProgress = async (promise: Promise<any>) => {
			await promise;
			count++;
			const progress = Math.min(1, count / amount);
			console.log('custom progress', progress, count, amount)

			this.progressBar.setProgress(progress);
			if(count === amount) resolver();
	
		}

		list.forEach(async item => {
			updateProgress(item.promise);
		});

		const originalPromiseCache = Assets.loader.promiseCache;
		const proxy = new Proxy(originalPromiseCache, {
			set(target, prop, value) {
				if (!(prop in target)) {
					console.log('Ресурс добавлен:', prop);
					amount++;
					updateProgress(value.promise);
				}
				return Reflect.set(target, prop, value);
			}
		});

		Assets.loader.promiseCache = proxy;
		await promise;
		Assets.loader.promiseCache = originalPromiseCache;
	}

	public override destroy(): void {
		Sounds.stop(this.music);
		this.progressBar.destroy();
		this.componentView.destroy();
	}
}
import { Assets } from "pixi.js";
import { BaseController } from "../../../core/commons/BaseController.ts";
import { Component } from "../../../core/components/Component.ts";
import { ProgressBar } from "../progress_bar/ProgressBar.ts";
import { BaseGame } from "../../../core/BaseGame.ts";
import { Sounds } from "../../../core/sounds/Sounds.ts";

export class Preloader extends BaseController {
	private componentView!: Component;
	private progressBar!: ProgressBar;
	private music!: HTMLAudioElement;
	private startAmount: number = 0;

	public get view(): Component {
		return this.componentView;
	}

	public override async preload() {
		await Assets.load([
			{ alias: "preloader", src: "./assets/preloader.asset" },
			{ alias: "progress", src: "./assets/progress/progress.png" },
			{ alias: "progress_background", src: "./assets/progress/progress_background.png" },
		]);
	}

	public override async init() {
		this.componentView = Component.from("preloader");

		this.progressBar = new ProgressBar({
			backgroundTexture: "progress_background",
			sliderTexture: "progress",
			width: 1000,
		});

		this.progressBar.position.set(
			-this.progressBar.width / 2,
			BaseGame.GAME_HEIGHT * 0.35
		);

		this.componentView.getLayer("root").addChild(this.progressBar);
		this.music = this.componentView.getSound("logo_05");
	}

	public override async start(): Promise<void> {
		this.startAmount = Object.values(Assets.loader.promiseCache).length;
		Sounds.play(this.music);
		this.componentView.playAnimation("intro");
	}

	public override async stop(): Promise<void> {
		Sounds.stop(this.music, true);
		await this.componentView.playAnimation("out");
		this.componentView.stopAnimation();
	}

	public async startPogressWatcher(): Promise<void> {
		const list = Object.values(Assets.loader.promiseCache);
		let amount = list.length;
		let count = 0;

		const updateProgress = async (promise: Promise<any>) => {
			await promise;
			
			count++;
			const progress = Math.max(0,Math.min(1, (count-this.startAmount) / (amount-this.startAmount)));
			if(progress===0) return;

			console.log("custom progress", `${(progress * 100).toFixed(0)}%`, (count-this.startAmount), (amount-this.startAmount));

			this.progressBar.setProgress(progress);
		}

		const promises = list.map(async item => {
			return updateProgress(item.promise);
		});

		await Promise.all(promises);
	}

	public override destroy(): void {
		Sounds.stop(this.music);
		this.progressBar.destroy();
		this.componentView.destroy();
	}
}
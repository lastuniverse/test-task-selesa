import { gsap } from "gsap";
import { Container, NineSliceSprite, TextStyle, Text, Texture, TilingSprite, DestroyOptions } from "pixi.js";

export interface IProgressBarOptions {
	backgroundTexture: string;
	sliderTexture: string;
	progress?: number;
	slice?: number;
	width?: number;
	height?: number;
}

export class ProgressBar extends Container {
	private background: NineSliceSprite;
	private slider: TilingSprite;
	private progressLabel: Text;
	private textStyle: TextStyle;
	private slice: number;
	private progress: number;
	private barWidth: number;
	private barHeight: number;
	private maxProgressWidth: number;
	private tween?: gsap.core.Tween;

	constructor(options: IProgressBarOptions) {
		super();
		this.progress = options.progress ?? 0;
		this.slice = options.slice ?? 8;
		this.barWidth = options.width ?? 100;
		this.barHeight = options.height ?? 30;
		this.maxProgressWidth = this.barWidth - this.slice * 2;

		this.background = new NineSliceSprite({
			texture: Texture.from(options.backgroundTexture),
			leftWidth: this.slice,
			topHeight: this.slice,
			rightWidth: this.slice,
			bottomHeight: this.slice
		});
		this.background.width = this.barWidth;
		this.background.height = this.barHeight;
		this.addChild(this.background);

		this.slider = new TilingSprite({
			texture: Texture.from(options.sliderTexture),
			width: this.maxProgressWidth * this.progress,
			height: this.barHeight - this.slice * 2,
		});
		this.slider.position.set(this.slice, this.slice);
		this.addChild(this.slider);

		this.textStyle = new TextStyle({
			fill: "#ffffff",
			stroke: { color: "#000000", width: 4, join: "round" },
			fontSize: 20,
			fontWeight: "bold"
		});
		this.progressLabel = new Text({
			text: `${Math.round(this.progress * 100)}%`,
			style: this.textStyle
		});
		this.progressLabel.anchor.set(0.5);
		this.progressLabel.position.set(
			this.barWidth / 2,
			this.barHeight * 1.5
		);
		this.addChild(this.progressLabel);
	}

	public setProgress(progress: number, needAnimate: boolean = true): void {
		this.progress = Math.max(0, Math.min(1, progress));

		this.tween?.kill();
		if (needAnimate) {
			this.tween = gsap.to(this.slider, { "duration": 0.5, "ease": "none", "pixi": { "width": this.maxProgressWidth * this.progress } })
		} else {
			this.slider.width = this.maxProgressWidth * this.progress;
		}

		this.progressLabel.text = `${Math.round(this.progress * 100)}%`;
	}

	destroy(options?: DestroyOptions): void {
		this.tween?.kill();
		super.destroy(options);
	}
}
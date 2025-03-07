import { Sprite, BlurFilter, Container } from "pixi.js";
import { BaseController } from "../../../core/commons/BaseController";
import { gsap } from "gsap";
import { IRequestSpinData } from "src/game/network/GameProxy";


export interface IBaseSlotReelOptions {
	symbols: string[],
	current: string,
	reelIndex: number,
	motionBlur?: number,
	symbolSize?: number,
}

// честно признаюсь, механику вращения содрал отсюда 
// https://pixijs.com/8.x/examples/advanced/slots
// и затем 2 дня адаптировал под необходимый функционал, уж очень понравилась анимация
// - переделал на ts
// - выпилил все лишнее (примерно 70%)
// - адаптировал к своей механике задания символов и использованию асинхронностей
// - сделал 2 режима:
//    - бесконечное вращение в ожидании ответа сервера
//    - завершение вращения с выставлением пришедшего с сервера мсимвола

export abstract class BaseSlotReel extends BaseController {
	protected symbolSize!: number;
	protected symbolNames!: string[];
	protected reelIndex!: number;
	protected motionBlur!: number;
	protected targetSymbol!: string;
	public currentSymbol!: string;
	protected symbols: (Sprite | Container)[] = [];
	protected position: number = 0;
	protected previousPosition: number = 0;
	protected blur?: BlurFilter;
	protected isRunning: boolean = false;
	protected isFinishing: boolean = false;
	protected startTime?: number;
	protected time?: number;
	protected target?: number;
	protected propertyBeginValue?: number;
	protected easing!: (value: number) => number;
	protected resolve?: (value?: any) => void;
	protected spinData?: Promise<IRequestSpinData>;
	protected container!: Container;

	public get view(): Container {
		return this.container;
	}

	public override async init(options: IBaseSlotReelOptions) {
		this.symbolNames = [...options.symbols];
		this.currentSymbol = options.current;
		this.reelIndex = options.reelIndex;
		this.motionBlur = options.motionBlur ?? 8;
		this.symbolSize = options.symbolSize ?? 256;

		this.container = new Container();
		this.initCurrent();
		this.initMotionBlur();
		this.createSymbols();
	}

	private initCurrent() {
		if (!this.symbolNames.includes(this.currentSymbol)) throw new Error(`The symbol ${this.currentSymbol} does not exist in the list of valid symbols [${this.symbolNames.join(",")}].`);
		if (this.symbolNames.length < 5) throw new Error(`This type of reels requires at least five symbols in the tape.`);
		while (this.symbolNames[0] !== this.currentSymbol) {
			const shiftedSymbol = this.symbolNames.shift();
			if (shiftedSymbol) this.symbolNames.push(shiftedSymbol);
		}
	}

	private initMotionBlur() {
		if (this.motionBlur == 0) return;
		this.blur = new BlurFilter();
		this.blur.blurX = 0;
		this.blur.blurY = 0;
		this.view.filters = [this.blur];
	}

	private createSymbols() {
		this.symbolNames.forEach((symbolName, index) => {
			const symbol = this.createSymbol(symbolName);
			symbol.scale = this.symbolSize / symbol.height;
			symbol.y = index * this.symbolSize;
			this.symbols.push(symbol)
			this.view.addChild(symbol);
		});
	}

	protected createSymbol(symbolName: string): (Sprite | Container) {
		throw new Error("The method 'createSymbol' does nothing, override it in the inheritor");
	}

	public override async start(): Promise<void> { }

	public async spin(spinData: Promise<IRequestSpinData>): Promise<void> {
		if (this.isRunning) return;
		this.spinData = spinData;

		this.isRunning = true;
		this.easing = this.backout(0.5);

		this.spinData.then(this.storeStartTime);
		gsap.ticker.add(this.reeelSlotsAnimate);
		gsap.ticker.add(this.reeelAnimate);

		await new Promise<void>((resolve, reject) => {
			this.resolve = resolve;
		})
	}

	private reelsComplete = () => {
		this.isRunning = false;
		this.isFinishing = false;
		this.position = 0;
		gsap.ticker.remove(this.reeelSlotsAnimate);
		gsap.ticker.remove(this.reeelAnimate);
		this.resolve?.();
	}

	private lerp(a1: number, a2: number, t: number): number {
		return a1 * (1 - t) + a2 * t;
	}

	private backout(amount: number): (value: number) => number {
		return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
	}

	private storeStartTime = (spinData: IRequestSpinData) => {
		const targetSymbol = spinData.currentSymbols[this.reelIndex];
		this.startTime = gsap.ticker.time;
		this.isFinishing = true;

		const targetIndex = this.symbolNames.lastIndexOf(targetSymbol);
		if (targetIndex < 0) throw new Error(`The terget symbol ${this.currentSymbol} does not exist in the list of valid symbols [${this.symbolNames.join(",")}].`);

		const currentIndex = this.symbolNames.lastIndexOf(this.currentSymbol) + 1;
		let target = this.symbolNames.length + (currentIndex - targetIndex);

		this.target = target + this.symbolNames.length * (this.reelIndex + 1);
		this.time = 2500 + this.target * 0.1 * 600;

		this.propertyBeginValue = Math.round(this.position);
	}

	private reeelAnimate = (time: number, deltaTime: number, frame: number, elapsed: number) => {
		if (this.isFinishing === false) {
			this.position = (this.position + 0.379) % this.symbols.length;

		} else {

			if (
				this.target === undefined ||
				this.time === undefined ||
				this.startTime === undefined ||
				this.propertyBeginValue === undefined
			) {
				throw new Error(`You have seriously violated something in the logic of the reel rotation process, roll back and sort it out`);
			}

			const delta = (time - this.startTime) * 1000;
			const phase = Math.min(1, delta / this.time);
			const easing = this.easing(phase);
			const lerp = this.lerp(this.propertyBeginValue, this.target, easing);
			this.position = lerp % this.symbols.length;

			if (phase === 1) {
				this.position = this.target;
				this.reelsComplete();
			}
		}
	}

	private reeelSlotsAnimate = () => {
		if (this.blur) {
			const strength = Math.abs(this.position - this.previousPosition);
			let blur = strength > 1 ? this.blur.blurY : strength * this.motionBlur;
			this.blur.blurY = blur;
		}

		this.previousPosition = this.position;

		for (let index = 0; index < this.symbols.length; index++) {
			const symbol = this.symbols[index];
			symbol.y = ((this.position + index) % this.symbols.length) * this.symbolSize - this.symbolSize;
		}
	}

	public override destroy(): void {
		gsap.ticker.remove(this.reeelSlotsAnimate);
		gsap.ticker.remove(this.reeelAnimate);
		this.view.filters = [];
		this.blur?.destroy();
		this.symbols.forEach(symbol => symbol.destroy());
		this.symbols = [];
	}
}

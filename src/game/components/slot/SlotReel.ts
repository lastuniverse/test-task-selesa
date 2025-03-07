import { Assets, Container, Sprite } from "pixi.js";
import { BaseSlotReel, IBaseSlotReelOptions } from "./BaseSlotReel";
import { ComponentResources } from "../../../core/components/ComponentResources";
import { Sounds } from "../../../core/sounds/Sounds";
import { IRequestSpinData } from "src/game/network/GameProxy";

export class SlotReel extends BaseSlotReel {
	protected resources!: ComponentResources;
	protected soundSpin!: HTMLAudioElement;
	protected soundSpinStart!: HTMLAudioElement;
	protected soundSpinLoop!: HTMLAudioElement;
	protected soundComplete!: HTMLAudioElement;

	public override async preload() {
		const resources = await Assets.load({ alias: "symbols", src: "./assets/slot/reel.asset" });
		this.resources = new ComponentResources(resources);
	}

	public override async init(options: IBaseSlotReelOptions) {
		await super.init({
			...options,
			motionBlur: 16
		});

		this.soundSpin = this.resources.getSound("reel_spin").cloneNode(true) as HTMLAudioElement;
		this.soundSpin.volume = 0.3;
		this.soundSpinStart = this.resources.getSound("reel_spin_start").cloneNode(true) as HTMLAudioElement;
		this.soundSpinStart.volume = 0.3;
		this.soundSpinLoop = this.resources.getSound("reel_spin_loop").cloneNode(true) as HTMLAudioElement;
		this.soundSpinLoop.volume = 0.3;

		this.soundComplete = this.resources.getSound("spin_complete").cloneNode(true) as HTMLAudioElement;
	}


	protected createSymbol(symbolName: string): (Sprite | Container) {
		return this.resources.createSprite(symbolName);
	}

	public override async start(): Promise<void> {
	}

	public override async spin(spinData: Promise<IRequestSpinData>): Promise<void> {
		this.statSpineSound();

		await super.spin(spinData);

		Sounds.stop(this.soundSpinStart);
		Sounds.stop(this.soundSpinLoop);
		Sounds.play(this.soundComplete);
	}

	protected async statSpineSound() {
		await Sounds.play(this.soundSpinStart);
		Sounds.play(this.soundSpinLoop, undefined, true);
	}

	public override destroy(): void {
		Sounds.stop(this.soundSpinStart);
		Sounds.stop(this.soundSpinLoop);
		Sounds.stop(this.soundComplete);

		this.resources.destroy();

		super.destroy();
	}
}

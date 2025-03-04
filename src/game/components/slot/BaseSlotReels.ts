import { IBaseSlotReelsOptions, IRequestSpinData } from "../../network/GameProxy";
import { BaseController } from "../../../core/commons/BaseController";
import { BaseSlotReel } from "./BaseSlotReel";


export class BaseSlotReels extends BaseController {
	protected tapes!: string[][];
	protected currents!: string[];
	protected reels: BaseSlotReel[] = [];


	public override async init(options: IBaseSlotReelsOptions) {
		this.tapes = options.tapes;
		this.currents = options.currentSymbols;
		this.reels = await this.createReels();
	}

	private async createReels(): Promise<BaseSlotReel[]> {
		const promises = this.tapes.map(async (symbols, reelIndex) => {
			const current = this.currents[reelIndex];
			const reel = this.createReel();
			await reel.preload(); // по факту ресурсы уже загружены и берутся из кеша
			await reel.init({
				current,
				symbols,
				reelIndex
			});
			return reel;
		});

		return await Promise.all(promises);
	}

	protected createReel(): BaseSlotReel {
		throw new Error("The method 'createReel' does nothing, override it in the inheritor");
	}

	public override async start(): Promise<void> {
	}

	public async spin(spinData: Promise<IRequestSpinData>): Promise<void> {
		const promises = this.reels.map((reel, index) => {
			return reel.spin(spinData);
		});

		await Promise.all(promises);
	}

	public override destroy(): void {
		this.reels.forEach(reel => {
			return reel.destroy();
		});
	}
}
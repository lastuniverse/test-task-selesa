import { BaseSlotReels } from "./BaseSlotReels";
import { BaseController } from "../../../core/commons/BaseController";
import { IBaseSlotReelsOptions, IRequestSpinData, GameProxy } from "../../network/GameProxy";

export class BaseSlotGame extends BaseController {
	protected bets!: number[];
	protected playerName!: string;
	protected balance!: number;
	protected bet!: number;
	protected betIndex!: number;
	protected reelsOptions!: IBaseSlotReelsOptions;
	protected reels!: BaseSlotReels;
	protected isRunning: boolean = false;

	constructor() {
		super();
		this.reels = this.createReels();
	}

	public override async init() {
		const slotData = await GameProxy.requestSlotData();
		this.playerName = slotData.playerName;
		this.balance = slotData.balance;
		this.bets = [...slotData.bets];
		this.betIndex = slotData.bet;
		this.reelsOptions = slotData.reelsOptions;

		await this.reels.init(this.reelsOptions);

		this.initializeUI();
		this.setBet(this.betIndex);
	}

	protected createReels(): BaseSlotReels {
		throw new Error('The method "createReel" does nothing, override it in the inheritor');
	}

	protected initializeUI() {
		throw new Error('The method "initializeUI" does nothing, override it in the inheritor');
	}

	protected updateUI() {
		throw new Error('The method "updateUI" does nothing, override it in the inheritor');
	}

	protected setBet(value: number) {
		this.betIndex = value;
		this.bet = this.bets[value];
		this.updateUI();
	}

	public async increaseBet() {
		const nextIndex = (this.betIndex + 1) % this.bets.length;

		if (this.bets[nextIndex] > this.balance) {
			this.setBet(0);
		} else {
			this.setBet(nextIndex);
		}
	}

	public async spin(): Promise<void> {
		if (this.isRunning) return;

		if (this.balance < this.bet) {
			this.setBet(0);
			return;
		}

		this.isRunning = true;

		const spinData = GameProxy.requestSpinData(this.betIndex);
		spinData.then(data => console.log('spinData', data));

		await this.beforeSpinAnimations();

		this.balance -= this.bet;
		this.updateUI();

		await this.reels.spin(spinData);

		await this.completeSpin(await spinData);

		this.isRunning = false;
	}

	protected async completeSpin(data: IRequestSpinData) {
		if (data.isWin) {
			await this.playWinAnimation(data);
		}
		this.balance = data.balance;
		this.updateUI();
	}

	protected async beforeSpinAnimations(): Promise<void> {
	}

	protected async playWinAnimation(data: IRequestSpinData) {
	}

	public override async start() {
	}

	public override destroy(): void {
		this.reels.destroy();
	}
}

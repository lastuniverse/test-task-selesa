import { gsapTimeout } from "../../core/utils/sleep";
import { MockServer } from "./MockServer";

export type Symbols = string[];

export interface IBaseSlotReelsOptions {
	tapes: Symbols[],
	currentSymbols: Symbols,
}

export interface IBaseSlotGameOptions {
	playerName: string,
	balance: number,
	bets: number[],
	bet: number,
	reelsOptions: IBaseSlotReelsOptions,
}

export interface IRequestSpinData {
	isWin: boolean,
	balance: number,
	diff: number,
	win: number,
	multiplier: number,
	currentSymbols: Symbols,
}

export interface IRequestChangeBetData {
	betIndex: number,
	isAllow: boolean,
}

export class GameProxy {
	public static async requestSlotData(): Promise<IBaseSlotGameOptions> {
		return new Promise((resolve, _) => {
			gsapTimeout(() => {
				resolve(MockServer.getSlotData());
			}, Math.random() * 5000);
		});
	}

	public static async requestSpinData(betIndex: number): Promise<IRequestSpinData> {
		return new Promise((resolve, _) => {
			gsapTimeout(() => {
				resolve(MockServer.getSpinData(betIndex));
			}, Math.random() * 5000);
		});
	}
}
import { IBaseSlotGameOptions, IBaseSlotReelsOptions, IRequestChangeBetData, IRequestSpinData, Symbols } from "./GameProxy";

const names = [
	"Donald",
	"Scrooge",
	"Zigzag",
	"Rui",
	"Dui",
	"Lui",
	"Pona",
];
const surNames = [
	"Goose",
	"Duck",
	"Crack",
	"McDuck",
	"McCrack",
];

export function createName() {
	const part1 = Math.floor(Math.random() * names.length);
	const part2 = Math.floor(Math.random() * surNames.length);
	return `${names[part1]} ${surNames[part2]}`;
}

export class MockServer {
	private static playerName: string;
	private static balance: number;
	private static bets: number[];
	private static bet: number;
	private static tapes: Symbols[];
	private static symbols = [
		"symbol_00",
		"symbol_01",
		"symbol_02",
		"symbol_03",
		"symbol_04",
		"symbol_05",
		"symbol_06",
		"symbol_07",
		"symbol_08",
		"symbol_09",
		"symbol_10",
		"symbol_11",
		"symbol_12",
		"symbol_13",
		"symbol_14",
		"symbol_15",
	]

	private static multipliers = {
		"symbol_00": 1.0,
		"symbol_01": 1.0,
		"symbol_02": 1.0,
		"symbol_03": 1.0,
		"symbol_04": 2.0,
		"symbol_05": 2.0,
		"symbol_06": 2.0,
		"symbol_07": 3.0,
		"symbol_08": 3.0,
		"symbol_09": 3.0,
		"symbol_10": 4.0,
		"symbol_11": 4.0,
		"symbol_12": 4.0,
		"symbol_13": 5.0,
		"symbol_14": 5.0,
		"symbol_15": 10.0,
	};

	public static init() {
		this.playerName = createName();
		this.bets = [1, 2, 3, 5, 10, 15, 25, 50, 100];
		this.balance = Math.floor(Math.random() * 99999);
		this.bet = Math.floor(Math.random() * this.bets.length);
		this.tapes = [this.symbols, this.symbols, this.symbols];
	}

	public static getSlotData(): IBaseSlotGameOptions {
		return {
			playerName: this.playerName,
			bets: this.bets,
			balance: this.balance,
			bet: this.bet,
			reelsOptions: {
				tapes: this.tapes,
				currentSymbols: this.generateCurrentSymbols(false)
			}
		} as IBaseSlotGameOptions;
	}

	public static getSpinData(betIndex: number): IRequestSpinData {
		const bet = this.bets[betIndex];
		if (bet > this.balance) {
			// Если клиент такое прислал, значит он сломан или его хакнули
			throw new Error(`Баланс меньше ставки: ${this.balance} < ${bet} !!!`);
		}

		this.bet = betIndex;
		const isWin = Math.random() < 0.4;
		const currentSymbols = this.generateCurrentSymbols(isWin);
		const multiplier = isWin ? this.multipliers[currentSymbols[0] as keyof typeof this.multipliers] : 0;
		const win = isWin ? bet * multiplier : 0;
		const diff = win - bet;
		this.balance += diff;

		return {
			isWin,
			diff,
			win,
			multiplier,
			currentSymbols,
			balance: this.balance,
		};
	}

	private static generateCurrentSymbols(isWin: boolean): Symbols {
		if (isWin) {
			const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
			return [symbol, symbol, symbol];
		} else {
			let data: Symbols = [];
			while (data.length < 3) {
				const index = Math.floor(Math.random() * this.symbols.length);
				const symbol = this.symbols[index];
				if (data.includes(symbol)) continue;
				data.push(symbol)
			}
			return data;
		}
	}
}

MockServer.init();
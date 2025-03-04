import { ApplicationOptions } from "pixi.js";
import { Logo } from "./components/logo/Logo.ts";
import { BaseController } from "../core/commons/BaseController.ts";
import { Preloader } from "./components/preloader/Preloader.ts";
import { BaseGame } from "../core/BaseGame.ts";
import { gsapSleep } from "../core/utils/sleep.ts";
import { SlotGame } from "./components/slot/SlotGame.ts";


export class Game extends BaseGame {
	private logo: BaseController | null = null;
	private preloader: Preloader | null = null;
	private slot!: SlotGame;


	async init(parentElementId: string, pixiOptions: Partial<ApplicationOptions> = {}) {
		await super.init(parentElementId, pixiOptions);
		this.logo = new Logo();
		await this.logo.preload();
		await this.logo.init();
	}

	public async start() {
		await this.startLogo();

		// таймаут добавлен для того чтобы подольше задержаться на лого, и увидеть все его анимации
		await gsapSleep(4000);
		await this.startPreloader();

		// таймаут добавлен для того чтобы подольше задержаться на прелоадере, и увидеть часть его анимаций
		await gsapSleep(4000);
		await this.startSlot();
	}

	private async startLogo() {
		if (this.logo) {
			this.app.stage.addChildAt(this.logo.view, 0);
			this.logo.start();
		}

		this.preloader = new Preloader();
		await this.preloader.preload();
		await this.preloader.init();
		this.app.stage.addChildAt(this.preloader.view, 0);
	}

	private async startPreloader() {
		await this.logo?.stop();
		await this.preloader?.start();

		this.logo?.destroy();
		this.logo = null;

		await this.preloader?.initPogressWatcher(()=>this.createSlot());
	}

	private async createSlot() {
		this.slot = new SlotGame();
		await this.slot.preload();
		await this.slot.init();
	}

	private async startSlot() {
		await this.preloader?.stop();
		this.preloader?.destroy();
		this.preloader = null;

		this.app.stage.addChildAt(this.slot.view, 0);
		await this.slot.start();
	}

	public destroy(): void {
		this.logo?.destroy();
		this.preloader?.destroy();
		this.slot?.destroy();
		super.destroy();
	}
}

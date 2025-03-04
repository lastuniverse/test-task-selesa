import "./parsers/loadAssets.ts";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { Application, ApplicationOptions } from "pixi.js";
import { Sounds } from "./sounds/Sounds.ts";
import { SystemButtons } from "./commons/SystemButtons.ts";

export abstract class BaseGame {
	// Базовые размеры игровой области (пока в виде констант, в проэкте нужен будет внешний механизм)
	public static readonly GAME_WIDTH: number = 1920;
	public static readonly GAME_HEIGHT: number = 1080;

	protected app!: Application;
	protected parentContainer!: HTMLElement;
	protected resizeObserver!: ResizeObserver;
	private sustemButtons!: SystemButtons;

	async init(parentElementId: string, pixiOptions: Partial<ApplicationOptions> = {}) {
		await this.initPixiApp(pixiOptions);
		this.initParentContainer(parentElementId);
		this.initGsap();
		this.setupResizeHandling();
		this.setupFocusHandling();
		this.initSystemButtons();
	}

	private async initSystemButtons() {
		this.sustemButtons = new SystemButtons();
		await this.sustemButtons.preload();
		await this.sustemButtons.init();
		this.sustemButtons.view.scale = 0.3;
		this.sustemButtons.view.position.set(BaseGame.GAME_WIDTH, 0);
		this.updateSystemButtons();
		this.app.stage.addChild(this.sustemButtons.view);
	}

	private async initPixiApp(options: Partial<ApplicationOptions>): Promise<void> {
		this.app = new Application();

		await this.app.init({
			background: "#ffffff",
			...options,
		});
		this.app.renderer.resize(BaseGame.GAME_WIDTH, BaseGame.GAME_HEIGHT);
	}

	private initGsap() {
		gsap.registerPlugin(PixiPlugin);
		PixiPlugin.registerPIXI(PIXI);
		this.app.ticker.stop();
		gsap.ticker.add(() => {
			this.app.ticker.update();
		});
	}

	private initParentContainer(elementId: string): void {
		const container = document.getElementById(elementId);
		if (!container) throw new Error(`Parent container #${elementId} not found`);
		this.parentContainer = container;
		this.parentContainer.appendChild(this.app.canvas);

	}

	private setupFocusHandling(): void {
		this.handleTabChange(document.visibilityState === "hidden");

		window.addEventListener("blur", () => {
			this.handleTabChange(true);
		});
		window.addEventListener("focus", () => {
			this.handleTabChange(false);
		});
	}

	private handleTabChange = (isLost: boolean) => {
		if (isLost) {
			console.log("Пользователь покинул вкладку");
			gsap.globalTimeline.pause()
			gsap.ticker.sleep();
			this.app.ticker.stop();
			this.app.stop();
			Sounds.pauseAll();
		} else {
			console.log(`Вкладка активна`);
			gsap.globalTimeline.resume()
			gsap.ticker.wake();
			this.app.ticker.start();
			this.app.start();
			Sounds.resumeAll();
		}
	}

	private setupResizeHandling(): void {
		this.resizeObserver = new ResizeObserver(() => this.handleResize());
		this.resizeObserver.observe(this.parentContainer);
		this.handleResize();
	}

	private handleResize(): void {
		const { clientWidth: width, clientHeight: height } = this.parentContainer;
		const { width: rendererWidth, height: rendererHeight } = this.app.renderer;

		const isLandscape = width > height;

		if (isLandscape) {
			this.app.stage.scale.set(rendererWidth / BaseGame.GAME_WIDTH, rendererHeight / BaseGame.GAME_HEIGHT);
			this.app.stage.angle = 0;
			this.app.stage.x = 0;
			this.app.stage.y = 0;
			this.sustemButtons?.updateResize(BaseGame.GAME_WIDTH / width, BaseGame.GAME_HEIGHT / height);
		} else {
			this.app.stage.scale.set(rendererHeight / BaseGame.GAME_WIDTH, rendererWidth / BaseGame.GAME_HEIGHT);
			this.app.stage.angle = -90;
			this.app.stage.x = 0;
			this.app.stage.y = rendererHeight;
			this.sustemButtons?.updateResize(BaseGame.GAME_WIDTH / height, BaseGame.GAME_HEIGHT / width);
		}
		this.updateSystemButtons();
		this.handleTabChange(false);
	}

	private updateSystemButtons() {
		const { clientWidth: width, clientHeight: height } = this.parentContainer;
		const isLandscape = width > height;
		if (isLandscape) {
			this.sustemButtons?.updateResize(BaseGame.GAME_WIDTH / width, BaseGame.GAME_HEIGHT / height);
		} else {
			this.sustemButtons?.updateResize(BaseGame.GAME_WIDTH / height, BaseGame.GAME_HEIGHT / width);
		}
	}

	public async start() {
		console.warn("The method 'start' does nothing, override it in the inheritor")
	}

	public async stop() {
		console.warn("The method 'stop' does nothing, override it in the inheritor")
	}

	public destroy(): void {
		this.resizeObserver.disconnect();
		this.app.destroy(true);
		this.parentContainer.removeChild(this.app.canvas);
	}
}

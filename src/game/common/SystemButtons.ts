import { Assets, Container, Sprite } from "pixi.js";
import { BaseController } from "../../core/commons/BaseController";
import { Component } from "../../core/components/Component";
import { Sounds } from "../../core/sounds/Sounds";


export class SystemButtons extends BaseController {
	private componentView!: Component;
	private buttons!: Container;
	private soundButton!: Sprite;
	private fullscreenButton!: Sprite;
	private fullscreenOffButton!: Sprite;
	private isSoundOn: boolean = true;

	public get view(): Component {
		return this.componentView;
	}

	public override async preload() {
		await Assets.load([
			{ alias: 'top_buttons', src: './assets/top_buttons.asset' }
		]);
	}

	public override async init() {
		this.componentView = Component.from('top_buttons');

		this.buttons = this.componentView.getLayer('buttons');

		this.soundButton = this.componentView.getSprite('sound') as Sprite;
		this.soundButton.interactive = true;
		this.soundButton.eventMode = 'static';
		this.soundButton.on('pointerdown', () => { this.turnSound(); });

		this.fullscreenButton = this.componentView.getSprite('fullscreen') as Sprite;
		this.fullscreenButton.interactive = true;
		this.fullscreenButton.eventMode = 'static';
		this.fullscreenButton.on('pointerdown', () => { this.turnFullscreen(); });

		this.fullscreenOffButton = this.componentView.getSprite('fullscreen_off') as Sprite;

		document.addEventListener('fullscreenchange', this.updateFullscreenButton);
		document.addEventListener('webkitfullscreenchange', this.updateFullscreenButton); // Chrome/Safari
		document.addEventListener('mozfullscreenchange', this.updateFullscreenButton); // Firefox
	}

	public async turnSound(): Promise<void> {
		this.isSoundOn = !this.isSoundOn;
		this.soundButton.alpha = this.isSoundOn ? 0.7 : 0.3;
		if (this.isSoundOn) {
			Sounds.unmuteAll();
		} else {
			Sounds.muteAll();
		}
	}

	public async turnFullscreen(): Promise<void> {
		if (this.isFullscreen) {
			this.exitFullscreen();
		} else {
			this.enterFullscreen();
		}
		this.updateFullscreenButton();
	}

	private updateFullscreenButton = () => {
		if (!this.componentView) return;
		this.fullscreenButton.alpha = this.isFullscreen ? 0.0 : 0.7;
		this.fullscreenOffButton.alpha = this.isF11Fullscreen ? 0.3 : 0.7;
		this.fullscreenOffButton.visible = this.isFullscreen;
	}

	private enterFullscreen(element = document.documentElement) {
		const anyElement = element as any;
		if (anyElement.requestFullscreen) {
			anyElement.requestFullscreen?.();
		} else if (anyElement.mozRequestFullScreen) { // Firefox
			anyElement.mozRequestFullScreen?.();
		} else if (anyElement.webkitRequestFullscreen) { // Chrome, Safari, Opera
			anyElement.webkitRequestFullscreen?.();
		} else if (anyElement.msRequestFullscreen) { // IE/Edge
			anyElement.msRequestFullscreen?.();
		}
	}

	private exitFullscreen() {
		// все это очень странно работает в комбинации с кнопкой F11.
		// если был переход в полноэкранный режим по F11 то обращение в API 
		// в chrome даст ошибку
		if (this.isF11Fullscreen) return;
		const anyElement = document as any;
		if (anyElement.exitFullscreen) {
			anyElement.exitFullscreen?.();
		} else if (anyElement.mozCancelFullScreen) { // Firefox
			anyElement.mozCancelFullScreen?.();
		} else if (anyElement.webkitExitFullscreen) { // Chrome, Safari, Opera
			anyElement.webkitExitFullscreen?.();
		} else if (anyElement.msExitFullscreen) { // IE/Edge
			anyElement.msExitFullscreen?.();
		}
	}

	private get isFullscreen() {
		return this.isApiFullscreen || this.isF11Fullscreen;
	}

	private get isApiFullscreen() {
		const anyElement = document as any;
		return !!(
			anyElement.fullscreenElement ||
			anyElement.mozFullScreenElement ||
			anyElement.webkitFullscreenElement ||
			anyElement.msFullscreenElement
		);
	}

	private get isF11Fullscreen() {
		return !this.isApiFullscreen && window.innerHeight === screen.height;
	}

	public updateResize(scaleX: number, scaleY: number) {
		var multiplier = this.isMobile ? 1.2 : 0.6;

		this.buttons?.scale.set(
			scaleX * multiplier,
			scaleY * multiplier
		);

		this.updateFullscreenButton();
	}

	get isMobile(): boolean {
		const userAgent = navigator.userAgent.toLowerCase();
		const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		const isMobileUserAgent = /mobile|android|iphone|ipad|ipod|windows phone|webos|blackberry/.test(userAgent);
		const isSmallScreen = window.innerWidth <= 768; // пока нет уверености в необходимости isSmallScreen

		return isMobileUserAgent && isTouchDevice;
	}

	public override async start(): Promise<void> { }

	public override async stop(): Promise<void> { }

	public override destroy(): void {
		document.removeEventListener('fullscreenchange', this.updateFullscreenButton);
		document.removeEventListener('webkitfullscreenchange', this.updateFullscreenButton); // Chrome/Safari
		document.removeEventListener('mozfullscreenchange', this.updateFullscreenButton); // Firefox
		this.componentView.destroy();
	}
}
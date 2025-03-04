import { gsap } from "gsap";
import { Text, Sprite, Assets, TextStyle, TextStyleAlign, TextStyleFontWeight } from "pixi.js";
import { Component } from "../../../core/components/Component";
import { SlotReels } from "./SlotReels";
import { Sounds } from "../../../core/sounds/Sounds";
import { SpineBoy } from "../spine/SpineBoy";
import { IRequestSpinData } from "../../network/GameProxy";
import { BaseGame } from "../../../core/BaseGame";
import { BaseSlotGame } from "./BaseSlotGame";
import { gsapSleep } from "../../../core/utils/sleep";

export class SlotGame extends BaseSlotGame {
	protected componentView!: Component;
	protected isAnimating: boolean = false;

	private playerText!: Text;
	private balanceText!: Text;
	private betText!: Text;
	private spinButton!: Sprite;
	private betButton!: Sprite;
	private spinSound!: HTMLAudioElement;
	private winSound!: HTMLAudioElement;
	private winCountSound!: HTMLAudioElement;
	private ambientMusic!: HTMLAudioElement;
	private bigWinSound!: HTMLAudioElement;
	private spineBoy!: SpineBoy;
	private money: Sprite[] = [];

	constructor() {
		super();
		this.spineBoy = new SpineBoy();
	}

	public get view(): Component {
		return this.componentView;
	}

	public override async preload() {
		await Promise.all([
			Assets.load({ alias: "slot", src: "./assets/slot/slot.asset" }),
			this.reels.preload(),
			this.spineBoy.preload(),
		]);
	}

	public override async init() {
		this.componentView = Component.from("slot");

		this.spinSound = this.componentView.getSound("spin_click");
		this.winSound = this.componentView.getSound("win_02");
		this.bigWinSound = this.componentView.getSound("big_win_02");
		this.winCountSound = this.componentView.getSound("win_count");
		this.ambientMusic = this.componentView.getSound("a_flat_major");

		await super.init();
		this.componentView.getLayer("reels").addChild(this.reels.view);

		await this.spineBoy.init();
		this.componentView.getLayer("spine_boy").addChild(this.spineBoy.view);
	}

	protected override createReels(): SlotReels {
		return new SlotReels();
	}

	protected override  initializeUI() {
		const templateStyle = {
			fill: "#ffbb00",
			stroke: { color: "#442200", width: 2, join: "round" as CanvasLineJoin },
			align: "center" as TextStyleAlign,
			fontSize: 30,
			fontWeight: "bold" as TextStyleFontWeight
		};

		const playerTextStyle = new TextStyle({ ...templateStyle, fontSize: 25 });
		this.playerText = new Text({ style: playerTextStyle });
		this.componentView.getLayer(`player`).addChild(this.playerText);

		const textStyle = new TextStyle(templateStyle);
		this.balanceText = new Text({ style: textStyle });
		this.componentView.getLayer(`balance`).addChild(this.balanceText);

		this.betText = new Text({ style: textStyle });
		this.componentView.getLayer(`bet`).addChild(this.betText);

		this.spinButton = this.componentView.getSprite("spin_button_up") as Sprite;
		this.spinButton.interactive = true;
		this.spinButton.eventMode = "static";
		this.spinButton.on("pointerdown", () => { this.spin(); });

		this.betButton = this.componentView.getSprite("bet_button_up") as Sprite;
		this.betButton.interactive = true;
		this.betButton.eventMode = "static";
		this.betButton.on("pointerdown", () => this.increaseBet());

		this.updateUI();
	}

	protected override updateUI() {
		this.playerText.text = `${this.playerName}`;
		this.playerText.position.set(
			-this.playerText.width / 2,
			-this.playerText.height / 2
		);

		this.balanceText.text = `${this.balance}`;
		this.balanceText.position.set(
			-this.balanceText.width / 2,
			-this.balanceText.height / 2
		);

		this.betText.text = `Bet: ${this.bet}`;
		this.betText.position.set(
			-this.betText.width / 2,
			-this.betText.height / 2
		);
	}

	public override async increaseBet() {
		if (this.isAnimating || this.isRunning) return;
		this.isAnimating = true;

		this.spineBoy.jump();

		Sounds.play(this.spinSound);
		await this.componentView.playAnimation("bet_click");

		super.increaseBet();

		this.spineBoy.idle(true);
		this.isAnimating = false;
	}

	protected override async beforeSpinAnimations(): Promise<void> {
		this.spineBoy.run(true);
		Sounds.play(this.spinSound);
		await this.componentView.playAnimation("spin_click");
	}

	protected override async completeSpin(data: IRequestSpinData) {
		await super.completeSpin(data)
		this.spineBoy.idle(true);
	}

	protected override async playWinAnimation(data: IRequestSpinData) {
		this.spineBoy.hover(true);
		const sound = data.multiplier > 1 ? this.bigWinSound : this.winSound;
		Sounds.play(sound);
		gsap.fromTo(this.balanceText, {
			duration: this.winCountSound.duration,
			pixi: { text: this.balance }
		}, {
			duration: this.winCountSound.duration,
			pixi: { text: data.balance },
			modifiers: {
				text: function (i) {
					return Math.round(i).toFixed(0);
				}
			}
		});
		await this.playMoneyAnimation(50, 2);
	}

	private async playMoneyAnimation(amount: number, duration: number = 1) {
		// всю эту анимацию можно было вставить внутрь компонента, но оставляю здесь как пример навыка использования gsap
		const texture = this.componentView.getTexture("money");
		const layer = this.componentView.getLayer("overlay");
		const promises = [];

		for (let i = 0; i < amount; i++) {
			const sprite = Sprite.from(texture);
			const delay = i * 0.05;
			const scale = 0.4 + Math.random() * 0.2;
			sprite.position.set(Math.random() * BaseGame.GAME_WIDTH, -50);
			sprite.anchor = 0.5;
			sprite.scale = scale;
			sprite.alpha = 0;

			gsap.to(sprite, { delay, duration: duration, ease: "power4.inOut", pixi: { y: 994 } });
			gsap.to(sprite, { delay, duration: duration, ease: "power4.in", pixi: { x: 587 } });
			gsap.to(sprite, { delay, duration: duration * 0.2, ease: "power4.out", pixi: { alpha: 1 } });
			gsap.to(sprite, { delay, duration: duration * 0.20, repeat: 3, yoyo: true, ease: "power3.out", pixi: { scaleX: -scale } });

			const promise = new Promise<void>((resolve, _) => {
				gsap.to(sprite, {
					delay: duration * 0.5 + delay, duration: duration * 0.7, ease: "none", pixi: { alpha: 0, scale: 0 }, onComplete: () => {
						gsap.killTweensOf(sprite);
						sprite.destroy();
						resolve();
					}
				});
			});

			promises.push(promise);
			this.money.push(sprite)
			layer.addChild(sprite);
		}

		promises.push(Sounds.play(this.winCountSound))
		await Promise.all(promises);
		this.money = [];
	}

	public override async start() {
		await this.spineBoy.spawn();
		this.spineBoy.idle(true);
		await gsapSleep(2000);
		Sounds.play(this.ambientMusic, 0.6, true);
	}

	public override destroy(): void {
		this.money.forEach(item => {
			gsap.killTweensOf(item);
			item.destroy();
		});

		Sounds.stop(this.spinSound);
		Sounds.stop(this.winSound);
		Sounds.stop(this.winCountSound);
		Sounds.stop(this.bigWinSound);
		this.componentView.destroy();

		super.destroy();
	}
}

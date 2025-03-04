import { Assets } from "pixi.js";
import { BaseController } from "../../../core/commons/BaseController";
import { Component } from "../../../core/components/Component";

export class Logo extends BaseController {
	private componentView!: Component;

	public get view(): Component {
		return this.componentView;
	}

	public override async preload() {
		await Assets.load([
			{ alias: "logo", src: "./assets/logo.asset" }
		]);
	}

	public override async init() {
		this.componentView = Component.from("logo");
	}

	public override async start(): Promise<void> {
		await this.componentView.playAnimation("main");
	}

	public override async stop(): Promise<void> {
		this.componentView.pauseAnimation("main");
		await this.componentView.playAnimation("out");
		this.componentView.stopAnimation();
	}

	public override destroy(): void {
		this.componentView.destroy();
	}
}
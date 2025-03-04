import { Container, NineSliceSprite, Sprite, Cache, DestroyOptions, Texture } from "pixi.js";
import { ResourcesMap } from "../parsers/loadAssetTypes.ts";
import { gsap } from "gsap";
import { ComponentResources } from "./ComponentResources.ts";
import { EGsapMethods, GsapElements, IGsapTweenFromToParams, IGsapTweenParams } from "../parsers/gsapTypes.ts";
import { TweenDeferred } from "./TweenDeferred.ts";

export class Component extends Container {
	protected static ROOT_LAYER_NAME: string = 'root';
	public readonly resources: ComponentResources;
	private animations: Map<string, TweenDeferred[]> = new Map();

	constructor(resources: ResourcesMap) {
		super();
		this.resources = new ComponentResources(resources);
		this.init();
	}

	private init() {
		const rootLayer = this.resources.getView(Component.ROOT_LAYER_NAME);
		this.addChild(rootLayer);
	}

	public getLayer(layerName: string): Container {
		return this.resources.getLayer(layerName);
	}

	public getSprite(spriteName: string): Sprite | NineSliceSprite {
		return this.resources.getSprite(spriteName);
	}

	public getTexture(textureName: string): Texture {
		return this.resources.getTexture(textureName);
	}

	public getSound(soundName: string): HTMLAudioElement {
		return this.resources.getSound(soundName);
	}

	public playSound(soundName: string): void {
		const sound = this.getSound(soundName);
		sound.play();
	}

	public async playAnimation(animationName: string): Promise<gsap.core.Tween[]> {
		const data = this.resources.getAnimationData(animationName);
		if (data === null) {
			console.warn(`Отсутствует анимация '${animationName}'`);
			return Promise.resolve([]);
		}

		this.stopAnimation(animationName);

		const tweenMethodNames = Object.values(EGsapMethods) as EGsapMethods[];
		const promises: Promise<gsap.core.Tween>[] = [];
		const animations = [] as TweenDeferred[];
		this.animations.set(animationName, animations);

		data.forEach(gsapItem => {
			const elements = this.getElements(gsapItem.elements, animationName);
			tweenMethodNames.forEach(key => {
				const params = gsapItem[key];
				if (!params) return;
				params.forEach(gsapParams => {
					const tweenDeferred = this.startAnimation(elements, gsapParams, key);
					animations.push(tweenDeferred);
					promises.push(tweenDeferred.promise);
				});
			})
		});

		return Promise.all(promises) as Promise<gsap.core.Tween[]>;
	}

	private startAnimation(targets: gsap.TweenTarget, gsapParams: IGsapTweenParams | IGsapTweenFromToParams, type: EGsapMethods): TweenDeferred {
		let tween;
		if (type === EGsapMethods.FROM_TO) {
			tween = gsap.fromTo(targets, gsapParams.from, gsapParams.to);
		} else {
			const method = gsap[type];
			tween = method(targets, gsapParams);
		}

		const tweenDeferred = new TweenDeferred(tween);
		return tweenDeferred;
	}

	private getElements(elements: GsapElements, animationName: string = 'unknown'): gsap.TweenTarget[] {
		return elements.reduce((acc, elementParams) => {
			const element = this.resources.getElement(elementParams);
			if (!element) {
				console.warn(`Отсутствует элемент '${elementParams}' в анимации '${animationName}'`);
			} else {
				acc.push(element);
			}
			return acc;
		}, [] as gsap.TweenTarget[]);
	}

	public pauseAnimation(name?: string): void {
		if (!name) {
			Object.keys(this.animations).forEach(key => this.pauseAnimationByName(key));
		} else {
			this.pauseAnimationByName(name);
		}
	}

	private pauseAnimationByName(name: string): void {
		const animations = this.animations.get(name);
		if (!animations) return;
		animations.forEach(tweenDeferred => tweenDeferred.pause());
	}

	public resumeAnimation(name?: string): void {
		if (!name) {
			Object.keys(this.animations).forEach(key => this.resumeAnimationByName(key));
		} else {
			this.resumeAnimationByName(name);
		}
	}

	private resumeAnimationByName(name: string): void {
		const animations = this.animations.get(name);
		if (!animations) return;
		animations.forEach(tweenDeferred => tweenDeferred.resume());
	}

	public stopAnimation(name?: string, progress?: number): void {
		if (!name) {
			Object.keys(this.animations).forEach(key => this.stopAnimationByName(key, progress));
		} else {
			this.stopAnimationByName(name, progress);
		}
	}

	private stopAnimationByName(name: string, progress?: number): void {
		const animations = this.animations.get(name);
		if (!animations) return;
		animations.forEach(tweenDeferred => tweenDeferred.stop(progress));
		this.animations.delete(name);
	}

	static from(id: string | Component): Component {
		if (typeof id === "string") {
			const resources = Cache.get(id);
			return new Component(resources);
		} else {
			return new Component(id.resources.resources);
		}
	}

	destroy(options?: DestroyOptions): void {
		this.resources?.destroy();
		super.destroy(options);
		this.stopAnimation();
	}
}
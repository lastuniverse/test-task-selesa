import { AssetLayersParams, AssetSpritesParams, IElementParams, ILayerParams, INineSpriteParams, ISpriteParams, ResourcesMap } from "../parsers/loadAssetTypes.ts";
import { gsap } from "gsap";
import { Container, NineSliceSprite, NineSliceSpriteOptions, Sprite, Texture } from "pixi.js"
import { EGsapTypes, GsapItems, IGsapElementParams } from "../parsers/gsapTypes.ts";

export class ComponentResources {
	public readonly resources: ResourcesMap;
	private animationsData: Record<string, GsapItems> | null = {};
	private layersData: Record<string, ILayerParams> | null = {};
	private spritesData: Record<string, ISpriteParams> | null = {};
	private textures: Record<string, Texture> | null = {};
	private sounds: Record<string, HTMLAudioElement> | null = {};
	private layers: Record<string, Container> | null = {};
	private sprites: Record<string, Sprite | NineSliceSprite> | null = {};
	private masksData: Record<string, Sprite | Container> | null = {};



	constructor(resources: ResourcesMap) {
		this.resources = resources;
		this.textures = resources.textures;
		this.animationsData = resources.gsap;
		this.sounds = resources.sounds;
		this.parseLayers(resources.data.layers);
		this.parseSprites(resources.data.sprites);
	}

	public getView(name: string): Container {
		const view = this.createLayer(name);
		this.initMasks();

		return view;
	}

	private initMasks(): void {
		Object.entries(this.masksData!).forEach(([maskName, maskedElement]) => {
			const element = this.getElement({ name: maskName, type: EGsapTypes.SPRITE });
			if (!element) throw new Error(`mask ${maskName} not found`);
			maskedElement.mask = element;
		});

		this.masksData = {};
	}

	public createLayer(layerName: string): Container {
		const layerParams = this.getLayerData(layerName);
		if (!layerParams) throw new Error(`layer ${layerName} not found`);

		const layer = new Container();
		this.applyContainerParams(layer, layerParams);

		layerParams.children?.forEach(childParams => {
			if (childParams.type === 'Sprite') {
				const childSprite = this.createSprite(childParams.name);
				layer.addChild(childSprite);
			} else if (childParams.type === 'NineSliceSprite') {
				const childLayer = this.createNineSliceSprite(childParams.name);
				layer.addChild(childLayer);
			} else if (childParams.type === 'Container') {
				const childLayer = this.createLayer(childParams.name);
				layer.addChild(childLayer);
			}
		});

		this.layers![layerName] = layer;

		return layer;
	}


	public createSprite(spriteName: string): Sprite {
		const spriteParams = this.getSpriteData(spriteName);
		if (!spriteParams) throw new Error(`sprite ${spriteName} not found`);

		const texture = this.getTexture(spriteParams.texture);
		let sprite = new Sprite(texture);
		this.setSpriteParams(sprite, spriteParams);

		this.sprites![spriteName] = sprite;

		return sprite;
	}

	public createNineSliceSprite(spriteName: string): NineSliceSprite {
		const spriteParams = this.getSpriteData(spriteName);
		if (!spriteParams) throw new Error(`sprite ${spriteName} not found`);

		const texture = this.getTexture(spriteParams.texture);
		const slice = spriteParams.slice ?? 20;
		const isNumber = typeof spriteParams.slice === 'number';
		const sliceParams = {
			texture,
			leftWidth: isNumber ? slice : (slice as number[])[0],
			topHeight: isNumber ? slice : (slice as number[])[1],
			rightWidth: isNumber ? slice : (slice as number[])[2],
			bottomHeight: isNumber ? slice : (slice as number[])[3],
		} as NineSliceSpriteOptions;

		const sprite = new NineSliceSprite(sliceParams);
		this.setNineSliceSpriteParams(sprite, spriteParams);

		this.sprites![spriteName] = sprite;

		return sprite;
	}

	private applyContainerParams(container: Container, params: ILayerParams): void {
		this.setElemetParams(container, params);
	}

	private setSpriteParams(sprite: Sprite, params: ISpriteParams): void {
		this.setElemetParams(sprite, params);

		if (params.anchor != null) {
			if (typeof params.anchor === 'number') {
				sprite.anchor.set(params.anchor, params.anchor);
			} else {
				sprite.anchor.set(params.anchor.x, params.anchor.y);
			}
		}

		if (params.width != null) {
			sprite.width = params.width;
		}

		if (params.height != null) {
			sprite.height = params.height;
		}
	}

	private setNineSliceSpriteParams(sprite: NineSliceSprite, params: INineSpriteParams): void {
		this.setElemetParams(sprite, params);
		// if (params.anchor != null) {
		// 	if (typeof params.anchor === 'number'){
		// 		sprite.anchor.set(params.anchor, params.anchor);
		// 	}else{
		// 		sprite.anchor.set(params.anchor.x, params.anchor.y);
		// 	}				
		// }

		if (params.pivot != null) {
			if (typeof params.pivot === 'number') {
				sprite.pivot.set(params.pivot, params.pivot);
			} else {
				sprite.pivot.set(params.pivot.x, params.pivot.y);
			}
		}

		if (params.width != null) {
			sprite.width = params.width;
		}

		if (params.height != null) {
			sprite.height = params.height;
		}
	}

	private setElemetParams(element: Sprite | Container, params: IElementParams): void {
		if (params.mask != null) {
			this.masksData![params.mask] = element;
		}

		if (params.position != null) {
			element.position.set(params.position.x, params.position.y)
		}

		if (params.angle != null) {
			element.angle = params.angle;
		}

		if (params.scale != null) {
			if (typeof params.scale === 'number') {
				element.scale.set(params.scale, params.scale);
			} else {
				element.scale.set(params.scale.x, params.scale.y);
			}
		}
		if (params.blur != null) {
			if (typeof params.blur === 'number') {
				gsap.set(element, { pixi: { blur: params.blur } });
			} else {
				gsap.set(element, { pixi: { blurX: params.blur.x, blurY: params.blur.y } });
			}
		}

		if (params.alpha != null) {
			element.alpha = params.alpha;
		}

		if (params.tint) {
			element.tint = parseInt(params.tint.slice(1), 16);
		}

		if (params.visible != null) {
			element.visible = params.visible;
		}
	}

	private parseLayers(layers: AssetLayersParams): void {
		layers.forEach(layer => {
			this.layersData![layer.name] = layer;
		});
	}

	private parseSprites(sprites: AssetSpritesParams): void {
		sprites.forEach(sprite => {
			this.spritesData![sprite.name] = sprite;
		});
	}

	private getLayerData(layerName: string): ILayerParams {
		return this.layersData![layerName] as ILayerParams;
	}

	private getSpriteData(spriteName: string): ISpriteParams{
		return this.spritesData![spriteName] as ISpriteParams;
	}

	public getAnimationData(animationName: string): GsapItems{
		return this.animationsData![animationName];
	}

	public getLayer(layerName: string): Container {
		return this.layers![layerName];
	}

	public getSprite(spriteName: string): Sprite | NineSliceSprite{
		return this.sprites![spriteName];
	}

	public getTexture(textureName: string): Texture {
		return this.textures![textureName];
	}

	public getSound(soundName: string): HTMLAudioElement{
		return this.sounds![soundName];
	}

	public getElement(elementParams: IGsapElementParams): Container | Sprite | null {
		if (elementParams.type === EGsapTypes.LAYER) {
			return this.getLayer(elementParams.name);
		} else if (elementParams.type === EGsapTypes.SPRITE) {
			return this.getSprite(elementParams.name);
		}
		return null;
	}

	public getTrigger(triggerName: string): any {
		return { triggerName };
	}
	
	public destroy(){
		this.animationsData = null;
		this.layersData = null;
		this.spritesData = null;
		this.textures = null;
		this.sounds = null;
		this.layers = null;
		this.sprites = null;
		this.masksData = null;
	}
}
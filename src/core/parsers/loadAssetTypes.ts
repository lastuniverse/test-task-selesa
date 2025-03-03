import { GsapMap } from "./gsapTypes.ts";
import { TextureSource, Texture } from "pixi.js";
import { Container, NineSliceSprite, Sprite } from "node_modules/pixi.js/lib";
import { EGsapTypes } from "../parsers/gsapTypes"


export type TexturesMap = Record<string, Texture<TextureSource<any>>>;
export type SoundsMap = Record<string, HTMLAudioElement>;

export interface DataMap {
	layers: AssetLayersParams,
	sprites: AssetSpritesParams,
	[key: string]: any
};

export interface ResourcesMap {
	textures: TexturesMap
	sounds: SoundsMap
	gsap: GsapMap,
	data: DataMap
}

export interface IMeta {
	type: string
}




export interface IComponentParams {
	type: string,
	class: string
}

export type AssetLayerElements = Array<AssetLayerElement>
// export type CompositionLayerElement = CompositionSprites | CompositionLayers;

export interface AssetLayerElement {
	type: EElementType,
	name: string,
}

export type EElementType = EGsapTypes;


export type AssetSpritesParams = Array<ISpriteParams>
export interface ISpriteParams extends IElementParams {
	texture: string,
	position: IPointParams,
	anchor?: number | IPointParams,
	slice?: number | NineSlice,
	width?: number,
	height?: number,
}

export interface INineSpriteParams extends IElementParams {
	pivot?: number | IPointParams,
	width?: number,
	height?: number,
}

export type AssetLayersParams = Array<ILayerParams>
export interface ILayerParams extends IElementParams {
	pivot?: number | IPointParams,
	children?: AssetLayerElements,
}

export interface IElementParams {
	name: string,
	position?: IPointParams,
	scale?: number | IPointParams,
	layer?: string,
	mask?: string,
	alpha?: number,
	angle?: number,
	tint?: string,
	blur?: number | IPointParams,
	visible?: boolean,
}

export interface IPointParams {
	x: number,
	y: number,
}


export type NineSlice = [number, number, number, number];
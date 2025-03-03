// файл все еще активно правится, поэтому не вылизывал его.

export type GsapMap = Record<string, GsapItems>;

export type GsapItems = Array<IGsapItemParams>;

export interface IGsapItemParams {
	elements: GsapElements,
	// none?: GsapTweens,
	[EGsapMethods.FROM]?: IGsapTweenParams[],
	[EGsapMethods.TO]?: IGsapTweenParams[],
	[EGsapMethods.SET]?: IGsapTweenParams[],
	[EGsapMethods.FROM_TO]?: IGsapTweenFromToParams[],
}

export enum EGsapMethods {
	FROM = 'from',
	TO = 'to',
	SET = 'set',
	FROM_TO = 'fromTo',
}

export enum EGsapSimpleMethods {
	FROM = 'from',
	TO = 'to',
	SET = 'set',
}

export type GsapTweens = Array<IGsapTweenParams | IGsapTweenFromToParams>;

export interface IGsapTweenFromToParams {
	from: IGsapTweenParams,
	to: IGsapTweenParams
}

export interface IGsapTweenParams extends gsap.TweenVars {
	ease?: gsap.EaseString;
	yoyoEase?: boolean | string | gsap.EaseString;
	onInterrupt?: undefined;
	onComplete?: gsap.Callback;
}
// export type IGSAPPixiParams = PixiPlugin.Vars;


export type GsapElements = Array<IGsapElementParams>;

export interface IGsapElementParams {
	name: string,
	type: EGsapTypes
}

export enum EGsapTypes {
	NINESLICESPRITE = 'NineSliceSprite',
	SPRITE = 'Sprite',
	LAYER = 'Container',
}

// export type GsapMethods = Array<EGsapMethods>;
// export enum EGsapMethods {
// 	SET = 'set',
// 	FROM = 'from',
// 	TO = 'to',
// 	// FROMTO = 'fromTo',
// }

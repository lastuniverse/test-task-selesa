import { Container } from "pixi.js";

export abstract class BaseController {
	constructor() {
		// throw new Error('The constructor does not support asynchrony, use the preload method to load resources and the view method to initialize them.')
	}

	public get view(): Container {
		throw new Error('The getter "view" does nothing, override it in the inheritor')
	}

	public async preload() {
		throw new Error('The method "preload" does nothing, override it in the inheritor')
	}

	public async init(options?: any) {
		throw new Error('The method "init" does nothing, override it in the inheritor')
	}

	public async start() {
		throw new Error('The method "start" does nothing, override it in the inheritor')
	}

	public async stop() {
		throw new Error('The method "stop" does nothing, override it in the inheritor')
	}

	public destroy() {
		throw new Error('The method "destroy" does nothing, override it in the inheritor')
	}
}


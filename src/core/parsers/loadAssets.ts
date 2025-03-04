import { Unzipped } from "fflate";
import { extensions, DOMAdapter, ExtensionType, checkDataUrl, checkExtension, LoaderParserPriority, ImageSource, createTexture, TextureSourceOptions, ResolvedAsset, Loader, Texture } from "pixi.js";
import { unzipResponce } from "../utils/unzip.ts";
import { Component } from "../components/Component.ts";
import { AssetInnerPath } from "../utils/parsePath.ts";
import { ResourcesMap, IMeta, IComponentParams } from "./loadAssetTypes.ts";

const VALID_ASSET_EXTENSION = ".asset";
const VALID_JSON_MIME = "application/asset";

const loadAsset = {
	extension: {
		type: ExtensionType.LoadParser,
		priority: LoaderParserPriority.High,
		name: "loadAsset"
	},
	name: "loadAsset",
	config: {
		preferWorkers: true,
		// preferCreateImageBitmap: true,
		crossOrigin: "anonymous"
	},
	test(url: string) {
		return checkDataUrl(url, VALID_JSON_MIME) || checkExtension(url, VALID_ASSET_EXTENSION);
	},
	async load(url: string, asset: ResolvedAsset<TextureSourceOptions>, loader: Loader): Promise<ResourcesMap> {
		const response = await DOMAdapter.get().fetch(url);
		const files: Unzipped = await unzipResponce(response);

		const params = getMeta(files) as IComponentParams;
		if (!params || params.type !== "asset") throw new Error(`Файл не является ассетом: ${url}`);

		const resources = await getResources(files, asset, loader);
		return resources;
		// const component = new Component(resources);
		// return component;
	}
};

extensions.add(loadAsset);

function getMeta(files: Unzipped): IMeta | null {
	let json: IMeta | null = null;
	for (const name of Object.keys(files)) {
		const match = /^.*?meta\.json$/.test(name);
		if (match) {
			const text = new TextDecoder().decode(files[name]);
			json = JSON.parse(text);
			break;
		}
	}
	return json;
}

async function getResources(files: Unzipped, asset: ResolvedAsset<TextureSourceOptions>, loader: Loader): Promise<ResourcesMap> {
	const resources = {
		textures: {},
		sounds: {},
		gsap: {},
		data: {},
	} as ResourcesMap;


	for (const [itemPath, data] of Object.entries(files)) {
		const path = new AssetInnerPath(itemPath);
		if (!path.mimeType) continue;
		
		if (path.isImage) {
			resources.textures[path.href] = await getTexture(data, path.mimeType, asset, loader);
		} else if (path.isSound) {
			resources.sounds[path.href] = await getSound(data, path.mimeType);
		} else if (path.isData) {
			const json = await getData(data);
			if (path.extension === "gsap.json") {
				resources.gsap[path.href] = json;
			} else {
				// console.log("data", path.href, path);
				resources.data[path.href] = json;
			}
		}
	}

	return resources;
}

async function getData(data: Uint8Array): Promise<any> {
	const text = new TextDecoder().decode(data);
	return JSON.parse(text);
}

async function getTexture(data: Uint8Array, mimeType: string, asset: ResolvedAsset<TextureSourceOptions>, loader: Loader): Promise<Texture> {
	const blob = new Blob([data], { type: mimeType });
	const src = await createImageBitmap(blob);
	const options: TextureSourceOptions = {
		resource: src,
		alphaMode: "premultiply-alpha-on-upload",
		// resolution: asset?.data?.resolution || getResolutionOfUrl(url),
		...asset?.data
	};

	const base = new ImageSource(options);
	return createTexture(base, loader, `test.`);
}

async function getSound(data: Uint8Array, mimeType: string): Promise<HTMLAudioElement> {
	return new Promise((resolve, reject) => {
		// Создаём Blob из данных ogg-файла
		const blob = new Blob([data], { type: mimeType });
		const url = URL.createObjectURL(blob);

		// Создаём HTMLAudioElement
		const audio = new Audio(url);
		audio.preload = "auto";
		audio.addEventListener("canplaythrough", () => {
			resolve(audio);
		});
		// Начинаем загрузку аудио
		audio.load();
	});
}



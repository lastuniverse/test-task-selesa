const IMAGES: Record<string, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	gif: "image/gif",
	webp: "image/webp"
};

const SOUNDS: Record<string, string> = {
	ogg: "audio/ogg",
	mp3: "audio/mpeg"
};

const DATAS: Record<string, string> = {
	'gsap.json': "application/json",
	json: "application/json",
	json5: "application/json5"
};

const MIME_TYPES: Record<string, string> = {
	...IMAGES,
	...SOUNDS,
	...DATAS
};

export class AssetInnerPath {
	private _parts: Array<string> = [];
	private _file: string = "";
	private _name: string = "";
	private _extension: string = "";
	private removeRoot!: boolean;
	private removeTypeRoot!: boolean;
	private removeExtension!: boolean;

	constructor(path: string, removeRoot: boolean = true, removeTypeRoot: boolean = true, removeExtension: boolean = true) {
		this.parse(path, removeRoot);
	}

	private parse(path: string, removeRoot: boolean = true, removeTypeRoot: boolean = true, removeExtension: boolean = true): void {
		this.removeRoot = removeRoot;
		this.removeTypeRoot = removeTypeRoot;
		this.removeExtension = removeExtension;

		const cleanPath = path.replace(/^(\.\/|\/)+/, "");
		this._parts = cleanPath.split("/").filter(part => part.length > 0);
		this._file = this._parts.pop() || "";
		const [filename, ...extParts] = this._file.split(".");
		this._name = filename;
		this._extension = extParts.join("."); // Для случаев с "tar.gz"
	}

	get isImage(): boolean {
		return this._extension in IMAGES;
	}

	get isSound(): boolean {
		return this._extension in SOUNDS;
	}

	get isData(): boolean {
		return this._extension in DATAS;
	}

	get mimeType(): string | null {
		return MIME_TYPES[this._extension] || null;
	}

	get path(): string {
		const parts = [...this._parts];
		if (this.removeRoot) parts.shift();
		if (this.removeTypeRoot) parts.shift();
		return parts.join('/')
	}

	get file(): string {
		return this._file
	}

	get name(): string {
		return this._name
	}

	get extension(): string {
		return this._extension
	}

	getPathFrom(fromPath: string = ""): string | null {
		const cleanPath = fromPath.replace(/^(\.\/|\/)+/, "").replace(/\/+$/, "");
		const path = this.path.replace(cleanPath, "");
		return path !== this.path ? path : null;
	}

	get href(): string {
		const filename = this.removeExtension ? this._name : this._file;
		return [this.path, filename].filter(part => part.length > 0).join('/');
	}
}



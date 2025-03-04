import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { Assets, Container } from "pixi.js";

export class SpineBoy {
	public readonly view: Container;
	private spine!: Spine;

    constructor(){
	    this.view = new Container();
    }

	async init() {
		await this.preload();
        this.spine = Spine.from({
            skeleton: "spineSkeleton",
            atlas: "spineAtlas",
        });

        this.view.addChild(this.spine);

        this.spine.state.data.defaultMix = 0.2;
	}

	async preload() {
		await Assets.load([
			{ alias: "spineSkeleton",	src: "https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets/spineboy-pro.skel"},
			{ alias: "spineAtlas",src: "https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets/spineboy-pma.atlas"},
			{ alias: "platform", src: "https://pixijs.com/assets/tutorials/spineboy-adventure/platform.png" },
		]);		
	}

    public async spawn(){
		await this.playAnimation("portal");
    }

	public async jump(isLooped: boolean = false){
		await this.playAnimation("jump", isLooped, 1.5);
    }

	public hover(isLooped: boolean = false){
		this.playAnimation("hoverboard", isLooped, 1.5);
    }

	public run(isLooped: boolean = false){
		this.playAnimation("run", isLooped);
    }

	public walk(isLooped: boolean = false){
		this.playAnimation("walk", isLooped);
    }

	public idle(isLooped: boolean = false){
		this.playAnimation("idle", isLooped);
    }

	public stopAnimation(durarion: number = 0.5) {
		this.spine.state.setEmptyAnimation(0, durarion);
	}

    public async playAnimation(name: string, loop: boolean = false, timeScale: number = 1) {
        if (this.currentAnimationName === name) return;
        const trackEntry = this.spine.state.setAnimation(0, name, loop);
        trackEntry.timeScale = timeScale;
		if(loop) return;
		await new Promise<void>((resolve,_)=>{
			trackEntry.listener = {	complete: () => resolve() };
		});
    }

    private isAnimationPlaying(name: string) {
        return this.currentAnimationName === name && !this.spine.state.getCurrent(0)?.isComplete();
    }

    get currentAnimationName() {
        return this.spine.state.getCurrent(0)?.animation?.name;
    }
}

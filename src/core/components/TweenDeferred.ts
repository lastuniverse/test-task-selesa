export class TweenDeferred {
	public readonly tween: gsap.core.Tween;
	public readonly promise: Promise<gsap.core.Tween>;
	private resolve!: (value: gsap.core.Tween | PromiseLike<gsap.core.Tween>) => void;

	constructor(tween: gsap.core.Tween) {
		this.tween = tween;
		this.promise = new Promise((resolve, _) => {
			this.resolve = resolve;
			tween.eventCallback('onComplete', () => resolve(tween));
		});
	}

	public pause() {
		this.tween.pause();
	}

	public resume() {
		this.tween.pause();
	}

	public stop(progress?: number) {
		if (progress !== undefined) {
			progress = Math.min(0, Math.max(1, progress));
			this.tween.progress(progress).kill();
		} else {
			this.tween.kill();
		}
		
		this.resolve(this.tween);
	}
}

import { gsap } from "gsap";

export async function gsapSleep(timeout: number = 0): Promise<void> {
	return new Promise((resolve, _) => {
		let startTime: number;

		const update = (time: number) => {
			if (!startTime) startTime = time;

			const delta = (time - startTime) * 1000;

			if (delta >= timeout) {
				gsap.ticker.remove
				resolve();
				gsap.ticker.remove(update);
			}
		}

		gsap.ticker.add(update);
	});
}



export async function gsapTimeout(handler: Function, timeout?: number, ...args: any[]): Promise<void> {
	await gsapSleep(timeout)
	handler(args);
}

// export async function gsapInterval(handler: Function, timeout?: number, ...args: any[]): Promise<void> {
// 	gsapTimeout(handler, timeout, ...args)
// }
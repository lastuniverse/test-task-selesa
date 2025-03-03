import { Game } from "./game/Game.ts";

(async()=>{
	const game = new Game();
	await game.init("pixi-container");
	await game.start();
	console.log("start confirm");
	
})();
import { Assets } from "pixi.js";
import { SlotReel } from "./SlotReel";
import { BaseSlotReel } from "./BaseSlotReel";
import { Component } from "../../../core/components/Component";
import { BaseSlotReels } from "./BaseSlotReels";
import { IBaseSlotReelsOptions } from "../../../game/network/GameProxy";

export class SlotReels extends BaseSlotReels {
    protected componentView!: Component;
    protected reel: BaseSlotReel;

    constructor() {
        super();
        this.reel = this.createReel();
    }

    public get view(): Component {
        return this.componentView;
    }

    public override async preload() {
        await Promise.all([
            Assets.load({ alias: 'reels', src: './assets/slot/reels.asset' }),
            this.reel.preload(),
        ]);
    }

    public override async init(options: IBaseSlotReelsOptions) {
        await super.init(options);
        this.componentView = Component.from('reels');
        this.reels.forEach((reel, reelIndex) => {
            this.componentView.getLayer(`reel${reelIndex + 1}`).addChildAt(reel.view, 0);
        });
    }

    protected override createReel(): BaseSlotReel {
        return new SlotReel();
    }

    public override destroy(): void {
        this.reels.forEach(reel => reel.destroy());
        this.componentView.destroy();

        super.destroy();
    }
}
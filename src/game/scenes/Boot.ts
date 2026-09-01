import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    public preload(): void {
        this.load.image('background', 'assets/bg.png');
    }

    public create(): void {
        this.scene.start('Preloader');
    }
}

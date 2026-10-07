import { Scene } from 'phaser';
import { validateGameConfig } from '../config/GameConfigValidator';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    public preload(): void {
        this.load.image('background', 'assets/bg.png');
    }

    public create(): void {
        validateGameConfig();
        this.scene.start('MainMenu');
    }
}

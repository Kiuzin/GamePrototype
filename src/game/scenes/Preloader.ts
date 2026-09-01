import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    public init(): void {
        const { width, height } =
            this.scale.gameSize;

        const barWidth = 464;
        const barHeight = 28;

        this.add.image(
            width / 2,
            height / 2,
            'background'
        );

        this.add.rectangle(
            width / 2,
            height / 2,
            barWidth + 4,
            barHeight + 4
        ).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(
            width / 2 - barWidth / 2,
            height / 2,
            0,
            barHeight,
            0xffffff
        ).setOrigin(0, 0.5);

        this.load.on('progress', (progress: number) => {
            bar.width =
                barWidth * progress;
        });
    }

    public preload(): void {
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');

        this.load.image(
            'slotMachineBackground',
            'CornGame/background.png'
        );

        this.load.image(
            'slotMachineFrame',
            'CornGame/moldura.png'
        );

        this.load.image(
            'symbolCrow',
            'CornGame/corvo_.png'
        );

        this.load.image(
            'symbolPopcorn',
            'CornGame/pipoca_.png'
        );

        this.load.image(
            'symbolCake',
            'CornGame/bolo_.png'
        );

        this.load.image(
            'symbolPamonha',
            'CornGame/pamonha_.png'
        );

        this.load.image(
            'symbolCanjica',
            'CornGame/canjica_.png'
        );

        this.load.image(
            'symbolCorn',
            'CornGame/milho_.png'
        );

        this.load.image(
            'symbolWild',
            'CornGame/wild_.png'
        );
    }

    public create(): void {
        this.scene.start('MainMenu');
    }
}

import {
    GameObjects,
    Scene,
} from 'phaser';

export class MainMenu extends Scene {
    private progressBar?:
        GameObjects.Rectangle;

    private progressText?:
        GameObjects.Text;

    constructor() {
        super('MainMenu');
    }

    public preload(): void {
        this.createLoadingScreen();

        this.load.on(
            'progress',
            this.updateLoadingProgress,
            this
        );

        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('slotMachineBackground', 'CornGame/background.png');
        this.load.image('slotMachineFrame', 'CornGame/moldura.png');
        this.load.image('slotMachineControlsBackdrop', 'CornGame/lower_Background2.png');
        this.load.image('slotMachineControlsDetails', 'CornGame/background_details.png');
        this.load.image('slotMachineSpinButton', 'CornGame/Spin_Button.png');
        this.load.image('slotMachineMinusButton', 'CornGame/minus_Button.png');
        this.load.image('slotMachinePlusButton', 'CornGame/plus_button.png');
        this.load.image('slotMachineAutoSpinOnButton', 'CornGame/auto-on_button.png');
        this.load.image('slotMachineAutoSpinOffButton', 'CornGame/auto-off_button.png');
        this.load.image('slotMachineTurboOnButton', 'CornGame/turbo-on_button.png');
        this.load.image('slotMachineTurboOffButton', 'CornGame/turbo-off_button.png');
        this.load.image('slotMachineHistoryButton', 'CornGame/history_button.png');
        this.load.image('symbolCrow', 'CornGame/corvo_.png');
        this.load.image('symbolPopcorn', 'CornGame/pipoca_.png');
        this.load.image('symbolCake', 'CornGame/bolo_.png');
        this.load.image('symbolPamonha', 'CornGame/pamonha_.png');
        this.load.image('symbolCanjica', 'CornGame/canjica_.png');
        this.load.image('symbolCorn', 'CornGame/milho_.png');
        this.load.image('symbolWild', 'CornGame/wild_.png');
    }

    public create(): void {
        this.progressText?.setText('CARREGAMENTO CONCLUÍDO');
        this.progressBar?.setDisplaySize(480, 20);

        this.createStartButton();
    }

    private createLoadingScreen(): void {
        const { width, height } = this.scale.gameSize;
        const centerX = width / 2;
        const centerY = height / 2;

        const background = this.add.image(centerX, centerY, 'background');

        background.setDisplaySize(width, height);

        this.add.rectangle(
            centerX,
            centerY,
            width,
            height,
            0x080d1a,
            0.72
        );

        this.add.text(
            centerX,
            centerY - 170,
            'Corn Game',
            {
                fontFamily: 'Arial Black, Arial',
                fontSize: '62px',
                color: '#ffffff',
                stroke: '#111827',
                strokeThickness: 10,
            }
        ).setOrigin(0.5);

        this.add.text(
            centerX,
            centerY - 90,
            'PREPARANDO SUA EXPERIÊNCIA',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#cbd5e1',
                letterSpacing: 2,
            }
        ).setOrigin(0.5);

        this.add.rectangle(
            centerX,
            centerY + 10,
            492,
            32,
            0x0f172a,
            0.92
        ).setStrokeStyle(2, 0xffffff, 0.28);

        this.progressBar = this.add.rectangle(
            centerX - 240,
            centerY + 10,
            0,
            20,
            0xf6b43c
        ).setOrigin(0, 0.5);

        this.progressText = this.add.text(
            centerX,
            centerY + 62,
            'CARREGANDO 0%',
            {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#ffffff',
            }
        ).setOrigin(0.5);
    }

    private updateLoadingProgress(progress: number): void {
        const percentage = Math.round(progress * 100);

        this.progressBar?.setDisplaySize(480 * progress, 20);
        this.progressText?.setText(`CARREGANDO ${percentage}%`);
    }

    private createStartButton(): void {
        const { width, height } = this.scale.gameSize;
        const startButton = this.add.container(
            width / 2,
            height / 2 + 190
        ).setAlpha(0);

        const background = this.add.rectangle(
            0,
            0,
            420,
            110,
            0xe59a21
        ).setStrokeStyle(3, 0xffe0a3);

        const label = this.add.text(
            0,
            0,
            'INICIAR JOGO',
            {
                fontFamily: 'Arial Black, Arial',
                fontSize: '30px',
                color: '#1f1304',
            }
        ).setOrigin(0.5);

        startButton.add([background, label]);
        startButton.setSize(420, 110);
        startButton.setInteractive({ useHandCursor: true });

        startButton.on('pointerover', () => {
            background.setFillStyle(0xffb43d);
        });

        startButton.on('pointerout', () => {
            background.setFillStyle(0xe59a21);
        });

        startButton.once('pointerdown', () => {
            this.scene.start('SlotMachine');
        });

        this.tweens.add({
            targets: startButton,
            alpha: 1,
            y: height / 2 + 155,
            duration: 420,
            ease: 'Sine.easeOut',
        });
    }
}

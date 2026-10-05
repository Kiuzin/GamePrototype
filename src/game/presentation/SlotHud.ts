import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

export interface SlotHudCallbacks {
    onMusicToggle: (isMuted: boolean) => void;
    onSoundToggle: (isMuted: boolean) => void;
    onRulesOpen: () => void;
    onWalletOpen: () => void;
}

export class SlotHud {
    private musicMuted = false;
    private soundMuted = false;
    private musicButton?: GameObjects.Rectangle;
    private soundButton?: GameObjects.Rectangle;
    private musicText?: GameObjects.Text;
    private soundText?: GameObjects.Text;

    public constructor(
        private readonly scene: Scene,
        private readonly callbacks: SlotHudCallbacks
    ) {}

    public create(): void {
        const layout = GameConfig.layout.topHud;
        const theme = GameConfig.topHud;
        const panel = this.scene.add.rectangle(layout.panel.x, layout.panel.y, layout.panel.width, layout.panel.height, theme.panelColor).setStrokeStyle(theme.panelStrokeWidth, theme.panelStrokeColor);
        const [music, sound, rules, wallet] = layout.buttons;

        this.musicButton = this.createButton(music, 'MÚSICA\nLIGADA', () => this.toggleMusic());
        this.musicText = this.getButtonText(this.musicButton);
        this.soundButton = this.createButton(sound, 'SOM\nLIGADO', () => this.toggleSound());
        this.soundText = this.getButtonText(this.soundButton);
        this.createButton(rules, 'REGRAS', this.callbacks.onRulesOpen);
        this.createButton(wallet, 'CAIXA', this.callbacks.onWalletOpen);
        panel.setDepth(4);
    }

    private toggleMusic(): void {
        this.musicMuted = !this.musicMuted;
        this.musicText?.setText(this.musicMuted ? 'MÚSICA\nDESLIGADA' : 'MÚSICA\nLIGADA');
        this.musicButton?.setFillStyle(this.musicMuted ? GameConfig.topHud.activeButtonColor : GameConfig.topHud.buttonColor);
        this.callbacks.onMusicToggle(this.musicMuted);
    }

    private toggleSound(): void {
        this.soundMuted = !this.soundMuted;
        this.soundText?.setText(this.soundMuted ? 'SOM\nDESLIGADO' : 'SOM\nLIGADO');
        this.soundButton?.setFillStyle(this.soundMuted ? GameConfig.topHud.activeButtonColor : GameConfig.topHud.buttonColor);
        this.callbacks.onSoundToggle(this.soundMuted);
    }

    private createButton(
        layout: { x: number; y: number; width: number; height: number },
        text: string,
        onClick: () => void
    ): GameObjects.Rectangle {
        const button = this.scene.add.rectangle(layout.x, layout.y, layout.width, layout.height, GameConfig.topHud.buttonColor).setStrokeStyle(2, GameConfig.topHud.panelStrokeColor).setInteractive({ useHandCursor: true }).setDepth(5);
        const label = this.scene.add.text(layout.x, layout.y, text, {
            fontFamily: 'Arial', fontSize: '17px', align: 'center', color: GameConfig.topHud.buttonText,
        }).setOrigin(0.5).setDepth(6);
        button.setData('label', label);
        button.on('pointerdown', onClick);

        return button;
    }

    private getButtonText(button: GameObjects.Rectangle): GameObjects.Text {
        return button.getData('label') as GameObjects.Text;
    }
}

import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class RulesModal {
    private modal?: GameObjects.Container;

    public constructor(private readonly scene: Scene) {}

    public open(): void {
        this.close();

        const { width, height } = this.scene.scale.gameSize;
        const layout = GameConfig.layout.rulesModal;
        const theme = GameConfig.rulesModal;
        const modal = this.scene.add.container(0, 0).setDepth(layout.depth);
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, theme.overlayColor, theme.overlayAlpha).setInteractive();
        const panel = this.scene.add.rectangle(width / 2, height / 2, layout.panel.width, layout.panel.height, theme.panelColor).setStrokeStyle(theme.panelStrokeWidth, theme.panelStrokeColor);
        const title = this.createLabel(width / 2, layout.titleY, 'REGRAS DO JOGO', { fontSize: '38px', color: GameConfig.colors.text });
        const content = this.scene.add.text(width / 2, layout.contentY, [
            '• Forme 3 símbolos iguais em uma das 5 linhas para ganhar.',
            '• O Wild substitui qualquer símbolo nas combinações vencedoras.',
            '• Cada prêmio é calculado pela aposta atual multiplicada pelo valor do símbolo.',
            '• Use + e − para escolher a aposta. No Auto Play, a alteração vale no próximo giro.',
            '• Turbo acelera os próximos giros automáticos.',
            '• O saldo pode ser gerenciado no botão CAIXA.',
        ].join('\n\n'), {
            fontFamily: 'Arial', fontSize: '26px', color: GameConfig.colors.text,
            lineSpacing: 7, wordWrap: { width: layout.contentWidth },
        }).setOrigin(0.5, 0);
        const closeButton = this.scene.add.rectangle(width / 2, layout.closeButtonY, layout.closeButton.width, layout.closeButton.height, GameConfig.colors.button).setInteractive();
        const closeText = this.createLabel(width / 2, layout.closeButtonY, 'FECHAR', { fontSize: '26px', color: GameConfig.colors.buttonText });
        const close = (): void => this.close();

        overlay.on('pointerdown', close);
        closeButton.on('pointerdown', close);
        modal.add([overlay, panel, title, content, closeButton, closeText]);
        this.modal = modal;
    }

    private close(): void {
        this.modal?.destroy();
        this.modal = undefined;
    }

    private createLabel(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle): GameObjects.Text {
        return this.scene.add.text(x, y, text, { fontFamily: 'Arial', ...style }).setOrigin(0.5);
    }
}

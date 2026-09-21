import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import type { SpinHistoryEntry } from '../logic/SlotSession';

export class SpinHistoryModal {
    private modal?: GameObjects.Container;

    public constructor(private readonly scene: Scene) {}

    public open(entries: readonly SpinHistoryEntry[]): void {
        this.close();
        const { width, height } = this.scene.scale.gameSize;
        const layout = GameConfig.layout.historyModal;
        const theme = GameConfig.historyModal;
        const modal = this.scene.add.container(0, 0).setDepth(layout.depth);
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, theme.overlayColor, theme.overlayAlpha).setInteractive();
        const panel = this.scene.add.rectangle(width / 2, height / 2, layout.panel.width, layout.panel.height, theme.panelColor).setStrokeStyle(theme.panelStrokeWidth, theme.panelStrokeColor);
        const title = this.createLabel(width / 2, layout.titleY, 'HISTÓRICO DE JOGADAS', { fontSize: '36px', color: GameConfig.colors.text });
        const content = this.createEntriesText(width / 2 + layout.content.offsetX, layout.content.y, entries);
        const closeButton = this.scene.add.rectangle(width / 2, layout.closeButton.y, layout.closeButton.width, layout.closeButton.height, GameConfig.colors.button).setInteractive();
        const closeText = this.createLabel(width / 2, layout.closeButton.y, 'FECHAR', { fontSize: '26px', color: GameConfig.colors.buttonText });
        const close = (): void => this.close();

        overlay.on('pointerdown', close);
        closeButton.on('pointerdown', close);
        modal.add([overlay, panel, title, content, closeButton, closeText]);
        this.modal = modal;
    }

    public close(): void {
        this.modal?.destroy();
        this.modal = undefined;
    }

    private createEntriesText(x: number, y: number, entries: readonly SpinHistoryEntry[]): GameObjects.Text {
        const text = entries.length === 0
            ? 'NENHUMA JOGADA REALIZADA.'
            : entries.map((entry, index) => {
                const result = entry.winningLines > 0 ? `GANHO ${entry.payout.toFixed(2)}` : 'SEM GANHO';
                return `${index + 1}. APOSTA ${entry.bet.toFixed(2)} | ${result}`;
            }).join('\n\n');

        return this.scene.add.text(x, y, text, {
            fontFamily: 'Arial', fontSize: '28px', color: GameConfig.colors.text,
            lineSpacing: 6, wordWrap: { width: GameConfig.layout.historyModal.content.width },
        });
    }

    private createLabel(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle): GameObjects.Text {
        return this.scene.add.text(x, y, text, { fontFamily: 'Arial', ...style }).setOrigin(0.5);
    }
}

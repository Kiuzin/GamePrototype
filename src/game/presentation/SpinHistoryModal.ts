import { GameObjects, Scene } from 'phaser';
import { GameTheme } from '../config/GameTheme';
import type { SpinHistoryEntry } from '../logic/SlotSession';

export class SpinHistoryModal {
    private modal?: GameObjects.Container;

    public constructor(private readonly scene: Scene) {}

    public open(entries: readonly SpinHistoryEntry[]): void {
        this.close();
        const { width, height } = this.scene.scale.gameSize;
        const modal = this.scene.add.container(0, 0).setDepth(20);
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setInteractive();
        const panel = this.scene.add.rectangle(width / 2, height / 2, 900, 1080, 0x24150e).setStrokeStyle(4, 0xd28b21);
        const title = this.createLabel(width / 2, 500, 'HISTÓRICO DE JOGADAS', { fontSize: '36px', color: GameTheme.colors.text });
        const content = this.createEntriesText(width / 2 - 370, 590, entries);
        const closeButton = this.scene.add.rectangle(width / 2, 1440, 240, 70, GameTheme.colors.button).setInteractive();
        const closeText = this.createLabel(width / 2, 1440, 'FECHAR', { fontSize: '26px', color: GameTheme.colors.buttonText });
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
            fontFamily: 'Arial', fontSize: '28px', color: GameTheme.colors.text,
            lineSpacing: 6, wordWrap: { width: 740 },
        });
    }

    private createLabel(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle): GameObjects.Text {
        return this.scene.add.text(x, y, text, { fontFamily: 'Arial', ...style }).setOrigin(0.5);
    }
}

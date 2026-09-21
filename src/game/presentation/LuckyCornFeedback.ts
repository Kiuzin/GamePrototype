import {
    GameObjects,
    Scene,
    Time,
    Tweens,
} from 'phaser';
import { BonusLayoutConfig } from '../config/BonusLayoutConfig';

/**
 * Apresentação visual transitória do Milho da Sorte.
 * O controle de tempo da funcionalidade permanece na cena; esta classe
 * é responsável somente por comunicar seus estados ao jogador.
 */
export class LuckyCornFeedback {
    private readonly scene: Scene;

    private announcement?: GameObjects.Container;

    private pendingTimer?: Time.TimerEvent;

    private payoutCounter?: Tweens.Tween;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public showSuspense(): void {
        this.showMessage(
            'O MILHO DA SORTE ESTÁ CHEGANDO!',
            'Os rolos ganharam um giro extra...',
            '#ffe06b'
        );
    }

    public showStart(
        selectedSymbolId: string,
        duration: number,
        onComplete: () => void
    ): void {
        this.showTimedMessage(
            'MILHO DA SORTE!',
            `Símbolo da sorte: ${selectedSymbolId.toUpperCase()}`,
            '#ffd54a',
            duration,
            onComplete
        );
    }

    public showFinalPayout(
        payout: number,
        duration: number,
        finalPause: number,
        onComplete: () => void
    ): void {
        const valueText = this.showMessage(
            'JACKPOT!',
            '0.00',
            '#ffd54a'
        );

        valueText.setStyle({
            fontSize: BonusLayoutConfig.luckyCorn.jackpotValueFontSize,
            fontStyle: 'bold',
            color: '#ffe06b',
        });

        this.payoutCounter =
            this.scene.tweens.addCounter({
                from: 0,
                to: Math.max(0, payout),
                duration,
                ease: 'Quad.easeOut',
                onUpdate: tween => {
                    valueText.setText(
                        tween.getValue().toFixed(2)
                    );
                },
                onComplete: () => {
                    this.payoutCounter = undefined;

                    this.pendingTimer =
                        this.scene.time.delayedCall(
                            finalPause,
                            () => {
                                this.pendingTimer = undefined;
                                this.clearAnnouncement();
                                onComplete();
                            }
                        );
                },
            });
    }

    public clear(): void {
        this.payoutCounter?.stop();
        this.payoutCounter = undefined;

        if (this.pendingTimer) {
            this.scene.time.removeEvent(
                this.pendingTimer
            );

            this.pendingTimer = undefined;
        }

        if (!this.announcement) {
            return;
        }

        this.scene.tweens.killTweensOf(
            this.announcement
        );

        this.announcement.destroy();
        this.announcement = undefined;
    }

    public destroy(): void {
        this.clear();
    }

    private showTimedMessage(
        title: string,
        detail: string,
        color: string,
        duration: number,
        onComplete: () => void
    ): void {
        this.showMessage(
            title,
            detail,
            color
        );

        this.pendingTimer =
            this.scene.time.delayedCall(
                duration,
                () => {
                    this.pendingTimer = undefined;
                    this.clearAnnouncement();
                    onComplete();
                }
            );
    }

    private showMessage(
        title: string,
        detail: string,
        color: string
    ): GameObjects.Text {
        this.clear();

        const { width } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.luckyCorn;

        const panel = this.scene.add.rectangle(
            width / 2,
            layout.panel.y,
            layout.panel.width,
            layout.panel.height,
            0x2d1609,
            0.96
        ).setStrokeStyle(
            5,
            0xffd54a
        );

        const titleText = this.scene.add.text(
            width / 2,
            layout.title.y,
            title,
            {
                fontFamily: 'Arial',
                fontSize: layout.title.fontSize,
                color,
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);

        const detailText = this.scene.add.text(
            width / 2,
            layout.detail.y,
            detail,
            {
                fontFamily: 'Arial',
                fontSize: layout.detail.fontSize,
                color: '#ffffff',
            }
        ).setOrigin(0.5);

        this.announcement = this.scene.add.container(
            0,
            0,
            [
                panel,
                titleText,
                detailText,
            ]
        )
            .setDepth(layout.depth)
            .setAlpha(0)
            .setScale(0.9);

        this.scene.tweens.add({
            targets: this.announcement,
            alpha: 1,
            scale: 1,
            duration: 220,
            ease: 'Back.easeOut',
        });

        return detailText;
    }

    private clearAnnouncement(): void {
        if (!this.announcement) {
            return;
        }

        this.scene.tweens.killTweensOf(
            this.announcement
        );

        this.announcement.destroy();
        this.announcement = undefined;
    }
}

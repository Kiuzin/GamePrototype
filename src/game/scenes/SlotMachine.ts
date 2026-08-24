import {
    Scene,
    GameObjects,
} from 'phaser';

import { GameConfig } from '../config/GameConfig';
import { RandomGenerator } from '../logic/RandomGenerator';
import { WinChecker } from '../logic/WinChecker';
import { Reel } from '../objects/Reel';

export class SlotMachine extends Scene {
    private reels: Reel[] = [];

    private spinBtn?:
        GameObjects.Rectangle;

    private debugText?:
        GameObjects.Text;

    private resultText?:
        GameObjects.Text;

    constructor() {
        super('SlotMachine');
    }

    create(): void {
        this.createBackground();
        this.createTitle();
        this.createReels();
        this.createDebugText();
        this.createResultText();
        this.createSpinButton();
    }

    private createBackground(): void {
        this.cameras.main.setBackgroundColor(
            GameConfig.colors.background
        );
    }

    private createTitle(): void {
        this.add.text(
            GameConfig.layout.title.x,
            GameConfig.layout.title.y,
            'Slot Machine MVP',
            {
                fontSize: '32px',
                color: GameConfig.colors.text,
            }
        );
    }

    private createReels(): void {
        this.reels = [];

        GameConfig.layout.reelPositions.forEach(
            position => {
                this.reels.push(
                    new Reel(
                        this,
                        position.x,
                        position.y
                    )
                );
            }
        );
    }

    private createDebugText(): void {
        this.debugText =
            this.add.text(
                GameConfig.layout.debug.x,
                GameConfig.layout.debug.y,
                '',
                {
                    fontSize: '16px',
                    color: GameConfig.colors.text,
                    lineSpacing: 4,
                }
            );
    }

    private createResultText(): void {
        this.resultText =
            this.add.text(
                GameConfig.layout.result.x,
                GameConfig.layout.result.y,
                '',
                {
                    fontSize: '24px',
                    color: GameConfig.colors.win,
                }
            );
    }

    private createSpinButton(): void {
        const button =
            GameConfig.layout.spinButton;

        this.spinBtn =
            this.add
                .rectangle(
                    button.x,
                    button.y,
                    button.width,
                    button.height,
                    GameConfig.colors.button
                )
                .setInteractive();

        this.add.text(
            button.x,
            button.y,
            'SPIN',
            {
                fontSize: '28px',
                color:
                    GameConfig.colors.buttonText,
            }
        ).setOrigin(0.5);

        this.spinBtn.on(
            'pointerdown',
            () => {
                this.spin();
            }
        );
    }

    private spin(): void {
        if (
            !this.spinBtn ||
            !this.debugText ||
            !this.resultText
        ) {
            return;
        }

        // Impede múltiplos spins simultâneos
        this.spinBtn.disableInteractive();

        // ==================================================
        // 1. GERA O RESULTADO ANTES DA ANIMAÇÃO
        // ==================================================

        const result =
            RandomGenerator.generateOutcome(
                GameConfig.reels,
                GameConfig.rows
            );

        // ==================================================
        // 2. MOSTRA O RESULTADO DE DEBUG
        // ==================================================

        this.updateDebug(result);

        this.resultText.setText(
            'SPINNING...'
        );

        // ==================================================
        // 3. INICIA OS REELS
        // ==================================================

        let stoppedReels = 0;

        this.reels.forEach(
            (reel, index) => {
                this.time.delayedCall(
                    index *
                        GameConfig.reel.reelStartDelay,
                    () => {
                        reel.setOnComplete(
                            () => {
                                stoppedReels++;

                                if (
                                    stoppedReels ===
                                    this.reels.length
                                ) {
                                    this.checkResult(
                                        result
                                    );

                                    this.spinBtn
                                        ?.setInteractive();
                                }
                            }
                        );

                        // O resultado já está definido.
                        // O reel apenas anima até ele.
                        reel.startSpin(
                            result[index]
                        );
                    }
                );
            }
        );
    }

    private checkResult(
        result: string[][]
    ): void {
        if (!this.resultText) {
            return;
        }

        const winningLines =
            WinChecker.checkWinningLines(
                result
            );

        if (winningLines.length === 0) {
            this.resultText.setText(
                'NO WIN'
            );

            console.log(
                'No winning lines.'
            );

            return;
        }

        const lines =
            winningLines.join(', ');

        this.resultText.setText(
            `WINNING LINES: ${lines}`
        );

        console.log(
            'Winning lines:',
            winningLines
        );
    }

    private updateDebug(
        result: string[][]
    ): void {
        if (!this.debugText) {
            return;
        }

        const lines: string[] = [
            'UPCOMING RESULT',
            '',
        ];

        result.forEach(
            (column, reelIndex) => {
                lines.push(
                    `REEL ${reelIndex + 1}`
                );

                column.forEach(symbol => {
                    lines.push(
                        `[${symbol}]`
                    );
                });

                lines.push('');
            }
        );

        this.debugText.setText(
            lines.join('\n')
        );
    }
}
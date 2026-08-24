import {
    Scene,
    GameObjects,
} from 'phaser';

import { GameConfig } from '../config/GameConfig';

import { RandomGenerator } from '../logic/RandomGenerator';

import {
    WinChecker,
} from '../logic/WinChecker';

import {
    PayoutCalculator,
} from '../logic/PayoutCalculator';

import { Reel } from '../objects/Reel';

export class SlotMachine extends Scene {
    private reels: Reel[] = [];

    private spinBtn?:
        GameObjects.Rectangle;

    private debugText?:
        GameObjects.Text;

    private resultText?:
        GameObjects.Text;

    private balanceText?:
        GameObjects.Text;

    private betText?:
        GameObjects.Text;

    /**
     * Saldo atual do jogador.
     */
    private balance =
        GameConfig.bet.initialBalance;

    /**
     * Aposta atual.
     */
    private currentBet =
        GameConfig.bet.defaultBet;

    /**
     * Indica se estamos executando um spin.
     */
    private isSpinning = false;

    constructor() {
        super('SlotMachine');
    }

    create(): void {
        this.createBackground();

        this.createTitle();

        this.createReels();

        this.createDebugText();

        this.createResultText();

        this.createBalanceText();

        this.createBetText();

        this.createSpinButton();

        this.updateBalanceUI();

        this.updateBetUI();
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

                color:
                    GameConfig.colors.text,
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

                    color:
                        GameConfig.colors.text,

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

                    color:
                        GameConfig.colors.win,
                }
            );
    }

    private createBalanceText(): void {
        this.balanceText =
            this.add.text(
                GameConfig.layout.balance.x,
                GameConfig.layout.balance.y,
                '',
                {
                    fontSize: '22px',

                    color:
                        GameConfig.colors.balance,
                }
            );
    }

    private createBetText(): void {
        this.betText =
            this.add.text(
                GameConfig.layout.bet.x,
                GameConfig.layout.bet.y,
                '',
                {
                    fontSize: '22px',

                    color:
                        GameConfig.colors.bet,
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
        // ==========================================
        // PREVENÇÃO DE SPIN DUPLICADO
        // ==========================================

        if (this.isSpinning) {
            return;
        }

        // ==========================================
        // VALIDAÇÕES
        // ==========================================

        if (this.balance < this.currentBet) {
            this.showError(
                'INSUFFICIENT BALANCE'
            );

            return;
        }

        // ==========================================
        // COMEÇA O SPIN
        // ==========================================

        this.isSpinning = true;

        this.spinBtn?.disableInteractive();

        // ==========================================
        // DESCONTA A APOSTA
        // ==========================================

        this.balance -= this.currentBet;

        this.updateBalanceUI();

        // ==========================================
        // GERA O RESULTADO
        // ==========================================

        const result =
            RandomGenerator.generateOutcome(
                GameConfig.reels,
                GameConfig.rows
            );

        // ==========================================
        // DEBUG
        // ==========================================

        this.updateDebug(result);

        this.resultText?.setText(
            'SPINNING...'
        );

        // ==========================================
        // INICIA OS REELS
        // ==========================================

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
                                    this.finishSpin(
                                        result
                                    );
                                }
                            }
                        );

                        reel.startSpin(
                            result[index]
                        );
                    }
                );
            }
        );
    }

    private finishSpin(
        result: string[][]
    ): void {
        // ==========================================
        // VERIFICA LINHAS VENCEDORAS
        // ==========================================

        const winningLines =
            WinChecker.checkWinningLines(
                result
            );

        // ==========================================
        // CALCULA O PAGAMENTO
        // ==========================================

        const payout =
            PayoutCalculator.calculate(
                result,
                this.currentBet
            );

        // ==========================================
        // ADICIONA O PRÊMIO AO SALDO
        // ==========================================

        this.balance +=
            payout.totalPayout;

        // ==========================================
        // ATUALIZA A INTERFACE
        // ==========================================

        this.updateBalanceUI();

        // ==========================================
        // MOSTRA RESULTADO
        // ==========================================

        if (
            winningLines.length === 0
        ) {
            this.resultText?.setText(
                'NO WIN'
            );

            console.log(
                'No winning lines.'
            );
        } else {
            const lines =
                winningLines.join(', ');

            this.resultText?.setText(
                `WIN: ${payout.totalPayout} | LINES: ${lines}`
            );

            console.log(
                'Winning lines:',
                winningLines
            );

            console.log(
                'Payout details:',
                payout
            );
        }

        // ==========================================
        // FINALIZA O SPIN
        // ==========================================

        this.isSpinning = false;

        this.spinBtn?.setInteractive();

        // Debug útil
        console.log(
            'Final balance:',
            this.balance
        );
    }

    private updateBalanceUI(): void {
        if (!this.balanceText) {
            return;
        }

        this.balanceText.setText(
            `BALANCE: ${this.balance.toFixed(2)}`
        );
    }

    private updateBetUI(): void {
        if (!this.betText) {
            return;
        }

        this.betText.setText(
            `BET: ${this.currentBet.toFixed(2)}`
        );
    }

    private showError(
        message: string
    ): void {
        this.resultText?.setText(
            message
        );

        console.warn(
            message
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
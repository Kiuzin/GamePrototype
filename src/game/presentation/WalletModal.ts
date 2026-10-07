import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Money } from '../logic/Money';
import type { MoneyCredits } from '../logic/Money';

export interface WalletModalCallbacks {
    getBalance: () => MoneyCredits;
    deposit: (credits: MoneyCredits) => boolean;
    withdraw: (credits: MoneyCredits) => boolean;
}

export class WalletModal {
    private modal?: GameObjects.Container;
    private balanceText?: GameObjects.Text;
    private statusText?: GameObjects.Text;
    private amountButtons: GameObjects.Rectangle[] = [];
    private selectedAmount = 100;

    public constructor(
        private readonly scene: Scene,
        private readonly callbacks: WalletModalCallbacks
    ) {}

    public open(initialStatus?: string): void {
        this.close();

        const { width, height } = this.scene.scale.gameSize;
        const layout = GameConfig.layout.walletModal;
        const theme = GameConfig.walletModal;
        const modal = this.scene.add.container(0, 0).setDepth(layout.depth);
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, theme.overlayColor, theme.overlayAlpha).setInteractive();
        const panel = this.scene.add.rectangle(width / 2, height / 2, layout.panel.width, layout.panel.height, theme.panelColor).setStrokeStyle(theme.panelStrokeWidth, theme.panelStrokeColor);
        const title = this.createLabel(width / 2, layout.titleY, 'CAIXA', { fontSize: '40px', color: GameConfig.colors.text });
        const balanceText = this.createLabel(width / 2, layout.balanceY, '', { fontSize: '30px', color: '#00ff00' });
        const amountLabel = this.createLabel(width / 2, layout.amountY, 'SELECIONE O VALOR', { fontSize: '24px', color: GameConfig.colors.text });
        const statusText = this.createLabel(width / 2, layout.closeButtonY - 90, '', {
            fontSize: '22px',
            color: GameConfig.colors.text,
            align: 'center',
            wordWrap: { width: layout.panel.width - 100 },
        });
        modal.add([overlay, panel, title, balanceText, amountLabel, statusText]);
        this.balanceText = balanceText;
        this.statusText = statusText;
        const values = [50, 100, 500, 1000];
        const amountButtons = values.map((amount, index) => {
            const x = width / 2 + (index - 1.5) * 195;
            const button = this.scene.add.rectangle(x, layout.amountButtonsY, layout.amountButton.width, layout.amountButton.height, theme.amountButtonColor).setStrokeStyle(2, 0xffffff).setInteractive();
            const label = this.createLabel(x, layout.amountButtonsY, `R$ ${amount}`, { fontSize: '22px', color: GameConfig.colors.text });
            button.on('pointerdown', () => {
                this.selectedAmount = amount;
                this.updateAmountButtons();
            });
            modal.add([button, label]);
            return button;
        });
        this.amountButtons = amountButtons;
        const depositButton = this.createActionButton(width / 2 - 185, layout.actionButtonsY, 'DEPOSITAR', theme.depositButtonColor, () => {
            const succeeded = this.callbacks.deposit(Money.fromAmount(this.selectedAmount));
            this.updateBalance();
            this.setStatus(
                succeeded
                    ? `R$ ${Money.format(Money.fromAmount(this.selectedAmount))} depositados.`
                    : 'Operação disponível somente com servidor.',
                !succeeded
            );
        });
        const withdrawButton = this.createActionButton(width / 2 + 185, layout.actionButtonsY, 'SACAR', theme.withdrawButtonColor, () => {
            const succeeded = this.callbacks.withdraw(Money.fromAmount(this.selectedAmount));
            this.updateBalance();
            this.setStatus(
                succeeded
                    ? `R$ ${Money.format(Money.fromAmount(this.selectedAmount))} sacados.`
                    : 'Operação disponível somente com servidor.',
                !succeeded
            );
        });
        const closeButton = this.scene.add.rectangle(width / 2, layout.closeButtonY, layout.closeButton.width, layout.closeButton.height, GameConfig.colors.button).setInteractive();
        const closeText = this.createLabel(width / 2, layout.closeButtonY, 'FECHAR', { fontSize: '26px', color: GameConfig.colors.buttonText });
        const close = (): void => this.close();

        overlay.on('pointerdown', close);
        closeButton.on('pointerdown', close);
        modal.add([depositButton, withdrawButton, closeButton, closeText]);
        this.modal = modal;
        this.updateBalance();
        this.updateAmountButtons();

        if (initialStatus) {
            this.setStatus(initialStatus, true);
        }
    }

    private close(): void {
        this.modal?.destroy();
        this.modal = undefined;
        this.balanceText = undefined;
        this.statusText = undefined;
        this.amountButtons = [];
    }

    private createActionButton(x: number, y: number, text: string, color: number, onClick: () => void): GameObjects.Container {
        const layout = GameConfig.layout.walletModal.actionButton;
        const button = this.scene.add.rectangle(0, 0, layout.width, layout.height, color).setStrokeStyle(2, 0xffffff).setInteractive();
        const label = this.createLabel(0, 0, text, { fontSize: '24px', color: GameConfig.colors.text });
        button.on('pointerdown', onClick);
        return this.scene.add.container(x, y, [button, label]);
    }

    private updateBalance(): void {
        this.balanceText?.setText(`SALDO DISPONÍVEL: R$ ${Money.format(this.callbacks.getBalance())}`);
    }

    private updateAmountButtons(): void {
        const theme = GameConfig.walletModal;
        this.amountButtons.forEach((button, index) => {
            const values = [50, 100, 500, 1000];
            button.setFillStyle(values[index] === this.selectedAmount ? theme.selectedAmountButtonColor : theme.amountButtonColor);
        });
    }

    private setStatus(message: string, isError = false): void {
        this.statusText?.setColor(isError ? GameConfig.colors.error : GameConfig.colors.text).setText(message);
    }

    private createLabel(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle): GameObjects.Text {
        return this.scene.add.text(x, y, text, { fontFamily: 'Arial', ...style }).setOrigin(0.5);
    }
}

import {
    Scene,
    GameObjects,
    Math as PhaserMath,
} from 'phaser';

import {
    SymbolConfig,
} from '../config/SymbolConfig';

import type {
    WinAnimation,
} from '../config/SymbolConfig';
import { GameConfig } from '../config/GameConfig';
import { RandomGenerator } from '../logic/RandomGenerator';

export interface ReelSymbolPosition {
    x: number;
    y: number;
}

interface ReelSymbolVisual {
    background: GameObjects.Rectangle;
    image: GameObjects.Image;
}

export class Reel {
    private readonly scene: Scene;

    public readonly x: number;
    public readonly y: number;

    private readonly symbolWidth =
        GameConfig.reel.symbolWidth;

    private readonly symbolHeight =
        GameConfig.reel.symbolHeight;

    private readonly symbolGap =
        GameConfig.reel.symbolGap;

    private readonly symbolStep: number;

    private readonly visibleRows =
        GameConfig.reel.visibleRows;

    private readonly visualObjects =
        GameConfig.reel.visualObjects;

    private readonly stripLength: number;

    private reelStrip: string[];

    private position = 0;

    private targetPosition: number | null = null;

    public isSpinning = false;

    private readonly symbolVisuals:
        ReelSymbolVisual[] = [];

    private readonly container:
        GameObjects.Container;

    private readonly maskGraphics:
        GameObjects.Graphics;

    private onCompleteCallback?: () => void;

    constructor(
        scene: Scene,
        x: number,
        y: number
    ) {
        this.scene = scene;

        this.x = x;
        this.y = y;

        this.symbolStep =
            this.symbolHeight +
            this.symbolGap;

        this.reelStrip =
            RandomGenerator.generateReelStrip();

        this.stripLength =
            this.reelStrip.length;

        this.container =
            this.scene.add.container(
                x,
                y
            );

        this.createVisualSymbols();

        this.maskGraphics =
            this.createVisibleAreaMask();

        this.container.setMask(
            this.maskGraphics
                .createGeometryMask()
        );

        this.render();
    }

    // =====================================================
    // SPIN
    // =====================================================

    public startSpin(
        finalColumn: string[]
    ): void {
        if (this.isSpinning) {
            return;
        }

        if (
            finalColumn.length !==
            this.visibleRows
        ) {
            console.error(
                'Invalid final column:',
                finalColumn
            );

            return;
        }

        // Remove qualquer efeito visual
        // da vitória anterior.
        this.clearWinEffects();

        this.isSpinning = true;

        const targetIndex =
            this.findTargetPosition(
                finalColumn
            );

        const currentIndex =
            Math.floor(
                this.position
            ) %
            this.stripLength;

        let distance =
            targetIndex -
            currentIndex;

        if (distance < 0) {
            distance +=
                this.stripLength;
        }

        const totalDistance =
            distance +
            GameConfig.reel.extraRotations *
            this.stripLength;

        this.targetPosition =
            this.position +
            totalDistance;

        this.scene.tweens.add({
            targets: this,

            position:
                this.targetPosition,

            duration:
                GameConfig.reel.spinDuration,

            ease:
                'Cubic.easeOut',

            onUpdate: () => {
                this.render();
            },

            onComplete: () => {
                this.position =
                    this.targetPosition!;

                this.render();

                this.isSpinning = false;

                this.onSpinComplete();
            },
        });
    }

    public setOnComplete(
        callback: () => void
    ): void {
        this.onCompleteCallback =
            callback;
    }

    // =====================================================
    // WIN PRESENTATION API
    // =====================================================

    /**
     * Retorna a posição no mundo do centro
     * de uma row visível.
     *
     * row:
     *
     * 0 = superior
     * 1 = central
     * 2 = inferior
     */
    public getRowCenter(
        row: number
    ): ReelSymbolPosition {
        return {
            x: this.x,

            y:
                this.y +
                row *
                    this.symbolStep,
        };
    }

    /**
     * Destaca visualmente uma row usando a
     * animação configurada para o símbolo visível.
     */
    public highlightRow(
        row: number
    ): void {
        const symbolImage =
            this.getVisibleSymbolVisual(
                row
            )?.image;

        if (!symbolImage) {
            return;
        }

        const symbolId =
            this.getVisibleSymbolId(row);

        const animation =
            SymbolConfig.getById(symbolId ?? '')
                ?.winAnimation;

        if (!animation) {
            return;
        }

        this.scene.tweens.killTweensOf(
            symbolImage
        );

        this.playWinAnimation(
            symbolImage,
            animation
        );
    }

    private playWinAnimation(
        symbolImage: GameObjects.Image,
        animation: WinAnimation
    ): void {
        const initialScaleX =
            symbolImage.scaleX;

        const initialScaleY =
            symbolImage.scaleY;

        const duration =
            GameConfig.winPresentation
                .symbolPulseDuration;

        if (animation === 'bouncing') {
            this.scene.tweens.add({
                targets: symbolImage,
                y: symbolImage.y - 18,
                duration,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
            });

            return;
        }

        if (animation === 'wiggle') {
            this.scene.tweens.add({
                targets: symbolImage,
                angle: 6,
                duration,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
            });

            return;
        }

        this.scene.tweens.add({
            targets: symbolImage,

            scaleX:
                initialScaleX *
                GameConfig.winPresentation
                    .symbolPulseScale,

            scaleY:
                initialScaleY *
                GameConfig.winPresentation
                    .symbolPulseScale,

            duration,

            ease:
                'Bounce.easeOut',

            yoyo: true,

            repeat: -1,
        });
    }

    /**
     * Remove os efeitos de vitória
     * deste reel.
     */
    public clearWinEffects(): void {
        for (
            let row = 0;
            row < this.visibleRows;
            row++
        ) {
            const symbolVisual =
                this.getVisibleSymbolVisual(
                    row
                );

            if (!symbolVisual) {
                continue;
            }

            this.scene.tweens.killTweensOf(
                symbolVisual.background
            );

            this.scene.tweens.killTweensOf(
                symbolVisual.image
            );

            symbolVisual.background
                .setScale(1)
                .setAlpha(1)
                .setStrokeStyle(
                    2,
                    0x000000
                );

            symbolVisual.image
                .setDisplaySize(
                    this.symbolWidth,
                    this.symbolHeight
                )
                .setAlpha(1)
                .setAngle(0);
        }

        this.render();
    }

    /**
     * Nossos objetos visuais são:
     *
     * index 0 = símbolo acima
     * index 1 = row 0
     * index 2 = row 1
     * index 3 = row 2
     * index 4 = símbolo abaixo
     */
    private getVisibleSymbolVisual(
        row: number
    ): ReelSymbolVisual | undefined {
        if (
            row < 0 ||
            row >= this.visibleRows
        ) {
            return undefined;
        }

        return this.symbolVisuals[
            row + 1
        ];
    }

    private getVisibleSymbolId(
        row: number
    ): string | undefined {
        if (
            row < 0 ||
            row >= this.visibleRows
        ) {
            return undefined;
        }

        return this.reelStrip[
            this.wrapIndex(
                Math.floor(this.position) + row
            )
        ];
    }

    // =====================================================
    // VISUAL SYMBOLS
    // =====================================================

    private createVisualSymbols(): void {
        for (
            let i = 0;
            i < this.visualObjects;
            i++
        ) {
            const background =
                this.scene.add.rectangle(
                    0,
                    0,
                    this.symbolWidth,
                    this.symbolHeight,
                    0xffffff
                );

            background.setStrokeStyle(
                2,
                0x000000
            );

            this.container.add(
                background
            );

            const image =
                this.scene.add.image(
                    0,
                    0,
                    'symbolCrow'
                );
            image
                .setDisplaySize(
                    this.symbolWidth,
                    this.symbolHeight
                )
                .setVisible(false);

            this.container.add(
                image
            );

            this.symbolVisuals.push({
                background,
                image,
            });
        }
    }
    /**
     * Recorta os símbolos à janela visível do rolo.
     * Os objetos acima e abaixo continuam animando,
     * mas ficam ocultos atrás da moldura.
     */
    private createVisibleAreaMask():
        GameObjects.Graphics {
        const maskConfig =
            GameConfig.layout.reelMask;

        const mask =
            this.scene.make.graphics(
                {},
                false
            );

        mask.fillStyle(0xffffff);

        mask.fillRect(
            this.x -
                maskConfig.width / 2 +
                maskConfig.offsetX,
            this.y -
                maskConfig.height / 2 +
                maskConfig.offsetY,
            maskConfig.width,
            maskConfig.height
        );

        return mask;
    }

    // =====================================================
    // TARGET RESULT
    // =====================================================

    private findTargetPosition(
        finalColumn: string[]
    ): number {
        const maxStart =
            this.stripLength -
            this.visibleRows;

        for (
            let attempt = 0;
            attempt < 100;
            attempt++
        ) {
            const startIndex =
                PhaserMath.Between(
                    0,
                    maxStart
                );

            const testStrip =
                [...this.reelStrip];

            const success =
                this.prepareResultOnStrip(
                    testStrip,
                    startIndex,
                    finalColumn
                );

            if (success) {
                this.reelStrip =
                    testStrip;

                return startIndex;
            }
        }

        for (
            let startIndex = 0;
            startIndex <= maxStart;
            startIndex++
        ) {
            const testStrip =
                [...this.reelStrip];

            const success =
                this.prepareResultOnStrip(
                    testStrip,
                    startIndex,
                    finalColumn
                );

            if (success) {
                this.reelStrip =
                    testStrip;

                return startIndex;
            }
        }

        console.error(
            'Could not place final result on reel.',
            finalColumn
        );

        return 0;
    }

    private prepareResultOnStrip(
        strip: string[],
        startIndex: number,
        finalColumn: string[]
    ): boolean {
        const lockedPositions =
            new Set<number>();

        for (
            let row = 0;
            row < finalColumn.length;
            row++
        ) {
            const targetIndex =
                startIndex +
                row;

            const desiredSymbol =
                finalColumn[row];

            if (
                strip[targetIndex] ===
                desiredSymbol
            ) {
                lockedPositions.add(
                    targetIndex
                );

                continue;
            }

            let sourceIndex = -1;

            for (
                let i = 0;
                i < strip.length;
                i++
            ) {
                const isInsideResultArea =
                    i >= startIndex &&
                    i <
                        startIndex +
                            finalColumn.length;

                if (
                    !isInsideResultArea &&
                    !lockedPositions.has(i) &&
                    strip[i] ===
                        desiredSymbol
                ) {
                    sourceIndex = i;

                    break;
                }
            }

            if (
                sourceIndex === -1
            ) {
                for (
                    let i = startIndex;
                    i <
                    startIndex +
                        finalColumn.length;
                    i++
                ) {
                    if (
                        i !==
                            targetIndex &&
                        !lockedPositions.has(
                            i
                        ) &&
                        strip[i] ===
                            desiredSymbol
                    ) {
                        sourceIndex =
                            i;

                        break;
                    }
                }
            }

            if (
                sourceIndex === -1
            ) {
                return false;
            }

            [
                strip[targetIndex],
                strip[sourceIndex],
            ] = [
                strip[sourceIndex],
                strip[targetIndex],
            ];

            lockedPositions.add(
                targetIndex
            );
        }

        for (
            let row = 0;
            row < finalColumn.length;
            row++
        ) {
            const index =
                startIndex +
                row;

            if (
                strip[index] !==
                finalColumn[row]
            ) {
                return false;
            }
        }

        return true;
    }

    // =====================================================
    // COMPLETE
    // =====================================================

    private onSpinComplete(): void {
        this.onCompleteCallback?.();
    }

    // =====================================================
    // RENDER
    // =====================================================

    private render(): void {
        const baseIndex =
            Math.floor(
                this.position
            );

        const fractional =
            this.position -
            baseIndex;

        for (
            let i = 0;
            i <
            this.symbolVisuals.length;
            i++
        ) {
            const stripIndex =
                this.wrapIndex(
                    baseIndex +
                        i -
                        1
                );

            const symbolId =
                this.reelStrip[
                    stripIndex
                ];

            const symbol =
                SymbolConfig.getById(
                    symbolId
                );

            const symbolVisual =
                this.symbolVisuals[i];

            const symbolY =
                (i - 1) *
                    this.symbolStep -
                fractional *
                    this.symbolStep;

            symbolVisual.background.y =
                symbolY;

            symbolVisual.image.y =
                symbolY;

            if (!symbol) {
                symbolVisual.background.setVisible(
                    false
                );
                symbolVisual.image.setVisible(
                    false
                );

                continue;
            }

            symbolVisual.background.setFillStyle(
                symbol.color
            );

            if (symbol.textureKey) {
                symbolVisual.image
                    .setTexture(
                        symbol.textureKey
                    )
                    .setDisplaySize(
                        this.symbolWidth,
                        this.symbolHeight
                    )
                    .setVisible(true);

                symbolVisual.background.setVisible(
                    false
                );

                continue;
            }

            symbolVisual.image.setVisible(
                false
            );

            symbolVisual.background.setVisible(
                true
            );
        }
    }

    private wrapIndex(
        index: number
    ): number {
        return PhaserMath.Wrap(
            index,
            0,
            this.stripLength
        );
    }
}

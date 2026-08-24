import {
    Scene,
    GameObjects,
    Math as PhaserMath,
} from 'phaser';

import { SymbolConfig } from '../config/SymbolConfig';
import { GameConfig } from '../config/GameConfig';
import { RandomGenerator } from '../logic/RandomGenerator';

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

    private readonly symbolObjects: GameObjects.Rectangle[] = [];

    private readonly container: GameObjects.Container;

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
            this.scene.add.container(x, y);

        this.createVisualSymbols();

        this.render();
    }

    /**
     * Inicia um spin e recebe o resultado final
     * que obrigatoriamente deverá aparecer.
     */
    public startSpin(
        finalColumn: string[]
    ): void {
        if (this.isSpinning) {
            return;
        }

        if (finalColumn.length !== this.visibleRows) {
            console.error(
                'Invalid final column:',
                finalColumn
            );

            return;
        }

        this.isSpinning = true;

        const targetIndex =
            this.findTargetPosition(finalColumn);

        const currentIndex =
            Math.floor(this.position) %
            this.stripLength;

        let distance =
            targetIndex - currentIndex;

        if (distance < 0) {
            distance += this.stripLength;
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

            position: this.targetPosition,

            duration:
                GameConfig.reel.spinDuration,

            ease: 'Cubic.easeOut',

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

    /**
     * Cria os 5 objetos visuais:
     *
     * índice 0 = fora da área superior
     * índice 1 = linha superior
     * índice 2 = linha central
     * índice 3 = linha inferior
     * índice 4 = fora da área inferior
     */
    private createVisualSymbols(): void {
        for (
            let i = 0;
            i < this.visualObjects;
            i++
        ) {
            const rect =
                this.scene.add.rectangle(
                    0,
                    0,
                    this.symbolWidth,
                    this.symbolHeight,
                    0xffffff
                );

            rect.setStrokeStyle(
                2,
                0x000000
            );

            this.container.add(rect);

            this.symbolObjects.push(rect);
        }
    }

    /**
     * Encontra uma posição no strip onde conseguimos
     * colocar exatamente o resultado final.
     */
    private findTargetPosition(
        finalColumn: string[]
    ): number {
        const maxStart =
            this.stripLength -
            this.visibleRows;

        // Tentativa aleatória
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

        // Fallback determinístico
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

    /**
     * Move os símbolos no strip até que as 3 posições
     * desejadas sejam exatamente o resultado determinado.
     */
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
                startIndex + row;

            const desiredSymbol =
                finalColumn[row];

            // Já está no lugar correto
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

            // Primeiro tenta encontrar o símbolo
            // fora da área final.
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

            // Segunda tentativa:
            // procura dentro da própria área final.
            if (sourceIndex === -1) {
                for (
                    let i = startIndex;
                    i <
                    startIndex +
                        finalColumn.length;
                    i++
                ) {
                    if (
                        i !== targetIndex &&
                        !lockedPositions.has(i) &&
                        strip[i] ===
                            desiredSymbol
                    ) {
                        sourceIndex = i;
                        break;
                    }
                }
            }

            if (sourceIndex === -1) {
                return false;
            }

            // Troca as posições
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

        // Validação final
        for (
            let row = 0;
            row < finalColumn.length;
            row++
        ) {
            const index =
                startIndex + row;

            if (
                strip[index] !==
                finalColumn[row]
            ) {
                return false;
            }
        }

        return true;
    }

    private onSpinComplete(): void {
        this.onCompleteCallback?.();
    }

    /**
     * Atualiza visualmente os 5 símbolos.
     */
    private render(): void {
        const baseIndex =
            Math.floor(this.position);

        const fractional =
            this.position -
            baseIndex;

        for (
            let i = 0;
            i < this.symbolObjects.length;
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

            if (!symbol) {
                continue;
            }

            const rect =
                this.symbolObjects[i];

            rect.y =
                (i - 1) *
                    this.symbolStep -
                fractional *
                    this.symbolStep;

            rect.setFillStyle(
                symbol.color
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
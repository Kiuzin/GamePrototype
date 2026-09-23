import { GameSettings } from './GameSettings';

const designScreen = { width: 1080, height: 1920 } as const;
const { width: screenWidth, height: screenHeight } = GameSettings.screen;

/**
 * Conversões da resolução de referência para o tamanho definido em GameSettings.
 * Use `x` e `y` para posições/offsets; `width` e `height` para dimensões.
 * Tipografia, cores e espessuras continuam sendo valores visuais absolutos.
 */
export const ScreenLayout = {
    width: screenWidth,
    height: screenHeight,
    centerX: screenWidth / 2,
    centerY: screenHeight / 2,
    x: (value: number): number => (value / designScreen.width) * screenWidth,
    y: (value: number): number => (value / designScreen.height) * screenHeight,
    horizontal: (value: number): number => (value / designScreen.width) * screenWidth,
    vertical: (value: number): number => (value / designScreen.height) * screenHeight,
} as const;

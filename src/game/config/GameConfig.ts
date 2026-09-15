import { GameLayout } from './GameLayout';
import { GameSettings } from './GameSettings';
import { GameTheme } from './GameTheme';

/**
 * Fachada de compatibilidade. Novos módulos devem importar apenas a configuração
 * pertinente à sua responsabilidade.
 */
export const GameConfig = {
    ...GameSettings,
    ...GameTheme,
    layout: GameLayout,
} as const;

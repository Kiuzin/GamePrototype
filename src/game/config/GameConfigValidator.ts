import { FeatureConfig } from './FeatureConfig';
import { SymbolConfig } from './SymbolConfig';
import { validateProbability } from '../logic/RandomUtils';
import { GameError } from '../logic/GameError';

/** Valida as configurações estáticas antes que qualquer cena seja iniciada. */
export const validateGameConfig = (): void => {
    const features = FeatureConfig;
    const symbols = SymbolConfig.SYMBOLS;

    if (
        symbols.some(
            symbol => symbol.weight <= 0 ||
                Object.values(symbol.payout).some(
                    multiplier => !Number.isFinite(multiplier) || multiplier < 0
                )
        )
    ) {
        throw new GameError(
            'INVALID_CONFIGURATION',
            'Todos os símbolos devem possuir peso positivo e pagamentos válidos.'
        );
    }

    [
        features.luckyCorn.activationChance,
        features.luckyCorn.selectedSymbolChance,
        features.luckyCorn.wildChance,
        features.horseRace.activationChance,
        features.treasureChest.activationChance,
        features.cardDouble.activationChance,
        features.wheelBonus.activationChance,
    ].forEach(validateProbability);

    if (features.luckyCorn.selectedSymbolChance + features.luckyCorn.wildChance > 1) {
        throw new GameError(
            'INVALID_CONFIGURATION',
            'As chances do Milho da Sorte não podem ultrapassar 100%.'
        );
    }

    const configuredLuckySymbols = Object.keys(
        features.luckyCorn.symbolSelectionWeights
    );
    if (
        configuredLuckySymbols.some(
            id => !SymbolConfig.getById(id) || SymbolConfig.isWild(id)
        ) ||
        Object.values(features.luckyCorn.symbolSelectionWeights)
            .some(weight => !Number.isFinite(weight) || weight <= 0)
    ) {
        throw new GameError(
            'INVALID_CONFIGURATION',
            'Os pesos do Milho da Sorte devem referenciar símbolos existentes e ser positivos.'
        );
    }

    if (
        features.treasureChest.endingChestCount < 1 ||
        features.treasureChest.chestCount !==
            features.treasureChest.endingChestCount +
            features.treasureChest.rewardMultipliers.length ||
        features.treasureChest.rewardMultipliers.some(
            multiplier => !Number.isFinite(multiplier) || multiplier < 0
        )
    ) {
        throw new GameError(
            'INVALID_CONFIGURATION',
            'A configuração dos baús é inválida.'
        );
    }

    if (
        features.wheelBonus.initialSpins < 1 ||
        features.wheelBonus.slices.length < 2 ||
        features.wheelBonus.slices.some(slice => slice.weight <= 0)
    ) {
        throw new GameError(
            'INVALID_CONFIGURATION',
            'A configuração da roleta é inválida.'
        );
    }
};

import type { BonusFeatureLifecycle } from './BonusFeatureLifecycle';

export type FeatureId =
    | 'luckyCorn'
    | 'horseRace'
    | 'treasureChest'
    | 'cardDouble'
    | 'wheelBonus';

/** Registro único do ciclo de vida das features ativas na cena. */
export class FeatureRegistry {
    private readonly features: ReadonlyMap<FeatureId, BonusFeatureLifecycle>;

    public constructor(entries: readonly (readonly [FeatureId, BonusFeatureLifecycle])[]) {
        this.features = new Map(entries);
    }

    public finishAll(): void {
        this.features.forEach(feature => feature.finish());
    }
}

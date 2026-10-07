/** Ciclo de vida compartilhado pelas funcionalidades opcionais. */
export interface BonusFeatureLifecycle {
    /** Verifica a elegibilidade sem iniciar nem reservar estado da feature. */
    tryStart(): boolean;

    /** Libera qualquer estado transitório da ativação atual. */
    finish(): void;
}

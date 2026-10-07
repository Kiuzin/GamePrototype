export type GameErrorCode =
    | 'INVALID_CONFIGURATION'
    | 'INVALID_GRID'
    | 'INVALID_MONEY'
    | 'INSUFFICIENT_BALANCE'
    | 'UNKNOWN_SYMBOL'
    | 'ROUND_IN_PROGRESS'
    | 'INVALID_HISTORY';

/** Erro de domínio estável; a interface decide como traduzir sua mensagem. */
export class GameError extends Error {
    public constructor(
        public readonly code: GameErrorCode,
        message: string
    ) {
        super(message);
        this.name = 'GameError';
    }
}

/** Mensagens de domínio prontas para consumo pela interface em PT-BR. */
export const getGameErrorMessage = (error: GameError): string => {
    const messages: Record<GameErrorCode, string> = {
        INVALID_CONFIGURATION: 'A configuração do jogo é inválida.',
        INVALID_GRID: 'O resultado da rodada é inválido.',
        INVALID_MONEY: 'O valor informado é inválido.',
        INSUFFICIENT_BALANCE: 'Saldo insuficiente para concluir a operação.',
        UNKNOWN_SYMBOL: 'Foi encontrado um símbolo desconhecido.',
        ROUND_IN_PROGRESS: 'Há uma rodada em andamento.',
        INVALID_HISTORY: 'Não foi possível registrar o histórico da rodada.',
    };

    return messages[error.code];
};

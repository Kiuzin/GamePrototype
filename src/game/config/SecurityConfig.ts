/**
 * Proteções aplicáveis ao cliente.
 *
 * Nenhum valor usado aqui deve ser tratado como segredo: todo código entregue
 * ao navegador pode ser inspecionado ou alterado pelo próprio jogador.
 */
export const SecurityConfig = {
    showDebugInformation: import.meta.env.DEV,
    allowLocalWalletMutations: import.meta.env.DEV,
} as const;

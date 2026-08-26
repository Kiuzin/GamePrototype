# Repository Guidelines

## Estrutura do projeto

MVP de caça-níquel em Phaser 4, TypeScript e Vite. `src/main.ts` inicia o jogo de `src/game/main.ts`.

- `src/game/scenes/`: cenas Phaser (`Boot`, `Preloader`, `MainMenu`, `SlotMachine` e outras).
- `src/game/logic/`: regras isoladas, como geração de resultados, verificação de linhas e cálculo de pagamentos.
- `src/game/config/`: configurações centralizadas de jogo, símbolos, cores e layout.
- `src/game/objects/`: objetos reutilizáveis do Phaser, por exemplo `Reel`.
- `public/`: CSS e recursos estáticos; imagens ficam em `public/assets/`.
- `vite/`: configurações de desenvolvimento e produção.

## Desenvolvimento, build e validação

Na raiz do repositório:

```bash
npm install        # instala dependências
npm run dev        # inicia o Vite em desenvolvimento com logs
npm run dev-nolog  # inicia o Vite sem o script de logs
npm run build      # gera a versão de produção
npm run build-nolog # build sem o script de logs
npm run lint       # verifica erros e convenções de TypeScript
npm run lint:fix   # corrige automaticamente convenções compatíveis
```

Não há testes automatizados configurados. Use `npm run lint` e `npm run build` antes de abrir uma alteração; o TypeScript está em modo estrito e ambos devem concluir sem erros.

## Estilo de código e nomes

Escreva prompts, comentários, documentação e mensagens dirigidas à equipe em **PT-BR**. Mantenha variáveis, funções, classes, métodos, arquivos TypeScript e demais identificadores de código em **inglês**: `currentBet`, `calculatePayout`, `SlotMachine` e `PayoutCalculator`.

O ESLint verifica erros, variáveis não usadas e importações duplicadas. Preserve o estilo existente: indentação de quatro espaços, ponto e vírgula e aspas simples. Use `camelCase` para funções, métodos e variáveis; nomeie cenas e objetos por responsabilidade. Mantenha regras de domínio em `logic/`, valores ajustáveis em `config/` e comportamento visual nas cenas. Prefira funções pequenas, tipadas e privadas quando pertencem a uma cena.

## Testes

Ao adicionar testes, priorize as regras puras de `src/game/logic/`. Use nomes que descrevam comportamento, como `PayoutCalculator.test.ts` e `calculates payout for three matching symbols`. Para mudanças visuais, execute `npm run dev`, percorra o fluxo de spin e verifique saldo, resultado, travamento do botão e carregamento dos recursos.

## Commits e pull requests

O histórico usa mensagens curtas com prefixos como `Feature:`, `Fix:` e `Refactor:`. Siga o mesmo padrão, no imperativo e focado: `Feature: add bonus symbol payout`.

Em pull requests, descreva a mudança, a validação e impactos. Vincule a issue e inclua captura de tela ou vídeo para alterações de interface. Não inclua arquivos gerados pelo build.

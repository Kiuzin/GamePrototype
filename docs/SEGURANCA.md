# Segurança e prevenção a fraudes

## Limite do cliente web

O jogo é distribuído para o navegador. Portanto, qualquer pessoa pode abrir o
DevTools, ler o JavaScript, alterar valores em memória, substituir funções ou
enviar requisições manualmente. Minificação e ausência de sourcemaps apenas
reduzem a legibilidade; elas não constituem proteção contra fraude.

Por esse motivo, saldo, resultado de rodadas, chances, bônus, depósito e saque
calculados apenas no cliente **não podem** representar dinheiro real ou prêmio
resgatável.

## Proteções incluídas no cliente

- O build de produção não gera sourcemaps e usa minificação com `terser`.
- A prévia de resultado e os textos de depuração só existem em desenvolvimento.
- Depósitos e saques locais são bloqueados no build de produção. Eles seguem
  disponíveis durante o desenvolvimento para teste do MVP.
- Uma Content Security Policy básica restringe scripts, conexões e recursos a
  origens próprias.

## Requisito para saldo ou prêmios reais

Antes de publicar com qualquer valor econômico, implemente um backend que seja
a única fonte de verdade. O cliente deve apenas solicitar uma rodada e exibir
a resposta do servidor.

1. Autentique o jogador e mantenha saldo e histórico exclusivamente no banco
   de dados do servidor, em unidades inteiras (centavos).
2. Desconte a aposta, sorteie com CSPRNG e calcule o pagamento em uma única
   transação atômica no servidor.
3. Retorne um identificador único de rodada e aplique idempotência para impedir
   repetição de requisições.
4. Faça depósito por confirmação assinada do provedor de pagamento e saque por
   fluxo autenticado, com limites, auditoria e análise antifraude.
5. Valide todas as entradas no servidor, aplique rate limiting e registre
   eventos de risco. Nunca aceite do cliente saldo, pagamento, resultado ou
   probabilidade como verdade.
6. Sirva o jogo por HTTPS e envie a CSP também como cabeçalho HTTP; o servidor
   deve adicionar `frame-ancestors 'none'` ou uma lista explícita de domínios
   permitidos.

O comportamento de DevTools não deve ser bloqueado: bloquear F12, clique
direito ou detectar inspeção é contornável e prejudica usuários legítimos. A
segurança deve existir mesmo quando o código é totalmente conhecido pelo jogador.

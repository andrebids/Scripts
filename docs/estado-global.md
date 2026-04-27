# Estado Global

## Variáveis globais base

Inicializadas em `core/appState.jsx`:

- `caminhoConfig`
- `nomeDesigner`
- `idiomaUsuario`
- `IDIOMA_ATUAL`
- `itensLegenda`
- `itensNomes`
- `ultimaSelecao`

Espelhadas também em `$.global.*` para compatibilidade com os módulos existentes.

## Namespaces globais exportados

### Core

- `$.global.funcoes`
- `$.global.database`
- `$.global.logs`
- `$.global.regras`
- `$.global.inicializacao`
- `$.global.appState`
- `$.global.bootstrap`

### Funcionais

- `$.global.funcoesComponentes`
- `$.global.funcoesBolas`
- `$.global.funcoesLegenda`
- `$.global.funcoesFiltragem`
- `$.global.alfabeto`

### UI

- `$.global.ui`
- `$.global.gestaoLista`
- `$.global.eventosUI`

### Infraestrutura

- `$.global.bridge`
- `$.global.config`

## Estado global de runtime observado

- `$.global.janelaScript`
- `$.global.componentesObservacoes`
- `$.global.legendaEstadoObs`
- `$.global.areaLogs`

## Riscos atuais

- Alguns módulos usam variáveis globais simples e outros usam `$.global`, o que cria dois estilos de acesso.
- A existência do namespace não garante que o estado associado esteja sincronizado.
- `eventosUI.jsx` e `script.jsx` ainda concentram muita coordenação baseada em estado mutável partilhado.

## Próximos passos recomendados

1. Passar novos módulos a consumir `$.global.appState` ou objetos de contexto explícitos.
2. Evitar criar novas variáveis globais simples.
3. Reduzir progressivamente `configEventos`.
4. Isolar estado de janela principal num único objeto dedicado.

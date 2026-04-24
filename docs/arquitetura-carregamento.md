# Arquitetura de Carregamento

## Ordem atual de carregamento

O ponto de entrada continua a ser `script.jsx`, com carregamento sequencial via `$.evalFile(...)`.

### Bibliotecas base

1. `assets/json2.js`
2. `assets/translations.js`

### Core

1. `core/funcoes.jsx`
2. `core/database.jsx`
3. `core/logs.jsx`
4. `core/regras.jsx`
5. `core/appState.jsx`

### Módulos funcionais

1. `modules/funcoesComponentes.jsx`
2. `modules/funcoesBolas.jsx`
3. `modules/funcoesLegenda.jsx`
4. `modules/funcoesFiltragem.jsx`
5. `modules/alfabeto.jsx`

### Infraestrutura

1. `infrastructure/bridge.jsx`
2. `infrastructure/config.jsx`
3. `core/inicializacao.jsx`
4. `core/bootstrap.jsx`

### UI e gestão

1. `ui/ui.jsx`
2. `ui/gestaoLista.jsx`
3. `ui/eventosUI.jsx`

### Manutenção

1. `infrastructure/update.jsx`

## Sequência de arranque

Depois do carregamento dos ficheiros:

1. `appState.inicializarEstadoBaseLegenda()`
2. `bootstrap.inicializarSistema()`
3. `bootstrap.criarJanelaPrincipal()`
4. Construção da UI principal em `script.jsx`
5. `bootstrap.prepararEstadoObservacoes()`
6. `gestaoLista.configurarEventosLista(...)`
7. `eventosUI.configurar...(...)`
8. `janela.show()`

## Dependências implícitas importantes

- `config.jsx` depende de `caminhoConfig`, `nomeDesigner`, `idiomaUsuario` e `IDIOMA_ATUAL`.
- `inicializacao.jsx` depende de `config`, `database`, `funcoes` e do estado global básico.
- `script.jsx` depende de quase todos os namespaces exportados.
- `eventosUI.jsx` depende de um `configEventos` muito largo e de múltiplos namespaces globais.

## Observações

- A ordem ainda é relevante e frágil.
- `script.jsx` continua a ser o orquestrador principal.
- `core/appState.jsx` e `core/bootstrap.jsx` foram introduzidos para começar a separar estado e arranque do resto da UI.

# Plano de Reorganização UI/UX da Secção Extra

## Contexto

Depois da refatoração recente, a base de arranque e estado ficou mais organizada com `core/bootstrap.jsx` e `core/appState.jsx`.

O problema principal de UI, no entanto, mantém-se:

- a secção `Extra` continua a crescer por adição de blocos dinâmicos
- vários checkboxes criam interface diretamente em `grupoExtra` ou `abaGeral`
- alguns módulos ainda alteram a altura da janela manualmente com `janela.preferredSize.height += 100`

Isto cria risco de a `palette` ficar mais alta do que o ecrã e esconder campos ou botões.

## Objetivo

Transformar a secção `Extra` de um modelo de expansão vertical para um modelo de conteúdo contido, mantendo a janela principal estável.

Objetivos concretos:

1. impedir crescimento incremental da janela principal
2. manter a lista final e os botões principais sempre acessíveis
3. separar ativação de módulos de configuração de módulos
4. centralizar a gestão dos extras num único ponto técnico
5. reduzir acoplamento entre `script.jsx` e `ui/eventosUI.jsx`

## Diagnóstico Atual

### Estrutura atual

- `script.jsx` continua a montar a UI principal e a secção `Extra`
- `ui/eventosUI.jsx` continua a tratar eventos e também a construir UI dinâmica
- `ui/ui.jsx` e `modules/alfabeto.jsx` contêm builders de módulos opcionais

### Problemas observados

1. `eventosUI.jsx` mistura wiring de eventos com construção de painéis dinâmicos.
2. Os módulos opcionais não partilham um container controlado.
3. O layout cresce por empilhamento vertical.
4. Há ainda lógica de resize manual em builders de módulos.
5. Existe duplicação conceptual entre a montagem real do `Extra` em `script.jsx` e a função `criarInterfaceExtra` em `ui/ui.jsx`.

## Arquitetura Alvo

### Princípio

A janela principal deve manter altura estável. O conteúdo variável deve viver dentro de uma área fixa da secção `Extra`.

### Estrutura proposta para `Extra`

Dentro do painel `Extra`, manter um `tabbedpanel` com três abas:

1. `Ativar`
2. `Configurar`
3. `Logs`

#### Aba `Ativar`

Contém apenas os checkboxes dos módulos opcionais:

- Observações
- Componente Extra
- PVC
- Texturas
- Bolas
- Contador
- GX

Esta aba deve ser curta e estável.

#### Aba `Configurar`

Contém uma área fixa para os módulos ativos.

Nesta aba deve existir um segundo `tabbedpanel` ou outro container controlado, onde cada módulo ativo ganha a sua própria tab:

- `Observações`
- `PVC`
- `Texturas`
- `Contador`
- `GX`
- `Bolas`
- `Comp. Extra`

Quando um checkbox é ligado:

- o módulo é criado nesta área
- a tab do módulo é selecionada automaticamente

Quando um checkbox é desligado:

- a tab do módulo é removida
- se não houver módulos ativos, a aba mostra um estado vazio

#### Aba `Logs`

Mantém a área de logs, isolada do fluxo principal de configuração.

## Diretrizes Técnicas

### 1. `script.jsx`

Deve ficar responsável por:

- criar a janela principal
- criar os containers base da UI
- criar a estrutura fixa da secção `Extra`
- passar referências mínimas para os módulos de eventos e extras

Não deve continuar a ser o ponto onde a UI opcional é criada diretamente após clique do utilizador.

### 2. `ui/eventosUI.jsx`

Deve passar a ser apenas um módulo de binding de eventos.

Responsabilidades desejadas:

- escutar `onClick`, `onChange`, `onChanging`
- delegar ações de criação e remoção de módulos para um gestor dedicado
- parar de construir grupos e painéis diretamente

### 3. Novo módulo sugerido: `ui/extraPanel.jsx`

Criar um módulo dedicado à secção `Extra`.

Responsabilidades:

- registar definição dos módulos opcionais
- criar e remover tabs de módulos ativos
- manter mapa interno de instâncias ativas
- devolver API simples para `eventosUI.jsx`

API sugerida:

```javascript
var extraPanel = {
    inicializar: function(config) {},
    ativarModulo: function(chave) {},
    desativarModulo: function(chave) {},
    selecionarModulo: function(chave) {},
    atualizarEstadoVazio: function() {}
};
```

### 4. `core/appState.jsx`

Adicionar estado explícito para extras ativos.

Exemplo:

```javascript
$.global.extraState = {
    ativos: {
        observacoes: false,
        componenteExtra: false,
        pvc: false,
        texturas: false,
        bolas: false,
        contador: false,
        alfabeto: false
    }
};
```

Isto evita depender apenas de referências soltas como `grupoPVC` ou `componentesObservacoes`.

### 5. Builders de UI

Os builders em `ui/ui.jsx` e `modules/alfabeto.jsx` devem passar a ser builders puros.

Devem:

- receber um `parent`
- criar controlos
- devolver a referência raiz do módulo

Não devem:

- aumentar ou diminuir `janela.preferredSize.height`
- assumir que vivem diretamente em `abaGeral`
- assumir que o parent é sempre `grupoExtra`

## Estratégia de Migração

### Fase 1

Objetivo: criar infraestrutura sem quebrar a UI atual.

1. criar `ui/extraPanel.jsx`
2. montar a nova aba `Configurar`
3. criar o container fixo para módulos ativos
4. introduzir estado básico de extras ativos

Resultado esperado:

- estrutura nova existe
- comportamento antigo ainda pode coexistir temporariamente

### Fase 2

Objetivo: migrar módulos mais simples.

Migrar primeiro:

1. `Observações`
2. `Texturas`
3. `Contador`

Ajustes necessários:

- deixar de mexer em `preferredSize.height`
- montar cada módulo na tab própria dentro de `Configurar`

### Fase 3

Objetivo: migrar módulos intermédios.

Migrar:

1. `Componente Extra`
2. `PVC`

Estes dois hoje são criados inline em `eventosUI.jsx` e devem sair de lá.

### Fase 4

Objetivo: migrar módulos com maior acoplamento.

Migrar:

1. `GX`
2. `Bolas`

Estes módulos devem ser os últimos porque têm mais dependências e mais lógica própria.

### Fase 5

Objetivo: limpeza final.

1. remover criação dinâmica antiga em `eventosUI.jsx`
2. remover resize manual remanescente
3. decidir se `ui.criarInterfaceExtra` continua a existir ou é removida
4. reduzir referências temporárias do `configEventos`

## Regras de Implementação

1. Nenhum módulo opcional pode alterar a altura da janela principal.
2. Nenhum checkbox em `eventosUI.jsx` deve criar UI complexa diretamente.
3. Cada módulo opcional deve ter uma raiz única e removível.
4. A aba `Configurar` deve suportar zero ou vários módulos ativos.
5. A lista final e os botões principais devem permanecer visíveis sem depender da altura do conteúdo extra.

## Critérios de Aceitação

O trabalho estará concluído quando:

1. ligar vários checkboxes não fizer a janela crescer indefinidamente
2. todos os módulos opcionais abrirem dentro de uma área fixa da secção `Extra`
3. o rodapé com lista e botões continuar acessível
4. `eventosUI.jsx` deixar de conter construção extensa de painéis opcionais
5. não existir lógica residual de `preferredSize.height +=` ou `-=`

## Riscos

1. alguns módulos assumem hoje parents concretos e podem quebrar ao mudar de container
2. `configEventos` ainda é largo e transporta demasiado contexto
3. a remoção parcial de UI dinâmica pode deixar referências antigas ativas se a migração não for feita por módulo

## Recomendação Final

Não fazer um redesign visual total nesta fase.

A melhor abordagem é uma refatoração estrutural da secção `Extra`, com contenção de layout, separação entre ativação e configuração, e um gestor dedicado de módulos opcionais.

Isto resolve o problema de altura sem reescrever a janela inteira.

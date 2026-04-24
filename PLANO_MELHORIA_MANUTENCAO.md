# Plano de Melhoria de Manutenção

## Objetivo

Melhorar a organização do plugin `Legenda`, reduzir ficheiros demasiado grandes, diminuir acoplamento entre UI/lógica/infraestrutura e tornar futuras alterações mais seguras.

## Diagnóstico Atual

### Estrutura geral

A base já tem uma tentativa de separação por áreas:

- `core/`
- `modules/`
- `ui/`
- `infrastructure/`
- `assets/`
- `resources/`

Isto é positivo, mas a separação ainda é incompleta porque o comportamento continua muito concentrado em poucos ficheiros grandes e num fluxo altamente global.

### Sinais de risco de manutenção

Ficheiros JS/JSX mais longos:

- `editor2.jsx`: 1160 linhas
- `modules/funcoesLegenda.jsx`: 1065 linhas
- `script.jsx`: 1016 linhas
- `infrastructure/bridge.jsx`: 837 linhas
- `ui/ui.jsx`: 793 linhas
- `ui/eventosUI.jsx`: 727 linhas
- `modules/funcoesFiltragem.jsx`: 627 linhas
- `core/funcoes.jsx`: 591 linhas

Principais problemas observados:

1. `script.jsx` faz demasiado
   - Carrega módulos
   - Define estado global
   - Constrói a janela principal
   - Contém regras de ciclo de vida da UI
   - Mistura bootstrap com comportamento

2. `ui/eventosUI.jsx` está demasiado procedural
   - Muitos handlers inline
   - Criação/remoção dinâmica de blocos de UI dentro dos eventos
   - Dependência forte de um objeto `config` muito largo

3. `ui/ui.jsx` e `editor2.jsx` têm forte mistura de layout, manipulação de dados e persistência
   - As funções de UI parecem também conhecer detalhes da base de dados
   - Há repetição de padrões de “lista + pesquisa + adicionar + remover”

4. `modules/funcoesLegenda.jsx` concentra regras de negócio extensas
   - Geração de frases
   - Agrupamentos
   - Regras linguísticas
   - Normalizações específicas
   - Alto risco de regressão em pequenas alterações

5. `infrastructure/bridge.jsx` tem responsabilidades a mais
   - Logging
   - Serialização de script BridgeTalk
   - Processamento de resultados
   - Fluxo de erro
   - Lógica funcional misturada com transporte

6. Dependência elevada de estado global
   - Uso de `$.global.*`
   - Dependência implícita entre módulos carregados por `$.evalFile`
   - Ordem de carregamento relevante e frágil

7. Código legado/editorial fora da arquitetura principal
   - `editor2.jsx` parece ser uma ferramenta paralela com grande volume de código
   - Está na raiz em vez de ficar claramente isolado como ferramenta administrativa

8. Artefactos operacionais misturados com código
   - `installer_log.txt`, `update_log.txt`, `update_status.txt`, `installer.bat` estão na raiz
   - Isto aumenta ruído e dificulta perceber o que é código, tooling e runtime output

## Avaliação

### O plugin está mal organizado?

Parcialmente.

O diretório já mostra intenção de modularização, mas o nível real de encapsulamento ainda é baixo. A organização física é melhor do que a organização lógica.

### Os ficheiros estão longos e complexos?

Sim.

Há pelo menos 6 ficheiros com tamanho suficiente para justificar divisão imediata. Acima de ~500 linhas em ExtendScript/UI procedural tende a degradar leitura, teste manual e segurança de refactor.

### Está difícil de manter?

Sim, por três razões principais:

- responsabilidades misturadas no mesmo ficheiro
- dependências implícitas via globais
- fluxo UI -> regras -> infraestrutura com fronteiras pouco claras

## Objetivos de Refactor

1. Reduzir ficheiros críticos para faixas de 150-350 linhas quando possível.
2. Separar bootstrap, estado, UI, eventos e regras de negócio.
3. Diminuir dependência de `$.global`.
4. Tornar `BridgeTalk` e atualização infraestrutural módulos pequenos e previsíveis.
5. Isolar ferramentas administrativas do runtime principal.
6. Melhorar legibilidade da estrutura para onboarding e correções rápidas.

## Plano Proposto

## Fase 1: Congelar arquitetura e mapear dependências

Objetivo: criar segurança antes de partir ficheiros.

Tarefas:

- Documentar a ordem atual de carregamento feita por `script.jsx`.
- Mapear quais módulos escrevem e leem `$.global`.
- Identificar funções públicas de cada ficheiro.
- Marcar pontos de integração críticos:
  - inicialização
  - criação de janela
  - geração de legenda
  - contagem BridgeTalk
  - update/config

Entregáveis:

- `docs/arquitetura-carregamento.md`
- `docs/estado-global.md`
- `docs/modulos-publicos.md`

## Fase 2: Limpar a raiz do projeto

Objetivo: separar runtime, tooling e documentação.

Tarefas:

- Criar pastas:
  - `tools/`
  - `docs/`
  - `runtime/` ou `var/` para ficheiros transitórios/logs
- Mover da raiz para `tools/`:
  - `installer.bat`
  - scripts de instalação/sync/update relacionados
- Mover ou redirecionar logs/output transitório para `runtime/`
- Isolar `editor2.jsx` em `tools/editor/` se ele não fizer parte do fluxo principal do plugin

Resultado esperado:

A raiz fica reservada para o ponto de entrada principal e documentação essencial.

## Fase 3: Partir `script.jsx`

Objetivo: transformar `script.jsx` num bootstrap pequeno.

Estrutura alvo:

- `script.jsx`
  - apenas `#target`, `$.evalFile`, bootstrap e arranque
- `core/bootstrap.jsx`
  - sequência de inicialização
- `core/appState.jsx`
  - estado partilhado da app
- `ui/mainWindow.jsx`
  - criação da janela principal
- `ui/mainController.jsx`
  - ligação entre UI e serviços

Meta:

- reduzir `script.jsx` para menos de 200 linhas

## Fase 4: Separar UI declarativa de eventos

Objetivo: reduzir acoplamento entre construção visual e comportamento.

Refactor recomendado:

- `ui/ui.jsx`:
  - manter apenas fábricas de componentes/grupos
- `ui/eventosUI.jsx`:
  - dividir por domínio de evento:
    - `ui/events/checks.jsx`
    - `ui/events/listas.jsx`
    - `ui/events/alfabeto.jsx`
    - `ui/events/contador.jsx`
    - `ui/events/extras.jsx`

Melhorias concretas:

- diminuir handlers inline longos
- receber dependências explícitas em vez de um `config` gigante
- criar pequenas funções `bind...()`

Meta:

- nenhum ficheiro de UI com mais de ~350 linhas

## Fase 5: Extrair regras de negócio de `funcoesLegenda.jsx`

Objetivo: tornar a geração de legenda composicional.

Divisão sugerida:

- `modules/legenda/normalizacao.jsx`
- `modules/legenda/agrupamento.jsx`
- `modules/legenda/regrasTexto.jsx`
- `modules/legenda/formatacao.jsx`
- `modules/legenda/geradorFrasePrincipal.jsx`
- `modules/legenda/index.jsx`

Princípio:

Cada ficheiro deve responder a uma pergunta clara:

- como normalizar entradas?
- como agrupar componentes?
- como aplicar regras linguísticas?
- como montar a frase final?

Meta:

- manter `index.jsx` como fachada pública
- deixar regras complexas isoladas e fáceis de testar manualmente

## Fase 6: Reestruturar `bridge.jsx`

Objetivo: separar transporte de lógica.

Divisão sugerida:

- `infrastructure/bridge/client.jsx`
- `infrastructure/bridge/serializer.jsx`
- `infrastructure/bridge/resultParser.jsx`
- `infrastructure/bridge/errorHandler.jsx`

Benefício:

- qualquer problema de BridgeTalk passa a ter localização clara
- reduz duplicação de logs/erros
- simplifica evolução futura de contagem e inserção de legenda

## Fase 7: Reduzir utilitário monolítico em `core/funcoes.jsx`

Objetivo: quebrar o ficheiro “caixa de ferramentas”.

Divisão sugerida:

- `core/utils/arrays.jsx`
- `core/utils/texto.jsx`
- `core/utils/illustrator.jsx`
- `core/utils/forms.jsx`
- `core/utils/validacao.jsx`

Nota:

Ficheiros chamados genericamente `funcoes.jsx` costumam crescer indefinidamente. Este é um bom candidato para eliminação progressiva.

## Fase 8: Formalizar fronteiras de módulo

Objetivo: reduzir dependência implícita.

Regras propostas:

- cada módulo publica um namespace único
- evitar funções soltas no escopo global
- usar padrão consistente, por exemplo:
  - `var legendaFormatacao = {};`
  - `legendaFormatacao.aplicar = function (...) {};`
- documentar dependências no topo de cada ficheiro

Isto é especialmente importante em ExtendScript, onde a ausência de imports reais favorece acoplamento acidental.

## Priorização

### Prioridade alta

- Partir `script.jsx`
- Partir `ui/eventosUI.jsx`
- Partir `modules/funcoesLegenda.jsx`
- Isolar `editor2.jsx`
- Reduzir uso de `$.global`

### Prioridade média

- Reestruturar `bridge.jsx`
- Dividir `core/funcoes.jsx`
- Limpar raiz e outputs transitórios

### Prioridade baixa

- Renomear ficheiros para convenção mais consistente
- Consolidar documentação de arquitetura
- Rever nomenclatura PT/FR/EN para coerência entre módulos

## Estratégia de Execução

A melhoria deve ser incremental, nunca um big bang.

Sequência recomendada:

1. Documentar dependências e estado global.
2. Limpar a raiz e separar tooling.
3. Reduzir `script.jsx` para bootstrap.
4. Separar construção de UI e binding de eventos.
5. Extrair regras de legenda.
6. Reestruturar BridgeTalk.
7. Partir utilitários transversais.

## Critérios de Sucesso

- ponto de entrada com menos de 200 linhas
- nenhum ficheiro crítico acima de 350-400 linhas, salvo casos justificados
- menos acesso direto a `$.global`
- módulos com responsabilidade única e nome explícito
- raiz do projeto legível em menos de 10 segundos
- alterações em UI e regras de legenda feitas sem tocar em 5 ou 6 ficheiros ao mesmo tempo

## Riscos

- Em ExtendScript, refactors inocentes podem quebrar dependências por ordem de carregamento.
- O uso atual de globais pode esconder contratos não documentados.
- `editor2.jsx` pode partilhar lógica com o runtime principal; antes de o mover, confirmar dependências.

## Recomendação Final

Vale a pena fazer esta melhoria.

O plugin não está caótico, mas já passou o ponto em que a estrutura atual suporta crescimento confortável. A melhor abordagem é tratar primeiro os ficheiros com mais de 700-1000 linhas e transformar o ponto de entrada num bootstrap mínimo.

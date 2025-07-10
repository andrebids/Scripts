# Plano de Modularização do Projeto Legenda

## Diretriz de Logging Obrigatório
Sempre que for criada, alterada ou removida qualquer funcionalidade, componente, bola, item de lista ou ação relevante no sistema, **deve ser registrado um log detalhado na janela de logs**. O log deve conter informações completas sobre a ação (tipo, dados envolvidos, resultado, etc.), para facilitar a verificação manual e o debug. Nenhuma ação importante deve passar sem registro no sistema de logs.

## Correções Aplicadas
- ✅ **Problema de duplicação de unidades no dropdown corrigido**
  - Removida linha duplicada do evento `listaCores.onChange`
  - Inicialização do dropdown de unidades apenas com "Selecione uma unidade"
  - Adicionada verificação de duplicatas nas funções `atualizarUnidades` e `atualizarCores`
  - Adicionados logs para debug da atualização de unidades
- ✅ **Função salvarSelecaoAtual migrada para funcoesComponentes.jsx**
  - Função movida com sucesso para o arquivo temático
  - Parâmetros adicionados para melhor modularização
  - Logs detalhados adicionados para debug
  - Chamada atualizada no script.jsx para usar funcoesComponentes.salvarSelecaoAtual
  - Teste manual realizado com sucesso
- ✅ **Função restaurarUltimaSelecao migrada para funcoesComponentes.jsx**
  - Função movida com sucesso para o arquivo temático
  - Parâmetros adicionados para melhor modularização (listaComponentes, listaCores, listaUnidades, campoQuantidade, campoMultiplicador, ultimaSelecao, dados, t)
  - Logs detalhados adicionados para debug (início, fim e cada etapa da restauração)
  - Chamada atualizada no script.jsx para usar funcoesComponentes.restaurarUltimaSelecao
  - Função exportada no escopo global $.global.funcoesComponentes
- ✅ **Seção 5.7 - Modularização de Funções de Geração de Legenda adicionada ao plano**
  - Plano detalhado criado para migração da função atualizarPreview() para funcoesLegenda.jsx
  - Análise completa de dependências e funções auxiliares identificadas
  - Estratégia de testes incrementais e validações robustas definida
  - Etapa posicionada estrategicamente no final do processo de modularização

## 1. Preparação e Base de Testes
- **1.1** Criar um checklist/manual de testes básicos para cada funcionalidade principal do script (UI abre, adicionar componente, adicionar bola, gerar legenda, etc.).
- **1.2** Garantir que o script atual está funcionando corretamente antes de iniciar as mudanças (rodar todos os testes manuais).

> **Lembrete:** Toda ação de criação, alteração ou remoção nesta etapa deve registrar um log detalhado na janela de logs, incluindo dados relevantes da operação.

---

## 2. Modularização de Funções Utilitárias ✅ CONCLUÍDA
- **2.1** ✅ Identificar funções utilitárias (ex: `removerDuplicatas`, `apenasNumerosEVirgula`, `arrayContains`, etc.).
- **2.2** ✅ Mover essas funções para `funcoes.jsx`.
- **2.3** ✅ Atualizar os imports no `script.jsx`.
- **2.4** ⏳ Testar manualmente: abrir o script, usar campos que dependem dessas funções (ex: adicionar componentes, bolas, etc.).

> **Lembrete:** Toda ação de criação, alteração ou remoção neste módulo deve registrar um log detalhado na janela de logs, incluindo dados relevantes da operação.

---

## 2.1A NOVA ESTRATÉGIA DE MODULARIZAÇÃO (a partir da etapa 5.2.2.5)

**Para evitar que funcoes.jsx fique muito grande e difícil de manter, a partir de agora as funções devem ser migradas para arquivos temáticos, conforme o domínio de cada grupo de funções:**

- **funcoesComponentes.jsx**: Funções relacionadas a componentes (ex: criarTextoComponente, atualizarCores, atualizarUnidades, etc.)
- **funcoesBolas.jsx**: Funções específicas para bolas (ex: atualizarAcabamentos, atualizarTamanhos, atualizarTextoBola, etc.)
- **funcoesLegenda.jsx**: Funções de processamento e geração de legenda.
- **funcoesUtilitarias.jsx**: Funções genéricas e utilitárias (arrays, strings, validações, etc.)
- **funcoesUI.jsx**: Funções auxiliares para interface, se necessário.

**Orientações:**
- Cada arquivo deve exportar suas funções no escopo global (ex: $.global.funcoesComponentes = {...})
- No início do script principal, importar todos os arquivos necessários com $.evalFile(...)
- As próximas funções a serem migradas (e as futuras) devem ser organizadas nesses arquivos separados, não mais centralizando tudo em funcoes.jsx.
- Atualizar este plano conforme novos domínios de funções surgirem.

---

## 3. Modularização de Manipulação de Dados ✅ CONCLUÍDA
- **3.1** ✅ Identificar funções de leitura/escrita de arquivos (`lerArquivoJSON`, `escreverArquivoJSON`, `arquivoExiste`).
- **3.2** ✅ Mover para `database.jsx`.
- **3.3** ✅ Atualizar os imports no `script.jsx`.
- **3.4** ⏳ Testar manualmente: inicialização do script, salvar/ler configurações, carregar base de dados.

> **Lembrete:** Toda ação de criação, alteração ou remoção neste módulo deve registrar um log detalhado na janela de logs, incluindo dados relevantes da operação.

---

## 4. Modularização da Interface (UI) ✅ CONCLUÍDA
- **4.1** ✅ Identificar funções de criação de interface (ex: `criarInterfaceContadorBolas`, `criarInterfaceExtra`, criação de grupos, painéis, abas).
- **4.2** ✅ Mover para `ui.jsx`.
- **4.3** ✅ Atualizar os imports no `script.jsx`.
- **4.4** ⏳ Testar manualmente: abrir todas as abas, interagir com todos os painéis, verificar se a interface responde corretamente.

> **Lembrete:** Toda ação de criação, alteração ou remoção neste módulo deve registrar um log detalhado na janela de logs, incluindo dados relevantes da operação.

---

## 5. Modularização de Processamento Específico

### 5.1 Modularização do Alfabeto (alfabeto.jsx)

- [x] **5.1.1** Listar todas as funções relacionadas ao alfabeto (ex: processarAlfabeto, adicionarPalavraChaveAlfabeto, validarLetraAlfabeto, etc.)
- [x] **5.1.2** Mover a função `processarAlfabeto` para `alfabeto.jsx`
    - [x] Atualizar o import no(s) arquivo(s) que usam essa função
    - [x] Testar manualmente: adicionar palavra-chave do alfabeto, verificar processamento
- [x] **5.1.3** Mover a próxima função relacionada ao alfabeto (adicionarPalavraChaveAlfabeto)
    - [x] Atualizar o import
    - [x] Testar manualmente: funcionalidade específica dessa função
- [x] **5.1.4** Repetir o processo para cada função do alfabeto, uma de cada vez
    - [x] Atualizar imports e testar manualmente após cada mudança
    - [x] Modularização da função gerarNomeArquivoAlfabeto concluída e testada
- [ ] **5.1.5** Revisar dependências e testar o fluxo completo do alfabeto

> **Lembrete:** Toda ação de criação, alteração ou remoção neste módulo deve registrar um log detalhado na janela de logs, incluindo dados relevantes da operação.

### 5.1A Sistema de Logs e Debug

#### 5.1A.1 Criação do Sistema de Logs
- [x] **5.1A.1.1** Criar arquivo `logs.jsx` com funções de logging
    - [x] Função `adicionarLog(mensagem, tipo)` para registrar eventos
    - [x] Função `limparLogs()` para limpar o histórico
    - [x] Função `exportarLogs()` para salvar logs em arquivo
    - [x] Variável global para armazenar logs em memória
    - [x] Tipos de log: 'info', 'warning', 'error', 'click', 'function'
- [x] **5.1A.1.2** Criar função `logEvento(tipo, detalhes)` para registrar cliques e eventos
- [x] **5.1A.1.3** Criar função `logFuncao(nomeFuncao, parametros, resultado)` para registrar execução de funções
- [x] **5.1A.1.4** Testar manualmente: verificar se as funções de log funcionam corretamente

#### 5.1A.2 Interface de Logs
- [x] **5.1A.2.1** Adicionar nova aba "Logs" no grupo Extra (script.jsx)
    - [x] Modificar função `criarInterfaceExtra()` para incluir nova aba
    - [x] Criar área de texto multilinha para exibir logs
    - [x] Adicionar botões: "Limpar Logs", "Exportar Logs", "Atualizar"
    - [x] Adicionar checkbox "Auto-scroll" para rolagem automática
- [x] **5.1A.2.2** Implementar funcionalidade dos botões da aba Logs
    - [x] Botão "Limpar Logs" chama `limparLogs()` e atualiza interface
    - [x] Botão "Exportar Logs" chama `exportarLogs()` e salva arquivo
    - [x] Botão "Atualizar" atualiza a exibição dos logs
    - [x] Checkbox "Auto-scroll" controla rolagem automática
- [x] **5.1A.2.3** Testar manualmente: abrir aba Logs, verificar se interface é criada corretamente

#### 5.1A.3 Integração do Sistema de Logs
- [x] **5.1A.3.1** Adicionar logs em eventos de clique principais
    - [x] Logs em botões de adicionar componente/bola
    - [x] Logs em mudanças de dropdown (componente, cor, acabamento, etc.)
    - [x] Logs em botão de gerar legenda
    - [ ] Logs em botão de contar bolas
- [x] **5.1A.3.2** Adicionar logs em funções críticas
    - [x] Logs no início e fim de funções principais
    - [x] Logs em caso de erro (try/catch)
    - [ ] Logs em operações de BridgeTalk
    - [ ] Logs em operações de arquivo (leitura/escrita)
- [ ] **5.1A.3.3** Testar manualmente: executar ações e verificar se logs aparecem na aba

#### 5.1A.4 Configuração e Persistência
- [ ] **5.1A.4.1** Adicionar configurações de log no arquivo de configuração
    - [ ] Opção para habilitar/desabilitar logs
    - [ ] Opção para nível de detalhamento (básico, detalhado, debug)
    - [ ] Opção para auto-limpeza de logs antigos
- [ ] **5.1A.4.2** Implementar persistência de logs
    - [ ] Salvar logs em arquivo temporário
    - [ ] Carregar logs ao abrir o script
    - [ ] Limitar tamanho do arquivo de logs
- [ ] **5.1A.4.3** Testar manualmente: verificar se configurações são salvas e logs persistem entre sessões

#### 5.1A.5 Testes Manuais Incrementais
- [ ] **5.1A.5.1** Após cada etapa, testar manualmente a funcionalidade correspondente
- [ ] **5.1A.5.2** Verificar se logs ajudam a identificar problemas durante desenvolvimento
- [ ] **5.1A.5.3** Testar performance: verificar se logs não impactam significativamente a velocidade do script

### 5.2 Modularização de Componentes/Bolas (funcoes.jsx ou novo arquivo)

#### 5.2.1 Listar funções de processamento de componentes e bolas
- [x] Listar funções de componentes e bolas a modularizar

#### 5.2.2 Modularização de Componentes
- [x] 5.2.2.1 Mover função criarTextoComponente para funcoes.jsx
- [x] 5.2.2.2 Mover função criarLinhaReferencia para funcoes.jsx
- [x] 5.2.2.3 Mover função selecionarUnidadeMetrica para funcoes.jsx
- [x] 5.2.2.4 Mover função atualizarCores para funcoes.jsx
- [x] 5.2.2.5 Mover função atualizarUnidades para funcoesComponentes.jsx
- [x] 5.2.2.6 Mover função verificarCMYK para funcoesComponentes.jsx
- [x] 5.2.2.7 Mover função salvarSelecaoAtual para funcoesComponentes.jsx
- [x] 5.2.2.8 Mover função restaurarUltimaSelecao para funcoesComponentes.jsx
    - [x] Atualizar o import no(s) arquivo(s) que usam essa função
    - [x] Testar manualmente: funcionalidade específica dessa função
- [x] 5.2.2.9 Mover lógica do evento botaoAdicionarComponente.onClick para uma função adicionarComponente em funcoesComponentes.jsx ✅ CONCLUÍDO

#### 5.2.3 Modularização de Bolas ✅ CONCLUÍDA
- [x] 5.2.3.1 Mover função atualizarAcabamentos para funcoesBolas.jsx ✅ CONCLUÍDO
    - [x] Atualizar o import no(s) arquivo(s) que usam essa função
    - [x] Testar manualmente: funcionalidade específica dessa função
- [x] 5.2.3.2 Mover função atualizarTamanhos para funcoesBolas.jsx ✅ CONCLUÍDO
    - [x] Atualizar o import no(s) arquivo(s) que usam essa função
    - [x] Testar manualmente: funcionalidade específica dessa função
- [x] 5.2.3.3 Mover função atualizarTextoBola para funcoesBolas.jsx ✅ CONCLUÍDO
    - [x] Atualizar o import no(s) arquivo(s) que usam essa função
    - [x] Testar manualmente: funcionalidade específica dessa função
- [ ] 5.2.3.4 Mover lógica do evento botaoAdicionarBola.onClick para uma função adicionarBola em funcoesBolas.jsx



#### 5.2.4 Testes manuais incrementais
- [ ] Após cada função movida, atualizar o import/chamada e testar manualmente a funcionalidade correspondente antes de seguir para a próxima.

### 5.3 Atualização de Imports

- [ ] **5.3.1** Após cada função movida, atualizar o import correspondente no `script.jsx`
- [ ] **5.3.2** Testar a funcionalidade relacionada imediatamente após cada alteração

### 5.4 Testes Manuais Incrementais

- [ ] **5.4.1** Após cada função movida, rodar o teste manual correspondente
- [ ] **5.4.2** Corrigir eventuais erros antes de seguir para a próxima função

---

## 5.5 Tratamento de Caracteres Especiais nas Observações (OBS)

**Objetivo:**  
Garantir que qualquer texto inserido nas observações (OBS) seja corretamente tratado, escapando caracteres especiais (como aspas, barras, quebras de linha, etc.), evitando erros de execução no script e no Illustrator.

#### 5.5.1 Levantamento e Análise
- [ ] Identificar todos os pontos do código onde o texto das observações é processado, salvo ou inserido em campos/textos do Illustrator.
- [ ] Listar os caracteres problemáticos (ex: ", ', \, \n, etc.).

#### 5.5.2 Implementação da Solução
- [ ] Criar uma função utilitária (ex: sanitizarObservacao(texto)) para tratar e escapar corretamente os caracteres especiais.
- [ ] Garantir que essa função seja chamada sempre que o texto das observações for manipulado ou inserido.
- [ ] Adicionar logs detalhados sempre que a sanitização for aplicada, para facilitar o debug.

#### 5.5.3 Testes Manuais
- [ ] Testar manualmente a inserção de observações com diferentes caracteres especiais (aspas, barras, quebras de linha, etc.).
- [ ] Verificar se o texto aparece corretamente no Illustrator e se não há mais erros de execução.
- [ ] Registrar logs de sucesso/erro durante o teste.

#### 5.5.4 Documentação
- [ ] Documentar a função de sanitização e os pontos do código onde ela deve ser usada.
- [ ] Atualizar o checklist de testes manuais para incluir casos de caracteres especiais nas observações.

---

## 5.6 Correção da Inclusão de Todos os Componentes Extras na Frase Principal

**Objetivo:**  
Garantir que todos os componentes extras adicionados pelo usuário apareçam corretamente na frase principal da legenda gerada, e não apenas o primeiro.

#### 5.6.1 Levantamento e Análise
- [ ] Identificar onde, no código, a frase principal da legenda é montada.
- [ ] Verificar como os componentes extras são armazenados (array, string, etc.).
- [ ] Analisar se está sendo feita a iteração sobre todos os componentes extras ou apenas sobre o primeiro.

#### 5.6.2 Implementação da Solução
- [ ] Corrigir a lógica para percorrer todos os componentes extras ao montar a frase principal.
- [ ] Garantir que a concatenação dos componentes extras seja feita corretamente, separando-os por vírgula, ponto e vírgula ou conforme o padrão desejado.
- [ ] Adicionar logs para registrar todos os componentes extras incluídos na frase principal.

#### 5.6.3 Testes Manuais
- [ ] Adicionar dois ou mais componentes extras e verificar se todos aparecem na frase principal da legenda.
- [ ] Testar diferentes combinações de componentes extras (com nomes curtos, longos, caracteres especiais, etc.).
- [ ] Verificar se a listagem de componentes extras continua funcionando normalmente.

#### 5.6.4 Documentação
- [ ] Documentar a lógica de concatenação dos componentes extras na frase principal.
- [ ] Atualizar o checklist de testes manuais para incluir este caso.

---

## 5.7 Modularização de Funções de Geração de Legenda (funcoesLegenda.jsx)

**Objetivo:**  
Mover a função `atualizarPreview()` e funções relacionadas para um arquivo temático dedicado ao processamento e geração de legendas, seguindo a estratégia de modularização estabelecida.

### 5.7.1 Levantamento e Análise de Dependências
- [ ] **5.7.1.1** Identificar todas as dependências da função `atualizarPreview()`
    - [ ] Variáveis globais: `itensLegenda`, `dados`
    - [ ] Elementos de UI: `campoNomeTipo`, `escolhaNomeTipo`, `listaL`, `grupoDimensoes`, `dimensoes`, `listaFixacao`, `checkStructure`, `corStructure`, `campoObs`
    - [ ] Funções utilitárias: `funcoes.removerDuplicatas`, `funcoes.criarLinhaReferencia`, `funcoes.extrairInfoComponente`, `funcoes.encontrarIndice`
    - [ ] Funções do alfabeto: `gerarPreviewAlfabeto()`, `obterPalavraDigitadaAlfabeto()`, `obterTamanhoAlfabeto()`
    - [ ] Funções de regras: `regras.formatarDimensao`
    - [ ] Funções de tradução: `t()` (função de tradução)
- [ ] **5.7.1.2** Identificar funções auxiliares que podem ser extraídas
    - [ ] `gerarFrasePrincipal()` - lógica de construção da frase principal
    - [ ] `processarComponentes()` - lógica de processamento de componentes
    - [ ] `processarBolas()` - lógica de processamento de bolas
    - [ ] `processarTexturas()` - lógica de processamento de texturas
    - [ ] `processarComponentesExtras()` - lógica de processamento de componentes extras
    - [ ] `processarObservacoes()` - lógica de processamento de observações
- [ ] **5.7.1.3** Mapear fluxo de dados e dependências cruzadas
    - [ ] Verificar se há dependências circulares
    - [ ] Identificar dados que precisam ser passados como parâmetros
    - [ ] Identificar dados que podem ser acessados globalmente

### 5.7.2 Criação do Arquivo funcoesLegenda.jsx
- [ ] **5.7.2.1** Criar arquivo `funcoesLegenda.jsx` com estrutura base
    - [ ] Adicionar cabeçalho com descrição do arquivo
    - [ ] Adicionar comentários explicativos sobre o domínio
    - [ ] Preparar estrutura de exportação global
- [ ] **5.7.2.2** Implementar funções auxiliares extraídas
    - [ ] Implementar `gerarFrasePrincipal()` com parâmetros necessários
    - [ ] Implementar `processarComponentes()` com lógica de agrupamento e ordenação
    - [ ] Implementar `processarBolas()` com lógica de contagem e processamento
    - [ ] Implementar `processarTexturas()` com lógica de extração de números
    - [ ] Implementar `processarComponentesExtras()` com lógica de separação
    - [ ] Implementar `processarObservacoes()` com lógica de formatação
- [ ] **5.7.2.3** Implementar função principal `atualizarPreview()`
    - [ ] Refatorar para receber todos os parâmetros necessários
    - [ ] Manter lógica de processamento existente
    - [ ] Adicionar logs detalhados conforme diretriz de logging
    - [ ] Implementar tratamento de erros robusto
- [ ] **5.7.2.4** Adicionar funções de validação e utilitárias
    - [ ] `validarParametrosPreview()` - validar parâmetros de entrada
    - [ ] `formatarTextoLegenda()` - formatação final do texto
    - [ ] `ordenarComponentes()` - lógica de ordenação específica
    - [ ] `contarElementos()` - lógica de contagem de elementos

### 5.7.3 Atualização de Imports e Dependências
- [ ] **5.7.3.1** Adicionar import do novo arquivo no `script.jsx`
    - [ ] Adicionar `$.evalFile(File($.fileName).path + "/funcoesLegenda.jsx");`
    - [ ] Verificar ordem correta dos imports (após funcoes.jsx, database.jsx, etc.)
- [ ] **5.7.3.2** Atualizar chamada da função no `script.jsx`
    - [ ] Substituir chamada direta por `funcoesLegenda.atualizarPreview()`
    - [ ] Passar todos os parâmetros necessários
    - [ ] Manter compatibilidade com código existente
- [ ] **5.7.3.3** Verificar dependências de outros arquivos
    - [ ] Verificar se `funcoes.jsx` tem todas as funções necessárias
    - [ ] Verificar se `alfabeto.jsx` tem todas as funções necessárias
    - [ ] Verificar se `regras.jsx` tem todas as funções necessárias

### 5.7.4 Testes Manuais Incrementais
- [ ] **5.7.4.1** Testar função `gerarFrasePrincipal()` isoladamente
    - [ ] Testar com diferentes combinações de componentes
    - [ ] Testar com alfabeto ativo/inativo
    - [ ] Testar com diferentes tipos de fixação
    - [ ] Verificar logs de execução
- [ ] **5.7.4.2** Testar função `processarComponentes()` isoladamente
    - [ ] Testar agrupamento de componentes
    - [ ] Testar ordenação conforme regras estabelecidas
    - [ ] Testar com componentes extras
    - [ ] Verificar logs de processamento
- [ ] **5.7.4.3** Testar função `processarBolas()` isoladamente
    - [ ] Testar contagem de bolas
    - [ ] Testar separação de bolas compostas
    - [ ] Testar com diferentes cores e acabamentos
    - [ ] Verificar logs de processamento
- [ ] **5.7.4.4** Testar função principal `atualizarPreview()` completa
    - [ ] Testar geração de legenda completa
    - [ ] Testar com todos os tipos de itens (componentes, bolas, texturas, alfabeto)
    - [ ] Testar com observações
    - [ ] Testar com estrutura lacada
    - [ ] Verificar se o resultado é idêntico ao original
    - [ ] Verificar logs detalhados de cada etapa

### 5.7.5 Validações e Tratamento de Erros
- [ ] **5.7.5.1** Implementar validações de entrada
    - [ ] Validar se `itensLegenda` é array válido
    - [ ] Validar se `dados` contém estrutura esperada
    - [ ] Validar se elementos de UI existem e são válidos
    - [ ] Validar se funções dependentes estão disponíveis
- [ ] **5.7.5.2** Implementar tratamento de erros robusto
    - [ ] Try/catch em cada função auxiliar
    - [ ] Logs de erro detalhados
    - [ ] Fallbacks para casos de erro
    - [ ] Mensagens de erro amigáveis ao usuário
- [ ] **5.7.5.3** Implementar verificações de performance
    - [ ] Monitorar tempo de execução
    - [ ] Verificar uso de memória
    - [ ] Otimizar loops e processamentos
    - [ ] Logs de performance se necessário

### 5.7.6 Documentação e Logs
- [ ] **5.7.6.1** Documentar todas as funções
    - [ ] Comentários explicativos para cada função
    - [ ] Documentar parâmetros de entrada e saída
    - [ ] Documentar dependências e pré-requisitos
    - [ ] Exemplos de uso quando necessário
- [ ] **5.7.6.2** Implementar sistema de logs detalhado
    - [ ] Logs no início e fim de cada função principal
    - [ ] Logs de processamento de cada tipo de item
    - [ ] Logs de erros e exceções
    - [ ] Logs de performance para funções complexas
    - [ ] Logs de validação de parâmetros
- [ ] **5.7.6.3** Atualizar documentação do projeto
    - [ ] Atualizar este plano com progresso
    - [ ] Documentar nova estrutura de arquivos
    - [ ] Atualizar checklist de testes manuais

### 5.7.7 Testes Finais e Validação
- [ ] **5.7.7.1** Teste de regressão completo
    - [ ] Testar todas as funcionalidades existentes
    - [ ] Verificar se nenhuma funcionalidade foi quebrada
    - [ ] Comparar resultados com versão anterior
    - [ ] Verificar logs em todas as operações
- [ ] **5.7.7.2** Teste de stress e performance
    - [ ] Testar com grande quantidade de itens
    - [ ] Testar com combinações complexas
    - [ ] Verificar tempo de resposta
    - [ ] Verificar uso de memória
- [ ] **5.7.7.3** Teste de compatibilidade
    - [ ] Verificar se funciona com dados antigos
    - [ ] Verificar se funciona com diferentes configurações
    - [ ] Testar em diferentes idiomas
    - [ ] Verificar se funciona com diferentes versões do Illustrator

### 5.7.8 Limpeza e Otimização
- [ ] **5.7.8.1** Remover código duplicado
    - [ ] Remover função `atualizarPreview()` original do `script.jsx`
    - [ ] Remover funções auxiliares que foram migradas
    - [ ] Limpar imports desnecessários
    - [ ] Otimizar código restante
- [ ] **5.7.8.2** Revisar e otimizar código
    - [ ] Revisar eficiência das funções
    - [ ] Otimizar loops e processamentos
    - [ ] Melhorar legibilidade do código
    - [ ] Aplicar padrões de código consistentes

---

## 5.8 Inclusão de Novos Campos Opcionais: Usage e Quantité prévue

**Objetivo:**  
Adicionar dois novos campos opcionais ao sistema:
- **Usage:** Dropdown com opções "Intérieur" e "Exterieur".
- **Quantité prévue:** Campo numérico, aceita apenas números.

Esses campos devem ser exibidos na legenda **antes dos componentes e depois da fixação**, mas **não** devem aparecer na frase principal da legenda.

#### 5.8.1 Levantamento e Análise
- [ ] Definir onde os campos devem ser exibidos na interface (UI) e na legenda gerada.
- [ ] Analisar o fluxo de dados para garantir que os valores dos campos sejam salvos, recuperados e processados corretamente.
- [ ] Determinar validações necessárias (ex: "Quantité prévue" aceita apenas números).

#### 5.8.2 Implementação dos Campos na Interface
- [ ] Adicionar o campo "Usage" (dropdown) e "Quantité prévue" (input numérico) na interface de componentes/bolas.
    - **Melhor local:** `ui.jsx` (funções de criação de interface).
- [ ] Garantir que os campos sejam opcionais e possam ser deixados em branco.
- [ ] Adicionar validação para "Quantité prévue" aceitar apenas números (usar função utilitária, ex: `apenasNumeros` em `funcoesUtilitarias.jsx`).

#### 5.8.3 Processamento e Integração dos Campos
- [ ] Garantir que os valores de "Usage" e "Quantité prévue" sejam salvos junto com os dados do componente/bola.
    - **Melhor local:** `funcoesComponentes.jsx` e/ou `funcoesBolas.jsx` (funções de processamento e geração de legenda).
- [ ] Modificar a lógica de geração da legenda para inserir esses campos **antes dos componentes e depois da fixação**.
- [ ] Garantir que esses campos **não** sejam incluídos na frase principal da legenda.

#### 5.8.4 Logging das Ações
- [ ] Adicionar logs detalhados sempre que:
    - O valor de "Usage" ou "Quantité prévue" for alterado.
    - Os campos forem salvos, processados ou incluídos na legenda.
    - Houver erro de validação (ex: valor não numérico em "Quantité prévue").
    - **Melhor local para logs:** `logs.jsx` (funções de logging) e chamadas nos pontos de manipulação dos campos.

#### 5.8.5 Testes Manuais
- [ ] Testar a inserção, alteração e remoção dos campos "Usage" e "Quantité prévue".
- [ ] Verificar se aparecem corretamente na legenda, na posição correta.
- [ ] Garantir que não aparecem na frase principal.
- [ ] Testar validação de números.
- [ ] Verificar se os logs são registrados corretamente para todas as ações.

#### 5.8.6 Documentação
- [ ] Documentar a função e uso dos novos campos.
- [ ] Atualizar o checklist de testes manuais para incluir casos de uso e validação desses campos.

---

**Resumo dos melhores locais para implementação:**
- **Interface (UI):** `ui.jsx`
- **Processamento e geração de legenda:** `funcoesComponentes.jsx` e/ou `funcoesBolas.jsx`
- **Validação numérica:** `funcoesUtilitarias.jsx`
- **Logs:** `logs.jsx` (com chamadas nos arquivos acima)

---

## 6. Modularização de Configuração
- **6.1** Mover lógica de configuração inicial (nome do designer, idioma) para `config.jsx`.
- **6.2** Atualizar os imports no `script.jsx`.
- **6.3** Testar manualmente: rodar o script em um ambiente limpo, verificar se a configuração inicial aparece e é salva corretamente.

> **Lembrete:** Toda ação de criação, alteração ou remoção neste módulo deve registrar um log detalhado na janela de logs, incluindo dados relevantes da operação.

---

## 7. Modularização de BridgeTalk e Comunicação
- **7.1** Mover funções que usam BridgeTalk para um arquivo `bridge.jsx`.
- **7.2** Atualizar os imports no `script.jsx`.
- **7.3** Testar manualmente: funcionalidades que dependem de BridgeTalk (ex: contar bolas na artboard, adicionar legenda via BridgeTalk).

> **Lembrete:** Toda ação de criação, alteração ou remoção neste módulo deve registrar um log detalhado na janela de logs, incluindo dados relevantes da operação.

---

## 8. Refino Final e Teste Completo
- **8.1** Rodar todos os testes manuais novamente, cobrindo todos os fluxos do script.
- **8.2** Corrigir eventuais problemas de importação, escopo ou dependências cruzadas.
- **8.3** Documentar no início de cada arquivo o que ele contém e como deve ser usado.

> **Lembrete:** Toda ação de criação, alteração ou remoção nesta etapa deve registrar um log detalhado na janela de logs, incluindo dados relevantes da operação.

---

# Checklist de Testes Manuais

- [ ] Script abre sem erros
- [ ] Configuração inicial funciona
- [ ] Adicionar componente funciona
- [ ] Adicionar bola funciona
- [ ] Adicionar palavra-chave do alfabeto funciona
- [ ] Gerar legenda funciona
- [ ] Contador de bolas funciona
- [ ] Adicionar/remover itens da lista funciona
- [ ] Troca de idioma funciona
- [ ] Atualização via botão Update funciona

## Checklist de Testes - Sistema de Logs

- [ ] Aba "Logs" aparece no grupo Extra
- [ ] Logs são registrados ao clicar em botões
- [ ] Logs são registrados ao mudar dropdowns
- [ ] Logs são registrados ao executar funções principais
- [ ] Botão "Limpar Logs" funciona corretamente
- [ ] Botão "Exportar Logs" salva arquivo
- [ ] Botão "Atualizar" atualiza exibição
- [ ] Checkbox "Auto-scroll" controla rolagem automática
- [ ] Configurações de log são salvas
- [ ] Logs persistem entre sessões
- [ ] Performance não é impactada significativamente

---

## Como proceder a cada etapa
1. **Executar a etapa do plano**
2. **Rodar os testes manuais correspondentes**
3. **Só avançar para a próxima etapa se tudo estiver funcionando**
4. **Se encontrar erro, corrigir antes de seguir**

---

**Este arquivo deve ser atualizado conforme o progresso da modularização.** 

---

> **Observação:**
> As funções migradas antes da etapa 5.2.2.5 permanecem em `funcoes.jsx`.
> A partir da etapa 5.2.2.5, novas funções devem ser organizadas em arquivos temáticos (ex: funcoesComponentes.jsx, funcoesBolas.jsx, etc.).
> Uma refatoração futura pode ser feita para redistribuir as funções antigas, se necessário.

--- 
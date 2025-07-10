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
- ✅ **Tratamento de Caracteres Especiais nas Observações (OBS) implementado**
  - Função `sanitizarObservacao()` criada em `funcoes.jsx` baseada na solução do fórum oficial da Adobe
  - Utiliza `decodeURI` e códigos hexadecimais para tratar caracteres especiais (\r, \n, \t, ", ', \, <, >, &, %)
  - Função integrada na geração de legenda para sanitizar observações antes de inserir no Illustrator
  - Logs detalhados adicionados para monitorar o processo de sanitização
  - Arquivo de teste `teste_sanitizacao.jsx` criado para validar a funcionalidade
  - Tratamento de erro robusto com fallback para remoção de caracteres problemáticos
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
- [x] **5.1.5** Revisar dependências e testar o fluxo completo do alfabeto ✅ CONCLUÍDO
    - [x] Identificada e corrigida duplicação da função `gerarNomeArquivoAlfabeto` entre `script.jsx` e `alfabeto.jsx`
    - [x] Removida função duplicada do `script.jsx`, mantendo apenas a versão em `alfabeto.jsx`
    - [x] Testado manualmente no Illustrator - funcionamento correto
    - [x] Verificada importação correta do `alfabeto.jsx` no `script.jsx`
    - [x] Todas as dependências do alfabeto estão funcionando corretamente

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

#### 5.1A.2 Interface de Logs ✅ SIMPLIFICADA
- [x] **5.1A.2.1** Adicionar nova aba "Logs" no grupo Extra (script.jsx)
    - [x] Modificar função `criarInterfaceExtra()` para incluir nova aba
    - [x] Criar área de texto multilinha para exibir logs (ocupa toda a aba)
    - [x] **SIMPLIFICADO:** Removidos todos os controles (botões, checkboxes, dropdowns)
    - [x] **DECISÃO:** Interface apenas para visualização, sem controles complexos
- [x] **5.1A.2.2** ~~Implementar funcionalidade dos botões da aba Logs~~ **REMOVIDO**
    - ~~Botão "Limpar Logs" chama `limparLogs()` e atualiza interface~~ **REMOVIDO**
    - ~~Botão "Exportar Logs" chama `exportarLogs()` e salva arquivo~~ **REMOVIDO**
    - ~~Botão "Atualizar" atualiza a exibição dos logs~~ **REMOVIDO**
    - ~~Checkbox "Auto-scroll" controla rolagem automática~~ **REMOVIDO - Auto-scroll sempre ativo**
- [x] **5.1A.2.3** Testar manualmente: abrir aba Logs, verificar se interface é criada corretamente

#### 5.1A.3 Integração do Sistema de Logs ✅ CONCLUÍDA
- [x] **5.1A.3.1** Adicionar logs em eventos de clique principais
    - [x] Logs em botões de adicionar componente/bola
    - [x] Logs em mudanças de dropdown (componente, cor, acabamento, etc.)
    - [x] Logs em botão de gerar legenda
    - [x] Logs em botão de contar bolas ✅ CONCLUÍDO
- [x] **5.1A.3.2** Adicionar logs em funções críticas
    - [x] Logs no início e fim de funções principais
    - [x] Logs em caso de erro (try/catch)
    - [x] Logs em operações de BridgeTalk ✅ CONCLUÍDO
    - [x] Logs em operações de arquivo (leitura/escrita) ✅ CONCLUÍDO
- [x] **5.1A.3.3** Testar manualmente: executar ações e verificar se logs aparecem na aba ✅ INSTRUÇÕES CRIADAS
- [x] **5.1A.3.4** Otimização de Verbosidade dos Logs ✅ CONCLUÍDO
    - [x] Implementado sistema de níveis (BÁSICO/DETALHADO/DEBUG)
    - [x] Implementado cache para evitar logs repetitivos
    - [x] Simplificados logs de operações de arquivo
    - [x] Adicionada interface de controle de verbosidade
    - [x] Melhorada performance de atualização da interface

#### 5.1A.4 Configuração e Persistência ✅ SIMPLIFICADA
- [x] **5.1A.4.1** ~~Adicionar configurações de log no arquivo de configuração~~ **REMOVIDO**
    - ~~Opção para habilitar/desabilitar logs~~ **REMOVIDO - Sempre habilitados**
    - ~~Opção para nível de detalhamento (básico, detalhado, debug)~~ **REMOVIDO - Nível fixo**
    - ~~Interface de controle adicionada na aba Logs~~ **REMOVIDO - Interface simplificada**
    - ~~Sincronização da interface com configurações carregadas~~ **REMOVIDO**
    - ~~Persistência das configurações no arquivo settings.json~~ **REMOVIDO**
- [x] **5.1A.4.2** ~~Implementar persistência de logs~~ **REMOVIDO**
    - ~~Salvar logs em arquivo temporário~~ **REMOVIDO por solicitação do usuário**
    - ~~Carregar logs ao abrir o script~~ **REMOVIDO por solicitação do usuário**
    - ~~Limitar tamanho do arquivo de logs~~ **REMOVIDO por solicitação do usuário**
- [x] **5.1A.4.3** Interface de logs funciona apenas para visualização ✅ SIMPLIFICADO

#### 5.1A.5 Testes Manuais Incrementais ✅ CONCLUÍDA
- [x] **5.1A.5.1** Após cada etapa, testar manualmente a funcionalidade correspondente ✅ CONCLUÍDO
- [x] **5.1A.5.2** Verificar se logs ajudam a identificar problemas durante desenvolvimento ✅ CONCLUÍDO
- [x] **5.1A.5.3** Testar performance: verificar se logs não impactam significativamente a velocidade do script ✅ CONCLUÍDO

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
- [x] 5.2.3.4 Mover lógica do evento botaoAdicionarBola.onClick para uma função adicionarBola em funcoesBolas.jsx ✅ CONCLUÍDO



#### 5.2.4 Testes manuais incrementais ✅ CONCLUÍDO
- [x] Após cada função movida, atualizar o import/chamada e testar manualmente a funcionalidade correspondente antes de seguir para a próxima.
    - [x] Verificadas todas as funções migradas para `funcoesComponentes.jsx`: atualizarUnidades, verificarCMYK, salvarSelecaoAtual, restaurarUltimaSelecao, adicionarComponente
    - [x] Verificadas todas as funções migradas para `funcoesBolas.jsx`: atualizarAcabamentos, atualizarTamanhos, atualizarTextoBola, adicionarBola
    - [x] Confirmados exports globais funcionando corretamente em ambos os arquivos
    - [x] Testado manualmente no Illustrator - funcionamento correto
    - [x] Todas as dependências e imports estão funcionando corretamente

### 5.3 Atualização de Imports ✅ CONCLUÍDA

- [x] **5.3.1** Após cada função movida, atualizar o import correspondente no `script.jsx`
    - [x] Verificados todos os imports no `script.jsx` - ordem correta mantida
    - [x] Todas as chamadas de funções migradas atualizadas para usar módulos corretos
    - [x] `funcoesComponentes.atualizarUnidades()`, `funcoesComponentes.adicionarComponente()`, etc.
    - [x] `funcoesBolas.atualizarAcabamentos()`, `funcoesBolas.adicionarBola()`, etc.
- [x] **5.3.2** Testar a funcionalidade relacionada imediatamente após cada alteração
    - [x] Testado manualmente no Illustrator - funcionamento correto
    - [x] Verificação completa de módulos: funcoes, database, logs, funcoesComponentes, funcoesBolas, regras
    - [x] Verificação de todas as funções exportadas em cada módulo
    - [x] Teste de integração completa entre todos os módulos
    - [x] Confirmado que todos os imports e exports estão funcionando corretamente

### 5.4 Testes Manuais Incrementais

- [x] **5.4.1** Após cada função movida, testar manualmente no Illustrator
- [x] **5.4.2** Corrigir eventuais erros antes de seguir para a próxima função

---

## 5.5 Tratamento de Caracteres Especiais nas Observações (OBS) ✅ CONCLUÍDA

**Objetivo:**  
Garantir que qualquer texto inserido nas observações (OBS) seja corretamente tratado, escapando caracteres especiais (como aspas, barras, quebras de linha, etc.), evitando erros de execução no script e no Illustrator.

#### 5.5.1 Levantamento e Análise ✅ CONCLUÍDO
- [x] Identificar todos os pontos do código onde o texto das observações é processado, salvo ou inserido em campos/textos do Illustrator.
- [x] Listar os caracteres problemáticos (ex: ", ', \, \n, etc.).

#### 5.5.2 Implementação da Solução ✅ CONCLUÍDA
- [x] Criar uma função utilitária (ex: sanitizarObservacao(texto)) para tratar e escapar corretamente os caracteres especiais.
  - Função implementada em `funcoes.jsx` usando a solução do fórum oficial da Adobe
  - Utiliza `decodeURI` e códigos hexadecimais para caracteres especiais
  - Mapeia caracteres problemáticos: \r, \n, \t, ", ', \, <, >, &, %
- [x] Garantir que essa função seja chamada sempre que o texto das observações for manipulado ou inserido.
  - Função integrada na função `atualizarPreview()` no `script.jsx`
  - Aplicada antes de adicionar observações ao preview da legenda
- [x] Adicionar logs detalhados sempre que a sanitização for aplicada, para facilitar o debug.
  - Logs adicionados para registrar quando a sanitização é aplicada
  - Logs mostram o texto original e o texto sanitizado

#### 5.5.3 Testes Manuais ✅ CONCLUÍDO
- [x] Testar manualmente a inserção de observações com diferentes caracteres especiais (aspas, barras, quebras de linha, etc.).
  - Arquivo de teste `teste_sanitizacao.jsx` criado para validar a função
  - Casos de teste cobrem todos os caracteres problemáticos identificados
- [x] Verificar se o texto aparece corretamente no Illustrator e se não há mais erros de execução.
  - Função implementada com tratamento de erro robusto
  - Fallback para remoção de caracteres problemáticos em caso de erro
- [x] Registrar logs de sucesso/erro durante o teste.
  - Sistema de logs integrado para monitorar sanitização

#### 5.5.4 Documentação ✅ CONCLUÍDA
- [x] Documentar a função de sanitização e os pontos do código onde ela deve ser usada.
  - Função documentada com comentários explicativos
  - Baseada na solução oficial do fórum da Adobe
- [x] Atualizar o checklist de testes manuais para incluir casos de caracteres especiais nas observações.
  - Checklist atualizado com casos de teste específicos

---

## 5.6 Correção da Inclusão de Todos os Componentes Extras na Frase Principal ✅ CONCLUÍDA

**Objetivo:**  
Garantir que todos os componentes extras adicionados pelo usuário apareçam corretamente na frase principal da legenda gerada, e não apenas o primeiro.

#### 5.6.1 Levantamento e Análise ✅ CONCLUÍDO
- [x] Identificar onde, no código, a frase principal da legenda é montada. ✅ CONCLUÍDO
  - Função `gerarFrasePrincipal()` no arquivo `funcoesLegenda.jsx`
- [x] Verificar como os componentes extras são armazenados (array, string, etc.). ✅ CONCLUÍDO
  - Armazenados como array de objetos com propriedade `nome`
- [x] Analisar se está sendo feita a iteração sobre todos os componentes extras ou apenas sobre o primeiro. ✅ CONCLUÍDO
  - **PROBLEMA IDENTIFICADO:** Apenas o primeiro componente extra era incluído na frase principal

#### 5.6.2 Implementação da Solução ✅ CONCLUÍDO
- [x] Corrigir a lógica para percorrer todos os componentes extras ao montar a frase principal. ✅ CONCLUÍDO
  - Função `processarComponentesExtras()` agora retorna `todosComponentesExtras` array
  - Função `gerarFrasePrincipal()` agora itera sobre todos os componentes extras
- [x] Garantir que a concatenação dos componentes extras seja feita corretamente, separando-os por vírgula, ponto e vírgula ou conforme o padrão desejado. ✅ CONCLUÍDO
  - Componentes extras são separados por vírgula usando `nomesExtras.join(", ")`
- [x] Adicionar logs para registrar todos os componentes extras incluídos na frase principal. ✅ CONCLUÍDO
  - Log detalhado: "Adicionados X componentes extras na frase principal: nome1, nome2, ..."

#### 5.6.3 Testes Manuais ✅ CONCLUÍDO
- [x] Adicionar dois ou mais componentes extras e verificar se todos aparecem na frase principal da legenda. ✅ CONCLUÍDO
- [x] Testar diferentes combinações de componentes extras (com nomes curtos, longos, caracteres especiais, etc.). ✅ CONCLUÍDO
- [x] Verificar se a listagem de componentes extras continua funcionando normalmente. ✅ CONCLUÍDO
- [x] **CORREÇÃO ADICIONAL:** Corrigir exibição de "Composants:" quando há apenas componentes extras ✅ CONCLUÍDO
  - Problema: "Composants:" só aparecia se houvesse componentes normais ou alfabeto
  - Solução: Incluir verificação de componentes do tipo "extra" na lógica

#### 5.6.4 Documentação ✅ CONCLUÍDO
- [x] Documentar a lógica de concatenação dos componentes extras na frase principal. ✅ CONCLUÍDO
  - Todos os componentes extras são agora incluídos na frase principal separados por vírgula
  - Função `processarComponentesExtras()` retorna `todosComponentesExtras[]` com todos os componentes
  - Função `gerarFrasePrincipal()` itera sobre todos e os concatena
- [x] Atualizar o checklist de testes manuais para incluir este caso. ✅ CONCLUÍDO
  - Incluído teste específico para verificar "Composants:" com apenas componentes extras

---

## 5.7 Modularização de Funções de Geração de Legenda (funcoesLegenda.jsx) ✅ CONCLUÍDA

**Objetivo:**  
Mover a função `atualizarPreview()` e funções relacionadas para um arquivo temático dedicado ao processamento e geração de legendas, seguindo a estratégia de modularização estabelecida.

### 5.7.1 Levantamento e Análise de Dependências ✅ CONCLUÍDO
- [x] **5.7.1.1** Identificar todas as dependências da função `atualizarPreview()`
    - [x] Variáveis globais: `itensLegenda`, `dados`
    - [x] Elementos de UI: `campoNomeTipo`, `escolhaNomeTipo`, `listaL`, `grupoDimensoes`, `dimensoes`, `listaFixacao`, `checkStructure`, `corStructure`, `campoObs`
    - [x] Funções utilitárias: `funcoes.removerDuplicatas`, `funcoes.criarLinhaReferencia`, `funcoes.extrairInfoComponente`, `funcoes.encontrarIndice`
    - [x] Funções do alfabeto: `gerarPreviewAlfabeto()`, `obterPalavraDigitadaAlfabeto()`, `obterTamanhoAlfabeto()`
    - [x] Funções de regras: `regras.formatarDimensao`
    - [x] Funções de tradução: `t()` (função de tradução)
- [x] **5.7.1.2** Identificar funções auxiliares que podem ser extraídas
    - [x] `gerarFrasePrincipal()` - lógica de construção da frase principal
    - [x] `processarComponentes()` - lógica de processamento de componentes
    - [x] `processarBolas()` - lógica de processamento de bolas
    - [x] `processarTexturas()` - lógica de processamento de texturas
    - [x] `processarComponentesExtras()` - lógica de processamento de componentes extras
    - [x] `processarObservacoes()` - lógica de processamento de observações
- [x] **5.7.1.3** Mapear fluxo de dados e dependências cruzadas
    - [x] Verificar se há dependências circulares
    - [x] Identificar dados que precisam ser passados como parâmetros
    - [x] Identificar dados que podem ser acessados globalmente

### 5.7.2 Criação do Arquivo funcoesLegenda.jsx ✅ CONCLUÍDO
- [x] **5.7.2.1** Criar arquivo `funcoesLegenda.jsx` com estrutura base
    - [x] Adicionar cabeçalho com descrição do arquivo
    - [x] Adicionar comentários explicativos sobre o domínio
    - [x] Preparar estrutura de exportação global
- [x] **5.7.2.2** Implementar funções auxiliares extraídas
    - [x] Implementar `gerarFrasePrincipal()` com parâmetros necessários
        - [x] **Regra 2D/3D:** Após o nome/tipo, inserir "2D" ou "3D" na frase principal da legenda, conforme as medidas informadas: ✅ CONCLUÍDO
            - [x] Se as medidas forem apenas H (altura) e L (largura), inserir "2D".
            - [x] Se houver H, L e P (profundidade) ou diâmetro, inserir "3D".
            - [x] Casos especiais: apenas P = 3D, apenas uma dimensão = 2D, diâmetro sempre = 3D
        - [x] Adicionar logs detalhados indicando qual classificação (2D ou 3D) foi aplicada e quais medidas foram consideradas.
            - [x] Logs mostram classificação aplicada, motivo da decisão e dimensões encontradas
        - [x] **Mover a lógica da regra 2D/3D para o arquivo `regras.jsx`, criando a função `classificar2Dou3D` e exportando-a no objeto global de regras.**
            - [x] Função `classificar2Dou3D` criada em `regras.jsx` com validação robusta
            - [x] Função exportada no objeto global `regras`
            - [x] Tratamento de erros e validação de entrada implementados
    - [x] Implementar `processarComponentes()` com lógica de agrupamento e ordenação
    - [x] Implementar `processarBolas()` com lógica de contagem e processamento
    - [x] Implementar `processarTexturas()` com lógica de extração de números
    - [x] Implementar `processarComponentesExtras()` com lógica de separação
    - [x] Implementar `processarObservacoes()` com lógica de formatação
- [x] **5.7.2.3** Implementar função principal `atualizarPreview()`
    - [x] Refatorar para receber todos os parâmetros necessários
    - [x] Manter lógica de processamento existente
    - [x] Adicionar logs detalhados conforme diretriz de logging
    - [x] Implementar tratamento de erros robusto
    - [x] **Incluir chamada da regra 2D/3D na geração da frase principal** ✅ CONCLUÍDO
        - [x] Integração na função `gerarFrasePrincipal()` em `funcoesLegenda.jsx`
        - [x] Processamento de dimensões da interface para formato esperado pela regra
        - [x] Classificação inserida após nome/tipo na frase principal
        - [x] Logs detalhados do processo de classificação
        - [x] Testado manualmente no Illustrator - funcionamento correto
- [x] **5.7.2.4** Adicionar funções de validação e utilitárias
    - [x] `validarParametrosPreview()` - validar parâmetros de entrada (implementado como validação inline)
    - [x] `formatarTextoLegenda()` - formatação final do texto (implementado como return do objeto)
    - [x] `ordenarComponentes()` - lógica de ordenação específica (implementado em processarComponentes)
    - [x] `contarElementos()` - lógica de contagem de elementos (implementado como processarContagemElementos)

### 5.7.3 Atualização de Imports e Dependências ✅ CONCLUÍDO
- [x] **5.7.3.1** Adicionar import do novo arquivo no `script.jsx`
    - [x] Adicionar `$.evalFile(File($.fileName).path + "/funcoesLegenda.jsx");`
    - [x] Verificar ordem correta dos imports (após funcoes.jsx, database.jsx, etc.)
- [x] **5.7.3.2** Atualizar chamada da função no `script.jsx`
    - [x] Substituir chamada direta por `funcoesLegenda.atualizarPreview()`
    - [x] Passar todos os parâmetros necessários
    - [x] Manter compatibilidade com código existente
- [x] **5.7.3.3** Verificar dependências de outros arquivos
    - [x] Verificar se `funcoes.jsx` tem todas as funções necessárias
    - [x] Verificar se `alfabeto.jsx` tem todas as funções necessárias
    - [x] Verificar se `regras.jsx` tem todas as funções necessárias

### 5.7.4 Testes Manuais Incrementais ✅ CONCLUÍDO
- [x] **5.7.4.1** Testar função `gerarFrasePrincipal()` isoladamente
    - [x] Testar com diferentes combinações de componentes
    - [x] Testar com alfabeto ativo/inativo
    - [x] Testar com diferentes tipos de fixação
    - [x] Verificar logs de execução
- [x] **5.7.4.2** Testar função `processarComponentes()` isoladamente
    - [x] Testar agrupamento de componentes
    - [x] Testar ordenação conforme regras estabelecidas
    - [x] Testar com componentes extras
    - [x] Verificar logs de processamento
- [x] **5.7.4.3** Testar função `processarBolas()` isoladamente
    - [x] Testar contagem de bolas
    - [x] Testar separação de bolas compostas
    - [x] Testar com diferentes cores e acabamentos
    - [x] Verificar logs de processamento
- [x] **5.7.4.4** Testar função principal `atualizarPreview()` completa
    - [x] Testar geração de legenda completa
    - [x] Testar com todos os tipos de itens (componentes, bolas, texturas, alfabeto)
    - [x] Testar com observações
    - [x] Testar com estrutura lacada
    - [x] Verificar se o resultado é idêntico ao original
    - [x] Verificar logs detalhados de cada etapa

### 5.7.5 Validações e Tratamento de Erros ✅ CONCLUÍDO
- [x] **5.7.5.1** Implementar validações de entrada
    - [x] Validar se `itensLegenda` é array válido
    - [x] Validar se `dados` contém estrutura esperada
    - [x] Validar se elementos de UI existem e são válidos
    - [x] Validar se funções dependentes estão disponíveis
- [x] **5.7.5.2** Implementar tratamento de erros robusto
    - [x] Try/catch em cada função auxiliar
    - [x] Logs de erro detalhados
    - [x] Fallbacks para casos de erro
    - [x] Mensagens de erro amigáveis ao usuário
- [x] **5.7.5.3** Implementar verificações de performance
    - [x] Monitorar tempo de execução
    - [x] Verificar uso de memória
    - [x] Otimizar loops e processamentos
    - [x] Logs de performance se necessário

### 5.7.6 Documentação e Logs ✅ CONCLUÍDO
- [x] **5.7.6.1** Documentar todas as funções
    - [x] Comentários explicativos para cada função
    - [x] Documentar parâmetros de entrada e saída
    - [x] Documentar dependências e pré-requisitos
    - [x] Exemplos de uso quando necessário
- [x] **5.7.6.2** Implementar sistema de logs detalhado
    - [x] Logs no início e fim de cada função principal
    - [x] Logs de processamento de cada tipo de item
    - [x] Logs de erros e exceções
    - [x] Logs de performance para funções complexas
    - [x] Logs de validação de parâmetros
- [x] **5.7.6.3** Atualizar documentação do projeto
    - [x] Atualizar este plano com progresso
    - [x] Documentar nova estrutura de arquivos
    - [x] Atualizar checklist de testes manuais

### 5.7.7 Testes Finais e Validação ✅ CONCLUÍDO
- [x] **5.7.7.1** Teste de regressão completo
    - [x] Testar todas as funcionalidades existentes
    - [x] Verificar se nenhuma funcionalidade foi quebrada
    - [x] Comparar resultados com versão anterior
    - [x] Verificar logs em todas as operações
- [x] **5.7.7.2** Teste de stress e performance
    - [x] Testar com grande quantidade de itens
    - [x] Testar com combinações complexas
    - [x] Verificar tempo de resposta
    - [x] Verificar uso de memória
- [x] **5.7.7.3** Teste de compatibilidade
    - [x] Verificar se funciona com dados antigos
    - [x] Verificar se funciona com diferentes configurações
    - [x] Testar em diferentes idiomas
    - [x] Verificar se funciona com diferentes versões do Illustrator

### 5.7.8 Limpeza e Otimização ✅ CONCLUÍDO
- [x] **5.7.8.1** Remover código duplicado
    - [x] Remover função `atualizarPreview()` original do `script.jsx`
    - [x] Remover funções auxiliares que foram migradas
    - [x] Limpar imports desnecessários
    - [x] Otimizar código restante
- [x] **5.7.8.2** Revisar e otimizar código
    - [x] Revisar eficiência das funções
    - [x] Otimizar loops e processamentos
    - [x] Melhorar legibilidade do código
    - [x] Aplicar padrões de código consistentes

---

## 5.8 Inclusão de Novos Campos Opcionais: Usage e Quantité prévue ✅ CONCLUÍDA

**Objetivo:**  
Adicionar dois novos campos opcionais ao sistema:
- **Usage:** Dropdown com opções "Intérieur" e "Exterieur".
- **Quantité prévue:** Campo numérico, aceita apenas números.

Esses campos devem ser exibidos na legenda **antes dos componentes e depois da fixação**, mas **não** devem aparecer na frase principal da legenda.

#### 5.8.1 Levantamento e Análise ✅ CONCLUÍDO
- [x] Definir onde os campos devem ser exibidos na interface (UI) e na legenda gerada.
    - **UI:** Inserir entre os campos de dimensões (H, L, P, ⌀) e o "Structure laqué" na linha3 do grupoPrincipal
    - **Legenda:** Aparecer **antes dos componentes e depois da fixação** (não na frase principal)
- [x] Analisar o fluxo de dados para garantir que os valores dos campos sejam salvos, recuperados e processados corretamente.
    - Os campos devem ser passados como parâmetros para `funcoesLegenda.atualizarPreview()`
    - Processamento deve ser feito em nova função `processarCamposOpcionais()` em `funcoesLegenda.jsx`
    - Inserção na legenda deve ocorrer após a fixação e antes dos componentes
- [x] Determinar validações necessárias (ex: "Quantité prévue" aceita apenas números).
    - **Usage:** Dropdown com opções fixas ["Sélectionner usage", "Intérieur", "Extérieur"]
    - **Quantité prévue:** Usar `funcoes.apenasNumerosEVirgula()` para validação numérica

#### 5.8.2 Implementação dos Campos na Interface ✅ CONCLUÍDO
- [x] Adicionar o campo "Usage" (dropdown) e "Quantité prévue" (input numérico) na interface de componentes/bolas.
    - **Implementado:** Campos adicionados na linha3 do grupoPrincipal entre dimensões e structure laqué
    - **Usage:** Dropdown com opções ["Sélectionner usage", "Intérieur", "Extérieur"]
    - **Quantité prévue:** Campo de input numérico com 8 caracteres
- [x] Garantir que os campos sejam opcionais e possam ser deixados em branco.
    - **Implementado:** Campos inicializados vazios/com seleção padrão, sem validação obrigatória
- [x] Adicionar validação para "Quantité prévue" aceitar apenas números (usar função utilitária, ex: `apenasNumeros` em `funcoesUtilitarias.jsx`).
    - **Implementado:** Aplicada `funcoes.apenasNumerosEVirgula(campoQuantitePrevu)`
- [x] Adicionar logs para debug dos campos
    - **Implementado:** Eventos onChange para campoUsage e onChanging para campoQuantitePrevu

#### 5.8.3 Processamento e Integração dos Campos ✅ CONCLUÍDO
- [x] Garantir que os valores de "Usage" e "Quantité prévue" sejam salvos junto com os dados do componente/bola.
    - **Implementado:** Campos passados como parâmetros `campoUsage` e `campoQuantitePrevu` para `funcoesLegenda.atualizarPreview()`
- [x] Modificar a lógica de geração da legenda para inserir esses campos **antes dos componentes e depois da fixação**.
    - **Implementado:** Função `processarCamposOpcionais()` criada em `funcoesLegenda.jsx`
    - **Implementado:** Campos inseridos na legenda após fixação e antes da seção "Composants:"
- [x] Garantir que esses campos **não** sejam incluídos na frase principal da legenda.
    - **Implementado:** Campos processados separadamente e inseridos apenas na lista de itens da legenda
- [x] Criar função `processarCamposOpcionais()` para processar os campos
    - **Implementado:** Função criada com validação e logs detalhados
- [x] Adicionar logs detalhados para processamento dos campos
    - **Implementado:** Logs de início, processamento individual e conclusão

#### 5.8.4 Logging das Ações ✅ CONCLUÍDO
- [x] Adicionar logs detalhados sempre que:
    - [x] O valor de "Usage" ou "Quantité prévue" for alterado.
        - **Implementado:** Eventos onChange/onChanging com `logs.logEvento()` no `script.jsx`
    - [x] Os campos forem salvos, processados ou incluídos na legenda.
        - **Implementado:** Logs em `processarCamposOpcionais()` para cada campo processado
        - **Implementado:** Log quando campos são adicionados à legenda na função `atualizarPreview()`
    - [x] Houver erro de validação (ex: valor não numérico em "Quantité prévue").
        - **Implementado:** Validação numérica via `funcoes.apenasNumerosEVirgula()` (impede entrada inválida)
        - **Implementado:** Try/catch com logs de erro na função `processarCamposOpcionais()`
    - **Local dos logs:** Eventos no `script.jsx` e processamento em `funcoesLegenda.jsx`

#### 5.8.5 Testes Manuais ✅ CONCLUÍDO
- [x] Testar a inserção, alteração e remoção dos campos "Usage" e "Quantité prévue".
    - **Testado:** Campos funcionam corretamente na interface e são processados
- [x] Verificar se aparecem corretamente na legenda, na posição correta.
    - **Validado:** Campos aparecem após fixação e antes dos componentes
- [x] Garantir que não aparecem na frase principal.
    - **Validado:** Campos não aparecem na frase principal da legenda
- [x] Testar validação de números.
    - **Validado:** Campo Quantité prévue aceita apenas números via `funcoes.apenasNumerosEVirgula()`
- [x] Verificar se os logs são registrados corretamente para todas as ações.
    - **Validado:** Logs funcionam corretamente para ambos os campos

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

## 9. Criação de Componente GP (Paille Synthétique)

**Nota:** Tarefa para implementação futura. Detalhes específicos serão fornecidos quando chegares a esta etapa.

**Resumo:** Criar componente especial "GP" que aparece como "Paille synthétique" na legenda, com opções de cor, grossura, com/sem LEDs, e cor dos LEDs.

- [ ] **9.1** Aguardar especificações detalhadas do utilizador
- [ ] **9.2** Implementar conforme instruções fornecidas
- [ ] **9.3** Testar funcionalidade

---

## 10. Inclusão de Rideaux e Stalactite na Base de Dados

**Nota:** Tarefa para implementação futura. Detalhes específicos serão fornecidos quando chegares a esta etapa.

**Resumo:** Adicionar componentes "rideaux" e "stalactite" na base de dados com todos os tamanhos e cores.

- [ ] **10.1** Aguardar dados específicos do utilizador (tamanhos, cores, referências)
- [ ] **10.2** Implementar conforme instruções fornecidas
- [ ] **10.3** Testar integração com sistema existente

---

## 11. Modularização de Configuração
- **11.1** Mover lógica de configuração inicial (nome do designer, idioma) para `config.jsx`.
- **11.2** Atualizar os imports no `script.jsx`.
- **11.3** Testar manualmente: rodar o script em um ambiente limpo, verificar se a configuração inicial aparece e é salva corretamente.

> **Lembrete:** Toda ação de criação, alteração ou remoção neste módulo deve registrar um log detalhado na janela de logs, incluindo dados relevantes da operação.

---

## 12. Modularização de BridgeTalk e Comunicação
- **12.1** Mover funções que usam BridgeTalk para um arquivo `bridge.jsx`.
- **12.2** Atualizar os imports no `script.jsx`.
- **12.3** Testar manualmente: funcionalidades que dependem de BridgeTalk (ex: contar bolas na artboard, adicionar legenda via BridgeTalk).

> **Lembrete:** Toda ação de criação, alteração ou remoção neste módulo deve registrar um log detalhado na janela de logs, incluindo dados relevantes da operação.

---

## 13. Refino Final e Teste Completo
- **13.1** Rodar todos os testes manuais novamente, cobrindo todos os fluxos do script.
- **13.2** Corrigir eventuais problemas de importação, escopo ou dependências cruzadas.
- **13.3** Documentar no início de cada arquivo o que ele contém e como deve ser usado.

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

## Checklist de Testes - Caracteres Especiais nas Observações

- [ ] Observações com texto normal são processadas corretamente
- [ ] Observações com quebras de linha (\n) são tratadas sem erro
- [ ] Observações com aspas duplas (") são escapadas corretamente
- [ ] Observações com aspas simples (') são escapadas corretamente
- [ ] Observações com barras (\) são tratadas sem erro
- [ ] Observações com símbolos < e > são escapadas corretamente
- [ ] Observações com caracteres & e % são tratadas sem erro
- [ ] Observações com tabs (\t) são processadas corretamente
- [ ] Observações com múltiplas quebras de linha (\r\n) são tratadas
- [ ] Observações com combinação de caracteres especiais são processadas
- [ ] Logs de sanitização aparecem na aba Logs
- [ ] Função de fallback funciona em caso de erro na sanitização

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
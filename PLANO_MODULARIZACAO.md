# Plano de Modularização do Projeto Legenda

## ⚠️ IMPORTANTE: Configuração Obrigatória do Adobe Illustrator
**NUNCA REMOVER** as seguintes diretivas do cabeçalho do `script.jsx`:
```javascript
#target illustrator
#targetengine maintarget
```

**Explicação:**
- `#target illustrator` - Define que o script é para o Adobe Illustrator
- `#targetengine maintarget` - Define o engine de execução principal, **obrigatório** para:
  - Comunicação entre aplicações (BridgeTalk)
  - Manter estado entre execuções
  - Acessar funcionalidades avançadas do Illustrator
  - Funcionamento correto do alfabeto e outras funções

**Nota:** O linter JavaScript pode mostrar erros nessas linhas, mas são **normais e devem ser ignorados** - essas diretivas são específicas do Adobe Illustrator e necessárias para o funcionamento do script.

## 📋 DIRETRIZ DE LOGGING OBRIGATÓRIO
Sempre que for criada, alterada ou removida qualquer funcionalidade, componente, bola, item de lista ou ação relevante no sistema, **deve ser registrado um log detalhado na janela de logs**. O log deve conter informações completas sobre a ação (tipo, dados envolvidos, resultado, etc.), para facilitar a verificação manual e o debug. Nenhuma ação importante deve passar sem registro no sistema de logs.

---

# 🗺️ MAPA ORGANIZACIONAL DOS ARQUIVOS

## 📁 ESTRUTURA ATUAL DO PROJETO

### **🎯 ARQUIVO PRINCIPAL**
- **`script.jsx`** - Script principal que inicializa e coordena todo o sistema
  - Imports de todos os módulos
  - Criação da interface principal
  - Coordenação entre módulos
  - Eventos principais da UI

### **🔧 MÓDULOS FUNCIONAIS**

#### **`funcoes.jsx`** - Funções Utilitárias Gerais
- **Domínio:** Utilidades genéricas e funções auxiliares
- **Responsabilidades:**
  - Manipulação de arrays (removerDuplicatas, arrayContains, etc.)
  - Validação de dados (apenasNumerosEVirgula, formatarDimensao)
  - Parsing JSON (parseJSON, stringifyJSON)
  - Funções de arquivo (selecionarArquivo, getPastaDocumentos)
  - Formatação de unidades e números
  - Sanitização de strings (sanitizarObservacao, escaparParaScript)

#### **`funcoesComponentes.jsx`** - Gestão de Componentes
- **Domínio:** Tudo relacionado a componentes normais da legenda
- **Responsabilidades:**
  - Atualização de cores (atualizarCores)
  - Atualização de unidades (atualizarUnidades)
  - Verificação CMYK (verificarCMYK)
  - Gestão de seleções (salvarSelecaoAtual, restaurarUltimaSelecao)
  - Adição de componentes (adicionarComponente)

#### **`funcoesBolas.jsx`** - Gestão de Bolas
- **Domínio:** Tudo relacionado a bolas da legenda
- **Responsabilidades:**
  - Atualização de acabamentos (atualizarAcabamentos)
  - Atualização de tamanhos (atualizarTamanhos)
  - Processamento de texto de bolas (atualizarTextoBola)
  - Adição de bolas (adicionarBola)

#### **`funcoesLegenda.jsx`** - Processamento e Geração de Legenda
- **Domínio:** Criação e formatação do conteúdo final da legenda
- **Responsabilidades:**
  - Atualização do preview (atualizarPreview)
  - Geração da frase principal (gerarFrasePrincipal)
  - Processamento de componentes (processarComponentes)
  - Processamento de bolas (processarBolas)
  - Processamento de extras (processarComponentesExtras)
  - Processamento de observações (processarObservacoes)
  - Processamento de dimensões (processarDimensoes)
  - Processamento de campos opcionais (processarCamposOpcionais)

#### **`alfabeto.jsx`** - Sistema de Alfabeto GX
- **Domínio:** Funcionalidades específicas do alfabeto GX
- **Responsabilidades:**
  - Processamento do alfabeto (processarAlfabeto)
  - Adição de palavras-chave (adicionarPalavraChaveAlfabeto)
  - Geração de preview do alfabeto (gerarPreviewAlfabeto)
  - Geração de nomes de arquivo (gerarNomeArquivoAlfabeto)
  - Obtenção de tamanho e palavra digitada

### **🔌 MÓDULOS DE INFRAESTRUTURA**

#### **`database.jsx`** - Gestão de Dados
- **Domínio:** Leitura/escrita de arquivos e base de dados
- **Responsabilidades:**
  - Leitura/escrita de JSON (lerArquivoJSON, escreverArquivoJSON)
  - Verificação de arquivos (arquivoExiste)
  - Carregamento da base de dados (carregarDadosBase)

#### **`logs.jsx`** - Sistema de Logs
- **Domínio:** Registo e gestão de logs do sistema
- **Responsabilidades:**
  - Adição de logs (adicionarLog)
  - Limpeza de logs (limparLogs)
  - Logs de eventos (logEvento, logFuncao, logArquivo)
  - Interface de logs (atualizarInterfaceLogs)
  - Configuração de logs (configurarNivelLog, alternarLogs)

#### **`bridge.jsx`** - Comunicação BridgeTalk
- **Domínio:** Comunicação entre aplicações via BridgeTalk
- **Responsabilidades:**
  - Execução de contagem de bolas (executarContagemBolas)
  - Adição de legenda via BridgeTalk (adicionarLegendaViaBridge)
  - Processamento de resultados (processarResultadoContagem)
  - Escape de strings para BridgeTalk (escaparStringParaBridge)
  - Validação do ambiente BridgeTalk

#### **`config.jsx`** - Configuração de Usuário
- **Domínio:** Gestão de configurações e preferências do usuário
- **Responsabilidades:**
  - Configuração inicial (mostrarJanelaConfigInicial)
  - Carregamento/salvamento de configurações
  - Alteração de idioma (alterarIdioma)
  - Inicialização do sistema (inicializarConfiguracao)
  - Validação de configurações

### **🎨 MÓDULOS DE INTERFACE**

#### **`ui.jsx`** - Interface de Usuário
- **Domínio:** Criação e gestão de elementos de interface
- **Responsabilidades:**
  - Criação de interfaces específicas
  - Gestão de componentes UI complexos
  - Funcionalidades visuais especializadas

### **📋 MÓDULOS DE REGRAS E TRADUÇÕES**

#### **`regras.jsx`** - Regras de Negócio
- **Domínio:** Lógicas específicas e regras de formatação
- **Responsabilidades:**
  - Formatação de dimensões (formatarDimensao)
  - Classificação 2D/3D (classificar2Dou3D)
  - Regras de validação específicas
  - Lógicas de negócio complexas

#### **`translations.js`** - Sistema de Traduções
- **Domínio:** Gestão de idiomas e traduções
- **Responsabilidades:**
  - Definição de textos em múltiplos idiomas
  - Função de tradução (t)

### **🔄 MÓDULOS DE MANUTENÇÃO**

#### **`update.jsx`** - Sistema de Atualizações
- **Domínio:** Gestão de versões e atualizações
- **Responsabilidades:**
  - Verificação de versões
  - Download de atualizações
  - Gestão de versioning

---

# 🎯 REGRAS DE INTEGRAÇÃO ESTABELECIDAS

## 📋 PADRÕES DE IMPLEMENTAÇÃO VALIDADOS

### **1. Estrutura de Arquivo Modular:**
- **Domínio:** Padrão de organização estabelecido e testado
- **Responsabilidades:**
  - Cabeçalho com descrição do módulo e responsabilidades
  - Implementação de funções com validação de entrada
  - Tratamento de erros com try/catch obrigatório
  - Logs detalhados conforme diretriz (início, fim, erros)
  - Export global no final do arquivo

```javascript
/**
 * nomeModulo.jsx
 * Domínio: [Descrição específica do domínio]
 * Responsabilidades: [Lista detalhada]
 */

function exemploFuncao(parametrosExplicitos) {
    logs.logFuncao("exemploFuncao", "Início da operação");
    
    try {
        // Validação obrigatória
        if (!parametrosExplicitos) {
            throw new Error("Parâmetros inválidos");
        }
        
        // Lógica principal
        var resultado = processarLogica();
        
        logs.logFuncao("exemploFuncao", "Operação concluída");
        return resultado;
        
    } catch (erro) {
        logs.adicionarLog("Erro em exemploFuncao: " + erro.message, "error");
        return null; // ou valor padrão apropriado
    }
}

// Export global obrigatório
$.global.nomeModulo = {
    exemploFuncao: exemploFuncao,
    outraFuncao: outraFuncao
};
```

### **2. Padrões de Import Validados:**
- **Domínio:** Ordem específica estabelecida e testada no script.jsx
- **Responsabilidades:**
  - Manter ordem alfabética dentro de cada categoria
  - Garantir dependências corretas entre módulos
  - Validar que todos os módulos necessários estão incluídos

```javascript
// ✅ ORDEM VALIDADA E OBRIGATÓRIA
$.evalFile(File($.fileName).path + "/json2.js");
$.evalFile(File($.fileName).path + "/translations.js");
$.evalFile(File($.fileName).path + "/funcoes.jsx");
$.evalFile(File($.fileName).path + "/database.jsx");
$.evalFile(File($.fileName).path + "/logs.jsx");
$.evalFile(File($.fileName).path + "/regras.jsx");
$.evalFile(File($.fileName).path + "/funcoesComponentes.jsx");
$.evalFile(File($.fileName).path + "/funcoesBolas.jsx");
$.evalFile(File($.fileName).path + "/funcoesLegenda.jsx");
$.evalFile(File($.fileName).path + "/alfabeto.jsx");
$.evalFile(File($.fileName).path + "/bridge.jsx");
$.evalFile(File($.fileName).path + "/config.jsx");
$.evalFile(File($.fileName).path + "/ui.jsx");
```

### **3. Padrões de Chamada de Funções:**
- **Domínio:** Convenções de nomenclatura e acesso testadas
- **Responsabilidades:**
  - Sempre usar módulo.função() para evitar conflitos
  - Passar parâmetros explícitos sem dependências globais
  - Validar retornos de funções modulares

```javascript
// ✅ CORRETO - Chamadas validadas
funcoesComponentes.adicionarComponente(parametros);
funcoesBolas.adicionarBola(parametros);
funcoesLegenda.atualizarPreview(parametros);
regras.formatarDimensao(dados);

// ❌ INCORRETO - Evitar
adicionarComponente(); // Função global não modularizada
```

### **4. Padrões de Logging Implementados:**
- **Domínio:** Sistema de logs detalhado conforme diretriz obrigatória
- **Responsabilidades:**
  - Registrar início e fim de funções críticas
  - Documentar eventos de interface importantes
  - Capturar e registrar todos os erros
  - Facilitar debug e verificação manual

```javascript
// ✅ PADRÃO VALIDADO
function exemploComLogs(parametros) {
    logs.logFuncao("exemploComLogs", "Iniciando processamento");
    
    // Para eventos de interface
    logs.logEvento("click", "Botão exemplo clicado");
    
    // Para operações críticas
    logs.adicionarLog("Dados processados: " + JSON.stringify(resultado), "info");
    
    // Para erros
    logs.adicionarLog("Erro ao processar: " + erro.message, "error");
}
```

---

# 📝 GUIA DE BOAS PRÁTICAS PARA IMPLEMENTAÇÕES FUTURAS

## 🎯 Onde Adicionar Novas Funcionalidades

### **Para Componentes Normais:**
- **Arquivo:** `funcoesComponentes.jsx`
- **Domínio:** Gestão de componentes normais da legenda
- **Padrão:** Função `adicionarNovoComponente()` seguindo exemplo de `adicionarComponente()`
- **Responsabilidades esperadas:**
  - Validação de parâmetros de entrada
  - Atualização de interface (dropdowns, listas)
  - Adição ao array global de itens
  - Logs detalhados de início, fim e erros
  - Integração com sistema de preview

### **Para Bolas:**
- **Arquivo:** `funcoesBolas.jsx`
- **Domínio:** Gestão de bolas da legenda
- **Padrão:** Função `adicionarNovaBola()` seguindo exemplo de `adicionarBola()`
- **Responsabilidades esperadas:**
  - Processamento de acabamentos e tamanhos
  - Validação de dados de entrada
  - Atualização de interface específica de bolas
  - Logs detalhados de cada operação
  - Integração com contagem automática

### **Para Processamento de Legenda:**
- **Arquivo:** `funcoesLegenda.jsx`
- **Domínio:** Criação e formatação do conteúdo final da legenda
- **Padrão:** Função `processarNovoTipo()` integrada em `atualizarPreview()`
- **Responsabilidades esperadas:**
  - Processamento de dados específicos do tipo
  - Formatação conforme regras estabelecidas
  - Integração com geradores de frase principal
  - Logs de processamento detalhados
  - Retorno de dados estruturados

### **Para Regras de Negócio:**
- **Arquivo:** `regras.jsx`
- **Domínio:** Lógicas específicas e regras de formatação
- **Padrão:** Função `novaRegra()` exportada no objeto global `regras`
- **Responsabilidades esperadas:**
  - Funções puras sem efeitos colaterais
  - Validação e formatação de dados
  - Aplicação de lógicas de negócio específicas
  - Logs de aplicação de regras
  - Tratamento de casos especiais

### **Para Comunicação BridgeTalk:**
- **Arquivo:** `bridge.jsx`
- **Domínio:** Comunicação entre aplicações via BridgeTalk
- **Padrão:** Função `novaOperacaoBridge()` com tratamento de erros
- **Responsabilidades esperadas:**
  - Construção de scripts para BridgeTalk
  - Escape de strings e sanitização
  - Tratamento robusto de erros de comunicação
  - Logs específicos de operações BridgeTalk
  - Validação de ambiente antes da execução

### **Para Funcionalidades de Interface:**
- **Arquivo:** `ui.jsx`
- **Domínio:** Criação e gestão de elementos de interface
- **Padrão:** Função `criarNovaInterface()` com gestão completa de eventos
- **Responsabilidades esperadas:**
  - Criação de elementos de interface complexos
  - Gestão de eventos e interações
  - Aplicação de estilos e layouts
  - Logs de eventos de interface
  - Integração com sistema de configuração

---

# 🚧 TAREFAS PENDENTES

## 8. Otimização e Modularização do script.jsx
- **Domínio:** Redução do tamanho e complexidade do arquivo principal
- **Objetivo:** Extrair funcionalidades específicas do script.jsx para módulos temáticos
- **Arquivo origem:** `script.jsx` (1156 linhas)
- **Status:** Análise concluída, implementação pendente
- **Responsabilidades esperadas:**
  - Manter funcionalidades atuais intactas
  - Seguir padrões de modularização estabelecidos
  - Implementar logs detalhados conforme diretriz
  - Testes manuais incrementais após cada fase

### **8.1 FASE 1: Criação do Módulo de Filtragem**
- **Duração estimada:** 30-45 minutos
- **Arquivo de destino:** `funcoesFiltragem.jsx`
- **Funções a extrair:**
  - `filtrarComponentes()` (linhas 335-375)
  - `getComponentesComCombinacoes()` (linhas 380-395)  
  - `getCoresDisponiveisBolas()` (linhas 526-540)
  - `preencherCoresBioprint()` (linhas 701-735)
  - `obterNumeroTextura()` (linhas 799-810)

**Tarefas específicas:**
- [ ] **8.1.1** Criar `funcoesFiltragem.jsx` com namespace global
- [ ] **8.1.2** Implementar `funcoesFiltragem.filtrarComponentes()` com parâmetros explícitos
- [ ] **8.1.3** Implementar `funcoesFiltragem.getComponentesComCombinacoes()`
- [ ] **8.1.4** Implementar `funcoesFiltragem.getCoresDisponiveisBolas()`
- [ ] **8.1.5** Implementar `funcoesFiltragem.preencherCoresBioprint()`
- [ ] **8.1.6** Implementar `funcoesFiltragem.obterNumeroTextura()`
- [ ] **8.1.7** Adicionar import em `script.jsx` na ordem correta
- [ ] **8.1.8** Substituir chamadas no `script.jsx` por `funcoesFiltragem.nomeFuncao()`
- [ ] **8.1.9** **TESTE MANUAL:** Verificar pesquisa de componentes
- [ ] **8.1.10** **TESTE MANUAL:** Verificar listas de cores e bolas
- [ ] **8.1.11** **TESTE MANUAL:** Verificar funcionalidade de texturas

### **8.2 FASE 2: Modularização da Inicialização**
- **Duração estimada:** 20-30 minutos
- **Arquivo de destino:** `inicializacao.jsx`
- **Código a extrair:**
  - Lógica de carregamento da base de dados (linhas 35-65)
  - Verificações iniciais de dados
  - Configuração de variáveis globais

**Tarefas específicas:**
- [ ] **8.2.1** Criar `inicializacao.jsx` com função principal
- [ ] **8.2.2** Implementar `inicializacao.carregarDadosBase()`
- [ ] **8.2.3** Implementar `inicializacao.verificarDadosCarregados()`
- [ ] **8.2.4** Implementar `inicializacao.configurarVariaveisGlobais()`
- [ ] **8.2.5** Substituir código no `script.jsx` por chamada modular
- [ ] **8.2.6** **TESTE MANUAL:** Verificar carregamento da base de dados
- [ ] **8.2.7** **TESTE MANUAL:** Verificar configuração inicial do sistema

### **8.3 FASE 3: Modularização de Interfaces Específicas**
- **Duração estimada:** 45-60 minutos
- **Arquivo de destino:** Módulos temáticos existentes
- **Interfaces a mover:**
  - Interface de alfabeto → `alfabeto.jsx`
  - Interface de texturas → `ui.jsx`
  - Interface de observações → `ui.jsx`

**Tarefas específicas:**
- [ ] **8.3.1** Mover criação da interface de alfabeto para `alfabeto.jsx`
- [ ] **8.3.2** Mover criação da interface de texturas para `ui.jsx`
- [ ] **8.3.3** Mover criação da interface de observações para `ui.jsx`
- [ ] **8.3.4** Adaptar eventos onClick para chamadas modulares
- [ ] **8.3.5** **TESTE MANUAL:** Verificar checkbox de alfabeto
- [ ] **8.3.6** **TESTE MANUAL:** Verificar checkbox de texturas
- [ ] **8.3.7** **TESTE MANUAL:** Verificar checkbox de observações
- [ ] **8.3.8** **TESTE MANUAL:** Verificar preview de texturas

### **8.4 FASE 4: Centralização de Eventos UI**
- **Duração estimada:** 30-40 minutos
- **Arquivo de destino:** `eventosUI.jsx`
- **Eventos a extrair:**
  - Eventos onClick de checkboxes
  - Eventos onChange de dropdowns
  - Lógica de atualização de interface

**Tarefas específicas:**
- [ ] **8.4.1** Criar `eventosUI.jsx` com namespace global
- [ ] **8.4.2** Implementar `eventosUI.configurarEventosCheckboxes()`
- [ ] **8.4.3** Implementar `eventosUI.configurarEventosDropdowns()`
- [ ] **8.4.4** Implementar `eventosUI.atualizarLayoutJanela()`
- [ ] **8.4.5** Substituir eventos inline por chamadas modulares
- [ ] **8.4.6** **TESTE MANUAL:** Verificar todos os checkboxes
- [ ] **8.4.7** **TESTE MANUAL:** Verificar dropdowns de componentes e cores
- [ ] **8.4.8** **TESTE MANUAL:** Verificar layout dinâmico da janela

### **8.5 FASE 5: Modularização da Gestão de Lista**
- **Duração estimada:** 25-35 minutos
- **Arquivo de destino:** `gestaoLista.jsx`
- **Funcionalidades a extrair:**
  - `atualizarListaItens()` (linhas 1012-1035)
  - Eventos de remoção de itens
  - Gestão do array `itensLegenda`

**Tarefas específicas:**
- [ ] **8.5.1** Criar `gestaoLista.jsx` com namespace global
- [ ] **8.5.2** Implementar `gestaoLista.atualizarListaItens()`
- [ ] **8.5.3** Implementar `gestaoLista.removerItem()`
- [ ] **8.5.4** Implementar `gestaoLista.removerTodosItens()`
- [ ] **8.5.5** Substituir chamadas no `script.jsx`
- [ ] **8.5.6** **TESTE MANUAL:** Verificar atualização da lista
- [ ] **8.5.7** **TESTE MANUAL:** Verificar remoção de itens
- [ ] **8.5.8** **TESTE MANUAL:** Verificar ordem dos itens (bolas por último)

### **8.6 FASE 6: Limpeza Final e Validação**
- **Duração estimada:** 20-30 minutos
- **Objetivo:** Verificação final e limpeza do código

**Tarefas específicas:**
- [ ] **8.6.1** Revisar todos os imports no `script.jsx`
- [ ] **8.6.2** Remover comentários de funções movidas
- [ ] **8.6.3** Verificar se não há código duplicado
- [ ] **8.6.4** Adicionar logs detalhados nos novos módulos
- [ ] **8.6.5** **TESTE COMPLETO:** Executar checklist básico completo
- [ ] **8.6.6** **TESTE COMPLETO:** Verificar todas as funcionalidades
- [ ] **8.6.7** Documentar mudanças neste plano

### **📊 IMPACTO ESPERADO DA OTIMIZAÇÃO:**
- **Redução do script.jsx:** ~400-500 linhas (de 1156 para ~650-750)
- **Novos módulos criados:** 3-4 arquivos
- **Funcionalidades mantidas:** 100% (zero regressões)
- **Melhoria na manutenibilidade:** Significativa
- **Tempo total estimado:** 2h30-3h30 (incluindo testes)

### **⚠️ CRITÉRIOS DE SUCESSO:**
- [ ] Todas as funcionalidades atuais mantidas
- [ ] Checklist de testes básicos 100% aprovado
- [ ] Logs detalhados em todas as operações
- [ ] Redução mínima de 300 linhas no script.jsx
- [ ] Zero regressões identificadas nos testes

## 9. Criação de Componente GP (Paille Synthétique)
- **Domínio:** Implementação de componente especial para paille synthétique
- **Objetivo:** Criar componente especial "GP" que aparece como "Paille synthétique" na legenda
- **Arquivo de destino:** `funcoesComponentes.jsx`
- **Responsabilidades esperadas:**
  - Criar função `adicionarComponenteGP()` seguindo padrões estabelecidos
  - Implementar opções específicas (cor, grossura, LEDs, etc.)
  - Integrar com sistema de processamento de legenda
  - Adicionar logs detalhados conforme diretriz
  - Testes manuais incrementais

- [ ] **9.1** Aguardar especificações detalhadas do utilizador
- [ ] **9.2** Implementar conforme instruções e padrões estabelecidos
- [ ] **9.3** Testar funcionalidade seguindo checklist obrigatório

## 10. Inclusão de Rideaux e Stalactite na Base de Dados
- **Domínio:** Expansão da base de dados com novos componentes
- **Objetivo:** Adicionar componentes "rideaux" e "stalactite" na base de dados
- **Arquivos de destino:** `database2.json` + `funcoesComponentes.jsx`
- **Responsabilidades esperadas:**
  - Atualizar estrutura JSON com novos componentes
  - Implementar integração com dropdowns existentes
  - Validar carregamento e processamento dos novos dados
  - Logs para operações de carregamento/validação
  - Testes de integração completos

- [ ] **10.1** Aguardar dados específicos (tamanhos, cores, referências)
- [ ] **10.2** Implementar conforme padrões de base de dados estabelecidos
- [ ] **10.3** Testar integração seguindo checklist obrigatório

## 11. Refino Final e Otimização
- **Domínio:** Limpeza e otimização do sistema modularizado
- **Objetivo:** Limpeza final e otimização do código modularizado
- **Responsabilidades esperadas:**
  - Revisão de conformidade com padrões estabelecidos
  - Otimização de performance e uso de memória
  - Documentação final consistente em todos os módulos
  - Testes de regressão seguindo checklist completo
  - Validação da arquitetura modular

- [ ] **11.1** Revisão completa de todos os módulos
- [ ] **11.2** Otimização de performance
- [ ] **11.3** Documentação final de cada arquivo
- [ ] **11.4** Testes de regressão completos

---

## 📋 Checklist para Novas Implementações

### **Checklist Obrigatório Baseado em Padrões Validados:**
- **Domínio:** Verificações essenciais para manter consistência e qualidade
- **Responsabilidades:**
  - [ ] **Localização correta:** Função adicionada no arquivo temático correto conforme mapa organizacional
  - [ ] **Estrutura padrão:** Cabeçalho com domínio e responsabilidades documentado
  - [ ] **Validação de entrada:** Parâmetros explícitos validados no início da função
  - [ ] **Tratamento de erros:** Try/catch implementado com logs de erro
  - [ ] **Logs obrigatórios:** Início, fim e erros registrados conforme diretriz
  - [ ] **Export global:** Função exportada corretamente no objeto global do módulo
  - [ ] **Import atualizado:** Se necessário, adicionado ao script.jsx na ordem correta
  - [ ] **Testes incrementais:** Verificação manual no Illustrator após implementação
  - [ ] **Documentação atualizada:** Comentários e responsabilidades atualizados
  - [ ] **Compatibilidade verificada:** Confirmação de que não quebra funcionalidades existentes
  - [ ] **Padrões seguidos:** Nomenclatura e estrutura seguem convenções estabelecidas

---

# 📚 CHECKLIST DE TESTES MANUAIS

## ✅ Testes Básicos (Validados)
- [ ] Script abre sem erros
- [ ] Configuração inicial funciona
- [ ] Adicionar componente funciona
- [ ] Adicionar bola funciona
- [ ] Gerar legenda funciona
- [ ] Contador de bolas funciona
- [ ] Sistema de logs funciona
- [ ] Mudança de idioma funciona

## ✅ Testes Específicos Implementados
- [ ] Campos Usage e Quantité prévue funcionam
- [ ] Caracteres especiais em observações são tratados
- [ ] Classificação 2D/3D funciona corretamente
- [ ] Todos os componentes extras aparecem na legenda
- [ ] Sistema de logging registra todas as operações
- [ ] BridgeTalk funciona para contagem e geração

---

**Este documento serve como guia definitivo para implementações futuras, baseado nos padrões validados durante a modularização já concluída.** 

---

# 📝 MANUAL DE IMPLEMENTAÇÕES REALIZADAS

## 🔧 Implementação: Tipo de Fixação na Frase Principal da Legenda

### **📅 Data da Implementação:** Janeiro 2025
### **🎯 Objetivo:** 
Incluir o tipo de fixação selecionado na frase principal da legenda, posicionado antes da classificação "2D 3D".

### **🔍 Problema Identificado:**
O tipo de fixação era mostrado apenas como uma linha separada na legenda, mas o usuário solicitou que aparecesse integrado na frase principal, antes do "2D 3D".

### **📋 Análise Técnica Realizada:**

#### **1. Investigação da Construção da Frase Principal:**
- **Localização encontrada:** Função `gerarFrasePrincipal()` no arquivo `funcoesLegenda.jsx` (linhas 50-121)
- **Estrutura da frase identificada:** 
  ```
  Logo L1: décor "Nome/Tipo" [2D/3D] avec/en [componentes...]
  ```
- **Ponto de inserção determinado:** Entre "Nome/Tipo" e "2D/3D"

#### **2. Análise do Fluxo de Dados:**
- **Origem dos dados:** `listaFixacao.selection.text` no `script.jsx`
- **Passagem de parâmetros:** Via função `atualizarPreview()` → `gerarFrasePrincipal()`
- **Estrutura de parâmetros:** Objeto `parametrosFrase` na linha 620-632

### **🛠️ Modificações Implementadas:**

#### **Arquivo: `funcoesLegenda.jsx`**

##### **1. Atualização da Documentação (linha 48):**
```javascript
* @param {string} parametros.tipoFixacao - Tipo de fixação selecionado
```

##### **2. Lógica de Processamento do Tipo de Fixação (linhas 57-65):**
```javascript
// Adicionar tipo de fixação se fornecido
var textoFixacao = "";
if (parametros.tipoFixacao && parametros.tipoFixacao !== "") {
    // Verificar se não é a opção padrão de seleção
    if (parametros.tipoFixacao.indexOf("Selec") === -1 && parametros.tipoFixacao.indexOf("selec") === -1) {
        textoFixacao = " " + parametros.tipoFixacao.toLowerCase();
        logLegenda("Tipo de fixação adicionado: " + parametros.tipoFixacao, "info");
    }
}
```

##### **3. Modificação da Construção da Frase (linha 78):**
```javascript
// ANTES:
var frasePrincipal = "Logo " + (parametros.listaL || "") + ": " + 
                     decorTexto + " " + prefixoNomeTipo + "\"" + nomeTipo + "\"" + classificacao2D3D + " " + preposicao;

// DEPOIS:
var frasePrincipal = "Logo " + (parametros.listaL || "") + ": " + 
                     decorTexto + " " + prefixoNomeTipo + "\"" + nomeTipo + "\"" + textoFixacao + classificacao2D3D + " " + preposicao;
```

##### **4. Passagem do Parâmetro (linha 632):**
```javascript
var parametrosFrase = {
    // ... outros parâmetros existentes ...
    dimensoes: dimensoesProcessadas,  // Adicionar dimensões processadas
    tipoFixacao: parametros.listaFixacao && parametros.listaFixacao.selection ? parametros.listaFixacao.selection.text : ""
};
```

### **🎯 Resultado Final:**
- **Estrutura da frase atualizada:** 
  ```
  Logo L1: décor "Nome/Tipo" [TIPO_FIXAÇÃO] [2D/3D] avec/en [componentes...]
  ```
- **Exemplo prático:** 
  ```
  Logo L1: décor "meu produto" poteau 2D avec bioprint blanc
  ```

### **✅ Características da Implementação:**

#### **Tratamento Inteligente:**
- ✅ Ignora opções de seleção padrão (contendo "Selec" ou "selec")
- ✅ Converte para minúsculas para manter padrão francês
- ✅ Adiciona espaçamento correto automaticamente
- ✅ Registra logs detalhados conforme diretriz obrigatória

#### **Integração Respeitosa:**
- ✅ Mantém toda a modularização existente
- ✅ Segue padrões ES3/ES5 (regras do usuário)
- ✅ Não quebra funcionalidades existentes
- ✅ Preserva tratamento de erro existente

#### **Compatibilidade:**
- ✅ Funciona com todos os tipos de fixação: poteau, suspendue, murale, etc.
- ✅ Compatível com classificação 2D/3D existente
- ✅ Mantém ordem correta dos elementos na frase

### **🧪 Procedimento de Teste Recomendado:**

#### **Teste Manual no Illustrator:**
1. **Configuração básica:**
   - Abrir o script no Illustrator
   - Preencher campo Nome/Tipo
   - Adicionar dimensões (para testar 2D/3D)

2. **Teste de tipos de fixação:**
   - Selecionar diferentes tipos: "poteau", "suspendue", "murale"
   - Verificar se aparecem corretamente na frase principal
   - Confirmar posicionamento antes do "2D" ou "3D"

3. **Teste de casos especiais:**
   - Deixar fixação como "Seleção padrão" → não deve aparecer
   - Combinar com alfabeto/bioprint → ordem correta
   - Adicionar componentes → estrutura mantida

4. **Verificação de logs:**
   - Abrir aba "Logs"
   - Confirmar registro: "Tipo de fixação adicionado: [tipo]"

### **📚 Lições Aprendidas:**

#### **Padrões Identificados:**
1. **Localização de lógica:** Frase principal sempre em `funcoesLegenda.jsx`
2. **Passagem de dados:** Via objeto `parametrosFrase` estruturado
3. **Validação:** Sempre verificar opções padrão antes de processar
4. **Logs:** Registrar todas as adições significativas à frase

#### **Boas Práticas Confirmadas:**
- ✅ Modificações incrementais respeitando arquitetura
- ✅ Testes de compatibilidade antes de finalizar
- ✅ Documentação detalhada de parâmetros
- ✅ Logs informativos para debug e validação

### **🔄 Extensibilidade:**
Esta implementação serve como modelo para futuras adições à frase principal da legenda. O padrão estabelecido pode ser replicado para outros elementos que precisem ser integrados na frase principal.

---

*Implementação finalizada com sucesso - Janeiro 2025*
*Seguindo padrões de modularização validados do projeto* 
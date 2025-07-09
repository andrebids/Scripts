# Plano de Modularização do Projeto Legenda

## 1. Preparação e Base de Testes
- **1.1** Criar um checklist/manual de testes básicos para cada funcionalidade principal do script (UI abre, adicionar componente, adicionar bola, gerar legenda, etc.).
- **1.2** Garantir que o script atual está funcionando corretamente antes de iniciar as mudanças (rodar todos os testes manuais).

---

## 2. Modularização de Funções Utilitárias ✅ CONCLUÍDA
- **2.1** ✅ Identificar funções utilitárias (ex: `removerDuplicatas`, `apenasNumerosEVirgula`, `arrayContains`, etc.).
- **2.2** ✅ Mover essas funções para `funcoes.jsx`.
- **2.3** ✅ Atualizar os imports no `script.jsx`.
- **2.4** ⏳ Testar manualmente: abrir o script, usar campos que dependem dessas funções (ex: adicionar componentes, bolas, etc.).

---

## 3. Modularização de Manipulação de Dados ✅ CONCLUÍDA
- **3.1** ✅ Identificar funções de leitura/escrita de arquivos (`lerArquivoJSON`, `escreverArquivoJSON`, `arquivoExiste`).
- **3.2** ✅ Mover para `database.jsx`.
- **3.3** ✅ Atualizar os imports no `script.jsx`.
- **3.4** ⏳ Testar manualmente: inicialização do script, salvar/ler configurações, carregar base de dados.

---

## 4. Modularização da Interface (UI) ✅ CONCLUÍDA
- **4.1** ✅ Identificar funções de criação de interface (ex: `criarInterfaceContadorBolas`, `criarInterfaceExtra`, criação de grupos, painéis, abas).
- **4.2** ✅ Mover para `ui.jsx`.
- **4.3** ✅ Atualizar os imports no `script.jsx`.
- **4.4** ⏳ Testar manualmente: abrir todas as abas, interagir com todos os painéis, verificar se a interface responde corretamente.

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

### 5.2 Modularização de Componentes/Bolas (funcoes.jsx ou novo arquivo)

#### 5.2.1 Listar funções de processamento de componentes e bolas
- [x] Listar funções de componentes e bolas a modularizar

#### 5.2.2 Modularização de Componentes
- [ ] 5.2.2.1 Mover função criarTextoComponente para funcoes.jsx
- [ ] 5.2.2.2 Mover função criarLinhaReferencia para funcoes.jsx
- [ ] 5.2.2.3 Mover função selecionarUnidadeMetrica para funcoes.jsx
- [ ] 5.2.2.4 Mover função atualizarCores para funcoes.jsx
- [ ] 5.2.2.5 Mover função atualizarUnidades para funcoes.jsx
- [ ] 5.2.2.6 Mover função verificarCMYK para funcoes.jsx
- [ ] 5.2.2.7 Mover função salvarSelecaoAtual para funcoes.jsx
- [ ] 5.2.2.8 Mover função restaurarUltimaSelecao para funcoes.jsx
- [ ] 5.2.2.9 Mover lógica do evento botaoAdicionarComponente.onClick para uma função adicionarComponente em funcoes.jsx

#### 5.2.3 Modularização de Bolas
- [ ] 5.2.3.1 Mover função atualizarAcabamentos para funcoes.jsx
- [ ] 5.2.3.2 Mover função atualizarTamanhos para funcoes.jsx
- [ ] 5.2.3.3 Mover função atualizarTextoBola para funcoes.jsx
- [ ] 5.2.3.4 Mover lógica do evento botaoAdicionarBola.onClick para uma função adicionarBola em funcoes.jsx

#### 5.2.4 Testes manuais incrementais
- [ ] Após cada função movida, atualizar o import/chamada e testar manualmente a funcionalidade correspondente antes de seguir para a próxima.

### 5.3 Atualização de Imports

- [ ] **5.3.1** Após cada função movida, atualizar o import correspondente no `script.jsx`
- [ ] **5.3.2** Testar a funcionalidade relacionada imediatamente após cada alteração

### 5.4 Testes Manuais Incrementais

- [ ] **5.4.1** Após cada função movida, rodar o teste manual correspondente
- [ ] **5.4.2** Corrigir eventuais erros antes de seguir para a próxima função

---

## 6. Modularização de Configuração
- **6.1** Mover lógica de configuração inicial (nome do designer, idioma) para `config.jsx`.
- **6.2** Atualizar os imports no `script.jsx`.
- **6.3** Testar manualmente: rodar o script em um ambiente limpo, verificar se a configuração inicial aparece e é salva corretamente.

---

## 7. Modularização de BridgeTalk e Comunicação
- **7.1** Mover funções que usam BridgeTalk para um arquivo `bridge.jsx`.
- **7.2** Atualizar os imports no `script.jsx`.
- **7.3** Testar manualmente: funcionalidades que dependem de BridgeTalk (ex: contar bolas na artboard, adicionar legenda via BridgeTalk).

---

## 8. Refino Final e Teste Completo
- **8.1** Rodar todos os testes manuais novamente, cobrindo todos os fluxos do script.
- **8.2** Corrigir eventuais problemas de importação, escopo ou dependências cruzadas.
- **8.3** Documentar no início de cada arquivo o que ele contém e como deve ser usado.

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

---

## Como proceder a cada etapa
1. **Executar a etapa do plano**
2. **Rodar os testes manuais correspondentes**
3. **Só avançar para a próxima etapa se tudo estiver funcionando**
4. **Se encontrar erro, corrigir antes de seguir**

---

**Este arquivo deve ser atualizado conforme o progresso da modularização.** 
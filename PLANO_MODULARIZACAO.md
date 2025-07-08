# Plano de Modularização do Projeto Legenda

## 1. Preparação e Base de Testes
- **1.1** Criar um checklist/manual de testes básicos para cada funcionalidade principal do script (UI abre, adicionar componente, adicionar bola, gerar legenda, etc.).
- **1.2** Garantir que o script atual está funcionando corretamente antes de iniciar as mudanças (rodar todos os testes manuais).

---

## 2. Modularização de Funções Utilitárias
- **2.1** Identificar funções utilitárias (ex: `removerDuplicatas`, `apenasNumerosEVirgula`, `arrayContains`, etc.).
- **2.2** Mover essas funções para `funcoes.jsx`.
- **2.3** Atualizar os imports no `script.jsx`.
- **2.4** Testar manualmente: abrir o script, usar campos que dependem dessas funções (ex: adicionar componentes, bolas, etc.).

---

## 3. Modularização de Manipulação de Dados
- **3.1** Identificar funções de leitura/escrita de arquivos (`lerArquivoJSON`, `escreverArquivoJSON`, `arquivoExiste`).
- **3.2** Mover para `database.jsx`.
- **3.3** Atualizar os imports no `script.jsx`.
- **3.4** Testar manualmente: inicialização do script, salvar/ler configurações, carregar base de dados.

---

## 4. Modularização da Interface (UI)
- **4.1** Identificar funções de criação de interface (ex: `criarInterfaceContadorBolas`, `criarInterfaceExtra`, criação de grupos, painéis, abas).
- **4.2** Mover para `ui.jsx`.
- **4.3** Atualizar os imports no `script.jsx`.
- **4.4** Testar manualmente: abrir todas as abas, interagir com todos os painéis, verificar se a interface responde corretamente.

---

## 5. Modularização de Processamento Específico
- **5.1** Mover funções relacionadas ao alfabeto para `alfabeto.jsx` (ex: `processarAlfabeto`).
- **5.2** Mover funções de processamento de componentes/bolas para `funcoes.jsx` (ou criar arquivos separados se necessário).
- **5.3** Atualizar os imports no `script.jsx`.
- **5.4** Testar manualmente: adicionar palavras-chave do alfabeto, adicionar bolas, componentes, verificar preview.

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
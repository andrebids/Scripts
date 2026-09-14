# Plano: atualização por ZIP e reinício da Legenda

Estado: implementado e validado localmente em 14/09/2026; sem publicação ou alteração de versão.

## Objetivo e evidência

Substituir os downloads individuais por um ZIP do GitHub e reabrir automaticamente a Legenda depois de uma instalação concluída.

Na medição desta sessão, os 158 ficheiros elegíveis demoraram 34,9 s a descarregar individualmente; o ZIP completo, de cerca de 7 MB, demorou 0,78 s. Esta comparação mede apenas o download. Medir também extração, cópia e tempo total durante a implementação.

## 1. Download e instalação

Alterar `infrastructure/update_project_from_github.ps1`:

- Resolver a referência remota para um commit e consultar a versão e o ZIP desse mesmo commit, evitando misturar conteúdos se a branch mudar durante a atualização.
- Conservar a comparação de versões e o tratamento de permissões existente. Quando a versão local já estiver atualizada, terminar sem descarregar o ZIP.
- Substituir a consulta recursiva da árvore e o ciclo de downloads por um download do arquivo para uma pasta temporária exclusiva da execução.
- Descompactar com as ferramentas .NET já disponíveis no Windows PowerShell 5.1, sem dependências adicionais. Validar os caminhos do arquivo para que a extração fique dentro da pasta temporária.
- Identificar a pasta raiz criada pelo ZIP do GitHub e reaproveitar `Should-IncludeFile` para selecionar os ficheiros a instalar.
- Validar os ficheiros obrigatórios e a versão do pacote antes de alterar a instalação.
- Reaproveitar a cópia e o tratamento de erros atuais. Copiar `assets/version.json` por último, para que uma cópia interrompida não marque a instalação como atualizada e impeça uma nova tentativa.
- Publicar `UPDATED` apenas após completar e verificar a instalação. Em caso de erro, apresentar o diagnóstico e não reiniciar.
- Libertar o cliente de rede e remover apenas os temporários desta execução, validando os caminhos absolutos antes de qualquer remoção recursiva. Conservar o log; falhas de limpeza não devem transformar uma instalação concluída em erro.

## 2. Progresso compatível

Alterar `infrastructure/update.jsx` e `assets/translations.js`:

- Manter o painel, o launcher oculto, o runner e o acompanhamento por ficheiro de estado.
- Mostrar as fases: verificar, descarregar, descompactar, instalar e reiniciar.
- Durante o download e a extração, apresentar a fase sem inventar uma percentagem. Durante a cópia, conservar a contagem real de ficheiros.
- Reutilizar `DOWNLOADING` durante a extração, com um campo adicional de fase. O JSX antigo interpreta estados desconhecidos como finais; evitar introduzir um estado `EXTRACTING` incompatível.
- Manter a proteção contra instalação duplicada e a possibilidade de retomar o acompanhamento de uma execução demorada.
- Atualizar as mensagens em português e francês através do sistema de tradução existente.

## 3. Reinício automático

Simplificar e ligar a função existente `reiniciarScript()`:

- Guardar o caminho absoluto de `script.jsx` no início da atualização, incluindo quando se retoma o acompanhamento. Não depender de `$.fileName` no callback final.
- Após `UPDATED`, concluir o acompanhamento e o bloco de limpeza da interface antiga; só depois fechar a janela e executar `$.evalFile()` com o caminho guardado.
- Evitar operações sobre a janela antiga ou alterações aos globais depois de carregar o novo script.
- Remover as esperas fixas de 1000 e 500 ms e a duplicação de tratamento de erros na função antiga.
- Reiniciar uma única vez. Não reiniciar em `ALREADY_CURRENT`, erros ou estado pendente.
- Se a reabertura falhar, conservar o sucesso da instalação e apresentar uma mensagem traduzida para abertura manual.
- Seguir o comportamento normal de fecho: a lista temporária da Legenda é limpa pelo `onClose` existente. A interface deve informar desse efeito antes de iniciar a atualização. Confirmar que a configuração persistida se mantém e que o documento do Illustrator não é alterado pelo reinício.

## 4. Validação

- Ampliar `tests/update-ui.test.cjs` para verificar fases, reinício único apenas após sucesso, ordem de limpeza/fecho/carregamento, caminho guardado, falha de reabertura e retomada sem segundo worker.
- Acrescentar um teste pequeno em PowerShell com pacotes e instalação temporários: ZIP válido, inválido, ficheiro obrigatório ausente, versão incoerente, caminho fora da pasta permitida, exclusões e versão gravada por último. Não instalar pacotes de teste sobre esta pasta de trabalho.
- Executar os testes com Windows PowerShell 5.1, usado pelo runner, e os testes Node existentes.
- Medir download, extração, cópia e tempo total com o pacote real numa instalação temporária.
- Validar no Illustrator 2026: uma única janela reaberta, versão nova visível, interface funcional, configuração mantida e documento intacto. Validar também o pedido de permissões e a recusa. Testes simulados não substituem esta verificação no host.

## 5. Transição e limites

- A primeira atualização iniciada pelo JSX antigo continuará a usar o fluxo antigo e poderá exigir reabertura manual. Substituir os ficheiros não substitui o código que já está em execução. A atualização seguinte usará o download por ZIP e o reinício automático.
- O fluxo continua a copiar sobre a instalação existente; este trabalho não introduz instalação transacional ou rollback. Uma cópia parcialmente falhada será reportada, não acionará o reinício e manterá a versão antiga para permitir nova tentativa.
- Não alterar o mecanismo de publicação nesta etapa. Preparar a atualização de versão juntamente com a publicação, quando autorizada.
- Preservar as alterações locais já existentes em `modules/funcoesLegenda.jsx` e `tests/oursin-names.test.cjs`.

## Critérios de conclusão

Um único download de pacote; validação antes da cópia; diagnóstico de falhas mantido; reinício automático após sucesso comprovado no Illustrator; tempos completos medidos; testes de regressão aprovados.

## Resultados da implementação

- `node tests/update-ui.test.cjs`: aprovado, incluindo fases, erros, estado pendente/retomado, caminho guardado, fecho antes do recarregamento, reinício único e falha de reabertura.
- `powershell -NoProfile -ExecutionPolicy Bypass -File tests/update-package.test.ps1`: nove cenários aprovados no Windows PowerShell 5.1, executando o worker real com rede simulada e instalações temporárias.
- `node tests/oursin-names.test.cjs`: regressões existentes aprovadas.
- Pacote real do commit `db8984be9b5da584051285bafba0f2953dbdd533`, instalado numa pasta temporária: download 1,19 s; extração e enumeração 0,61 s; cópia 1,67 s; total incluindo arranque do PowerShell e limpeza 5,05 s. Foram instalados 158 ficheiros e confirmada a versão 3.11. Os tempos variam com rede, disco e antivírus.
- Illustrator 2026 (30.6.0): teste via API COM, com janela ScriptUI real e clique programático no botão. O acompanhamento recebeu um ficheiro de estado `UPDATED` preparado para o teste e executou o reinício real de `script.jsx`. A janela antiga ficou invisível, uma nova janela abriu, o botão de atualização ficou ativo e não houve alertas. A configuração persistida, o documento ativo, a quantidade de objetos e o estado de gravação mantiveram-se iguais. A janela de teste foi fechada no final.
- A instalação real e o reinício no Illustrator foram verificados separadamente. Não foi exercitado um pedido UAC real, nem publicada uma versão para executar uma atualização completa pela interface contra o GitHub.

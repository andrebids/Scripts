#target illustrator
#targetengine maintarget illustrator

// Importar o arquivo de regras
$.evalFile(File($.fileName).path + "/regras.jsx");
$.evalFile(File($.fileName).path + "/funcoes.jsx");
$.evalFile(File($.fileName).path + "/database.jsx");
$.evalFile(File($.fileName).path + "/ui.jsx");


(function() {
    
    // Caminho do arquivo de configuração
    var caminhoConfig = getPastaDocumentos() + "/cartouche_config.json";

    // Verificar se o arquivo de configuração existe
    var nomeDesigner, caminhoBaseDados;
    if (arquivoExiste(caminhoConfig)) {
        var config = lerArquivoJSON(caminhoConfig);
        nomeDesigner = config.nomeDesigner;
        caminhoBaseDados = config.caminhoBaseDados;
    } else {
        // Criar janela para pedir o nome do designer e o caminho da base de dados
        var janelaDesigner = new Window("dialog", "Configuração Inicial");
        janelaDesigner.add("statictext", undefined, "Por favor, insira o nome do designer:");
        var campoNome = janelaDesigner.add("edittext", undefined, "");
        campoNome.characters = 30;

        janelaDesigner.add("statictext", undefined, "Selecione o caminho para o arquivo da base de dados:");
        var campoCaminho = janelaDesigner.add("edittext", undefined, "");
        campoCaminho.characters = 30;
        var botaoNavegar = janelaDesigner.add("button", undefined, "Navegar");

        botaoNavegar.onClick = function() {
            var caminhoSelecionado = selecionarArquivo();
            if (caminhoSelecionado) {
                campoCaminho.text = caminhoSelecionado;
            }
        };

        var botaoOK = janelaDesigner.add("button", undefined, "OK");

        botaoOK.onClick = function() {
            nomeDesigner = campoNome.text;
            caminhoBaseDados = campoCaminho.text;
            janelaDesigner.close();
        };

        janelaDesigner.show();

        // Salvar o nome do designer e o caminho da base de dados no arquivo de configuração
        escreverArquivoJSON(caminhoConfig, {nomeDesigner: nomeDesigner, caminhoBaseDados: caminhoBaseDados});
    }

    // Verificar se o caminho da base de dados é válido
    if (!arquivoExiste(caminhoBaseDados)) {
        var caminhoSelecionado = selecionarArquivo();
        if (caminhoSelecionado) {
            caminhoBaseDados = caminhoSelecionado;
            // Atualizar o arquivo de configuração com o novo caminho
            var config = lerArquivoJSON(caminhoConfig);
            config.caminhoBaseDados = caminhoBaseDados;
            escreverArquivoJSON(caminhoConfig, config);
        } else {
            alert("Erro: O caminho para o arquivo da base de dados não foi selecionado.");
            return;
        }
    }

    // Carregar dados do arquivo database2.json
    var dados;
    try {
        dados = lerArquivoJSON(caminhoBaseDados);
    } catch (e) {
        alert("Erro ao ler o arquivo da base de dados: " + e.message + "\nO script será encerrado.");
        return;
    }

    // Verificar se os dados foram carregados corretamente
    if (!dados || typeof dados !== 'object' || !dados.componentes || !isArray(dados.componentes)) {
        alert("Erro: Os dados não foram carregados corretamente ou estão em um formato inválido.");
        return;
    }

    // Criar a janela principal
    var janela = new Window("palette", "Cartouche by Bids", undefined, {
        resizeable: true,
        closeButton: true      // Garante que haja um botão de fechar
    });
    janela.orientation = "column";
    janela.alignChildren = ["fill", "top"];
    janela.spacing = 10;
    janela.margins = 16;

    // Ajustar o tamanho máximo da janela principal
    janela.maximumSize = [800, 800]; // Aumentada a largura para 800

    // Criar painel esquerdo para campos de preenchimento
    var painelEsquerdo = janela.add("panel");
    painelEsquerdo.orientation = "column";
    painelEsquerdo.alignChildren = "left";

    // Criar painel direito para previewcriar a
    var painelDireito = janela.add("panel");
    painelDireito.orientation = "column";
    painelDireito.alignChildren = "left";

    // Aba: Legenda
    var abaLegenda = painelEsquerdo.add("panel", undefined, "Legenda");
    abaLegenda.orientation = "column";
    abaLegenda.alignChildren = ["fill", "top"];

    // Primeiro grupo (Informações principais)
    var grupoPrincipal = abaLegenda.add("panel", undefined, "Informações Principais @@@3333");
    grupoPrincipal.orientation = "column";
    grupoPrincipal.alignChildren = "left";

    var grupo1 = grupoPrincipal.add("group");
    grupo1.orientation = "column";

    var subgrupo1 = grupo1.add("group");
    subgrupo1.orientation = "row";

    // Campo do nome
    var grupoNome = subgrupo1.add("group");
    grupoNome.add("statictext", undefined, "Nome:");
    var campoNome = grupoNome.add("statictext", undefined, nomeDesigner);
    campoNome.characters = 20;

    // Dropdown L1-L20
    subgrupo1.add("statictext", undefined, "L:");
    var opcoesL = [];
    for (var i = 1; i <= 20; i++) {
        opcoesL.push("L" + i);
    }
    var listaL = subgrupo1.add("dropdownlist", undefined, opcoesL);
    listaL.selection = 0;

    // Campo do nome ou tipo
    var grupoNomeTipo = grupoPrincipal.add("group");
    grupoNomeTipo.add("statictext", undefined, "Nome/tipo:");
    var campoNomeTipo = grupoNomeTipo.add("edittext", undefined, "");
    campoNomeTipo.characters = 20;

    // Structure laqueé
    var structureElements = regras.criarGrupoStructure(subgrupo1);
    var checkStructure = structureElements.checkbox;
    var corStructure = structureElements.corDropdown;

    // Importar a função do arquivo regras.jsx
    var apenasNumerosEVirgula = regras.apenasNumerosEVirgula;

    // Grupo para dimensões e tipo de fixação
    var grupoDimensoesFixacao = grupoPrincipal.add("group");
    grupoDimensoesFixacao.orientation = "row";

    // Campos H, L, P, ⌀
    var grupoDimensoes = grupoDimensoesFixacao.add("group");
    var dimensoes = ["H", "L", "P", "⌀"];
    for (var i = 0; i < dimensoes.length; i++) {
        grupoDimensoes.add("statictext", undefined, dimensoes[i] + ":");
        var campoDimensao = grupoDimensoes.add("edittext", undefined, "");
        campoDimensao.characters = 5;
        apenasNumerosEVirgula(campoDimensao);
    }

    // Tipo de fixação
    var grupoFixacao = grupoDimensoesFixacao.add("group");
    grupoFixacao.add("statictext", undefined, "Tipo de fixação:");
    var tiposFixacao = ["poteau", "suspendue/transversée", "murale", "au sol", "spéciale"];
    var listaFixacao = grupoFixacao.add("dropdownlist", undefined, tiposFixacao);
    listaFixacao.selection = 0;

    // Segundo grupo (Componentes)
    var grupoComponentes = abaLegenda.add("panel", undefined, "Componentes");
    grupoComponentes.orientation = "column";
    grupoComponentes.alignChildren = "left";

    // Grupo para o campo de pesquisa
    var grupoPesquisa = grupoComponentes.add("group");
    grupoPesquisa.orientation = "row";
    grupoPesquisa.alignChildren = "center";

    // Label para o campo de pesquisa
    var labelPesquisa = grupoPesquisa.add("statictext", undefined, "Procurar:");
    
    // Campo de pesquisa
    var campoPesquisa = grupoPesquisa.add("edittext", undefined, "");
    campoPesquisa.characters = 20;
    campoPesquisa.onChanging = function() {
        filtrarComponentes(campoPesquisa.text);
    };

    // Função para filtrar componentes
    function filtrarComponentes(termo) {
        var componentesFiltrados = ["Selecione um componente"];
        
        if (termo.length > 0) {
            for (var i = 1; i < componentesNomes.length; i++) {
                if (componentesNomes[i].toLowerCase().indexOf(termo.toLowerCase()) !== -1) {
                    componentesFiltrados.push(componentesNomes[i]);
                }
            }
        } else {
            componentesFiltrados = componentesNomes;
        }

        // Salvar a seleção atual
        var selecaoAtual = listaComponentes.selection;

        // Limpar e repopular a lista
        listaComponentes.removeAll();
        for (var i = 0; i < componentesFiltrados.length; i++) {
            listaComponentes.add("item", componentesFiltrados[i]);
        }

        // Restaurar a seleção se possível, ou selecionar o primeiro item filtrado
        if (componentesFiltrados.length > 1) {
            if (selecaoAtual && componentesFiltrados.indexOf(selecaoAtual.text) !== -1) {
                listaComponentes.selection = componentesFiltrados.indexOf(selecaoAtual.text);
            } else {
                listaComponentes.selection = 1; // Seleciona o primeiro componente filtrado
            }
        } else {
            listaComponentes.selection = 0; // Seleciona "Selecione um componente" se não houver resultados
        }

        // Atualizar cores e unidades
        atualizarCores();
    }

    var grupo2 = grupoComponentes.add("group");
    grupo2.orientation = "row";

    // Função para obter componentes com combinações
    function getComponentesComCombinacoes() {
        var componentesDisponiveis = ["Selecione um componente"];
        var componentesIds = [];
        for (var i = 0; i < dados.combinacoes.length; i++) {
            var componenteId = dados.combinacoes[i].componenteId;
            if (!arrayContains(componentesIds, componenteId)) {
                var componente = encontrarPorId(dados.componentes, componenteId);
                if (componente) {
                    componentesDisponiveis.push(componente.nome);
                    componentesIds.push(componenteId);
                }
            }
        }
        return componentesDisponiveis;
    }

    // Atualizar a criação da lista de componentes
    var componentesNomes = getComponentesComCombinacoes();
    var listaComponentes = grupo2.add("dropdownlist", undefined, componentesNomes);
    listaComponentes.selection = 0;

    // Lista de cores
    var coresNomes = extrairNomes(dados.cores);
    var listaCores = grupo2.add("dropdownlist", undefined, coresNomes);
    listaCores.selection = 0;

    // Lista de unidades
    var unidades = ["ml", "m2", "unit"];
    var listaUnidades = grupo2.add("dropdownlist", undefined, unidades);
    listaUnidades.selection = 0;

    // Campo de quantidade
    var campoQuantidade = grupo2.add("edittext", undefined, "1");
    campoQuantidade.characters = 5;
    apenasNumerosEVirgula(campoQuantidade);

    // Botão adicionar componente
    var botaoAdicionarComponente = grupo2.add("button", undefined, "Adicionar Componente");

    // Grupo para bolas
    var grupoBolas = abaLegenda.add("panel", undefined, "Bolas");
    grupoBolas.orientation = "column";
    grupoBolas.alignChildren = "left";

    var grupoBolasSelecao = grupoBolas.add("group");
    grupoBolasSelecao.orientation = "row";

    // Função para obter cores disponíveis para bolas
    function getCoresDisponiveisBolas() {
        var coresDisponiveis = ["Selecione uma cor"];
        var coresIds = [];
        for (var i = 0; i < dados.bolas.length; i++) {
            var corId = dados.bolas[i].corId;
            if (!arrayContains(coresIds, corId)) {
                var cor = encontrarPorId(dados.cores, corId);
                if (cor) {
                    coresDisponiveis.push(cor.nome);
                    coresIds.push(corId);
                }
            }
        }
        return coresDisponiveis;
    }

    // Lista de cores para bolas
    var coresBolasDisponiveis = getCoresDisponiveisBolas();
    var listaCoresBolas = grupoBolasSelecao.add("dropdownlist", undefined, coresBolasDisponiveis);
    listaCoresBolas.selection = 0;

    // Lista de acabamentos (inicialmente vazia)
    var listaAcabamentos = grupoBolasSelecao.add("dropdownlist", undefined, ["Selecione um acabamento"]);
    listaAcabamentos.selection = 0;

    // Lista de tamanhos (inicialmente vazia)
    var listaTamanhos = grupoBolasSelecao.add("dropdownlist", undefined, ["Selecione um tamanho"]);
    listaTamanhos.selection = 0;

    // Campo para quantidade de bolas
    var campoQuantidadeBolas = grupoBolasSelecao.add("edittext", undefined, "1");
    campoQuantidadeBolas.characters = 5;
    apenasNumerosEVirgula(campoQuantidadeBolas);

    // Botão adicionar bola
    var botaoAdicionarBola = grupoBolasSelecao.add("button", undefined, "Adicionar Bola");

    // Função para atualizar a lista de acabamentos com base na cor selecionada
    function atualizarAcabamentos() {
        if (listaCoresBolas.selection.index === 0) {
            listaAcabamentos.removeAll();
            listaAcabamentos.add("item", "Selecione um acabamento");
            listaAcabamentos.selection = 0;
            return;
        }

        var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCoresBolas.selection.text)];
        var acabamentosDisponiveis = ["Selecione um acabamento"];
        var acabamentosIds = [];

        for (var i = 0; i < dados.bolas.length; i++) {
            if (dados.bolas[i].corId === corSelecionada.id) {
                var acabamento = encontrarPorId(dados.acabamentos, dados.bolas[i].acabamentoId);
                if (acabamento && !arrayContains(acabamentosIds, acabamento.id)) {
                    acabamentosDisponiveis.push(acabamento.nome);
                    acabamentosIds.push(acabamento.id);
                }
            }
        }

        listaAcabamentos.removeAll();
        for (var i = 0; i < acabamentosDisponiveis.length; i++) {
            listaAcabamentos.add("item", acabamentosDisponiveis[i]);
        }
        listaAcabamentos.selection = 0;

        // Resetar a lista de tamanhos
        listaTamanhos.removeAll();
        listaTamanhos.add("item", "Selecione um tamanho");
        listaTamanhos.selection = 0;
    }

    // Função para atualizar a lista de tamanhos com base na cor e acabamento selecionados
    function atualizarTamanhos() {
        if (listaCoresBolas.selection.index === 0 || listaAcabamentos.selection.index === 0) {
            listaTamanhos.removeAll();
            listaTamanhos.add("item", "Selecione um tamanho");
            listaTamanhos.selection = 0;
            return;
        }

        var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCoresBolas.selection.text)];
        var acabamentoSelecionado = dados.acabamentos[encontrarIndicePorNome(dados.acabamentos, listaAcabamentos.selection.text)];
        var tamanhosDisponiveis = ["Selecione um tamanho"];

        for (var i = 0; i < dados.bolas.length; i++) {
            if (dados.bolas[i].corId === corSelecionada.id && dados.bolas[i].acabamentoId === acabamentoSelecionado.id) {
                var tamanho = encontrarPorId(dados.tamanhos, dados.bolas[i].tamanhoId);
                if (tamanho && !arrayContains(tamanhosDisponiveis, tamanho.nome)) {
                    tamanhosDisponiveis.push(tamanho.nome);
                }
            }
        }

        listaTamanhos.removeAll();
        for (var i = 0; i < tamanhosDisponiveis.length; i++) {
            listaTamanhos.add("item", tamanhosDisponiveis[i]);
        }
        listaTamanhos.selection = 0;
    }

    // Adicionar eventos de mudança
    listaCoresBolas.onChange = atualizarAcabamentos;
    listaAcabamentos.onChange = atualizarTamanhos;

    // Botão para adicionar bola à legenda
    botaoAdicionarBola.onClick = function() {
        if (listaCoresBolas.selection.index === 0 || listaAcabamentos.selection.index === 0 || listaTamanhos.selection.index === 0) {
            alert("Por favor, selecione uma cor, um acabamento e um tamanho para a bola.");
            return;
        }

        var quantidade = parseFloat(campoQuantidadeBolas.text.replace(',', '.'));
        if (isNaN(quantidade) || quantidade <= 0) {
            alert("Por favor, insira uma quantidade válida de bolas.");
            return;
        }

        var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCoresBolas.selection.text)];
        var acabamentoSelecionado = dados.acabamentos[encontrarIndicePorNome(dados.acabamentos, listaAcabamentos.selection.text)];
        var tamanhoSelecionado = dados.tamanhos[encontrarIndicePorNome(dados.tamanhos, listaTamanhos.selection.text)];

        // Encontrar a bola correspondente na base de dados
        var bolaSelecionada = null;
        for (var i = 0; i < dados.bolas.length; i++) {
            if (dados.bolas[i].corId === corSelecionada.id &&
                dados.bolas[i].acabamentoId === acabamentoSelecionado.id &&
                dados.bolas[i].tamanhoId === tamanhoSelecionado.id) {
                bolaSelecionada = dados.bolas[i];
                break;
            }
        }

        if (bolaSelecionada) {
            var texto = "bola " + corSelecionada.nome + " " + acabamentoSelecionado.nome + " " + tamanhoSelecionado.nome;
            if (bolaSelecionada.referencia) {
                texto += " (Ref: " + bolaSelecionada.referencia + ")";
            }
            texto += " units: " + quantidade.toFixed(2).replace('.', ',');
            
            itensLegenda.push({
                tipo: "bola",
                nome: "bola " + corSelecionada.nome + " " + acabamentoSelecionado.nome + " " + tamanhoSelecionado.nome,
                texto: texto,
                referencia: bolaSelecionada.referencia,
                quantidade: quantidade,
                unidade: "units" // Adiciona a unidade ao objeto
            });
            
            atualizarListaItens();
        } else {
            alert("Erro: Combinação de bola não encontrada na base de dados.");
        }
    }

    // Terceiro grupo (Observações)
    var grupoObs = abaLegenda.add("panel", undefined, "Observações");
    grupoObs.orientation = "row";
    grupoObs.add("statictext", undefined, "Obs:");
    var campoObs = grupoObs.add("edittext", undefined, "");
    campoObs.characters = 30;

    // Quarto grupo (Componentes adicionados)
    var grupoComponentesAdicionados = abaLegenda.add("panel", undefined, "Itens Adicionados");
    grupoComponentesAdicionados.orientation = "column";
    grupoComponentesAdicionados.alignChildren = "left";
    grupoComponentesAdicionados.maximumSize = [550, 200]; // Altura máxima de 200px

    // Lista de itens adicionados com barra de rolagem
    var listaItens = grupoComponentesAdicionados.add("listbox", undefined, [], {multiselect: false});
    listaItens.preferredSize = [530, 180]; // Ajuste o tamanho conforme necessário

    // Botão para remover item selecionado (movido para fora do grupoComponentesAdicionados)
    var botaoRemoverItem = abaLegenda.add("button", undefined, "Remover Selecionado");

    // Função para atualizar a lista de itens
    function atualizarListaItens() {
        listaItens.removeAll();
        for (var i = 0; i < itensLegenda.length; i++) {
            listaItens.add("item", itensLegenda[i].texto);
        }
    }

    // Evento de clique no botão remover
    botaoRemoverItem.onClick = function() {
        var selectedIndex = listaItens.selection.index;
        if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < itensLegenda.length) {
            itensLegenda.splice(selectedIndex, 1);
            atualizarListaItens();
        } else {
            alert("Por favor, selecione um item para remover.");
        }
    }

    // Botão para adicionar legenda
    var botaoGerar = abaLegenda.add("button", undefined, "Adicionar legenda");

    // Array para armazenar os itens da legenda
    var itensLegenda = [];

    // Função para atualizar o preview (agora sem exibição visual)
    function atualizarPreview() {
        var previewText = [];
        previewText.push("Logo " + (listaL.selection ? listaL.selection.text : "") + ": décor \"" + campoNomeTipo.text + "\" avec, ");
        
        var itensNomes = [];
        var referencias = [];
        for (var i = 0; i < itensLegenda.length; i++) {
            var item = itensLegenda[i];
            itensNomes.push(item.nome);
            if (item.referencia) {
                referencias.push(item.referencia + " (" + item.unidade + "): " + item.quantidade.toFixed(2).replace('.', ','));
            } else {
                referencias.push(item.nome + " (" + item.unidade + "): " + item.quantidade.toFixed(2).replace('.', ','));
            }
        }
        previewText[0] += itensNomes.join(", ");
        
        previewText[0] += " sur structure aluminium";
        if (checkStructure.value) {
            previewText[0] += " laqué " + (corStructure.selection ? corStructure.selection.text : "");
        }

        // Modificar a parte do código que lida com as dimensões no preview
        var dimensoesTexto = "";
        for (var i = 0; i < dimensoes.length; i++) {
            var valorDimensao = grupoDimensoes.children[i*2 + 1].text;
            if (valorDimensao !== "") {
                var dimensao = dimensoes[i];
                if (dimensao === "⌀") {
                    dimensao = "\u00D8"; // Símbolo de diâmetro Unicode (Ø)
                }
                dimensoesTexto += dimensao + ": " + regras.formatarDimensao(valorDimensao) + " ";
            }
        }
        previewText.push(dimensoesTexto);

        previewText.push("Fixation: " + (listaFixacao.selection ? listaFixacao.selection.text : ""));
        
        previewText.push("\u200B"); // Caractere de largura zero para forçar uma linha vazia

        // Adiciona as referências e quantidades à lista de itens
        for (var i = 0; i < referencias.length; i++) {
            previewText.push(referencias[i]);
        }

        previewText.push("\u200B"); // Outra linha vazia antes das observações
        
        // Adiciona a linha de observações apenas se o campo não estiver vazio
        if (campoObs.text && campoObs.text.toString().replace(/\s/g, '').length > 0) {
            previewText.push("Obs: " + campoObs.text);
        }

        return previewText.join("\n");
    }

    // Função para atualizar a lista de cores com base no componente selecionado
    function atualizarCores() {
        listaCores.removeAll();
        listaUnidades.removeAll();
        
        if (listaComponentes.selection && listaComponentes.selection.index > 0) {
            var componenteSelecionado = dados.componentes[encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
            var coresDisponiveis = ["Selecione uma cor"];
            var coresIds = [];

            for (var i = 0; i < dados.combinacoes.length; i++) {
                if (dados.combinacoes[i].componenteId === componenteSelecionado.id) {
                    var cor = encontrarPorId(dados.cores, dados.combinacoes[i].corId);
                    if (cor && !arrayContains(coresIds, cor.id)) {
                        coresDisponiveis.push(cor.nome);
                        coresIds.push(cor.id);
                    }
                }
            }

            for (var i = 0; i < coresDisponiveis.length; i++) {
                listaCores.add("item", coresDisponiveis[i]);
            }
            listaCores.selection = 0;
        } else {
            listaCores.add("item", "Selecione uma cor");
        }
        
        listaUnidades.add("item", "Selecione uma unidade");
        listaCores.selection = 0;
        listaUnidades.selection = 0;
    }

    // Função para atualizar a lista de unidades com base no componente e cor selecionados
    function atualizarUnidades() {
        if (listaComponentes.selection.index === 0 || listaCores.selection.index === 0) {
            listaUnidades.removeAll();
            listaUnidades.add("item", "Selecione uma unidade");
            listaUnidades.selection = 0;
            return;
        }

        var componenteSelecionado = dados.componentes[encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
        var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCores.selection.text)];
        var unidadesDisponiveis = ["Selecione uma unidade"];

        for (var i = 0; i < dados.combinacoes.length; i++) {
            if (dados.combinacoes[i].componenteId === componenteSelecionado.id && dados.combinacoes[i].corId === corSelecionada.id) {
                if (!arrayContains(unidadesDisponiveis, dados.combinacoes[i].unidade)) {
                    unidadesDisponiveis.push(dados.combinacoes[i].unidade);
                }
            }
        }

        listaUnidades.removeAll();
        for (var i = 0; i < unidadesDisponiveis.length; i++) {
            listaUnidades.add("item", unidadesDisponiveis[i]);
        }
        listaUnidades.selection = 0;
    }

    // Adicionar eventos de mudança
    listaComponentes.onChange = atualizarCores;
    listaCores.onChange = atualizarUnidades;

    // Função para arredondar para a próxima décima
    function arredondarParaDecima(valor) {
        return Math.ceil(valor * 10) / 10;
    }

    // Botão para adicionar componente à legenda
    botaoAdicionarComponente.onClick = function() {
        if (listaComponentes.selection.index === 0 || listaCores.selection.index === 0 || listaUnidades.selection.index === 0) {
            alert("Por favor, selecione um componente, uma cor e uma unidade.");
            return;
        }

        var quantidade = parseFloat(campoQuantidade.text.replace(',', '.'));
        if (isNaN(quantidade) || quantidade <= 0) {
            alert("Por favor, insira uma quantidade válida para o componente.");
            return;
        }

        var componenteSelecionado = dados.componentes[encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
        var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCores.selection.text)];
        var unidadeSelecionada = listaUnidades.selection.text;

        // Aplicar arredondamento especial para fil lumiére e fil cométe
        quantidade = regras.arredondamentoEspecial(quantidade, componenteSelecionado.id, unidadeSelecionada);

        // Aplicar arredondamento para a próxima décima para "m2" ou "ml", exceto para fil lumiére e fil cométe
        if (unidadeSelecionada !== "units" && componenteSelecionado.id !== 13 && componenteSelecionado.id !== 14) {
            quantidade = arredondarParaDecima(quantidade);
        }

        // Encontrar a combinação correspondente na base de dados
        var combinacaoSelecionada = null;
        for (var i = 0; i < dados.combinacoes.length; i++) {
            if (dados.combinacoes[i].componenteId === componenteSelecionado.id &&
                dados.combinacoes[i].corId === corSelecionada.id &&
                dados.combinacoes[i].unidade === unidadeSelecionada) {
                combinacaoSelecionada = dados.combinacoes[i];
                break;
            }
        }

        if (combinacaoSelecionada) {
            var texto = componenteSelecionado.nome + " " + corSelecionada.nome;
            if (combinacaoSelecionada.referencia) {
                texto += " (Ref: " + combinacaoSelecionada.referencia + ")";
            }
            
            // Formatar a quantidade com base no componente e unidade
            var quantidadeFormatada = regras.formatarQuantidade(quantidade, componenteSelecionado.id, unidadeSelecionada);
            
            texto += " (" + unidadeSelecionada + "): " + quantidadeFormatada;
            
            itensLegenda.push({
                tipo: "componente",
                nome: componenteSelecionado.nome + " " + corSelecionada.nome,
                texto: texto,
                referencia: combinacaoSelecionada.referencia,
                quantidade: quantidade,
                unidade: unidadeSelecionada,
                componenteId: componenteSelecionado.id
            });
            
            atualizarListaItens();
        } else {
            alert("Erro: Combinação de componente não encontrada na base de dados.");
        }
    }

// Adicionar barra de status na parte inferior da janela

var barraStatus = janela.add("group");
barraStatus.orientation = "row";
barraStatus.alignment = ["fill", "bottom"]; 
barraStatus.alignChildren = ["left", "center"];
barraStatus.spacing = 5;
barraStatus.margins = [5, 10, 5, 5];

// Botão Update (anteriormente "Atualizar via Git")
var botaoAtualizarGit = barraStatus.add("button", undefined, "Update");
botaoAtualizarGit.size = [100, 25];

// Espaço flexível
var espacoFlexivel = barraStatus.add("group");
espacoFlexivel.alignment = ["fill", "center"];

// Evento de clique para o botão Atualizar via Git
botaoAtualizarGit.onClick = function() {
    try {
        var currentDir = File($.fileName).parent.fsName;

        // Criar arquivo .bat para Windows
        var scriptFile = new File(currentDir + "/update_script.bat");
        scriptFile.open('w');
        scriptFile.write("@echo off\n");
        scriptFile.write("cd /d \"" + currentDir + "\"\n");
        scriptFile.write("git pull\n");
        scriptFile.write("if %ERRORLEVEL% NEQ 0 (\n");
        scriptFile.write("    echo Falha na atualização. Pressione qualquer tecla para sair.\n");
        scriptFile.write("    pause >nul\n");
        scriptFile.write(") else (\n");
        scriptFile.write("    echo Atualização concluída com sucesso!\n");
        scriptFile.write("    echo success > update_success.tmp\n");
        scriptFile.write(")\n");
        scriptFile.write("exit\n");
        scriptFile.close();

        // Executar o script
        if (scriptFile.execute()) {
            // Aguardar um pouco para dar tempo do script terminar
            $.sleep(2000);
            
            // Verificar se o arquivo de sucesso foi criado
            var successFile = new File(currentDir + "/update_success.tmp");
            if (successFile.exists) {
                alert("Atualização concluída com sucesso. Por favor, reinicie o script.");
                successFile.remove();
            } else {
                alert("A atualização pode não ter sido concluída. Verifique o console para mais detalhes.");
            }
        } else {
            alert("Houve um problema ao iniciar a atualização. Verifique se o Git está instalado e acessível.");
        }
    } catch (e) {
        alert("Erro ao atualizar: " + e);
    }
};

    // Exibir a janela
    janela.show();

    // Modificar o botão para gerar legenda
    botaoGerar.onClick = function() {
        try {
            var legendaConteudo = atualizarPreview(); // Agora chamamos atualizarPreview() aqui 
            
            // Substituir pontos por vírgulas e garantir duas casas decimais
            legendaConteudo = legendaConteudo.replace(/(\d+)\.(\d+)/g, formatarNumero);



            var scriptIllustrator = function(nomeDesigner, conteudoLegenda) {
                var doc = app.activeDocument;

                if (!doc) {
                    return "Nenhum documento ativo. Por favor, abra um documento no Illustrator.";
                }

                // Verificar se há uma artboard ativa
                if (doc.artboards.length === 0) {
                    return "Erro: O documento não tem artboards. Por favor, crie uma artboard antes de adicionar a legenda.";
                }

                // Criar uma nova camada para a legenda
                var novaLayer = doc.layers.add();
                novaLayer.name = "Legenda";

                // Obter as dimensões da artboard ativa
                var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
                var artboardBounds = artboard.artboardRect;

                // Criar o quadro de texto para a legenda
                var textoLegenda = novaLayer.textFrames.add();
                textoLegenda.position = [artboardBounds[0], artboardBounds[3] - 40]; // Posiciona no canto inferior esquerdo

                // Configurar as propriedades do texto
                textoLegenda.textRange.characterAttributes.size = 40; // Tamanho da fonte
                textoLegenda.textRange.characterAttributes.fillColor = new RGBColor(0, 0, 0);
                textoLegenda.textRange.characterAttributes.textFont = app.textFonts.getByName("ArialMT");

                // Adicionar o nome do designer com "Bids -" na frente
                var textoCompleto = "Bids - " + nomeDesigner + "\n" + conteudoLegenda;

                // Função para processar cada linha da legenda
                function processarLinha(linha) {
                    // Procura por padrões de unidade seguidos por dois pontos
                    linha = linha.replace(/(ml|m2|unit):/g, "($1):");
                    
                    // Função para formatar números com duas casas decimais, exceto para fil lumiére
                    function formatarNumero(match, inteiro, decimal, offset, string) {
                        // Verifica se é o componente fil lumiére
                        if (string.indexOf("fil lumiére") !== -1) {
                            return inteiro; // Retorna apenas a parte inteira
                        }
                        var numero = parseFloat(inteiro + "." + decimal);
                        return numero.toFixed(2).replace(".", ",");
                    }
                    
                    // Substitui pontos por vírgulas e garante duas casas decimais (exceto para fil lumiére)
                    linha = linha.replace(/(\d+)\.(\d+)/g, formatarNumero);
                    
                    return linha;
                }

                // Definir o conteúdo da legenda com quebras de linha
                var linhas = textoCompleto.split('\n');
                textoLegenda.contents = linhas[0]; // Adiciona a primeira linha

                // Adiciona as linhas restantes como novos parágrafos
                for (var i = 1; i < linhas.length; i++) {
                    var linhaProcessada = processarLinha(linhas[i]);
                    var novoParag = textoLegenda.paragraphs.add(linhaProcessada);
                    novoParag.paragraphAttributes.spaceBefore = 0; // Garante que não haja espaço extra entre parágrafos
                    novoParag.paragraphAttributes.spaceAfter = 0;
                    
                    // Adiciona espaço extra após a linha de fixação e antes das observações
                    if (linhas[i] === "\u200B") {
                        novoParag.paragraphAttributes.spaceAfter = 6; // Ajuste este valor conforme necessário
                    }
                }

                // Ajustar o tamanho inicial do quadro de texto
                textoLegenda.geometricBounds = [
                    textoLegenda.geometricBounds[0],
                    textoLegenda.geometricBounds[1],
                    textoLegenda.geometricBounds[2],
                    textoLegenda.geometricBounds[1] + 400
                ];

                return "success";
            };

            var scriptString = "(" + scriptIllustrator.toString() + ")";
            scriptString += "('" + escapeString(nomeDesigner) + "', '" + escapeString(legendaConteudo) + "');";

            var bt = new BridgeTalk();
            bt.target = "illustrator";
            bt.body = scriptString;
            bt.onResult = function(resObj) {
                if (resObj.body === "success") {
                    alert("Legenda adicionada com sucesso!");
                    janela.close(); // Fecha a janela após adicionar a legenda com sucesso
                    janela = null; // Ajuda a liberar a memória
                } else {
                    alert("Ocorreu um problema ao adicionar a legenda: " + resObj.body);
                }
            };
            bt.onError = function(err) {
                alert("Erro ao adicionar legenda: " + err.body);
            };
            bt.send();

        } catch (e) {
            alert("Erro ao adicionar legenda: " + e + "\nLinha: " + e.line);
        }
    };

    // Exibir a janela
    janela.show();

    // Função para limpar recursos (pode ser chamada no final do script)
    function limparRecursos() {
        if (janela && janela.toString() !== "[object Window]") {
            janela.close();
            janela = null;
        }
    }
})();
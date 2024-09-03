#target illustrator
#targetengine maintarget illustrator

(function() {
    // Função para analisar JSON
    function parseJSON(str) {
        try {
            return eval('(' + str + ')');
        } catch (e) {
            throw new Error("Erro ao analisar o JSON: " + e.message);
        }
    }

    // Função para serializar JSON
    function stringifyJSON(obj) {
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            if (t == "string") obj = '"' + obj.replace(/"/g, '\\"') + '"';
            return String(obj);
        } else {
            var n, v, json = [], arr = (obj && obj.constructor == Array);
            for (n in obj) {
                v = obj[n];
                t = typeof(v);
                if (t == "string") v = '"' + v.replace(/"/g, '\\"') + '"';
                else if (t == "object" && v !== null) v = stringifyJSON(v);
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    }

    // Função para ler o arquivo JSON
    function lerArquivoJSON(caminho) {
        var arquivo = new File(caminho);
        if (!arquivo.exists) {
            throw new Error("O arquivo não existe: " + caminho);
        }
        arquivo.open('r');
        var conteudo = arquivo.read();
        arquivo.close();
        try {
            return parseJSON(conteudo); // Use parseJSON em vez de JSON.parse
        } catch (e) {
            throw new Error("Erro ao analisar o JSON: " + e.message);
        }
    }

    // Função para selecionar o arquivo da base de dados
    function selecionarArquivo() {
        var arquivo = File.openDialog("Selecione o arquivo da base de dados", "*.json");
        if (arquivo) {
            return arquivo.fsName.replace(/\\/g, '/'); // Substitui \ por /
        }
        return null;
    }

    // Função para obter o caminho da pasta Documentos
    function getPastaDocumentos() {
        return Folder.myDocuments.fsName;
    }

    // Função para verificar se o arquivo existe
    function arquivoExiste(caminho) {
        return new File(caminho).exists;
    }

    // Função para escrever no arquivo JSON
    function escreverArquivoJSON(caminho, dados) {
        var arquivo = new File(caminho);
        arquivo.open('w');
        arquivo.write(stringifyJSON(dados));
        arquivo.close();
    }

    // Funo para verificar se um objeto é um array
    function isArray(obj) {
        return obj && typeof obj === 'object' && obj.constructor === Array;
    }

    // Função para extrair nomes de um array de objetos
    function extrairNomes(array) {
        var nomes = [];
        for (var i = 0; i < array.length; i++) {
            nomes.push(array[i].nome);
        }
        return nomes;
    }

    // Funço auxiliar para encontrar um item em um array por id
    function encontrarPorId(array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id === id) {
                return array[i];
            }
        }
        return null;
    }

    // Funo auxiliar para verificar se um elemento está em um array
    function arrayContains(array, element) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === element) {
                return true;
            }
        }
        return false;
    }

    // Função para encontrar o índice de um item em um array de objetos por nome
    function encontrarIndicePorNome(array, nome) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].nome === nome) {
                return i;
            }
        }
        return -1;
    }

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

    // Criar painel direito para preview
    var painelDireito = janela.add("panel");
    painelDireito.orientation = "column";
    painelDireito.alignChildren = "left";

    // Aba: Legenda
    var abaLegenda = painelEsquerdo.add("panel", undefined, "Legenda");
    abaLegenda.orientation = "column";
    abaLegenda.alignChildren = ["fill", "top"];

    // Primeiro grupo (Informações principais)
    var grupoPrincipal = abaLegenda.add("panel", undefined, "Informações Principais");
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
    var grupoStructure = subgrupo1.add("group");
    grupoStructure.orientation = "row";
    var checkStructure = grupoStructure.add("checkbox", undefined, "Structure laqué");
    var coresStructure = [
        "Blanc RAL 9010",
        "Or PANTONE 131C",
        "Rouge RAL 3000",
        "Bleu RAL 5005",
        "Vert RAL 6029",
        "Rose RAL 3015",
        "Noir RAL 9011"
    ];
    var corStructure = grupoStructure.add("dropdownlist", undefined, coresStructure);
    corStructure.selection = 0;
    corStructure.enabled = false;

    checkStructure.onClick = function() {
        corStructure.enabled = checkStructure.value;
    }

    // Função para permitir apenas números e vírgula nas dimensões
    function apenasNumerosEVirgula(campo) {
        campo.onKeydown = function(e) {
            var key = e.keyName;
            var isNumber = (key >= "0" && key <= "9");
            var isComma = (key == "," || key == ".");
            var isControlKey = (key == "Backspace" || key == "Delete" || key == "Left" || key == "Right");
            
            if (!(isNumber || isComma || isControlKey)) {
                e.preventDefault();
            }
        };
    }

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
    var tiposFixacao = ["poteau", "transversée", "murale", "suspendue", "au sol", "spéciale"];
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

        // Função para formatar as dimensões com duas casas decimais
        function formatarDimensao(valor) {
            if (valor === "") return "";
            var numero = parseFloat(valor.replace(',', '.'));
            if (isNaN(numero)) return "";
            return numero.toFixed(2).replace('.', ',') + " m";
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
                dimensoesTexto += dimensao + ": " + formatarDimensao(valorDimensao) + " ";
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

    // Função para arredondar para a décima
    function arredondarParaDecima(valor) {
        return Math.ceil(valor * 10) / 10;
    }

    // Função de arredondamento especial
    function arredondamentoEspecial(valor, componenteId, unidade) {
        if (componenteId === 13 || componenteId === 14) { // IDs do fil lumiére e fil cométe
            return Math.ceil(valor);
        } else if (unidade === 'm2' || unidade === 'ml') {
            return arredondarParaDecima(valor);
        }
        return valor;
    }

    // Botão para adicionar componente à legenda
    botaoAdicionarComponente.onClick = function() {
        try {
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

            // Aplicar arredondamento especial
            quantidade = arredondamentoEspecial(quantidade, componenteSelecionado.id, unidadeSelecionada);

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
                var quantidadeFormatada;
                if (componenteSelecionado.id === 13 || componenteSelecionado.id === 14) {
                    quantidadeFormatada = quantidade.toString();
                } else if (unidadeSelecionada === 'm2' || unidadeSelecionada === 'ml') {
                    quantidadeFormatada = quantidade.toFixed(1).replace('.', ',');
                } else {
                    quantidadeFormatada = quantidade.toFixed(2).replace('.', ',');
                }
                
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
                
                // Limpar campos após adicionar
                listaComponentes.selection = 0;
                listaCores.selection = 0;
                listaUnidades.selection = 0;
                campoQuantidade.text = "";
            } else {
                alert("Erro: Combinação de componente não encontrada na base de dados.");
            }
        } catch (e) {
            alert("Ocorreu um erro ao adicionar o componente: " + e.message);
        }
    }

    // Botão para adicionar legenda
    botaoGerar.onClick = function() {
        try {
            var legendaConteudo = atualizarPreview();
            
            // Substituir pontos por vírgulas e garantir duas casas decimais
            legendaConteudo = legendaConteudo.replace(/(\d+)\.(\d+)/g, function(match, inteiro, decimal) {
                var numero = parseFloat(inteiro + "." + decimal);
                return numero.toFixed(2).replace(".", ",");
            });

            var scriptString = "(" + scriptIllustrator.toString() + ")";
            scriptString += "('" + escapeString(nomeDesigner) + "', '" + escapeString(legendaConteudo) + "');";

            // ... (restante do código)
        } catch (e) {
            alert("Erro ao adicionar legenda: " + e + "\nLinha: " + e.line);
        }
    };

    // Função para escapar strings
    function escapeString(str) {
        return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    // Função para adicionar legenda ao Illustrator
    var scriptIllustrator = function(nomeDesigner, conteudoLegenda) {
        var doc = app.activeDocument;

        if (!doc) {
            return "Nenhum documento ativo. Por favor, abra um documento no Illustrator.";
        }

        // ... (restante do código)

        return "success";
    };

    // Mostrar a janela
    janela.show();
})();

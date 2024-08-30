// @target illustrator

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
            return arquivo.fsName;
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

    // Função para verificar se um objeto é um array
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

    // Função auxiliar para encontrar um item em um array por id
    function encontrarPorId(array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id === id) {
                return array[i];
            }
        }
        return null;
    }

    // Função auxiliar para verificar se um elemento está em um array
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
    var nomeDesigner;
    if (arquivoExiste(caminhoConfig)) {
        var config = lerArquivoJSON(caminhoConfig);
        nomeDesigner = config.nomeDesigner;
    } else {
        // Criar janela para pedir o nome do designer
        var janelaDesigner = new Window("dialog", "Nome do Designer");
        janelaDesigner.add("statictext", undefined, "Por favor, insira o nome do designer:");
        var campoNome = janelaDesigner.add("edittext", undefined, "");
        campoNome.characters = 30;
        var botaoOK = janelaDesigner.add("button", undefined, "OK");
        
        botaoOK.onClick = function() {
            nomeDesigner = campoNome.text;
            janelaDesigner.close();
        }
        
        janelaDesigner.show();
        
        // Salvar o nome do designer no arquivo de configuração
        escreverArquivoJSON(caminhoConfig, {nomeDesigner: nomeDesigner});
    }

    // Carregar dados do arquivo database2.json
    var caminhoArquivo = File($.fileName).parent.fsName + "/database2.json";
    var dados;
    try {
        dados = lerArquivoJSON(caminhoArquivo);
    } catch (e) {
        alert("Erro ao ler o arquivo database2.json: " + e.message + "\nO script será encerrado.");
        return;
    }

    // Verificar se os dados foram carregados corretamente
    if (!dados || typeof dados !== 'object' || !dados.componentes || !isArray(dados.componentes)) {
        alert("Erro: Os dados não foram carregados corretamente ou estão em um formato inválido.");
        return;
    }

    // Criar a janela principal
    var janela = new Window("dialog", "Cartouche by Bids");
    janela.orientation = "row";

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
    var coresStructure = ["Blanc", "Noir", "Gris", "Argent", "Or"];
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
    var tiposFixacao = ["Murale", "Suspendue", "Sur pied", "Encastrée", "Magnétique"];
    var listaFixacao = grupoFixacao.add("dropdownlist", undefined, tiposFixacao);
    listaFixacao.selection = 0;

    // Segundo grupo (Componentes)
    var grupoComponentes = abaLegenda.add("panel", undefined, "Componentes");
    grupoComponentes.orientation = "column";
    grupoComponentes.alignChildren = "left";

    var grupo2 = grupoComponentes.add("group");
    grupo2.orientation = "row";

    // Lista dropdown componentes
    var componentesNomes = extrairNomes(dados.componentes);
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

    // Grupo para combinações existentes
    var grupoCombinacoes = grupoComponentes.add("group");
    grupoCombinacoes.orientation = "row";

    // Lista de combinações existentes
    var combinacoesNomes = ["Selecione uma combinação"];
    for (var i = 0; i < dados.combinacoes.length; i++) {
        var comb = dados.combinacoes[i];
        var componente = encontrarPorId(dados.componentes, comb.componenteId);
        var cor = encontrarPorId(dados.cores, comb.corId);
        if (componente && cor) {
            combinacoesNomes.push(componente.nome + " " + cor.nome + " - " + comb.unidade + " (Ref: " + comb.referencia + ")");
        }
    }
    var listaCombinacoes = grupoCombinacoes.add("dropdownlist", undefined, combinacoesNomes);
    listaCombinacoes.selection = 0;

    // Campo de quantidade para combinações
    var campoQuantidadeCombinacoes = grupoCombinacoes.add("edittext", undefined, "1");
    campoQuantidadeCombinacoes.characters = 5;
    apenasNumerosEVirgula(campoQuantidadeCombinacoes);

    // Botão adicionar combinação
    var botaoAdicionarCombinacao = grupoCombinacoes.add("button", undefined, "Adicionar Combinação");

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

        var quantidade = parseInt(campoQuantidadeBolas.text);
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
            var texto = "Bola " + corSelecionada.nome + " " + acabamentoSelecionado.nome + " " + tamanhoSelecionado.nome;
            if (bolaSelecionada.referencia) {
                texto += " (Ref: " + bolaSelecionada.referencia + ")";
            }
            texto += " units: " + quantidade;
            
            itensLegenda.push({
                tipo: "bola",
                nome: "Bola",
                texto: texto
            });
            
            atualizarListaItens();
            atualizarPreview();
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
    var grupoComponentesAdicionados = abaLegenda.add("panel", undefined, "Componentes Adicionados");
    grupoComponentesAdicionados.orientation = "column";
    grupoComponentesAdicionados.alignChildren = "left";

    // Área de preview
    var grupoPreview = abaLegenda.add("group");
    grupoPreview.orientation = "column";
    grupoPreview.alignChildren = ["fill", "top"];
    var botaoAtualizar = grupoPreview.add("button", undefined, "Atualizar");
    var areaPreview = grupoPreview.add("edittext", undefined, "", {multiline: true, scrollable: true});
    areaPreview.preferredSize = [400, 400];
    var botaoGerar = abaLegenda.add("button", undefined, "Adicionar legenda");

    // Array para armazenar os itens da legenda
    var itensLegenda = [];

    // Função para atualizar a lista de itens
    function atualizarListaItens() {
        // Limpar o grupo de itens adicionados
        for (var i = grupoComponentesAdicionados.children.length - 1; i >= 0; i--) {
            grupoComponentesAdicionados.remove(grupoComponentesAdicionados.children[i]);
        }

        // Adicionar cada item à lista
        for (var i = 0; i < itensLegenda.length; i++) {
            var grupoItem = grupoComponentesAdicionados.add("group");
            grupoItem.orientation = "row";
            
            var textoItem = grupoItem.add("statictext", undefined, itensLegenda[i].texto);
            textoItem.size = [250, 20];
            
            var botaoRemover = grupoItem.add("button", undefined, "X");
            botaoRemover.size = [20, 20];
            botaoRemover.index = i;
            
            botaoRemover.onClick = function() {
                itensLegenda.splice(this.index, 1);
                atualizarListaItens();
                atualizarPreview();
            }
        }

        janela.layout.layout(true);
    }

    // Função para atualizar o preview
    function atualizarPreview() {
        var previewText = "";
        previewText += "Logo " + (listaL.selection ? listaL.selection.text : "") + ": décor \"" + campoNomeTipo.text + "\" avec, ";
        
        var itensNomes = [];
        for (var i = 0; i < itensLegenda.length; i++) {
            itensNomes.push(itensLegenda[i].nome);
        }
        previewText += itensNomes.join(", ");
        
        previewText += " sur structure aluminium";
        if (checkStructure.value) {
            previewText += " laqué " + (corStructure.selection ? corStructure.selection.text : "");
        }
        previewText += "\n";

        var dimensoesTexto = "";
        for (var i = 0; i < dimensoes.length; i++) {
            if (grupoDimensoes.children[i*2 + 1].text !== "") {
                var dimensao = dimensoes[i];
                if (dimensao === "⌀") {
                    dimensao = "\u00D8"; // Símbolo de diâmetro Unicode (Ø)
                }
                dimensoesTexto += dimensao + ": " + grupoDimensoes.children[i*2 + 1].text + "m ";
            }
        }
        previewText += dimensoesTexto + "\n";

        previewText += "Fixation: " + (listaFixacao.selection ? listaFixacao.selection.text : "") + "\n\n";

        for (var i = 0; i < itensLegenda.length; i++) {
            previewText += itensLegenda[i].texto + "\n";
        }

        previewText += "\nObs: " + campoObs.text;

        areaPreview.text = previewText;
    }

    // Adicionar evento de clique ao botão Atualizar
    botaoAtualizar.onClick = function() {
        try {
            atualizarPreview();
        } catch (e) {
            alert("Erro ao atualizar preview: " + e + "\nLinha: " + e.line);
        }
    };

    // Botão para adicionar componente à legenda
    botaoAdicionarComponente.onClick = function() {
        var componente = dados.componentes[listaComponentes.selection.index];
        var cor = dados.cores[listaCores.selection.index];
        var unidade = listaUnidades.selection.text;
        var quantidade = campoQuantidade.text;
        
        var texto = componente.nome + " " + cor.nome + " " + unidade;
        if (componente.referencia) {
            texto += " (Ref: " + componente.referencia + ")";
        }
        texto += " " + unidade + ": " + quantidade;
        
        itensLegenda.push({
            tipo: "componente",
            nome: componente.nome,
            texto: texto
        });
        
        atualizarListaItens();
        atualizarPreview();
    }

    // Botão para adicionar combinação existente à legenda
    botaoAdicionarCombinacao.onClick = function() {
        if (listaCombinacoes.selection.index > 0) {
            var combinacaoSelecionada = dados.combinacoes[listaCombinacoes.selection.index - 1];
            var componente = encontrarPorId(dados.componentes, combinacaoSelecionada.componenteId);
            var cor = encontrarPorId(dados.cores, combinacaoSelecionada.corId);
            
            var quantidade = parseInt(campoQuantidadeCombinacoes.text);
            if (isNaN(quantidade) || quantidade <= 0) {
                alert("Por favor, insira uma quantidade válida para a combinação.");
                return;
            }
            
            if (componente && cor) {
                var texto = componente.nome + " " + cor.nome + " " + combinacaoSelecionada.unidade;
                if (combinacaoSelecionada.referencia) {
                    texto += " (Ref: " + combinacaoSelecionada.referencia + ")";
                }
                texto += " " + combinacaoSelecionada.unidade + ": " + quantidade;
                
                itensLegenda.push({
                    tipo: "combinacao",
                    nome: componente.nome,
                    texto: texto
                });
                
                atualizarListaItens();
                atualizarPreview();
            } else {
                alert("Erro: Componente ou cor não encontrados para a combinação selecionada.");
            }
        } else {
            alert("Por favor, selecione uma combinação válida.");
        }
    }

    // Botão para adicionar legenda ao Illustrator
    botaoGerar.onClick = function() {
        try {
            var doc = app.activeDocument;
            if (!doc) {
                alert("Nenhum documento ativo. Por favor, abra um documento no Illustrator.");
                return;
            }

            // Verificar se há uma artboard ativa
            if (doc.artboards.length === 0) {
                alert("Erro: O documento não tem artboards. Por favor, crie uma artboard antes de adicionar a legenda.");
                return;
            }

            // Resto do código para criar a legenda
            var novaLayer = doc.layers.add();
            novaLayer.name = "Legenda";

            // Criar o "P" grande
            var textoP = novaLayer.textFrames.add();
            textoP.contents = "P";
            textoP.textRange.characterAttributes.size = 50;
            textoP.textRange.characterAttributes.fillColor = new RGBColor(0, 0, 0);
            textoP.textRange.characterAttributes.textFont = app.textFonts.getByName("Arial-BoldMT");

            // Posicionar o "P" no canto inferior esquerdo do artboard ativo
            var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
            textoP.position = [artboard.artboardRect[0], artboard.artboardRect[3] - textoP.height];

            // Adicionar o nome abaixo do "P"
            var textoNome = novaLayer.textFrames.add();
            textoNome.contents = nomeDesigner;
            textoNome.textRange.characterAttributes.size = 12;
            textoNome.textRange.characterAttributes.fillColor = new RGBColor(0, 0, 0);
            textoNome.textRange.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
            textoNome.position = [textoP.position[0], textoP.position[1] - textoP.height - 5];

            // Adicionar o conteúdo da legenda
            var textoLegenda = novaLayer.textFrames.add();
            textoLegenda.contents = areaPreview.text;
            textoLegenda.textRange.characterAttributes.size = 10;
            textoLegenda.textRange.characterAttributes.fillColor = new RGBColor(0, 0, 0);
            textoLegenda.textRange.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
            textoLegenda.position = [textoNome.position[0], textoNome.position[1] - textoNome.height - 10];

            alert("Legenda adicionada com sucesso!");
            janela.close(); // Fechar a janela após adicionar a legenda
        } catch (e) {
            alert("Erro ao adicionar legenda: " + e + "\nLinha: " + e.line);
        }
    }

    // Exibir a janela
    janela.show();
})();
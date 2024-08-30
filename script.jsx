// @target illustrator

(function() {
    // Função para analisar JSON
    function parseJSON(str) {
        return eval('(' + str + ')');
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
            return parseJSON(conteudo);
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

    // Selecionar o arquivo da base de dados
    var caminhoArquivo = selecionarArquivo();
    if (!caminhoArquivo) {
        alert("Nenhum arquivo selecionado. O script será encerrado.");
        return;
    }

    // Carregar dados do arquivo
    var dados;
    try {
        dados = lerArquivoJSON(caminhoArquivo);
    } catch (e) {
        alert("Erro ao ler o arquivo: " + e.message + "\nO script será encerrado.");
        return;
    }

    // Verificar se todas as chaves necessárias estão presentes
    var chavesNecessarias = ['nomes', 'componentes', 'cores', 'tiposFixacao', 'coresStructure', 'unidades'];
    for (var i = 0; i < chavesNecessarias.length; i++) {
        if (!dados.hasOwnProperty(chavesNecessarias[i])) {
            alert("O arquivo JSON não contém a chave necessária: " + chavesNecessarias[i] + "\nO script será encerrado.");
            return;
        }
    }

    // Dados
    var nomes = dados.nomes;
    var componentes = dados.componentes;
    var cores = dados.cores;
    var tiposFixacao = dados.tiposFixacao;
    var coresStructure = dados.coresStructure;
    var unidades = dados.unidades;

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
    var listaFixacao = grupoFixacao.add("dropdownlist", undefined, tiposFixacao);
    listaFixacao.selection = 0;

    // Segundo grupo (Componentes)
    var grupoComponentes = abaLegenda.add("panel", undefined, "Componentes");
    grupoComponentes.orientation = "column";
    grupoComponentes.alignChildren = "left";

    var grupo2 = grupoComponentes.add("group");
    grupo2.orientation = "row";

    // Lista dropdown componentes
    var listaComponentes = grupo2.add("dropdownlist", undefined, componentes);
    listaComponentes.selection = 0;

    // Lista de cores
    var listaCores = grupo2.add("dropdownlist", undefined, cores);
    listaCores.selection = 0;

    // Adicionar seleção de unidade para componentes
    var listaUnidades = grupo2.add("dropdownlist", undefined, unidades);
    listaUnidades.selection = 0;

    // Campo de quantidade
    var campoQuantidade = grupo2.add("edittext", undefined, "1");
    campoQuantidade.characters = 5;
    apenasNumerosEVirgula(campoQuantidade);

    // Botão adicionar
    var botaoAdicionar = grupo2.add("button", undefined, "Adicionar");

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

    // Array para armazenar os componentes
    var componentesLegenda = [];

    // Função para atualizar a lista de componentes
    function atualizarListaComponentes() {
        // Limpar o grupo de componentes
        for (var i = grupoComponentesAdicionados.children.length - 1; i >= 0; i--) {
            grupoComponentesAdicionados.remove(grupoComponentesAdicionados.children[i]);
        }

        // Adicionar cada componente à lista
        for (var i = 0; i < componentesLegenda.length; i++) {
            var grupoComponente = grupoComponentesAdicionados.add("group");
            grupoComponente.orientation = "row";
            
            var textoComponente = grupoComponente.add("statictext", undefined, componentesLegenda[i]);
            textoComponente.size = [250, 20];
            
            var botaoRemover = grupoComponente.add("button", undefined, "X");
            botaoRemover.size = [20, 20];
            botaoRemover.index = i;
            
            botaoRemover.onClick = function() {
                componentesLegenda.splice(this.index, 1);
                atualizarListaComponentes();
                atualizarPreview();
            }
        }

        janela.layout.layout(true);
    }

    // Função para atualizar o preview
    function atualizarPreview() {
        var previewText = "";
        previewText += "Logo " + (listaL.selection ? listaL.selection.text : "") + ": décor \"" + campoNomeTipo.text + "\" avec, ";
        
        var componentesNomes = "";
        for (var i = 0; i < componentesLegenda.length; i++) {
            if (i > 0) componentesNomes += ", ";
            var partesComponente = componentesLegenda[i].split(":");
            var unidade = partesComponente[0].split(" ").pop();
            componentesNomes += partesComponente[0].replace(" " + unidade, "");
        }
        previewText += componentesNomes;
        
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

        for (var i = 0; i < componentesLegenda.length; i++) {
            var partesComponente = componentesLegenda[i].split(":");
            var unidade = partesComponente[0].split(" ").pop();
            previewText += partesComponente[0].replace(" " + unidade, "") + " " + unidade + ": " + partesComponente[1] + "\n";
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
    botaoAdicionar.onClick = function() {
        var componente = listaComponentes.selection.text;
        var cor = listaCores.selection.text;
        var quantidade = campoQuantidade.text;
        var unidade = listaUnidades.selection.text;
        
        var novoComponente = componente + " " + cor + " " + unidade + ": " + quantidade;
        
        var componenteAtualizado = false;
        for (var i = 0; i < componentesLegenda.length; i++) {
            if (componentesLegenda[i].indexOf(componente + " " + cor) === 0) {
                componentesLegenda[i] = novoComponente;
                componenteAtualizado = true;
                break;
            }
        }
        
        if (!componenteAtualizado) {
            componentesLegenda.push(novoComponente);
        }
        
        atualizarListaComponentes();
        atualizarPreview();
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
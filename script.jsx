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

// Caminho hardcoded para a base de dados
var caminhoBaseDadosHardcoded = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\ILLUSTRATOR\\basededados\\database2.json";

// Verificar se o arquivo de configuração existe
var nomeDesigner;
if (arquivoExiste(caminhoConfig)) {
    var config = lerArquivoJSON(caminhoConfig);
    nomeDesigner = config.nomeDesigner;
} else {
    // Criar janela para pedir o nome do designer
    var janelaDesigner = new Window("dialog", "Configuração Inicial");
    janelaDesigner.add("statictext", undefined, "Por favor, insira o nome do designer:");
    var campoNome = janelaDesigner.add("edittext", undefined, "");
    campoNome.characters = 30;

    var botaoOK = janelaDesigner.add("button", undefined, "OK");

    botaoOK.onClick = function() {
        nomeDesigner = campoNome.text;
        janelaDesigner.close();
    };

    janelaDesigner.show();

    // Salvar o nome do designer no arquivo de configuração
    escreverArquivoJSON(caminhoConfig, {nomeDesigner: nomeDesigner});
}

// Carregar dados do arquivo database2.json
var dados;
try {
    dados = lerArquivoJSON(caminhoBaseDadosHardcoded);
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
        
        // Pré-selecionar o acabamento se houver apenas uma opção
        if (acabamentosDisponiveis.length === 2) {
            listaAcabamentos.selection = 1;
        } else {
            listaAcabamentos.selection = 0;
        }

        listaAcabamentos.removeAll();
        for (var i = 0; i < acabamentosDisponiveis.length; i++) {
            listaAcabamentos.add("item", acabamentosDisponiveis[i]);
        }
        
        // Pré-selecionar o acabamento se houver apenas uma opção
        if (acabamentosDisponiveis.length === 2) {
            listaAcabamentos.selection = 1;
        } else {
            listaAcabamentos.selection = 0;
        }
    
        // Atualizar tamanhos após selecionar o acabamento
        atualizarTamanhos();
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
        
        // Pré-selecionar o tamanho se houver apenas uma opção
        if (tamanhosDisponiveis.length === 2) {
            listaTamanhos.selection = 1;
        } else {
            listaTamanhos.selection = 0;
        }
    }

    // Adicionar eventos de mudança
    listaCoresBolas.onChange = atualizarAcabamentos;
    listaAcabamentos.onChange = atualizarTamanhos;

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
            var textoBoule = quantidade === 1 ? "boule" : "boules";
            var texto = textoBoule + " " + corSelecionada.nome + " " + acabamentoSelecionado.nome + " " + tamanhoSelecionado.nome;
            if (bolaSelecionada.referencia) {
                texto += " (Ref: " + bolaSelecionada.referencia + ")";
            }
            texto += " units: " + quantidade.toFixed(2).replace('.', ',');
            
            itensLegenda.push({
                tipo: "bola",
                nome: textoBoule + " " + corSelecionada.nome + " " + acabamentoSelecionado.nome + " " + tamanhoSelecionado.nome,
                texto: texto,
                referencia: bolaSelecionada.referencia,
                quantidade: quantidade,
                unidade: "units"
            });
            
            atualizarListaItens();
        } else {
            alert("Erro: Combinação de bola não encontrada na base de dados.");
        }
    }

    // Grupo para palavra-chave
    var grupoAlfabeto = abaLegenda.add("panel", undefined, "Alfabeto");
    grupoAlfabeto.orientation = "row";
    grupoAlfabeto.add("statictext", undefined, "Alfabeto:");
    var campoPalavraChave = grupoAlfabeto.add("edittext", undefined, "");
    campoPalavraChave.characters = 20;

    // Adicionar texto estático para bioprint
    grupoAlfabeto.add("statictext", undefined, "Bioprint");

    // Adicionar dropdown para cor do bioprint
    grupoAlfabeto.add("statictext", undefined, "Cor:");
    var dropdownCorBioprint = grupoAlfabeto.add("dropdownlist", undefined, ["Selecione a cor"]);

    // Manter o dropdown de tamanho existente
    grupoAlfabeto.add("statictext", undefined, "Tamanho:");
    var tamanhoAlfabeto = grupoAlfabeto.add("dropdownlist", undefined, ["1,20 m", "2,00 m"]);
    tamanhoAlfabeto.selection = 0;

    var botaoAdicionarPalavraChave = grupoAlfabeto.add("button", undefined, "Adicionar");

    // Função para preencher o dropdown de cores do bioprint
    function preencherCoresBioprint() {
        dropdownCorBioprint.removeAll();
        
        var componenteBioprint = null;
        for (var i = 0; i < dados.componentes.length; i++) {
            if (dados.componentes[i].nome.toLowerCase() === "bioprint") {
                componenteBioprint = dados.componentes[i];
                break;
            }
        }
    
        if (componenteBioprint) {
            var coresBioprint = [];
            var indexOr = -1;
            for (var i = 0; i < dados.combinacoes.length; i++) {
                if (dados.combinacoes[i].componenteId === componenteBioprint.id) {
                    var cor = encontrarPorId(dados.cores, dados.combinacoes[i].corId);
                    if (cor && !arrayContains(coresBioprint, cor)) {
                        coresBioprint.push(cor);
                        if (cor.nome.toLowerCase() === "or") {
                            indexOr = coresBioprint.length - 1;
                        }
                    }
                }
            }
    
            for (var i = 0; i < coresBioprint.length; i++) {
                dropdownCorBioprint.add("item", coresBioprint[i].nome);
            }
    
            // Pré-selecionar "or" se existir, caso contrário, selecionar o primeiro item
            if (indexOr !== -1) {
                dropdownCorBioprint.selection = indexOr;
            } else if (coresBioprint.length > 0) {
                dropdownCorBioprint.selection = 0;
            }
        }
    
        // Se não houver cores disponíveis, adicionar um item padrão
        if (dropdownCorBioprint.items.length === 0) {
            dropdownCorBioprint.add("item", "Sem cores disponíveis");
            dropdownCorBioprint.selection = 0;
        }
    }

    // Chamar a função para preencher as cores do bioprint
    preencherCoresBioprint();

    function processarAlfabeto() {
        var alfabeto = campoPalavraChave.text.toUpperCase();
        var corBioprintSelecionada = dropdownCorBioprint.selection ? dropdownCorBioprint.selection.text : "";
        var tamanhoSelecionado = tamanhoAlfabeto.selection.text;
        var referenciasUsadas = {};
        
        // Armazenar a palavra digitada
        var palavraDigitada = campoPalavraChave.text;
        
        var referenciasMapeadas = {
            'A': 'GX214LW', 'B': 'GX215LW', 'C': 'GX216LW', 'D': 'GX217LW',
            'E': 'GX218LW', 'G': 'GX220LW', 'H': 'GX221LW', 'I': 'GX222LW',
            'J': 'GX223LW', 'K': 'GX224LW', 'L': 'GX225LW', 'M': 'GX226LW',
            'N': 'GX227LW', 'O': 'GX228LW', 'P': 'GX229LW', 'Q': 'GX230LW',
            'R': 'GX231LW', 'S': 'GX232LW', 'T': 'GX233LW', 'U': 'GX234LW',
            'V': 'GX235LW', 'W': 'GX236LW', 'X': 'GX237LW', 'Y': 'GX238LW',
            '#': 'GX241LW'
        };
        
        for (var i = 0; i < alfabeto.length; i++) {
            var letra = alfabeto[i];
            if (referenciasMapeadas.hasOwnProperty(letra)) {
                if (!referenciasUsadas[letra]) {
                    referenciasUsadas[letra] = 1;
                } else {
                    referenciasUsadas[letra]++;
                }
            }
        }
        
        var referenciasTexto = [];
        for (var letra in referenciasUsadas) {
            if (referenciasUsadas.hasOwnProperty(letra)) {
                referenciasTexto.push(referenciasMapeadas[letra] + " (" + letra + ") bioprint " + corBioprintSelecionada + " " + tamanhoSelecionado + ": " + referenciasUsadas[letra]);
            }
        }
        
        // Adicionar as referências usadas à legenda
        if (referenciasTexto.length > 0) {
            itensLegenda.push({
                tipo: "alfabeto",
                nome: "Referências do Alfabeto",
                texto: referenciasTexto.join("\n"),
                referencia: "",
                quantidade: 1,
                unidade: "",
                tamanho: tamanhoSelecionado,
                bioprint: "bioprint",
                corBioprint: corBioprintSelecionada,
                palavraDigitada: palavraDigitada // Removido "bioprint" e cor da palavra digitada
            });
            
            atualizarListaItens();
            campoPalavraChave.text = "";
            
            // Atualizar o campo nome/tipo apenas com a palavra digitada
            campoNomeTipo.text = palavraDigitada;
        } else {
            alert("Nenhuma letra válida foi inserida.");
        }
    }


botaoAdicionarPalavraChave.onClick = processarAlfabeto;
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

    // Certifique-se de que itensLegenda seja definido como um array no início do script
    var itensLegenda = itensLegenda || [];
    var itensNomes = [];

    // Função para atualizar o preview (agora sem exibição visual)
    function atualizarPreview() {
        var previewText = [];
        var palavraDigitada = "";
        var corBioprint = "";
        var alfabetoUsado = false;
        var componentesAgrupados = {};
        var bolasCores = [];
        
        // Procurar pela palavra digitada no alfabeto, a cor do bioprint, componentes e bolas
        for (var i = 0; i < itensLegenda.length; i++) {
            if (itensLegenda[i].tipo === "alfabeto" && itensLegenda[i].palavraDigitada) {
                palavraDigitada = itensLegenda[i].palavraDigitada;
                corBioprint = itensLegenda[i].corBioprint;
                alfabetoUsado = true;
            } else if (itensLegenda[i].tipo === "componente") {
                var nomeComponente = itensLegenda[i].nome.split(' ')[0];
                var corComponente = itensLegenda[i].nome.split(' ').slice(1).join(' ');
                if (!componentesAgrupados[nomeComponente]) {
                    componentesAgrupados[nomeComponente] = [];
                }
                var corJaExiste = false;
                for (var j = 0; j < componentesAgrupados[nomeComponente].length; j++) {
                    if (componentesAgrupados[nomeComponente][j] === corComponente) {
                        corJaExiste = true;
                        break;
                    }
                }
                if (!corJaExiste) {
                    componentesAgrupados[nomeComponente].push(corComponente);
                }
            } else if (itensLegenda[i].tipo === "bola") {
                var corBola = itensLegenda[i].nome.split(' ')[1];
                var corBolaJaExiste = false;
                for (var k = 0; k < bolasCores.length; k++) {
                    if (bolasCores[k] === corBola) {
                        corBolaJaExiste = true;
                        break;
                    }
                }
                if (!corBolaJaExiste) {
                    bolasCores.push(corBola);
                }
            }
        }
        
        // Usar a palavra digitada ou o conteúdo do campoNomeTipo
        var nomeTipo = palavraDigitada || campoNomeTipo.text;
        
        // Determinar se deve usar "avec" ou "en"
        var preposicao = alfabetoUsado ? "en" : "avec";
        
        // Construir a primeira parte da frase
        var frasePrincipal = "Logo " + (listaL.selection ? listaL.selection.text : "") + ": décor \"" + nomeTipo + "\" " + preposicao;
    
        if (alfabetoUsado) {
            frasePrincipal += " bioprint " + (corBioprint || "");
        }
    
        // Adicionar os componentes agrupados
        var componentesTexto = [];
        for (var componente in componentesAgrupados) {
            if (componentesAgrupados.hasOwnProperty(componente)) {
                componentesTexto.push(componente + " " + componentesAgrupados[componente].join(", "));
            }
        }
        if (componentesTexto.length > 0) {
            frasePrincipal += " " + componentesTexto.join(", ");
        }
    
        // Adicionar as bolas
        if (bolasCores.length > 0) {
            var totalBolas = 0;
            if (Object.prototype.toString.call(itensLegenda) === '[object Array]') {
                for (var i = 0; i < itensLegenda.length; i++) {
                    if (itensLegenda[i].tipo === "bola") {
                        totalBolas += itensLegenda[i].quantidade;
                    }
                }
            }
            var textoBoule = totalBolas > 1 ? "boules" : "boule";
            frasePrincipal += ", " + textoBoule + " " + bolasCores.join(", ");
        }
    
        frasePrincipal += ", sur structure aluminium";
        if (checkStructure.value) {
            frasePrincipal += " laqué " + (corStructure.selection ? corStructure.selection.text : "");
        }
        frasePrincipal += ".";
    
        previewText.push(frasePrincipal);
    
        var itensAgrupados = {};
        var referencias = [];
        var referenciasAlfabeto = [];
        
        for (var i = 0; i < itensLegenda.length; i++) {
            var item = itensLegenda[i];
            if (item.tipo === "alfabeto") {
                referenciasAlfabeto.push(item);
            } else {
                var componenteNome = item.nome.split(' ')[0];
                if (!itensAgrupados[componenteNome]) {
                    itensAgrupados[componenteNome] = [];
                }
                itensAgrupados[componenteNome].push(item);
                if (item.referencia) {
                    referencias.push(item.referencia + " (" + item.unidade + "): " + item.quantidade.toFixed(2).replace('.', ','));
                } else {
                    referencias.push(item.nome + " (" + item.unidade + "): " + item.quantidade.toFixed(2).replace('.', ','));
                }
            }
        }
        
        var itensNomes = [];
        for (var componente in itensAgrupados) {
            if (itensAgrupados.hasOwnProperty(componente)) {
                var cores = [];
                for (var j = 0; j < itensAgrupados[componente].length; j++) {
                    var cor = itensAgrupados[componente][j].nome.split(' ').slice(1).join(' ');
                    var corJaExiste = false;
                    for (var k = 0; k < cores.length; k++) {
                        if (cores[k] === cor) {
                            corJaExiste = true;
                            break;
                        }
                    }
                    if (!corJaExiste) {
                        cores.push(cor);
                    }
                }
                itensNomes.push(componente + " " + cores.join(', '));
            }
        }
        

        // Modificar a parte do código que lida com as dimensões no preview
        var dimensoesTexto = "";
        var dimensoesValidas = [];
        for (var i = 0; i < dimensoes.length; i++) {
            var valorDimensao = grupoDimensoes.children[i*2 + 1].text;
            if (valorDimensao !== "") {
                var dimensao = dimensoes[i];
                if (dimensao === "⌀") {
                    dimensao = "\u00D8"; // Símbolo de diâmetro Unicode (Ø)
                }
                dimensoesValidas.push(dimensao + ": " + regras.formatarDimensao(valorDimensao));
            }
        }
        dimensoesTexto = dimensoesValidas.join(" - ");
        if (dimensoesTexto !== "") {
            previewText.push(dimensoesTexto);
        }

        previewText.push("Fixation: " + (listaFixacao.selection ? listaFixacao.selection.text : ""));
        
        previewText.push("\u200B"); // Caractere de largura zero para forçar uma linha vazia

        // Adiciona as referências e quantidades à lista de itens
        for (var i = 0; i < referencias.length; i++) {
            previewText.push(referencias[i]);
        }
        // Adiciona as referências do alfabeto, se existirem
        if (referenciasAlfabeto.length > 0) {
            var referenciasTexto = referenciasAlfabeto[referenciasAlfabeto.length - 1].texto.split("\n");
            previewText = previewText.concat(referenciasTexto);
        }
        previewText.push("\u200B"); // Outra linha vazia antes das observações
        
        // Adiciona a linha de observações apenas se o campo não estiver vazio
        if (campoObs.text && campoObs.text.toString().replace(/\s/g, '').length > 0) {
            previewText.push("Obs: " + campoObs.text);
        }



    return previewText.join("\n");
    }

    // Função para atualizar a lista de cores com base no componente selecionado
    function selecionarUnidadeMetrica(unidades) {
        var prioridade = ["m2", "ml", "unit"];
        
        // Primeiro, verifica se há apenas uma unidade disponível (excluindo "Selecione uma unidade")
        if (unidades.length === 2 && unidades[1] === "unit") {
            return "unit";
        }
        
        // Se houver mais de uma opção, segue a ordem de prioridade
        for (var i = 0; i < prioridade.length; i++) {
            if (arrayContains(unidades, prioridade[i])) {
                return prioridade[i];
            }
        }
        return null;
    }

    function atualizarCores() {
        listaCores.removeAll();
        listaUnidades.removeAll();
        
        if (listaComponentes.selection && listaComponentes.selection.index > 0) {
            var componenteSelecionado = dados.componentes[encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
            var coresDisponiveis = ["Selecione uma cor"];
            var coresIds = [];
            var unidadesDisponiveis = ["Selecione uma unidade"];
    
            for (var i = 0; i < dados.combinacoes.length; i++) {
                if (dados.combinacoes[i].componenteId === componenteSelecionado.id) {
                    var cor = encontrarPorId(dados.cores, dados.combinacoes[i].corId);
                    if (cor && !arrayContains(coresIds, cor.id)) {
                        coresDisponiveis.push(cor.nome);
                        coresIds.push(cor.id);
                    }
                    if (!arrayContains(unidadesDisponiveis, dados.combinacoes[i].unidade)) {
                        unidadesDisponiveis.push(dados.combinacoes[i].unidade);
                    }
                }
            }
    
            for (var i = 0; i < coresDisponiveis.length; i++) {
                listaCores.add("item", coresDisponiveis[i]);
            }
            listaCores.selection = 0;

        // Pré-selecionar a cor se houver apenas uma opção
        if (coresDisponiveis.length === 2) {
            listaCores.selection = 1;
        } else {
            listaCores.selection = 0;
        }

        for (var i = 0; i < unidadesDisponiveis.length; i++) {
            listaUnidades.add("item", unidadesDisponiveis[i]);
        }
    
        // Selecionar unidade métrica automaticamente
        var unidadeParaSelecionar = selecionarUnidadeMetrica(unidadesDisponiveis);
        if (unidadeParaSelecionar) {
            for (var i = 0; i < listaUnidades.items.length; i++) {
                if (listaUnidades.items[i].text === unidadeParaSelecionar) {
                    listaUnidades.selection = i;
                    break;
                }
            }
            } else {
                listaUnidades.selection = 0;
            }

        } else {
            listaCores.add("item", "Selecione uma cor");
            listaUnidades.add("item", "Selecione uma unidade");
            listaCores.selection = 0;
            listaUnidades.selection = 0;
        }
    // Chamar atualizarUnidades() para atualizar as unidades com base na cor selecionada
    atualizarUnidades();
}
    
    function atualizarUnidades() {
        if (listaComponentes.selection.index === 0 || listaCores.selection.index === 0) {
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
    
        var selecaoAtual = listaUnidades.selection ? listaUnidades.selection.text : null;
        listaUnidades.removeAll();
        for (var i = 0; i < unidadesDisponiveis.length; i++) {
            listaUnidades.add("item", unidadesDisponiveis[i]);
        }
    
    // Selecionar unidade métrica automaticamente
    var unidadeParaSelecionar = selecionarUnidadeMetrica(unidadesDisponiveis);
    if (unidadeParaSelecionar) {
        for (var i = 0; i < listaUnidades.items.length; i++) {
            if (listaUnidades.items[i].text === unidadeParaSelecionar) {
                listaUnidades.selection = i;
                break;
            }
        }
    } else if (unidadesDisponiveis.length === 2) {
        listaUnidades.selection = 1; // Seleciona automaticamente se houver apenas uma opção
    } else {
        listaUnidades.selection = 0;
    }
}
    
    // Atualizar os event listeners
    listaComponentes.onChange = function() {
        atualizarCores();
    };
    
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
        if (unidadeSelecionada !== "units" && componenteSelecionado.id !== 13 && componenteSelecionado.id !== 14) {
            quantidade = arredondarParaDecima(quantidade);
        }
    
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
        scriptFile.write("git pull > git_output.tmp 2>&1\n");
        scriptFile.write("set /p GIT_OUTPUT=<git_output.tmp\n");
        scriptFile.write("del git_output.tmp\n");
        scriptFile.write("if \"%GIT_OUTPUT%\"==\"Already up to date.\" (\n");
        scriptFile.write("    echo up_to_date > update_status.tmp\n");
        scriptFile.write(") else if %ERRORLEVEL% NEQ 0 (\n");
        scriptFile.write("    echo Falha na atualização. Pressione qualquer tecla para sair.\n");
        scriptFile.write("    pause >nul\n");
        scriptFile.write(") else (\n");
        scriptFile.write("    echo Atualização concluída com sucesso!\n");
        scriptFile.write("    echo success > update_status.tmp\n");
        scriptFile.write(")\n");
        scriptFile.write("del \"%~f0\"\n");  // Delete the .bat file itself
        scriptFile.write("exit\n");
        scriptFile.close();

        // Executar o script
        if (scriptFile.execute()) {
            // Aguardar um pouco para dar tempo do script terminar
            $.sleep(2000);
            
            // Verificar o status da atualização
            var statusFile = new File(currentDir + "/update_status.tmp");
            if (statusFile.exists) {
                statusFile.open('r');
                var status = statusFile.read();
                statusFile.close();
                statusFile.remove();  // Remove the .tmp file

                if (status.indexOf("success") !== -1) {
                    alert("Atualização concluída com sucesso. Por favor, reinicie o script.");
                } else if (status.indexOf("up_to_date") !== -1) {
                    alert("O repositório já está atualizado. Nenhuma alteração necessária.");
                } else {
                    alert("A atualização pode não ter sido concluída. Verifique o console para mais detalhes.");
                }
            } else {
                alert("Atualizado com sucesso! Reinicie o script.");
            }

            // Tentar remover o arquivo .bat (caso ainda exista)
            var batFile = new File(currentDir + "/update_script.bat");
            if (batFile.exists) {
                batFile.remove();
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
                try {
                    textoLegenda.textRange.characterAttributes.textFont = app.textFonts.getByName("Apercu-Regular");
                } catch (e) {
                    // Fallback para Arial se Helvetica não estiver disponível
                    textoLegenda.textRange.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
                }

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
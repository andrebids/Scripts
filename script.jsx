#target illustrator
#targetengine maintarget illustrator

// Importar o arquivo de regras
$.evalFile(File($.fileName).path + "/json2.js");
$.evalFile(File($.fileName).path + "/regras.jsx");
$.evalFile(File($.fileName).path + "/funcoes.jsx");
$.evalFile(File($.fileName).path + "/database.jsx");
$.evalFile(File($.fileName).path + "/ui.jsx");


(function() {
    
     // Caminho do arquivo de configuração
var caminhoConfig = getPastaDocumentos() + "/cartouche_config.json";

// Caminho hardcoded para a base de dados
var caminhoBaseDadosHardcoded = "\\\\192.168.1.104\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\ILLUSTRATOR\\basededados\\database2.json";
var itensLegenda = [];
var itensNomes = [];
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
function arrayContains(arr, obj) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
}

function criarInterfaceContadorBolas(grupoContar) {
    var grupo = grupoContar.add("group");
    grupo.orientation = "column";
    grupo.alignChildren = ["left", "top"];
    grupo.spacing = 10;

    // Adicionar um subgrupo com orientação horizontal para alinhar o campo de resultado e o botão lado a lado
    var subgrupoContador = grupo.add("group");
    subgrupoContador.orientation = "row";
    subgrupoContador.alignChildren = ["left", "center"];
    subgrupoContador.spacing = 10;

    // Campo de resultado
    var textoResultado = subgrupoContador.add("edittext", undefined, "Resultado: ", {multiline: true, scrollable: true});
    textoResultado.preferredSize.width = 400;
    textoResultado.preferredSize.height = 150; // Linha 56

    // Botão para contar
    var botaoContar = subgrupoContador.add("button", undefined, "Contar elementos");
    // Botão para adicionar ao preview
    var botaoAdicionarPreview = subgrupoContador.add("button", undefined, "Adicionar ao Preview");

// Atualizar os eventos conforme necessário
botaoAdicionarPreview.onClick = function() {
    var resultado = textoResultado.text;
    if (resultado && resultado !== "Resultado: ") {
        // Procurar por uma contagem existente e removê-la
        for (var i = itensLegenda.length - 1; i >= 0; i--) {
            if (itensLegenda[i].tipo === "contagem") {
                itensLegenda.splice(i, 1);
                break;
            }
        }
        
        // Adicionar a nova contagem
        itensLegenda.push({
            tipo: "contagem",
            nome: "Contagem de Elementos",
            texto: resultado
        });
        atualizarListaItens();
        alert("Contagem atualizada no preview.");
    } else {
        alert("Por favor, realize uma contagem antes de adicionar ao preview.");
    }
};
    // Atualizar os eventos conforme necessário
    botaoContar.onClick = function() {
        try {
            if (!dados || typeof dados !== 'object' || !dados.componentes || !isArray(dados.componentes)) {
                alert("Erro: A base de dados não está acessível ou está em um formato inválido.");
                return;
            }
            
            var bt = new BridgeTalk();
            bt.target = "illustrator";
            bt.body = "(" + contarBolasNaArtboard.toString() + ")()";
            bt.onResult = function(resObj) {
                var resultado = resObj.body.split("|");
                var contagem, combinacoes;
            
                for (var i = 0; i < resultado.length; i++) {
                    var parte = resultado[i].split(":");
                    if (parte[0] === "contagem") {
                        contagem = parseInt(parte[1]);
                    } else if (parte[0] === "combinacoes") {
                        combinacoes = parte.slice(1).join(":"); // Para lidar com possíveis ":" nas mensagens de erro
                    }
                }
            
                var textoCompleto = "";
                if (contagem !== undefined) {
                    if (contagem === 0) {
                        textoCompleto = "Resultado: " + (combinacoes || "Nenhum objeto selecionado") + "\n\n";
                    } else {
                        var textoBoule = contagem === 1 ? "boule" : "boules";
                        textoCompleto = "Total de " + contagem + " " + textoBoule + " :\n";
                        
                        if (combinacoes && combinacoes !== "Nenhum objeto selecionado") {
                            var combArray = combinacoes.split(",");
                            for (var i = 1; i < combArray.length; i++) { // Começar do índice 1 para pular o total
                                var combInfo = combArray[i].split("=");
                                if (combInfo.length === 3) {
                                    var cor = decodeURIComponent(combInfo[0]);
                                    var tamanho = combInfo[1];
                                    var quantidade = combInfo[2];
                                    
                                    textoCompleto += "boule " + cor + " ⌀ " + tamanho + " m: " + quantidade + "\n";
                                } else {
                                    textoCompleto += combArray[i] + "\n";
                                }
                            }
                        } else {
                            textoCompleto += "Nenhuma informação de combinação disponível\n";
                        }
                    }
                } else {
                    textoCompleto = "Erro: " + resObj.body;
                }
                
                textoResultado.text = textoCompleto;
                textoResultado.notify("onChange");
                alert("Resultado atualizado na janela de contagem");
            };
            bt.onError = function(err) {
                alert("Erro no BridgeTalk: " + err.body);
                textoResultado.text = "Erro no BridgeTalk: " + err.body;
                textoResultado.notify("onChange");
            };
            bt.send();
        } catch (e) {
            alert("Erro ao iniciar contagem: " + (e.message || "Erro desconhecido") + "\nTipo de erro: " + (e.name || "Tipo de erro desconhecido"));
            textoResultado.text = "Erro ao iniciar contagem: " + (e.message || "Erro desconhecido") + "\nTipo de erro: " + (e.name || "Tipo de erro desconhecido");
            textoResultado.notify("onChange");
        }
    };

    return {
        botaoContar: botaoContar,
        textoResultado: textoResultado
    };
} // Linha 75
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

function contarBolasNaArtboard() {
    try {
        // Caminho hardcoded para a base de dados
        var caminhoBaseDadosHardcoded = "//192.168.1.104/Olimpo/DS/_BASE DE DADOS/07. TOOLS/ILLUSTRATOR/basededados/database2.json";
        
        // Função para verificar se um objeto é um array
        function isArray(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }

        // Função para ler e parsear um arquivo JSON
        function lerArquivoJSON(caminho) {
            var arquivo = new File(caminho);
            if (!arquivo.exists) {
                throw 'Arquivo não encontrado: ' + caminho;
            }
            arquivo.open('r');
            var conteudo = arquivo.read();
            arquivo.close();

            try {
                var dados = eval('(' + conteudo + ')');
                return dados;
            } catch (e) {
                throw 'Erro ao parsear o JSON: ' + e.message;
            }
        }
        
        // Carregar dados da base de dados
        var dados = lerArquivoJSON(caminhoBaseDadosHardcoded);

        // Verificar se a propriedade 'cores' existe e é um array
        if (!dados || !isArray(dados.cores)) {
            throw 'Os dados da base de cores não são um array ou a propriedade "cores" está ausente.';
        }
        var dadosCores = dados.cores;

        // Função para encontrar o nome da cor baseado em CMYK
        function getNomeCor(cmykArray) {
            for (var i = 0; i < dadosCores.length; i++) {
                var cor = dadosCores[i];
                if (cor && cor.cmyk && cor.nome) {
                    if (
                        cor.cmyk[0] === cmykArray[0] &&
                        cor.cmyk[1] === cmykArray[1] &&
                        cor.cmyk[2] === cmykArray[2] &&
                        cor.cmyk[3] === cmykArray[3]
                    ) {
                        return cor.nome;
                    }
                }
            }
            return null;
        }

        if (app.documents.length === 0) {
            throw "Nenhum documento aberto. Por favor, abra um documento no Illustrator.";
        }
        var doc = app.activeDocument;
        if (!doc) {
            throw "Não foi possível acessar o documento ativo.";
        }
        
        var selecao = doc.selection;
        if (!selecao || selecao.length === 0) {
            return "contagem:0|combinacoes:Nenhum objeto selecionado";
        }
    
        var contagem = 0;
        var combinacoes = {};
    
        for (var i = 0; i < selecao.length; i++) {
            var item = selecao[i];
            if (item.typename === "PathItem" && item.closed && item.filled) {
                contagem++;
                
                // Coletar informações sobre cor
                var cor = item.fillColor;
                var corKey = "";
                if (cor.typename === "CMYKColor") {
                    var cmykArray = [
                        Math.round(cor.cyan),
                        Math.round(cor.magenta),
                        Math.round(cor.yellow),
                        Math.round(cor.black)
                    ];
                    var nomeCor = getNomeCor(cmykArray);
                    if (nomeCor) {
                        corKey = nomeCor;
                    } else {
                        corKey = "CMYK:" + cmykToString(cor);
                    }
                } else if (cor.typename === "SpotColor") {
                    var spotColor = cor.spot.color;
                    if (spotColor.typename === "CMYKColor") {
                        var spotCmykArray = [
                            Math.round(spotColor.cyan),
                            Math.round(spotColor.magenta),
                            Math.round(spotColor.yellow),
                            Math.round(spotColor.black)
                        ];
                        var nomeSpotCor = getNomeCor(spotCmykArray);
                        if (nomeSpotCor) {
                            corKey = nomeSpotCor;
                        } else {
                            corKey = "Spot CMYK:" + cmykToString(spotColor);
                        }
                    } else {
                        corKey = "Spot:" + cor.spot.name;
                    }
                } else {
                    corKey = cor.typename;
                }

                // Coletar informações sobre tamanho
                var tamanhoPx = Math.round(item.width); // Assumindo que os círculos são perfeitos
                var tamanhoM = tamanhoPx * 0.009285714285714286; // Converter de pixels para metros
                var tamanhoMKey = tamanhoM.toFixed(3);

                // Criar uma chave única para cada combinação de cor e tamanho
                var combinacaoKey = corKey + "|" + tamanhoMKey;
                
                if (!combinacoes[combinacaoKey]) {
                    combinacoes[combinacaoKey] = {
                        cor: corKey,
                        tamanho: tamanhoMKey,
                        quantidade: 1
                    };
                } else {
                    combinacoes[combinacaoKey].quantidade++;
                }
            }
        }
    
        function cmykToString(cmykColor) {
            return Math.round(cmykColor.cyan) + "," + 
                   Math.round(cmykColor.magenta) + "," + 
                   Math.round(cmykColor.yellow) + "," + 
                   Math.round(cmykColor.black);
        }
    
        // Preparar o resultado como uma string formatada
        var resultado = "contagem:" + contagem + "|";
        resultado += "combinacoes:";
        var combinacoesArray = [];
        
        // Determinar se deve usar singular ou plural
        var textoBoule = contagem === 1 ? "boule" : "boules";
        
        // Adicionar o total de bolas no início do resultado
        combinacoesArray.push("Total de " + contagem + " " + textoBoule + " :");

        for (var key in combinacoes) {
            if (combinacoes.hasOwnProperty(key)) {
                var comb = combinacoes[key];
                combinacoesArray.push(encodeURIComponent(comb.cor) + "=" + comb.tamanho + "=" + comb.quantidade);
            }
        }
        resultado += combinacoesArray.join(",");

        return resultado;
    } catch (e) {
        return "contagem:0|combinacoes:Erro: " + (e.message || "Erro desconhecido");
    }
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
    janela.preferredSize = [-1, -1]; // Tamanho preferido da janela

// Criar abas para Legenda e Contador de Bolas
var abas = janela.add("tabbedpanel");
abas.alignChildren = ["fill", "fill"];
var abaLegenda = abas.add("tab", undefined, "Legenda");

// Criar conteúdo para a aba Legenda
var conteudoLegenda = abaLegenda.add("group");
conteudoLegenda.orientation = "column";
conteudoLegenda.alignChildren = ["fill", "top"];

// Adicionar elementos à aba Legenda
var grupoPrincipal = conteudoLegenda.add("panel", undefined, "Informações Principais");
grupoPrincipal.orientation = "column";
grupoPrincipal.alignChildren = ["fill", "top"];

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
var grupoComponentes = conteudoLegenda.add("panel", undefined, "Componentes");
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
// Campo de multiplicador
grupo2.add("statictext", undefined, "x");
var campoMultiplicador = grupo2.add("edittext", undefined, "1");
campoMultiplicador.characters = 3;
apenasNumerosEVirgula(campoMultiplicador);

// Botão adicionar componente
var botaoAdicionarComponente = grupo2.add("button", undefined, "Adicionar Componente");

// Grupo para bolas
var grupoBolas = conteudoLegenda.add("panel", undefined, "Bolas");
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
        try {
            // Verificar se já existe uma bola com a mesma referência
            var bolaExistente = null;
            for (var i = 0; i < itensLegenda.length; i++) {
                if (itensLegenda[i].tipo === "bola" && itensLegenda[i].referencia === bolaSelecionada.referencia) {
                    bolaExistente = itensLegenda[i];
                    break;
                }
            }

            if (bolaExistente) {
                bolaExistente.quantidade = quantidade; // Atualiza com a nova quantidade
                bolaExistente.texto = atualizarTextoBola(bolaExistente);
            } else {
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
                    unidade: "units",
                    composta: bolaSelecionada.composta || false
                });
            }
            
            atualizarListaItens();
        } catch (e) {
            alert("Erro ao processar a bola: " + e.message);
        }
    } else {
        alert("Erro: Combinação de bola não encontrada na base de dados.");
    }
}

function atualizarTextoBola(bola) {
    var textoBoule = bola.quantidade === 1 ? "boule" : "boules";
    var texto = textoBoule + " " + bola.nome;
    if (bola.referencia) {
        texto += " (Ref: " + bola.referencia + ")";
    }
    texto += " units: " + bola.quantidade.toFixed(2).replace('.', ',');
    return texto;
}

    // Quarto grupo (Componentes adicionados)
 var grupoComponentesAdicionados = abaLegenda.add("group");
 grupoComponentesAdicionados.orientation = "row";
 grupoComponentesAdicionados.alignChildren = ["fill", "top"];
 grupoComponentesAdicionados.spacing = 10;
 
 // Subgrupo para a lista de itens adicionados
 var subgrupoListaItens = grupoComponentesAdicionados.add("group");
 subgrupoListaItens.orientation = "column";
 subgrupoListaItens.alignChildren = ["fill", "top"];
 subgrupoListaItens.maximumSize = [400, 200]; // Ajuste a largura conforme necessário
 
 // Lista de itens adicionados com barra de rolagem
 var listaItens = subgrupoListaItens.add("listbox", undefined, [], {multiselect: false});
 listaItens.preferredSize = [380, 180]; // Ajuste o tamanho conforme necessário
 
// Subgrupo para o botão remover item e adicionar legenda - linha 270
var subgrupoBotaoRemover = grupoComponentesAdicionados.add("group");
subgrupoBotaoRemover.orientation = "column";
subgrupoBotaoRemover.alignChildren = ["fill", "top"];
subgrupoBotaoRemover.spacing = 10;
subgrupoBotaoRemover.preferredSize = [200, 100]; // Linha 275 - Definir tamanho adequado

// Botão para remover item selecionado - Linha 276
var botaoRemoverItem = subgrupoBotaoRemover.add("button", undefined, "Remover Selecionado");
botaoRemoverItem.preferredSize = [180, 30]; // Linha 277

// Botão para remover todos os itens - Linha 278
var botaoRemoverTodos = subgrupoBotaoRemover.add("button", undefined, "Remover Todos");
botaoRemoverTodos.preferredSize = [180, 30]; // Linha 279

// Botão para adicionar legenda - Linha 280
var botaoGerar = subgrupoBotaoRemover.add("button", undefined, "Adicionar Legenda");
botaoGerar.preferredSize = [180, 30]; // Linha 281
  
function atualizarListaItens() {
    listaItens.removeAll();
    var componentesNaoBolas = [];
    var bolas = [];
    
    for (var i = 0; i < itensLegenda.length; i++) {
        if (itensLegenda[i].tipo === "bola") {
            bolas.push(itensLegenda[i]);
        } else {
            componentesNaoBolas.push(itensLegenda[i]);
        }
    }
    
    // Adicionar primeiro os componentes que não são bolas
    for (var i = 0; i < componentesNaoBolas.length; i++) {
        listaItens.add("item", componentesNaoBolas[i].texto);
    }
    
    // Adicionar as bolas por último
    for (var i = 0; i < bolas.length; i++) {
        listaItens.add("item", bolas[i].texto);
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
  };
  
  // Evento de clique no botão remover todos
  botaoRemoverTodos.onClick = function() {
      if (confirm("Tem certeza de que deseja remover todos os itens?")) {
          itensLegenda = [];
          atualizarListaItens();
      }
  };

  var grupoExtra = abaLegenda.add("panel", undefined, "Extra"); 
  grupoExtra.orientation = "column"; 
  grupoExtra.alignChildren = ["fill", "top"]; 
  grupoExtra.spacing = 10;
  grupoExtra.preferredSize.width = 700; 

  // Mover o checkbox para dentro do grupoExtra
  var checkboxMostrarObs = grupoExtra.add("checkbox", undefined, "Adicionar Observações");
  checkboxMostrarObs.value = false; // Inicialmente desmarcado
// Adicionar checkbox para ocultar/mostrar o campo "Alfabeto"
var checkboxMostrarAlfabeto = grupoExtra.add("checkbox", undefined, "Criar GX (Alfabeto)");
checkboxMostrarAlfabeto.value = false; // Inicialmente desmarcado

// Adicionar evento para o checkbox de alfabeto
var grupoAlfabeto, campoPalavraChave, dropdownCorBioprint, tamanhoAlfabeto, botaoAdicionarPalavraChave;

checkboxMostrarAlfabeto.onClick = function() {
    if (this.value) {
        // Adicionar o grupo de alfabeto
        grupoAlfabeto = grupoExtra.add("panel", undefined, "Alfabeto");
        grupoAlfabeto.orientation = "column"; // Alterar para "column" para alinhar verticalmente
        grupoAlfabeto.alignChildren = ["fill", "top"]; // Preencher a largura
        grupoAlfabeto.spacing = 10; // Adicionar espaçamento entre os elementos

        var subGrupoAlfabeto = grupoAlfabeto.add("group");
        subGrupoAlfabeto.orientation = "row";
        subGrupoAlfabeto.alignChildren = ["fill", "top"];
        subGrupoAlfabeto.spacing = 10;

        subGrupoAlfabeto.add("statictext", undefined, "Alfabeto:");
        campoPalavraChave = subGrupoAlfabeto.add("edittext", undefined, "");
        campoPalavraChave.characters = 20;

        // Adicionar texto estático para bioprint
        subGrupoAlfabeto.add("statictext", undefined, "Bioprint");

        // Adicionar dropdown para cor do bioprint
        subGrupoAlfabeto.add("statictext", undefined, "Cor:");
        dropdownCorBioprint = subGrupoAlfabeto.add("dropdownlist", undefined, ["Selecione a cor"]);

        // Manter o dropdown de tamanho existente
        subGrupoAlfabeto.add("statictext", undefined, "Tamanho:");
        tamanhoAlfabeto = subGrupoAlfabeto.add("dropdownlist", undefined, ["1,40 m", "2,00 m"]);
        tamanhoAlfabeto.selection = 0;

        botaoAdicionarPalavraChave = grupoAlfabeto.add("button", undefined, "Adicionar");

        // Adicionar linha separadora
        var linhaSeparadora = grupoAlfabeto.add("panel");
        linhaSeparadora.preferredSize = [-1, 2]; // Ajustar a largura para preencher e altura para 2px
        linhaSeparadora.graphics.backgroundColor = linhaSeparadora.graphics.newBrush(linhaSeparadora.graphics.BrushType.SOLID_COLOR, [0, 0, 0, 1]);

        // Adicionar texto de informação
        grupoAlfabeto.add("statictext", undefined, "Escreve a tua frase GX, e adiciona á legenda, não precisas de preencher o Nome/tipo. Para fazer o coração é: <3");

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
                'E': 'GX218LW', 'F': 'GX219LW', 'G': 'GX220LW', 'H': 'GX221LW',
                'I': 'GX222LW', 'J': 'GX223LW', 'K': 'GX224LW', 'L': 'GX225LW',
                'M': 'GX226LW', 'N': 'GX227LW', 'O': 'GX228LW', 'P': 'GX229LW',
                'Q': 'GX230LW', 'R': 'GX231LW', 'S': 'GX232LW', 'T': 'GX233LW',
                'U': 'GX234LW', 'V': 'GX235LW', 'W': 'GX236LW', 'X': 'GX237LW',
                'Y': 'GX238LW', 'Z': 'GX239LW', '<3': 'GX240LW', '#': 'GX241LW'
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

        janela.layout.layout(true); // Forçar atualização do layout
        janela.preferredSize.height += 100; // Aumentar a altura da janela
    } else {
        // Remover o grupo de alfabeto
        grupoAlfabeto.parent.remove(grupoAlfabeto);
        campoPalavraChave = null; // Definir campoPalavraChave como null quando o grupo é removido
        dropdownCorBioprint = null; // Definir dropdownCorBioprint como null quando o grupo é removido
        tamanhoAlfabeto = null; // Definir tamanhoAlfabeto como null quando o grupo é removido
        botaoAdicionarPalavraChave = null; // Definir botaoAdicionarPalavraChave como null quando o grupo é removido
        janela.layout.layout(true); // Forçar atualização do layout
        janela.preferredSize.height -= 100; // Diminuir a altura da janela
    }
    janela.layout.resize();
};

  // Adicionar checkbox para ocultar/mostrar o campo "Contar elementos"
  var checkboxMostrarContar = grupoExtra.add("checkbox", undefined, "Mostrar Contar Elementos");
  checkboxMostrarContar.value = false; // Inicialmente desmarcado

  // Adicionar evento para o checkbox de contar elementos
  checkboxMostrarContar.onClick = function() {
    if (this.value) {
        // Adicionar o grupo de contar elementos
        grupoContar = grupoExtra.add("panel", undefined, "Contar Elementos (bolas para já)");
        grupoContar.orientation = "column";
        grupoContar.alignChildren = ["fill", "top"];
        grupoContar.spacing = 10;

        // Criar a interface do contador de bolas
        var interfaceContador = criarInterfaceContadorBolas(grupoContar);

        janela.layout.layout(true);
        janela.preferredSize.height += 200; // Aumentar a altura da janela
    } else {
        // Remover o grupo de contar elementos
        grupoContar.parent.remove(grupoContar);
        janela.layout.layout(true);
        janela.preferredSize.height -= 200; // Diminuir a altura da janela
    }
    janela.layout.resize();
};

// Adicionar evento para o checkbox de observações
var grupoObs, campoObs; // Declarar as variáveis no escopo adequado
checkboxMostrarObs.onClick = function() {
    if (this.value) {
        // Adicionar o grupo de observações
        grupoObs = grupoExtra.add("panel", undefined, "Observações");
        grupoObs.orientation = "row";
        grupoObs.alignChildren = ["fill", "top"]; // Preencher a largura
        grupoObs.spacing = 0;

        grupoObs.add("statictext", undefined, "Obs:");

        // Adicionar uma caixa de texto para observações
        campoObs = grupoObs.add("edittext", undefined, "", {multiline: true, scrollable: true});
        campoObs.characters = 60;
        campoObs.preferredSize.height = 100; // Aumentar a altura da caixa de texto
        campoObs.alignment = ["fill", "fill"]; // Preencher a largura

        janela.layout.layout(true); // Forçar atualização do layout
        janela.preferredSize.height += 100; // Aumentar a altura da janela
    } else {
        // Remover o grupo de observações
        grupoObs.parent.remove(grupoObs);
        campoObs = null; // Definir campoObs como null quando o grupo é removido
        janela.layout.layout(true); // Forçar atualização do layout
        janela.preferredSize.height -= 100; // Diminuir a altura da janela
    }
    janela.layout.resize();
};

function atualizarPreview() {
    var previewText = [];
    var palavraDigitada = "";
    var corBioprint = "";
    var alfabetoUsado = false;
    var componentesAgrupados = {};
    var bolasCores = [];
    var totalBolas = 0;
    var contagemBolas = {};
    var bolasCompostas = false;
    var bolesContadas = [];
    var componentesTexto = [];
    var bolasTexto = [];
    
    var componentesReferencias = [];
    var bolasProcessadas = {};
    var referenciasAlfabeto = [];
    var itensProcessados = {};
    
    // Função auxiliar para verificar se é um array
    function isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    }

    // Função auxiliar para remover duplicatas
    function removerDuplicatas(arr) {
        var resultado = [];
        for (var i = 0; i < arr.length; i++) {
            if (!arrayContains(resultado, arr[i])) {
                resultado.push(arr[i]);
            }
        }
        return resultado;
    }

    // Função auxiliar para verificar se um array contém um elemento
    function arrayContains(arr, elem) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === elem) {
                return true;
            }
        }
        return false;
    }

    // Procurar pela palavra digitada no alfabeto, a cor do bioprint, componentes e bolas
    for (var i = 0; i < itensLegenda.length; i++) {
        var item = itensLegenda[i];
        if (item.tipo === "alfabeto" && item.palavraDigitada) {
            palavraDigitada = item.palavraDigitada;
            corBioprint = item.corBioprint;
            alfabetoUsado = true;
            referenciasAlfabeto.push(item);
        } else if (item.tipo === "componente") {
            var nomeComponente = item.nome.split(' ')[0];
            var corComponente = item.nome.split(' ').slice(1).join(' ');
            if (!componentesAgrupados[nomeComponente]) {
                componentesAgrupados[nomeComponente] = [];
            }
            if (!arrayContains(componentesAgrupados[nomeComponente], corComponente)) {
                componentesAgrupados[nomeComponente].push(corComponente);
            }
            if (!itensProcessados[item.referencia]) {
                componentesReferencias.push(criarLinhaReferencia(item));
                itensProcessados[item.referencia] = true;
            }
        } else if (item.tipo === "bola") {
            var corBola = item.nome.split(' ')[1];
            if (!arrayContains(bolasCores, corBola)) {
                bolasCores.push(corBola);
            }
            totalBolas += item.quantidade;
            
            var chaveBola = item.referencia || item.nome;
            if (!contagemBolas[chaveBola]) {
                contagemBolas[chaveBola] = 0;
            }
            contagemBolas[chaveBola] += item.quantidade;

            if (item.nome.toLowerCase().indexOf("composta") !== -1) {
                bolasCompostas = true;
            }
            
            // Verificar se já processamos esta bola
            if (!bolasProcessadas[chaveBola] || item.unidade === "units") {
                bolasProcessadas[chaveBola] = item;
            }
        } else if (item.tipo === "contagem") {
            // Extrair as cores das bolas contadas
            var linhas = item.texto.split('\n');
            for (var j = 1; j < linhas.length; j++) { // Começar do índice 1 para pular o total
                var match = linhas[j].match(/boule\s+(\S+)/);
                if (match && match[1]) {
                    if (!arrayContains(bolesContadas, match[1])) {
                        bolesContadas.push(match[1]);
                    }
                }
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

    // Adicionar as bolas (incluindo as contadas e compostas)
    var todasBolas = [];
    var bolasCompostas = [];
    if (isArray(bolasCores)) {
        for (var i = 0; i < bolasCores.length; i++) {
            todasBolas.push(bolasCores[i]);
        }
    }
    if (isArray(bolesContadas)) {
        for (var i = 0; i < bolesContadas.length; i++) {
            todasBolas.push(bolesContadas[i]);
        }
    }
    
    // Separar bolas compostas
    for (var i = 0; i < itensLegenda.length; i++) {
        if (itensLegenda[i].tipo === "bola" && itensLegenda[i].composta) {
            bolasCompostas.push(itensLegenda[i].nome);
        }
    }
    
    // Remover duplicatas
    todasBolas = removerDuplicatas(todasBolas);
    bolasCompostas = removerDuplicatas(bolasCompostas);

    if (todasBolas.length > 0 || bolasCompostas.length > 0) {
        var textoBoule = totalBolas > 1 ? "boules" : "boule";
        frasePrincipal += ", " + textoBoule + " " + todasBolas.join(", ");
        if (bolasCompostas.length > 0) {
            frasePrincipal += ", boules composées " + bolasCompostas.join(", ");
        }
    }

    frasePrincipal += ", sur structure aluminium";
    if (checkStructure.value) {
        frasePrincipal += " laqué " + (corStructure.selection ? corStructure.selection.text : "");
    }
    frasePrincipal += ".";

    previewText.push(frasePrincipal);

    // Adicionar dimensões
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
    if (dimensoesValidas.length > 0) {
        previewText.push(dimensoesValidas.join(" - "));
    }

    // Adicionar tipo de fixação
    previewText.push("Fixation: " + (listaFixacao.selection ? listaFixacao.selection.text : ""));

    previewText.push("\u200B"); // Linha em branco após a fixação

    // Adicionar referências do alfabeto
    for (var i = 0; i < referenciasAlfabeto.length; i++) {
        previewText = previewText.concat(referenciasAlfabeto[i].texto.split('\n'));
    }

    // Adicionar referências de componentes
    previewText = previewText.concat(componentesReferencias);
    
    // Adicionar uma linha em branco antes do Total de boules
    previewText.push("\u200B");

    // Adicionar contagem de bolas
    if (totalBolas > 0) {
        var textoBouleContagem = totalBolas === 1 ? "boule" : "boules";
        previewText.push("Total de " + totalBolas + " " + textoBouleContagem + " :");
        for (var chaveBola in bolasProcessadas) {
            if (bolasProcessadas.hasOwnProperty(chaveBola)) {
                var bolaItem = bolasProcessadas[chaveBola];
                previewText.push(criarLinhaReferencia(bolaItem));
            }
        }
    }

    // Adicionar contagem de elementos
    var contagemElementosTexto = [];
    for (var i = 0; i < itensLegenda.length; i++) {
        if (itensLegenda[i].tipo === "contagem") {
            var linhas = itensLegenda[i].texto.split('\n');
            contagemElementosTexto.push(linhas[0]); // Adiciona a primeira linha (total)
            for (var j = 1; j < linhas.length; j++) {
                var linha = linhas[j];
                // Verifica se a linha contém informações sobre uma bola
                if (linha.indexOf("boule") !== -1) {
                    // Adiciona "(units)" após a medida, mantendo o formato original
                    linha = linha.replace(/(\d+(?:,\d+)?\s*m)/, "$1 (units)");
                }
                contagemElementosTexto.push(linha);
            }
            break;
        }
    }

    if (contagemElementosTexto.length > 0) {
        previewText = previewText.concat(contagemElementosTexto);
    }

    previewText.push("\u200B"); // Outra linha em branco

    // Adicionar observações
    if (campoObs && campoObs.text && campoObs.text.toString().replace(/\s/g, '').length > 0) {
        previewText.push("Obs: " + campoObs.text);
    }

    return previewText.join("\n");
}

function criarLinhaReferencia(item) {
    var linha = item.referencia ? item.referencia : item.nome;
    if (item.unidade) {
        linha += " (" + item.unidade + ")";
    }
    if (item.multiplicador && item.multiplicador > 1) {
        linha += " x" + item.multiplicador;
    }
    if (item.quantidade !== undefined) {
        var quantidadeFormatada = regras.formatarQuantidade(item.quantidade, item.componenteId, item.unidade);
        linha += ": " + quantidadeFormatada;
    }
    return linha;
}

function criarLinhaReferencia(item) {
    var linha = item.referencia ? item.referencia : item.nome;
    if (item.unidade) {
        linha += " (" + item.unidade + ")";
    }
    if (item.multiplicador && item.multiplicador > 1) {
        linha += " x" + item.multiplicador;
    }
    if (item.quantidade !== undefined) {
        var quantidadeFormatada;
        if (item.unidade === "units") {
            quantidadeFormatada = Math.round(item.quantidade).toString();
        } else {
            quantidadeFormatada = item.quantidade.toFixed(2).replace('.', ',');
        }
        linha += ": " + quantidadeFormatada;
    }
    if (item.composta) {
        linha += " (composta)";
    }
    return linha;
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
        var multiplicador = parseFloat(campoMultiplicador.text.replace(',', '.'));
        if (isNaN(quantidade) || quantidade <= 0 || isNaN(multiplicador) || multiplicador <= 0) {
            alert("Por favor, insira uma quantidade e um multiplicador válidos para o componente.");
            return;
        }
        
        quantidade *= multiplicador;
    
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
            
            texto += " (" + unidadeSelecionada + ")";
        
            if (multiplicador > 1) {
                texto += " x" + multiplicador;
            }
        
            texto += ": " + regras.formatarQuantidade(quantidade, componenteSelecionado.id, unidadeSelecionada);
            
            itensLegenda.push({
                tipo: "componente",
                nome: componenteSelecionado.nome + " " + corSelecionada.nome,
                texto: texto,
                referencia: combinacaoSelecionada.referencia,
                quantidade: quantidade,
                unidade: unidadeSelecionada,
                componenteId: componenteSelecionado.id,
                multiplicador: multiplicador
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
        if (confirm("Tens certeza que adicionaste todos os componentes que precisavas?")) {
            try {
                var legendaConteudo = atualizarPreview(); // Agora chamamos atualizarPreview() aqui 
                
                if (legendaConteudo === undefined) {
                    alert("Erro: Não foi possível gerar o conteúdo da legenda.");
                    return;
                }
        
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
                        // Substitui o símbolo de diâmetro por Ø
                        linha = linha.replace(/⌀/g, "Ø");
                        
                        // Procura por padrões de unidade seguidos por dois pontos e possivelmente um multiplicador
                        linha = linha.replace(/(\(ml|munit\))(\s*x\d+)?:/g, "$1$2:");
                        
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
        novoParag.paragraphAttributes.spaceBefore = 0;
        novoParag.paragraphAttributes.spaceAfter = 0;
        
        // Adiciona espaço extra após a linha de fixação, antes das observações e antes da contagem de elementos
    if (linhas[i] === "\u200B") {
        novoParag.paragraphAttributes.spaceBefore = 6;
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
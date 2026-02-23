#target illustrator
#targetengine maintarget

// Importar bibliotecas base
$.evalFile(File($.fileName).path + "/assets/json2.js");
$.evalFile(File($.fileName).path + "/assets/translations.js");

// Importar módulos fundamentais
$.evalFile(File($.fileName).path + "/core/funcoes.jsx");
$.evalFile(File($.fileName).path + "/core/database.jsx");
$.evalFile(File($.fileName).path + "/core/logs.jsx");
$.evalFile(File($.fileName).path + "/core/regras.jsx");

// Importar módulos funcionais
$.evalFile(File($.fileName).path + "/modules/funcoesComponentes.jsx");
$.evalFile(File($.fileName).path + "/modules/funcoesBolas.jsx");
$.evalFile(File($.fileName).path + "/modules/funcoesLegenda.jsx");
$.evalFile(File($.fileName).path + "/modules/funcoesFiltragem.jsx");
$.evalFile(File($.fileName).path + "/modules/alfabeto.jsx");

// Importar módulos de infraestrutura
$.evalFile(File($.fileName).path + "/infrastructure/bridge.jsx");
$.evalFile(File($.fileName).path + "/infrastructure/config.jsx");
$.evalFile(File($.fileName).path + "/core/inicializacao.jsx");

// Importar módulos de interface e gestão
$.evalFile(File($.fileName).path + "/ui/ui.jsx");
$.evalFile(File($.fileName).path + "/ui/gestaoLista.jsx");
$.evalFile(File($.fileName).path + "/ui/eventosUI.jsx");

// Importar módulos de manutenção
$.evalFile(File($.fileName).path + "/infrastructure/update.jsx");

// Definir variáveis no escopo global
var caminhoConfig = Folder.myDocuments.fsName + "/cartouche_config.json";
var nomeDesigner = "";
var idiomaUsuario = "Português";
var IDIOMA_ATUAL = "Português";

var itensLegenda = [];
var itensNomes = [];
// Variável para armazenar última seleção
var ultimaSelecao = {
    componente: null,
    cor: null,
    unidade: null,
    multiplicador: "1"
};

(function() {
// Inicializar sistema usando o módulo inicializacao.jsx
var dados;
try {
    dados = inicializacao.inicializarSistema();
} catch (e) {
    // Erro já foi tratado pelo módulo de inicialização
    return;
}

// Criar a janela principal
var janela = new Window("palette", t("tituloJanela"), undefined);
// Tornar a janela acessível globalmente para reinício
$.global.janelaScript = janela;
janela.orientation = "column";
janela.alignChildren = ["fill", "top"];
janela.spacing = 10;
janela.margins = 16;

// Garantir que a janela pode ser fechada
janela.addEventListener('close', function() {
    $.global.componentesObservacoes = null;
    $.global.janelaScript = null;
    $.global.legendaEstadoObs = null;
    return true;
});

// Garantir que o evento de fechamento é processado corretamente
if (janela.closeButton) {
    janela.closeButton.onClick = function() {
        janela.close();
    };
}

function obterChaveDocumentoAtivo() {
    try {
        if (app && app.documents && app.documents.length > 0 && app.activeDocument) {
            var doc = app.activeDocument;
            try {
                if (doc.fullName) {
                    return doc.fullName.fsName;
                }
            } catch (e1) {}
            return doc.name || "";
        }
    } catch (e2) {}
    return "";
}

function sincronizarObservacoesComDocumento(campoObs) {
    var chaveAtual = obterChaveDocumentoAtivo();
    if (!$.global.legendaEstadoObs) {
        $.global.legendaEstadoObs = {
            chaveDocumento: chaveAtual,
            ultimoTexto: campoObs ? campoObs.text : ""
        };
        return;
    }

    var estado = $.global.legendaEstadoObs;
    if (estado.chaveDocumento !== chaveAtual) {
        // Se mudou de documento e o texto atual e exatamente o ultimo usado,
        // considerar valor herdado e limpar.
        if (campoObs && campoObs.text === estado.ultimoTexto) {
            campoObs.text = "";
        }
        estado.chaveDocumento = chaveAtual;
    }

    estado.ultimoTexto = campoObs ? campoObs.text : "";
}

// Grupo para o botão Update (acima das abas)
var grupoUpdate = janela.add("group");
grupoUpdate.orientation = "row";
grupoUpdate.alignment = ["fill", "top"];

// Dropdown de idiomas (agora à esquerda)
var dropdownIdiomas = grupoUpdate.add("dropdownlist", undefined, [
    "Português",
    "Français"
]);
dropdownIdiomas.alignment = ["left", "center"];

// Espaço flexível para empurrar o texto da versão e botão para a direita
var espacoFlexivel = grupoUpdate.add("group");
espacoFlexivel.alignment = ["fill", "center"];

// Texto da versão (antes do botão Update)
var textoVersao = grupoUpdate.add("statictext", undefined, "v2.2.7");
textoVersao.graphics.font = ScriptUI.newFont(textoVersao.graphics.font.family, ScriptUI.FontStyle.REGULAR, 9);
textoVersao.alignment = ["right", "center"];

// Selecionar o idioma do arquivo de configuração silenciosamente
if (idiomaUsuario) {
    dropdownIdiomas.selection = dropdownIdiomas.find(idiomaUsuario);
} else {
    dropdownIdiomas.selection = 0;
}

// Evento será configurado pelo módulo eventosUI

// Na criação do dropdown, selecionar o idioma atual
dropdownIdiomas.selection = dropdownIdiomas.find(IDIOMA_ATUAL);
// Botão Update
var botaoUpdate = grupoUpdate.add("button", undefined, t("botaoUpdate"));
botaoUpdate.alignment = ["right", "center"];
botaoUpdate.size = [60, 25];

// Evento será configurado pelo módulo eventosUI

// Criar abas para Legenda e Contador de Bolas
var abas = janela.add("tabbedpanel");
abas.alignChildren = ["fill", "fill"];
var abaLegenda = abas.add("tab", undefined, t("legenda"));

// Criar conteúdo para a aba Legenda
var conteudoLegenda = abaLegenda.add("group");
conteudoLegenda.orientation = "column";
conteudoLegenda.alignChildren = ["fill", "top"];

// Grupo para informações principais
var grupoPrincipal = conteudoLegenda.add("panel", undefined, t("informacoesPrincipais"));
grupoPrincipal.orientation = "column";
grupoPrincipal.alignChildren = ["fill", "top"];

// Primeira linha: Nome
var linha1 = grupoPrincipal.add("group");
linha1.orientation = "row";
linha1.alignChildren = ["left", "center"];
linha1.spacing = 10;

// Campo do nome
var textoNome = t("nome");  // minúsculo para o label
var textoNomeMaiusculo = t("Nome");  // maiúsculo para o dropdown/título
linha1.add("statictext", undefined, textoNome);
var campoNome = linha1.add("statictext", undefined, nomeDesigner);
campoNome.characters = 20;

// Segunda linha: Nome/Tipo dropdown, L e Tipo de fixação (otimizada)
var linha2 = grupoPrincipal.add("group");
linha2.orientation = "row";
linha2.alignChildren = ["left", "center"];
linha2.spacing = 8; // Reduzir espaçamento geral de 10 para 8

// Modificar a criação do dropdown para usar as strings traduzidas
var escolhaNomeTipo = linha2.add("dropdownlist", undefined, [
    t("Nome"),
    t("Tipo")
]);
escolhaNomeTipo.selection = 0;  // Seleciona a primeira opção por padrão
escolhaNomeTipo.selection = 0;
linha2.add("statictext", undefined, ":");
var campoNomeTipo = linha2.add("edittext", undefined, "");
campoNomeTipo.characters = 20;

// Espaço flexível
var espacoFlexivel = linha2.add("group");
espacoFlexivel.alignment = ["fill", "center"];

// Grupo super compacto para L e Tipo de fixação (eliminar espaço extra)
var grupoLFixacao = linha2.add("group");
grupoLFixacao.orientation = "row";
grupoLFixacao.spacing = 3; // Espaçamento mínimo entre todos os elementos
grupoLFixacao.add("statictext", undefined, "L:");
var opcoesL = [];
for (var i = 1; i <= 30; i++) {
    opcoesL.push("L" + i);
}
var listaL = grupoLFixacao.add("dropdownlist", undefined, opcoesL);
// listaL.selection = 0; // Removido para não selecionar nenhum valor por padrão
listaL.preferredSize.width = 50; // Reduzir ainda mais para 50px

// Evento será configurado pelo módulo eventosUI

grupoLFixacao.add("statictext", undefined, t("fixacao"));

// Tipos de fixação
var tiposFixacao = [];
var tiposFixacaoKeys = ["poteau latéral","poteau central", "suspendue", "transversal", "murale", "sansFixation", "auSol", "speciale", "aucune"];

// Preencher o array com as traduções
for (var i = 0; i < tiposFixacaoKeys.length; i++) {
    tiposFixacao.push(t("tiposFixacao")[tiposFixacaoKeys[i]]);
}

// Criar o dropdown com os tipos traduzidos
var listaFixacao = grupoLFixacao.add("dropdownlist", undefined, [t("selecioneFixacao")].concat(tiposFixacao));
listaFixacao.selection = 0;

// Terceira linha: Dimensões e Structure laqueé (otimizada)
var linha3 = grupoPrincipal.add("group");
linha3.orientation = "row";
linha3.alignChildren = ["left", "center"];
linha3.spacing = 5; // Reduzir espaçamento geral de 10 para 5

// Campos H, L, P, ⌀ (otimizados para economizar espaço)
var grupoDimensoes = linha3.add("group");
grupoDimensoes.spacing = 3; // Reduzir espaçamento entre elementos
var dimensoes = ["H", "L", "P", "⌀"];
for (var i = 0; i < dimensoes.length; i++) {
    grupoDimensoes.add("statictext", undefined, dimensoes[i] + ":");
    var campoDimensao = grupoDimensoes.add("edittext", undefined, "");
    campoDimensao.characters = 4; // Reduzir de 5 para 4 caracteres
    campoDimensao.preferredSize.width = 35; // Definir largura fixa menor
    apenasNumerosEVirgula(campoDimensao);
}

// Espaço flexível
var espacoFlexivel = linha3.add("group");
espacoFlexivel.alignment = ["fill", "center"];

// Campos opcionais: Usage e Quantité prévue (otimizados)
var grupoCamposOpcionais = linha3.add("group");
grupoCamposOpcionais.orientation = "row";
grupoCamposOpcionais.alignChildren = ["left", "center"];
grupoCamposOpcionais.spacing = 5; // Reduzir espaçamento de 10 para 5

// Campo Usage (dropdown mais compacto)
grupoCamposOpcionais.add("statictext", undefined, t("usage"));
var campoUsage = grupoCamposOpcionais.add("dropdownlist", undefined, [t("selecioneUsage"), t("usageInterieur"), t("usageExterieur")]);
campoUsage.selection = 0;
campoUsage.preferredSize.width = 100; // Reduzir de 120 para 100

// Evento será configurado pelo módulo eventosUI

// Campo Quantité prévue (input numérico mais compacto)
grupoCamposOpcionais.add("statictext", undefined, t("quantitePrevu"));
var campoQuantitePrevu = grupoCamposOpcionais.add("edittext", undefined, "");
campoQuantitePrevu.characters = 6; // Reduzir de 8 para 6
campoQuantitePrevu.preferredSize.width = 50; // Definir largura fixa menor
funcoes.apenasNumerosEVirgula(campoQuantitePrevu);

// Evento será configurado pelo módulo eventosUI

// Campo Preço (input numérico mais compacto)
grupoCamposOpcionais.add("statictext", undefined, t("preco"));
var campoPreco = grupoCamposOpcionais.add("edittext", undefined, "");
campoPreco.characters = 6; // Mesmo tamanho que o campo quantidade
campoPreco.preferredSize.width = 50; // Definir largura fixa menor
funcoes.apenasNumerosEVirgula(campoPreco);

// Evento será configurado pelo módulo eventosUI

var coresStructure = [
    "Blanc RAL 9010",
    "Or PANTONE 131C",
    "Rouge RAL 3000",
    "Bleu RAL 5005",
    "Vert RAL 6029",
    "Rose RAL 3015",
    "Noir RAL 9011"
];

// Atualizar a criação do dropdown para a estrutura lacada
var grupoStructure = linha3.add("group");
var checkStructure = grupoStructure.add("checkbox", undefined, t("structureLaqueada"));
var corStructure = grupoStructure.add("dropdownlist", undefined, coresStructure);
corStructure.selection = 0;

// Tornar o dropdown de cores visível apenas quando o checkbox estiver marcado
corStructure.visible = false;

// Segundo grupo (Componentes)
var grupoComponentes = conteudoLegenda.add("panel", undefined, t("painelComponentes"));
grupoComponentes.orientation = "column";
grupoComponentes.alignChildren = "left";

// Grupo para o campo de pesquisa
var grupoPesquisa = grupoComponentes.add("group");
grupoPesquisa.orientation = "row";
grupoPesquisa.alignChildren = "center";


var labelPesquisa = grupoPesquisa.add("statictext", undefined, t("procurar"));

var grupo2 = grupoComponentes.add("group");
grupo2.orientation = "row";

// Atualizar a criação da lista de componentes
var componentesSeparados = funcoesFiltragem.getComponentesComCombinacoes(dados, t, funcoes.arrayContains, funcoes.encontrarPorId);
var componentesOriginaisPrint = componentesSeparados.componentesPrint.slice(0);
var componentesOriginaisLeds = componentesSeparados.componentesLeds.slice(0);
var componentesOriginaisNormais = componentesSeparados.componentesNormais.slice(0);

// Ordenar apenas os componentes normais (bubble sort tradicional)
for (var i = 0; i < componentesOriginaisNormais.length - 1; i++) {
    for (var j = 0; j < componentesOriginaisNormais.length - i - 1; j++) {
        if (componentesOriginaisNormais[j].toLowerCase() > componentesOriginaisNormais[j + 1].toLowerCase()) {
            var temp = componentesOriginaisNormais[j];
            componentesOriginaisNormais[j] = componentesOriginaisNormais[j + 1];
            componentesOriginaisNormais[j + 1] = temp;
        }
    }
}

// Função auxiliar para criar linha de grupo de componentes
function criarLinhaGrupo(grupoPai, labelGrupo, componentesGrupo) {
    var grupoLinha = grupoPai.add("group");
    grupoLinha.orientation = "row";
    grupoLinha.alignChildren = "center";
    grupoLinha.add("statictext", undefined, labelGrupo);
    var listaComponentes = grupoLinha.add("dropdownlist", undefined, [t("selecioneComponente")].concat(componentesGrupo));
    listaComponentes.selection = 0;
    var listaCores = grupoLinha.add("dropdownlist", undefined, [t("selecioneCor")].concat(extrairNomes(dados.cores)));
    listaCores.selection = 0;
    var listaUnidades = grupoLinha.add("dropdownlist", undefined, [t("selecioneUnidade")]);
    listaUnidades.selection = 0;

    // Grupo para campos de quantidade
    var grupoQuantidades = grupoLinha.add("group");
    grupoQuantidades.orientation = "row";
    grupoQuantidades.alignChildren = "center";
    var camposQuantidade = [];

    // Função para criar um campo de quantidade (modificada para garantir só um campo visível)
    function criarCampoQuantidade(valorPadrao) {
        // Antes de criar, remover todos os campos existentes
        while (camposQuantidade.length > 0) {
            grupoQuantidades.remove(camposQuantidade[0]);
            camposQuantidade.splice(0, 1);
        }
        var campo = grupoQuantidades.add("edittext", undefined, valorPadrao ? valorPadrao : "");
        campo.characters = 4;
        campo.preferredSize.width = 40;
        camposQuantidade.push(campo);
        return campo;
    }
    // Função para remover um campo de quantidade
    function removerCampoQuantidade(campo) {
        for (var i = 0; i < camposQuantidade.length; i++) {
            if (camposQuantidade[i] === campo) {
                grupoQuantidades.remove(campo);
                camposQuantidade.splice(i, 1);
                break;
            }
        }
        grupoLinha.layout.layout(true);
        grupoLinha.layout.resize();
    }
    // Adicionar campo inicial
    var campoQuantidade = criarCampoQuantidade("");
    // Botão +
    var botaoMais = grupoQuantidades.add("button", undefined, "+");
    botaoMais.preferredSize.width = 22;
    botaoMais.preferredSize.height = 22;
    botaoMais.onClick = function() {
        try {
            // Abrir nova janela para edição de quantidades
            var dialogQuantidades = new Window("palette", "Editar Quantidades");
        dialogQuantidades.orientation = "column";
        dialogQuantidades.alignChildren = ["fill", "top"];
        dialogQuantidades.spacing = 10;
        dialogQuantidades.margins = 16;
        dialogQuantidades.preferredSize.width = 320;
        dialogQuantidades.preferredSize.height = 400;
        
        // Proteção contra janela órfã
        dialogQuantidades.onClose = function() {
            try {
                // Verificar se a janela principal ainda existe
                if (!janela || janela.toString() === "[object Window]") {
                    return true; // Permitir fechamento
                }
                return true;
            } catch (e) {
                return true; // Em caso de erro, permitir fechamento
            }
        };

        // Título da seção
        var tituloSecao = dialogQuantidades.add("statictext", undefined, "Campos de Valores:");
        tituloSecao.graphics.font = ScriptUI.newFont(tituloSecao.graphics.font.family, ScriptUI.FontStyle.BOLD, 10);
        
        // Cabeçalho explicativo
        var grupoCabecalho = dialogQuantidades.add("group");
        grupoCabecalho.orientation = "row";
        grupoCabecalho.alignChildren = ["left", "center"];
        grupoCabecalho.spacing = 5;
        
        var labelValor = grupoCabecalho.add("statictext", undefined, "Valor");
        labelValor.preferredSize.width = 40;
        labelValor.graphics.font = ScriptUI.newFont(labelValor.graphics.font.family, ScriptUI.FontStyle.BOLD, 9);
        
        var labelDescricao = grupoCabecalho.add("statictext", undefined, "Descrição (opcional)");
        labelDescricao.preferredSize.width = 120;
        labelDescricao.graphics.font = ScriptUI.newFont(labelDescricao.graphics.font.family, ScriptUI.FontStyle.BOLD, 9);

        // Área scrollável para os campos
        var painelCampos = dialogQuantidades.add("panel");
        painelCampos.orientation = "column";
        painelCampos.alignChildren = ["fill", "top"];
        painelCampos.preferredSize.width = 290;
        painelCampos.preferredSize.height = 150;
        
        var grupoCampos = painelCampos.add("group");
        grupoCampos.orientation = "column";
        grupoCampos.alignChildren = ["fill", "top"];
        var camposTemp = [];

        // Função para criar campo na janela
        function criarCampoTemp(valorPadrao, descricaoPadrao) {
            try {
                var grupoLinhaTemp = grupoCampos.add("group");
            grupoLinhaTemp.orientation = "row";
            grupoLinhaTemp.alignChildren = ["left", "center"];
            grupoLinhaTemp.spacing = 5;
            
            // Campo numérico
            var campoTemp = grupoLinhaTemp.add("edittext", undefined, valorPadrao ? valorPadrao : "");
            campoTemp.characters = 4;
            campoTemp.preferredSize.width = 40;
            
            // Configurar navegação por Tab
            campoTemp.addEventListener('keydown', function(event) {
                // Tab key = keyCode 9
                if (event.keyName === 'Tab') {
                    event.preventDefault();
                    // Encontrar próximo campo
                    var indiceCampoAtual = -1;
                    for (var k = 0; k < camposTemp.length; k++) {
                        if (camposTemp[k].campo === campoTemp) {
                            indiceCampoAtual = k;
                            break;
                        }
                    }
                    // Ir para próximo campo ou criar novo se for o último
                    if (indiceCampoAtual >= 0) {
                        if (indiceCampoAtual < camposTemp.length - 1) {
                            // Ir para próximo campo existente
                            camposTemp[indiceCampoAtual + 1].campo.active = true;
                        } else {
                            // Se for o último campo e tiver valor, criar novo e focar nele
                            if (campoTemp.text && campoTemp.text.length > 0) {
                                var novoCampo = criarCampoTemp("", "");
                                dialogQuantidades.layout.layout(true);
                                dialogQuantidades.layout.resize();
                                // Focar no novo campo criado
                                novoCampo.active = true;
                            }
                        }
                    }
                }
            });
            
            // Validação em tempo real - só permite números, vírgula e ponto
            campoTemp.onChanging = function() {
                // Filtrar caracteres não numéricos (exceto vírgula, ponto e menos)
                var texto = campoTemp.text;
                var textoLimpo = texto.replace(/[^0-9.,\-]/g, "");
                if (texto !== textoLimpo) {
                    campoTemp.text = textoLimpo;
                }
            };
            
            // Campo de descrição (opcional)
            var campoDescricao = grupoLinhaTemp.add("edittext", undefined, descricaoPadrao ? descricaoPadrao : "");
            campoDescricao.characters = 15;
            campoDescricao.preferredSize.width = 120;
            campoDescricao.helpTip = "Descrição opcional (não conta no total)";
            
            camposTemp.push({campo: campoTemp, descricao: campoDescricao, grupo: grupoLinhaTemp});
            
            // Botão - para remover
            var botaoRemoverTemp = grupoLinhaTemp.add("button", undefined, "-");
            botaoRemoverTemp.preferredSize.width = 22;
            botaoRemoverTemp.preferredSize.height = 22;
            botaoRemoverTemp.onClick = function() {
                for (var i = 0; i < camposTemp.length; i++) {
                    if (camposTemp[i].campo === campoTemp) {
                        grupoCampos.remove(camposTemp[i].grupo);
                        camposTemp.splice(i, 1);
                        break;
                    }
                }
                atualizarSoma();
                dialogQuantidades.layout.layout(true);
                dialogQuantidades.layout.resize();
            };
            // Evento adicional para soma e auto-adição (após validação)
            campoTemp.addEventListener('changing', function() {
                // Executar após a validação
                atualizarSoma();
                // Verificar se é o último campo e tem valor
                var isUltimoCampo = camposTemp[camposTemp.length - 1].campo === campoTemp;
                var temValor = campoTemp.text && campoTemp.text.length > 0;
                
                if (isUltimoCampo && temValor) {
                    // Adicionar novo campo automaticamente
                    criarCampoTemp("", "");
                    dialogQuantidades.layout.layout(true);
                    dialogQuantidades.layout.resize();
                }
            });
            // Evento onBlur para validação final
            campoTemp.onDeactivate = function() {
                var valor = parseFloat(campoTemp.text.replace(",", "."));
                if (campoTemp.text && (isNaN(valor) || valor <= 0)) {
                    campoTemp.graphics.backgroundColor = campoTemp.graphics.newBrush(campoTemp.graphics.BrushType.SOLID_COLOR, [1, 0.9, 0.9]);
                } else {
                    campoTemp.graphics.backgroundColor = campoTemp.graphics.newBrush(campoTemp.graphics.BrushType.SOLID_COLOR, [1, 1, 1]);
                }
            };
            return campoTemp;
            } catch (e) {
                alert("ERRO na criarCampoTemp: " + e.toString() + "\nLinha: " + e.line);
                return null;
            }
        }
        // Preencher campos com valores atuais
        for (var i = 0; i < camposQuantidade.length; i++) {
            criarCampoTemp(camposQuantidade[i].text, "");
        }
        // Se não houver campos, criar um
        if (camposTemp.length === 0) {
            criarCampoTemp("", "");
        }
        
        // Focar no primeiro campo automaticamente
        if (camposTemp.length > 0) {
            camposTemp[0].campo.active = true;
        }
        
        // Botão + removido - adição automática de campos implementada
        // Separador visual
        var separador = dialogQuantidades.add("panel");
        separador.preferredSize.height = 2;
        
        // Painel destacado para o resumo
        var painelResumo = dialogQuantidades.add("panel", undefined, "Resumo");
        painelResumo.orientation = "column";
        painelResumo.alignChildren = ["fill", "top"];
        painelResumo.spacing = 8;
        painelResumo.margins = 10;
        
        // Área scrollável para os valores
        var grupoValores = painelResumo.add("group");
        grupoValores.orientation = "column";
        grupoValores.alignChildren = ["fill", "top"];
        
        var labelValores = grupoValores.add("statictext", undefined, "Valores inseridos:");
        labelValores.graphics.font = ScriptUI.newFont(labelValores.graphics.font.family, ScriptUI.FontStyle.BOLD, 9);
        
        var areaValores = grupoValores.add("edittext", undefined, "-", {multiline: true, scrollable: true, readonly: true});
        areaValores.preferredSize.width = 280;
        areaValores.preferredSize.height = 50;
        areaValores.graphics.font = ScriptUI.newFont(areaValores.graphics.font.family, ScriptUI.FontStyle.REGULAR, 9);
        
        // Soma total destacada
        var grupoSoma = painelResumo.add("panel");
        grupoSoma.orientation = "row";
        grupoSoma.alignChildren = ["center", "center"];
        grupoSoma.margins = 8;
        grupoSoma.preferredSize.width = 280;
        grupoSoma.preferredSize.height = 35;
        
        var textoSoma = grupoSoma.add("statictext", undefined, "TOTAL: 0");
        textoSoma.graphics.font = ScriptUI.newFont("Arial", ScriptUI.FontStyle.BOLD, 16);
        textoSoma.graphics.foregroundColor = textoSoma.graphics.newPen(textoSoma.graphics.PenType.SOLID_COLOR, [1, 1, 1], 1);
        // Definir tamanho adequado para acomodar números grandes
        textoSoma.preferredSize.width = 200;
        textoSoma.preferredSize.height = 25;
        
        function atualizarSoma() {
            var soma = 0;
            var numerosValidos = [];
            var valoresInvalidos = 0;
            
            for (var i = 0; i < camposTemp.length; i++) {
                var textoOriginal = camposTemp[i].campo.text;
                var valor = parseFloat(textoOriginal.replace(",", "."));
                
                if (!isNaN(valor) && valor > 0) {
                    soma += valor;
                    numerosValidos.push(valor);
                } else if (textoOriginal && textoOriginal.length > 0) {
                    valoresInvalidos++;
                }
            }
            // Atualizar lista de valores com quebras de linha organizadas
            if (numerosValidos.length > 0) {
                var textoValores = "";
                if (numerosValidos.length <= 6) {
                    // Poucos números: mostrar em linha
                    var numerosFormatados = [];
                    for (var j = 0; j < numerosValidos.length; j++) {
                        var num = numerosValidos[j];
                        if (num % 1 === 0) {
                            numerosFormatados.push(num.toString());
                        } else {
                            numerosFormatados.push(num.toString());
                        }
                    }
                    textoValores = numerosFormatados.join(" + ");
                } else {
                    // Muitos números: mostrar em linhas organizadas (5 por linha)
                    for (var i = 0; i < numerosValidos.length; i++) {
                        if (i > 0 && i % 5 === 0) {
                            textoValores += "\n";
                        }
                        var numeroFormatado = numerosValidos[i];
                        if (numeroFormatado % 1 === 0) {
                            numeroFormatado = numeroFormatado.toString();
                        } else {
                            numeroFormatado = numeroFormatado.toString();
                        }
                        textoValores += numeroFormatado;
                        if (i < numerosValidos.length - 1) {
                            textoValores += " + ";
                        }
                    }
                }
                areaValores.text = textoValores;
            } else {
                areaValores.text = "-";
            }
            // Recalcular soma especificamente para exibição
            var somaExibicao = 0;
            for (var j = 0; j < numerosValidos.length; j++) {
                somaExibicao = somaExibicao + numerosValidos[j];
            }
            
            // Forçar conversão para string de forma explícita
            var somaString = String(somaExibicao);
            
            // Atualizar soma destacada com informação sobre valores inválidos  
            var textoTotal = "TOTAL: " + somaString;
            if (valoresInvalidos > 0) {
                textoTotal += " (" + valoresInvalidos + " inválido" + (valoresInvalidos > 1 ? "s" : "") + ")";
            }
            
            // Forçar atualização da interface
            textoSoma.text = textoTotal;
            textoSoma.parent.layout.layout(true);
            textoSoma.parent.layout.resize();
        }
        atualizarSoma();
        // Botões OK e Cancelar
        var grupoBotoes = dialogQuantidades.add("group");
        grupoBotoes.orientation = "row";
        var botaoOK = grupoBotoes.add("button", undefined, "OK");
        var botaoCancelar = grupoBotoes.add("button", undefined, "Cancelar");
        botaoOK.onClick = function() {
            // Atualizar camposQuantidade principal
            // Limpar campos antigos
            while (camposQuantidade.length > 0) {
                grupoQuantidades.remove(camposQuantidade[0]);
                camposQuantidade.splice(0, 1);
            }
            // Calcular a soma total
            var soma = 0;
            for (var i = 0; i < camposTemp.length; i++) {
                var valor = parseFloat(camposTemp[i].campo.text.replace(",", "."));
                if (!isNaN(valor) && valor > 0) {
                    soma += valor;
                }
            }
            // Criar apenas um campo com a soma total
            criarCampoQuantidade(soma > 0 ? soma : "");
            // Atualizar layout
            grupoLinha.layout.layout(true);
            grupoLinha.layout.resize();
            dialogQuantidades.close();
        };
        botaoCancelar.onClick = function() {
            dialogQuantidades.close();
        };
        dialogQuantidades.show();
        } catch (e) {
            alert("ERRO GERAL na janela: " + e.toString() + "\nLinha: " + e.line + "\nDescrição: " + e.description);
        }
    };
    grupoLinha.add("statictext", undefined, "x");
    var campoMultiplicador = grupoLinha.add("edittext", undefined, "1");
    campoMultiplicador.characters = 2;
    campoMultiplicador.preferredSize.width = 25;
    funcoes.apenasNumerosEVirgula(campoMultiplicador);
    var botaoAdicionar = grupoLinha.add("button", undefined, t("botaoAdicionar"));
    return {
        listaComponentes: listaComponentes,
        listaCores: listaCores,
        listaUnidades: listaUnidades,
        camposQuantidade: camposQuantidade,
        campoMultiplicador: campoMultiplicador,
        botaoAdicionar: botaoAdicionar
    };
}

// Criar três linhas independentes para cada grupo
var linhaPrint = criarLinhaGrupo(grupoComponentes, "PRINT", componentesOriginaisPrint);
var linhaLeds = criarLinhaGrupo(grupoComponentes, "LEDS", componentesOriginaisLeds);
var linhaNormais = criarLinhaGrupo(grupoComponentes, "COMPONENTS", componentesOriginaisNormais);

// Aplicar filtragem inicial do dropdown de print baseada no uso selecionado
if (campoUsage && campoUsage.selection && linhaPrint && linhaPrint.listaComponentes) {
    try {
        var usoInicial = campoUsage.selection.text;
        
        if (logs && logs.adicionarLog && logs.TIPOS_LOG) {
            logs.adicionarLog("Aplicando filtragem inicial do PRINT por uso: " + usoInicial, logs.TIPOS_LOG.INFO);
        }
        
        var componentesFiltradosInicial = funcoesFiltragem.filtrarComponentesPrintPorUso(usoInicial, dados, t);
        
        // Limpar e repopular o dropdown
        linhaPrint.listaComponentes.removeAll();
        linhaPrint.listaComponentes.add("item", t("selecioneComponente"));
        
        for (var i = 0; i < componentesFiltradosInicial.length; i++) {
            linhaPrint.listaComponentes.add("item", componentesFiltradosInicial[i]);
        }
        
        linhaPrint.listaComponentes.selection = 0;
        
        if (logs && logs.adicionarLog && logs.TIPOS_LOG) {
            logs.adicionarLog("Filtragem inicial aplicada: " + componentesFiltradosInicial.length + " componentes para uso '" + usoInicial + "'", logs.TIPOS_LOG.INFO);
        }
        
    } catch (erro) {
        if (logs && logs.adicionarLog && logs.TIPOS_LOG) {
            logs.adicionarLog("Erro na filtragem inicial do PRINT: " + erro.message, logs.TIPOS_LOG.ERROR);
        }
    }
} else {
    var mensagemDebugInicial = "=== DEBUG FILTRAGEM INICIAL ===\n";
    mensagemDebugInicial += "campoUsage existe: " + (campoUsage ? "SIM" : "NÃO") + "\n";
    if (campoUsage) {
        mensagemDebugInicial += "campoUsage.selection existe: " + (campoUsage.selection ? "SIM" : "NÃO") + "\n";
    }
    mensagemDebugInicial += "linhaPrint existe: " + (linhaPrint ? "SIM" : "NÃO") + "\n";
    if (linhaPrint) {
        mensagemDebugInicial += "linhaPrint.listaComponentes existe: " + (linhaPrint.listaComponentes ? "SIM" : "NÃO") + "\n";
    }
    alert(mensagemDebugInicial);
}

// Campo de pesquisa (mantido no topo)
var campoPesquisa = grupoPesquisa.add("edittext", undefined, "");
campoPesquisa.characters = 15;
campoPesquisa.preferredSize.width = 120;
campoPesquisa.onChanging = function() {
    funcoesFiltragem.filtrarComponentes(
        campoPesquisa.text,
        componentesOriginaisPrint.slice(0),
        linhaPrint.listaComponentes,
        linhaPrint.listaCores,
        linhaPrint.listaUnidades,
        dados,
        t,
        funcoes,
        funcoesComponentes
    );
    funcoesFiltragem.filtrarComponentes(
        campoPesquisa.text,
        componentesOriginaisLeds.slice(0),
        linhaLeds.listaComponentes,
        linhaLeds.listaCores,
        linhaLeds.listaUnidades,
        dados,
        t,
        funcoes,
        funcoesComponentes
    );
    funcoesFiltragem.filtrarComponentes(
        campoPesquisa.text,
        componentesOriginaisNormais.slice(0),
        linhaNormais.listaComponentes,
        linhaNormais.listaCores,
        linhaNormais.listaUnidades,
        dados,
        t,
        funcoes,
        funcoesComponentes
    );
};

// Eventos para atualizar cores e unidades ao selecionar um componente em cada linha
// Eventos serão configurados pelo módulo eventosUI

// Eventos serão configurados pelo módulo eventosUI
// Eventos serão configurados pelo módulo eventosUI
// Eventos serão configurados pelo módulo eventosUI

// Grupo para bolas
// var grupoBolas = conteudoLegenda.add("panel", undefined, t("painelBolas"));
// grupoBolas.orientation = "column";
// grupoBolas.alignChildren = "left";
// ADICIONAR ESTE NOVO CÓDIGO

// Modificar as propriedades de altura do grupo Extra e do painel de abas
// Modificar a criação do grupo Extra
var grupoExtra = conteudoLegenda.add("panel", undefined, t("painelExtra"));
grupoExtra.orientation = "column";
grupoExtra.alignChildren = ["fill", "top"];
grupoExtra.spacing = 5;

// Adicionar as abas diretamente ao grupo Extra
var abasExtra = grupoExtra.add("tabbedpanel");
abasExtra.alignChildren = ["fill", "fill"];


// Aba 1: Observações e Componente Extra
var abaGeral = abasExtra.add("tab", undefined, t("geral"));
abaGeral.alignChildren = ["fill", "top"];

// Grupo para organizar checkboxes em 2 colunas
var grupoCheckboxes = abaGeral.add("group");
grupoCheckboxes.orientation = "row";
grupoCheckboxes.alignChildren = ["fill", "top"];
grupoCheckboxes.spacing = 10;

// Coluna esquerda
var colunaEsquerda = grupoCheckboxes.add("group");
colunaEsquerda.orientation = "column";
colunaEsquerda.alignChildren = ["fill", "top"];
var checkboxMostrarObs = colunaEsquerda.add("checkbox", undefined, t("adicionarObservacoes"));
var checkboxMostrarComponenteExtra = colunaEsquerda.add("checkbox", undefined, t("adicionarComponenteExtra"));
var checkboxMostrarTexturas = colunaEsquerda.add("checkbox", undefined, t("adicionarTexturas"));

// Coluna direita
var colunaDireita = grupoCheckboxes.add("group");
colunaDireita.orientation = "column";
colunaDireita.alignChildren = ["fill", "top"];
var checkboxMostrarBolas = colunaDireita.add("checkbox", undefined, t("adicionarBolas"));
var checkboxMostrarContar = colunaDireita.add("checkbox", undefined, t("mostrarContarElementos"));
var checkboxMostrarAlfabeto = colunaDireita.add("checkbox", undefined, t("criarGX"));

// Variável para armazenar componentes do alfabeto
var componentesAlfabeto = null;

// Variável para armazenar componentes do contador
var componentesContador = null;

// Variável para armazenar o grupo de bolas extra
var grupoBolasExtra = null;

// Evento será configurado pelo módulo eventosUI

// Evento será configurado pelo módulo eventosUI

// Evento será configurado pelo módulo eventosUI


// Variável para armazenar componentes da interface de texturas
var grupoTexturas = abaGeral.add("group");
grupoTexturas.orientation = "column";
grupoTexturas.alignChildren = ["fill", "top"];
var componentesTextura = null;

// Grupo para o contador na aba Geral
var grupoContador = abaGeral.add("group");
grupoContador.orientation = "column";
grupoContador.alignChildren = ["fill", "top"];

// Evento será configurado pelo módulo eventosUI

// Aba 2: Logs
var abaLogs = abasExtra.add("tab", undefined, "Logs");
abaLogs.alignChildren = ["fill", "top"];
abaLogs.spacing = 10;

// Área de logs com barra de rolagem
var grupoLogs = abaLogs.add("group");
grupoLogs.orientation = "column";
grupoLogs.alignChildren = ["fill", "fill"];
var areaLogs = grupoLogs.add("edittext", undefined, "", {multiline: true, scrollable: true, readonly: true});
areaLogs.preferredSize.width = 500;
areaLogs.preferredSize.height = 80;

// Torna a área de logs global para acesso
$.global.areaLogs = areaLogs;

// Inicializar sistema de logs
if (logs && logs.inicializarSistemaLogs) {
    logs.inicializarSistemaLogs();
}

// Selecionar a primeira aba por padrão
abasExtra.selection = abaGeral;

// Variável para armazenar componentes da interface de observações
var componentesObservacoes = null;
// Limpar referência global antiga ao iniciar nova janela (engine persistente)
$.global.componentesObservacoes = null;

// Evento será configurado pelo módulo eventosUI

// Variável para armazenar o grupo de componente extra
var grupoComponenteExtra = null;
// Evento será configurado pelo módulo eventosUI

// Manter apenas este código para a lista única
var grupoPreviewBotoes = conteudoLegenda.add("group");
grupoPreviewBotoes.orientation = "column";
grupoPreviewBotoes.alignChildren = ["fill", "top"];
grupoPreviewBotoes.spacing = 10;

// Lista de itens
var subgrupoListaItens = grupoPreviewBotoes.add("group");
subgrupoListaItens.orientation = "column";
subgrupoListaItens.alignChildren = ["fill", "top"];

var listaItens = subgrupoListaItens.add("listbox", undefined, [], {multiselect: false});
listaItens.alignment = ["fill", "fill"];
listaItens.preferredSize.height = 180;

// Grupo para os botões principais
var grupoBotoesPrincipais = grupoPreviewBotoes.add("group");
grupoBotoesPrincipais.orientation = "row";
grupoBotoesPrincipais.alignment = ["fill", "bottom"];
grupoBotoesPrincipais.spacing = 10;

// Botões
var botaoRemoverItem = grupoBotoesPrincipais.add("button", undefined, t("removerSelecionado"));
var botaoRemoverTodos = grupoBotoesPrincipais.add("button", undefined, t("removerTodos"));
var botaoGerar = grupoBotoesPrincipais.add("button", undefined, t("adicionarLegenda"));

// Adicionar estilo personalizado ao botão Adicionar Legenda
botaoGerar.graphics.foregroundColor = botaoGerar.graphics.newPen(botaoGerar.graphics.PenType.SOLID_COLOR, [0, 0, 0], 2);

  
function atualizarListaItens() {
    gestaoLista.atualizarListaItens(listaItens, itensLegenda);
}
  
  // Configurar eventos da lista usando o módulo gestaoLista.jsx
  gestaoLista.configurarEventosLista(botaoRemoverItem, botaoRemoverTodos, listaItens, itensLegenda, atualizarListaItens, t);

  // Evento será configurado pelo módulo eventosUI

    // Configurar todos os eventos UI usando o módulo eventosUI
    if (eventosUI) {
        var configEventos = {
            // Elementos de interface
            janela: janela,
            dropdownIdiomas: dropdownIdiomas,
            botaoUpdate: botaoUpdate,
            listaL: listaL,
            campoUsage: campoUsage,
            campoQuantitePrevu: campoQuantitePrevu,
            campoPreco: campoPreco,
            checkStructure: checkStructure,
            corStructure: corStructure,
            checkboxMostrarBolas: checkboxMostrarBolas,
            checkboxMostrarAlfabeto: checkboxMostrarAlfabeto,
            checkboxMostrarContar: checkboxMostrarContar,
            checkboxMostrarTexturas: checkboxMostrarTexturas,
            checkboxMostrarObs: checkboxMostrarObs,
            checkboxMostrarComponenteExtra: checkboxMostrarComponenteExtra,
            linhaPrint: linhaPrint,
            linhaLeds: linhaLeds,
            linhaNormais: linhaNormais,
            botaoGerar: botaoGerar,
            listaFixacao: listaFixacao,
            grupoDimensoes: grupoDimensoes,
            dimensoes: dimensoes,
            grupoExtra: grupoExtra,
            grupoBolasExtra: grupoBolasExtra,
            grupoTexturas: grupoTexturas,
            grupoContador: grupoContador,
            abaGeral: abaGeral,
            componentesAlfabeto: componentesAlfabeto,
            componentesContador: componentesContador,
            componentesTextura: componentesTextura,
            componentesObservacoes: componentesObservacoes,
            grupoComponenteExtra: grupoComponenteExtra,
            campoNomeTipo: campoNomeTipo,
            
            // Dados e funções
            dados: dados,
            t: t,
            itensLegenda: itensLegenda,
            atualizarListaItens: atualizarListaItens,
            ultimaSelecao: ultimaSelecao,
            idiomaUsuario: idiomaUsuario,
            alterarIdioma: config ? config.alterarIdioma : null,
            executarUpdate: executarUpdate,
            gerarLegenda: function() {
                // Lógica de geração da legenda
                try {
                    var campoObsAtual = (checkboxMostrarObs &&
                        checkboxMostrarObs.value &&
                        configEventos.componentesObservacoes &&
                        configEventos.componentesObservacoes.campoObs) ?
                        configEventos.componentesObservacoes.campoObs : null;
                    sincronizarObservacoesComDocumento(campoObsAtual);

                    var parametrosPreview = {
                        itensLegenda: itensLegenda,
                        campoNomeTipo: campoNomeTipo,
                        escolhaNomeTipo: escolhaNomeTipo,
                        listaL: listaL,
                        dimensoes: dimensoes,
                        grupoDimensoes: grupoDimensoes,
                        listaFixacao: listaFixacao,
                        checkStructure: checkStructure,
                        corStructure: corStructure,
                        campoObs: campoObsAtual,
                        campoUsage: campoUsage,
                        campoQuantitePrevu: campoQuantitePrevu,
                        campoPreco: campoPreco
                    };
                    
                    var legendaInfo = funcoesLegenda.atualizarPreview(parametrosPreview);
                    
                    if (legendaInfo === undefined) {
                        ui.mostrarAlertaPersonalizado(t("erroGerarLegenda"), "Erro");
                        return;
                    }
                    
                    var legendaConteudo = legendaInfo.texto.replace(/(\d+)\.(\d+)/g, regras.formatarNumero);
                    var tamanhoGXSelecionado = alfabeto.obterTamanhoAlfabeto(itensLegenda);
                    var palavraDigitada = alfabeto.obterPalavraDigitadaAlfabeto(itensLegenda);
                    
                    var pastaBaseLegenda = File($.fileName).parent.fsName.replace(/\\/g, '/');
                    bridge.adicionarLegendaViaBridge(
                        nomeDesigner,
                        legendaConteudo,
                        (Object.prototype.toString.call(legendaInfo.texturas) === '[object Array]' ? legendaInfo.texturas.join(',') : ''),
                        palavraDigitada,
                        tamanhoGXSelecionado,
                        t,
                        janela,
                        pastaBaseLegenda,
                        function(erro, resultado) {
                            if (erro) {
                                if (logs && logs.adicionarLog && logs.TIPOS_LOG) {
                                    logs.adicionarLog("Erro ao adicionar legenda via bridge: " + erro, logs.TIPOS_LOG.ERROR);
                                }
                            } else {
                                if (logs && logs.adicionarLog && logs.TIPOS_LOG) {
                                    logs.adicionarLog("Legenda adicionada via bridge com sucesso", logs.TIPOS_LOG.INFO);
                                }
                            }
                        }
                    );
                } catch (e) {
                    ui.mostrarAlertaPersonalizado("Erro ao adicionar legenda: " + e + "\nLinha: " + e.line, "Erro");
                }
            }
        };
        
        // Configurar eventos
        eventosUI.configurarEventosCheckboxes(configEventos);
        eventosUI.configurarEventosDropdowns(configEventos);
        eventosUI.configurarEventosComponentes(configEventos);
        eventosUI.configurarEventosBotoes(configEventos);
    }
    
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



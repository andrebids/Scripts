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
$.evalFile(File($.fileName).path + "/core/appState.jsx");

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
$.evalFile(File($.fileName).path + "/core/bootstrap.jsx");

// Importar módulos de interface e gestão
$.evalFile(File($.fileName).path + "/ui/ui.jsx");
$.evalFile(File($.fileName).path + "/ui/extraPanel.jsx");
$.evalFile(File($.fileName).path + "/ui/componentRows.jsx");
$.evalFile(File($.fileName).path + "/ui/gestaoLista.jsx");
$.evalFile(File($.fileName).path + "/ui/eventosUI.jsx");

// Importar módulos de manutenção
$.evalFile(File($.fileName).path + "/infrastructure/update.jsx");

appState.inicializarEstadoBaseLegenda();

(function() {
// Inicializar sistema usando o módulo inicializacao.jsx
var dados;
try {
    dados = bootstrap.inicializarSistema();
} catch (e) {
    // Erro já foi tratado pelo módulo de inicialização
    return;
}

// Criar a janela principal
var janela = bootstrap.criarJanelaPrincipal();

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
var textoVersao = grupoUpdate.add("statictext", undefined, "v2.2.9");
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

// Criar três linhas independentes para cada grupo
var opcoesLinhasComponentes = {
    t: t,
    dados: dados,
    janela: janela,
    funcoes: funcoes
};
var linhaPrint = componentRows.criarLinhaGrupo(grupoComponentes, "PRINT", componentesOriginaisPrint, opcoesLinhasComponentes);
var linhaLeds = componentRows.criarLinhaGrupo(grupoComponentes, "LEDS", componentesOriginaisLeds, opcoesLinhasComponentes);
var linhaNormais = componentRows.criarLinhaGrupo(grupoComponentes, "COMPONENTS", componentesOriginaisNormais, opcoesLinhasComponentes);

// Aplicar filtragem inicial do dropdown de print baseada no uso selecionado
if (campoUsage && campoUsage.selection && linhaPrint && linhaPrint.listaComponentes) {
    try {
        var usoInicial = campoUsage.selection.text;
        
        if (logs && logs.adicionarLog && logs.TIPOS_LOG) {
            logs.adicionarLog("Aplicando filtragem inicial do PRINT por uso: " + usoInicial, logs.TIPOS_LOG.INFO);
        }
        
        var componentesFiltradosInicial = funcoesFiltragem.filtrarComponentesPrintPorUso(usoInicial, dados, t);
        if (!componentesFiltradosInicial || componentesFiltradosInicial.length === 0) {
            componentesFiltradosInicial = componentesOriginaisPrint.slice(0);
            if (logs && logs.adicionarLog && logs.TIPOS_LOG) {
                logs.adicionarLog("Filtragem inicial de PRINT vazia; usando fallback com lista original.", logs.TIPOS_LOG.WARNING);
            }
        }
        
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
grupoExtra.margins = [10, 14, 10, 10];

// Adicionar as abas diretamente ao grupo Extra
var abasExtra = grupoExtra.add("tabbedpanel");
abasExtra.alignChildren = ["fill", "fill"];
abasExtra.alignment = ["fill", "top"];


// Aba 1: ativação dos módulos opcionais
var abaAtivar = abasExtra.add("tab", undefined, t("geral"));
abaAtivar.alignChildren = ["fill", "top"];

// Grupo para organizar checkboxes em 2 colunas
var grupoCheckboxes = abaAtivar.add("group");
grupoCheckboxes.orientation = "row";
grupoCheckboxes.alignChildren = ["fill", "top"];
grupoCheckboxes.spacing = 10;
grupoCheckboxes.margins = [0, 8, 0, 0];

// Coluna esquerda
var colunaEsquerda = grupoCheckboxes.add("group");
colunaEsquerda.orientation = "column";
colunaEsquerda.alignChildren = ["fill", "top"];
colunaEsquerda.spacing = 8;
var checkboxMostrarObs = colunaEsquerda.add("checkbox", undefined, t("adicionarObservacoes"));
var checkboxMostrarComponenteExtra = colunaEsquerda.add("checkbox", undefined, t("adicionarComponenteExtra"));
var checkboxMostrarPVC = colunaEsquerda.add("checkbox", undefined, t("adicionarPVC"));
var checkboxMostrarTexturas = colunaEsquerda.add("checkbox", undefined, t("adicionarTexturas"));

// Coluna direita
var colunaDireita = grupoCheckboxes.add("group");
colunaDireita.orientation = "column";
colunaDireita.alignChildren = ["fill", "top"];
colunaDireita.spacing = 8;
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


// Aba 2: preenchimento dos módulos ativos
var abaConfigurar = abasExtra.add("tab", undefined, t("preencher"));
abaConfigurar.alignChildren = ["fill", "top"];
abaConfigurar.spacing = 10;

var grupoConfigurarExtras = abaConfigurar.add("group");
grupoConfigurarExtras.orientation = "column";
grupoConfigurarExtras.alignChildren = ["fill", "top"];

var grupoConfigVazio = grupoConfigurarExtras.add("group");
grupoConfigVazio.orientation = "column";
grupoConfigVazio.alignChildren = ["fill", "top"];
grupoConfigVazio.margins = [8, 8, 8, 6];
grupoConfigVazio.add("statictext", undefined, t("ativarExtraPreencherAqui"));

var tabsModulosExtra = grupoConfigurarExtras.add("tabbedpanel");
tabsModulosExtra.alignChildren = ["fill", "top"];
tabsModulosExtra.alignment = ["fill", "top"];
tabsModulosExtra.preferredSize.height = 100;
tabsModulosExtra.visible = false;

var componentesTextura = null;
var grupoContador = null;

// Aba 3: Logs
var abaLogs = abasExtra.add("tab", undefined, "Logs");
abaLogs.alignChildren = ["fill", "top"];
abaLogs.spacing = 10;

// Área de logs com barra de rolagem
var grupoLogs = abaLogs.add("group");
grupoLogs.orientation = "column";
grupoLogs.alignChildren = ["fill", "fill"];
var areaLogs = grupoLogs.add("edittext", undefined, "", {multiline: true, scrollable: true, readonly: true});
areaLogs.preferredSize.width = 500;
areaLogs.preferredSize.height = 70;

// Torna a área de logs global para acesso
$.global.areaLogs = areaLogs;

// Inicializar sistema de logs
if (logs && logs.inicializarSistemaLogs) {
    logs.inicializarSistemaLogs();
}

// Selecionar a primeira aba por padrão
abasExtra.selection = abaAtivar;

function atualizarAlturaExtra() {
    var altura = 128;

    if (abasExtra.selection === abaConfigurar) {
        altura = tabsModulosExtra.visible ? 128 : 96;
    } else if (abasExtra.selection === abaLogs) {
        altura = 86;
    }

    abasExtra.preferredSize.height = altura;
    abasExtra.minimumSize.height = altura;

    grupoExtra.preferredSize.height = altura + 22;
    grupoExtra.minimumSize.height = altura + 22;

    janela.layout.layout(true);
    janela.layout.resize();
}

abasExtra.onChange = atualizarAlturaExtra;
atualizarAlturaExtra();

// Isolar estado de observações por documento ao abrir a janela
bootstrap.prepararEstadoObservacoes();

// Variável para armazenar componentes da interface de observações
var componentesObservacoes = null;
// Limpar referência global antiga ao iniciar nova janela (engine persistente)
$.global.componentesObservacoes = null;

// Evento será configurado pelo módulo eventosUI

// Variável para armazenar o grupo de componente extra
var grupoComponenteExtra = null;
// Evento será configurado pelo módulo eventosUI

// Variável para armazenar o grupo de PVC
var grupoPVC = null;
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
            checkboxMostrarPVC: checkboxMostrarPVC,
            linhaPrint: linhaPrint,
            linhaLeds: linhaLeds,
            linhaNormais: linhaNormais,
            botaoGerar: botaoGerar,
            listaFixacao: listaFixacao,
            grupoDimensoes: grupoDimensoes,
            dimensoes: dimensoes,
            abasExtra: abasExtra,
            grupoExtra: grupoExtra,
            grupoBolasExtra: grupoBolasExtra,
            grupoContador: grupoContador,
            abaAtivar: abaAtivar,
            abaConfigurar: abaConfigurar,
            grupoConfigVazio: grupoConfigVazio,
            tabsModulosExtra: tabsModulosExtra,
            atualizarAlturaExtra: atualizarAlturaExtra,
            componentesAlfabeto: componentesAlfabeto,
            componentesContador: componentesContador,
            componentesTextura: componentesTextura,
            componentesObservacoes: componentesObservacoes,
            grupoComponenteExtra: grupoComponenteExtra,
            grupoPVC: grupoPVC,
            campoNomeTipo: campoNomeTipo,
            
            // Dados e funções
            dados: dados,
            t: t,
            itensLegenda: itensLegenda,
            componentesOriginaisPrint: componentesOriginaisPrint,
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
                    bootstrap.sincronizarObservacoesComDocumento(campoObsAtual);

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

        if (extraPanel && extraPanel.inicializar) {
            configEventos.extraPanelManager = extraPanel.inicializar(configEventos);
        }
        
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



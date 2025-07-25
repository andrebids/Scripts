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
janela.orientation = "column";
janela.alignChildren = ["fill", "top"];
janela.spacing = 10;
janela.margins = 16;

// Garantir que a janela pode ser fechada
janela.addEventListener('close', function() {
    return true;
});

// Garantir que o evento de fechamento é processado corretamente
if (janela.closeButton) {
    janela.closeButton.onClick = function() {
        janela.close();
    };
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
var textoVersao = grupoUpdate.add("statictext", undefined, "v2.1.1");
textoVersao.graphics.font = ScriptUI.newFont(textoVersao.graphics.font.family, ScriptUI.FontStyle.REGULAR, 9);
textoVersao.alignment = ["right", "center"];

// Selecionar o idioma do arquivo de configuração silenciosamente
if (idiomaUsuario) {
    dropdownIdiomas.selection = dropdownIdiomas.find(idiomaUsuario);
} else {
    dropdownIdiomas.selection = 0;
}

// Evento de mudança do idioma - só dispara quando o usuário muda manualmente
dropdownIdiomas.onChange = function() {
    var novoIdioma = dropdownIdiomas.selection.text;
    
    // Só mostrar alerta e salvar se o idioma realmente mudou
    if (novoIdioma !== idiomaUsuario) {
        // Usar módulo config para alterar idioma
        if (config.alterarIdioma(novoIdioma)) {
            // Mostrar mensagem para o usuário
            alert(t("idiomaAlterado") + novoIdioma + t("reiniciarScript"));
            
            // Fechar a janela atual
            janela.close();
        } else {
            alert("Erro ao alterar idioma. Por favor, tente novamente.");
        }
    }
};

// Na criação do dropdown, selecionar o idioma atual
dropdownIdiomas.selection = dropdownIdiomas.find(IDIOMA_ATUAL);
// Botão Update
var botaoUpdate = grupoUpdate.add("button", undefined, t("botaoUpdate"));
botaoUpdate.alignment = ["right", "center"];
botaoUpdate.size = [60, 25];

// Adicionar a funcionalidade do Update
botaoUpdate.onClick = function() {
    executarUpdate(t);
};

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
for (var i = 1; i <= 20; i++) {
    opcoesL.push("L" + i);
}
var listaL = grupoLFixacao.add("dropdownlist", undefined, opcoesL);
// listaL.selection = 0; // Removido para não selecionar nenhum valor por padrão
listaL.preferredSize.width = 50; // Reduzir ainda mais para 50px

// Validação obrigatória do campo L
listaL.onChange = function() {
    if (logs && logs.logEvento) {
        logs.logEvento("change", "listaL - " + (this.selection ? this.selection.text : "nenhuma seleção"));
    }
};

grupoLFixacao.add("statictext", undefined, t("fixacao"));

// Tipos de fixação
var tiposFixacao = [];
var tiposFixacaoKeys = ["poteau", "suspendue", "transversal", "murale", "sansFixation", "auSol", "speciale", "aucune"];

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

// Adicionar evento para logs
campoUsage.onChange = function() {
    if (logs && logs.logEvento) {
        logs.logEvento("change", "campoUsage - " + (this.selection ? this.selection.text : "nenhuma seleção"));
    }
};

// Campo Quantité prévue (input numérico mais compacto)
grupoCamposOpcionais.add("statictext", undefined, t("quantitePrevu"));
var campoQuantitePrevu = grupoCamposOpcionais.add("edittext", undefined, "");
campoQuantitePrevu.characters = 6; // Reduzir de 8 para 6
campoQuantitePrevu.preferredSize.width = 50; // Definir largura fixa menor
funcoes.apenasNumerosEVirgula(campoQuantitePrevu);

// Adicionar evento para logs
campoQuantitePrevu.onChanging = function() {
    if (logs && logs.logEvento) {
        logs.logEvento("change", "campoQuantitePrevu - " + this.text);
    }
};

// Campo Preço (input numérico mais compacto)
grupoCamposOpcionais.add("statictext", undefined, t("preco"));
var campoPreco = grupoCamposOpcionais.add("edittext", undefined, "");
campoPreco.characters = 6; // Mesmo tamanho que o campo quantidade
campoPreco.preferredSize.width = 50; // Definir largura fixa menor
funcoes.apenasNumerosEVirgula(campoPreco);

// Adicionar evento para logs
campoPreco.onChanging = function() {
    if (logs && logs.logEvento) {
        logs.logEvento("change", "campoPreco - " + this.text);
    }
};

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
checkStructure.onClick = function() {
    corStructure.visible = this.value;
};

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
        // Abrir nova janela para edição de quantidades
        var dialogQuantidades = new Window("dialog", "Editar Quantidades");
        dialogQuantidades.orientation = "column";
        dialogQuantidades.alignChildren = ["fill", "top"];
        dialogQuantidades.spacing = 10;
        dialogQuantidades.margins = 16;

        var grupoCampos = dialogQuantidades.add("group");
        grupoCampos.orientation = "column";
        grupoCampos.alignChildren = ["fill", "top"];
        var camposTemp = [];

        // Função para criar campo na janela
        function criarCampoTemp(valorPadrao) {
            var grupoLinhaTemp = grupoCampos.add("group");
            grupoLinhaTemp.orientation = "row";
            var campoTemp = grupoLinhaTemp.add("edittext", undefined, valorPadrao ? valorPadrao : "");
            campoTemp.characters = 4;
            campoTemp.preferredSize.width = 40;
            camposTemp.push({campo: campoTemp, grupo: grupoLinhaTemp});
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
            // Atualizar soma em tempo real ao digitar
            campoTemp.onChanging = function() {
                atualizarSoma();
            };
            // Forçar atualização ao criar
            campoTemp.addEventListener && campoTemp.addEventListener('changing', atualizarSoma);
            return campoTemp;
        }
        // Preencher campos com valores atuais
        for (var i = 0; i < camposQuantidade.length; i++) {
            criarCampoTemp(camposQuantidade[i].text);
        }
        // Se não houver campos, criar um
        if (camposTemp.length === 0) {
            criarCampoTemp("");
        }
        // Botão para adicionar novo campo
        var botaoAdicionarTemp = dialogQuantidades.add("button", undefined, "+");
        botaoAdicionarTemp.preferredSize.width = 22;
        botaoAdicionarTemp.preferredSize.height = 22;
        botaoAdicionarTemp.onClick = function() {
            criarCampoTemp("");
            dialogQuantidades.layout.layout(true);
            dialogQuantidades.layout.resize();
        };
        // Exibir soma
        var grupoSoma = dialogQuantidades.add("group");
        grupoSoma.orientation = "row";
        var textoSoma = grupoSoma.add("statictext", undefined, "Soma: 0");
        textoSoma.preferredSize.width = 100;
        function atualizarSoma() {
            var soma = 0;
            for (var i = 0; i < camposTemp.length; i++) {
                var valor = parseFloat(camposTemp[i].campo.text.replace(",", "."));
                if (!isNaN(valor) && valor > 0) {
                    soma += valor;
                }
            }
            textoSoma.text = "Soma: " + soma;
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
function configurarEventosLinha(linha) {
    linha.listaComponentes.onChange = function() {
        funcoes.atualizarCores(linha.listaComponentes, linha.listaCores, linha.listaUnidades, dados, t, function() {
            if (funcoesComponentes && funcoesComponentes.verificarCMYK) {
                funcoesComponentes.verificarCMYK(linha.listaComponentes, linha.listaCores, linha.listaUnidades, dados, funcoes.encontrarIndicePorNome);
            }
        });
    };
    linha.listaCores.onChange = function() {
        if (funcoesComponentes && funcoesComponentes.atualizarUnidades) {
            funcoesComponentes.atualizarUnidades(linha.listaComponentes, linha.listaCores, linha.listaUnidades, dados, funcoes.selecionarUnidadeMetrica, funcoes.arrayContains);
        }
    };
}
configurarEventosLinha(linhaPrint);
configurarEventosLinha(linhaLeds);
configurarEventosLinha(linhaNormais);

// Atualizar eventos de adicionar para todos os grupos
linhaPrint.botaoAdicionar.onClick = function() {
    if (logs && logs.logEvento) {
        logs.logEvento("click", "botaoAdicionarComponente_PRINT");
    }
    var soma = 0;
    var campos = linhaPrint.camposQuantidade;
    for (var i = 0; i < campos.length; i++) {
        var valor = parseFloat(campos[i].text.replace(",", "."));
        if (!isNaN(valor) && valor > 0) {
            soma += valor;
        }
    }
    if (soma <= 0) {
        alert(t("preencherCampos"));
        return;
    }
    funcoesComponentes.adicionarComponente(
        linhaPrint.listaComponentes,
        linhaPrint.listaCores,
        linhaPrint.listaUnidades,
        soma,
        linhaPrint.campoMultiplicador,
        ultimaSelecao,
        dados,
        itensLegenda,
        atualizarListaItens,
        t,
        logs,
        funcoes,
        funcoes.encontrarIndicePorNome,
        linhaPrint.camposQuantidade
    );
};
linhaLeds.botaoAdicionar.onClick = function() {
    if (logs && logs.logEvento) {
        logs.logEvento("click", "botaoAdicionarComponente_LEDS");
    }
    var soma = 0;
    var campos = linhaLeds.camposQuantidade;
    for (var i = 0; i < campos.length; i++) {
        var valor = parseFloat(campos[i].text.replace(",", "."));
        if (!isNaN(valor) && valor > 0) {
            soma += valor;
        }
    }
    if (soma <= 0) {
        alert(t("preencherCampos"));
        return;
    }
    funcoesComponentes.adicionarComponente(
        linhaLeds.listaComponentes,
        linhaLeds.listaCores,
        linhaLeds.listaUnidades,
        soma,
        linhaLeds.campoMultiplicador,
        ultimaSelecao,
        dados,
        itensLegenda,
        atualizarListaItens,
        t,
        logs,
        funcoes,
        funcoes.encontrarIndicePorNome,
        linhaLeds.camposQuantidade
    );
};
linhaNormais.botaoAdicionar.onClick = function() {
    if (logs && logs.logEvento) {
        logs.logEvento("click", "botaoAdicionarComponente_COMPONENTS");
    }
    var soma = 0;
    var campos = linhaNormais.camposQuantidade;
    for (var i = 0; i < campos.length; i++) {
        var valor = parseFloat(campos[i].text.replace(",", "."));
        if (!isNaN(valor) && valor > 0) {
            soma += valor;
        }
    }
    if (soma <= 0) {
        alert(t("preencherCampos"));
        return;
    }
    funcoesComponentes.adicionarComponente(
        linhaNormais.listaComponentes,
        linhaNormais.listaCores,
        linhaNormais.listaUnidades,
        soma,
        linhaNormais.campoMultiplicador,
        ultimaSelecao,
        dados,
        itensLegenda,
        atualizarListaItens,
        t,
        logs,
        funcoes,
        funcoes.encontrarIndicePorNome,
        linhaNormais.camposQuantidade
    );
};

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
var checkboxMostrarObs = abaGeral.add("checkbox", undefined, t("adicionarObservacoes"));
var checkboxMostrarComponenteExtra = abaGeral.add("checkbox", undefined, t("adicionarComponenteExtra"));
var checkboxMostrarBolas = abaGeral.add("checkbox", undefined, t("adicionarBolas"));

// Variável para armazenar o grupo de bolas extra
var grupoBolasExtra = null;

checkboxMostrarBolas.onClick = function() {
    if (this.value) {
        grupoBolasExtra = grupoExtra.add("panel", undefined, t("painelBolas"));
        grupoBolasExtra.orientation = "column";
        grupoBolasExtra.alignChildren = "left";

        // Grupo de seleção de bolas
        var grupoBolasSelecao = grupoBolasExtra.add("group");
        grupoBolasSelecao.orientation = "row";

        // Lista de cores para bolas
        var coresBolasDisponiveis = funcoesFiltragem.getCoresDisponiveisBolas(dados, t, funcoes.arrayContains, funcoes.encontrarPorId);
        var listaCoresBolas = grupoBolasSelecao.add("dropdownlist", undefined, coresBolasDisponiveis);
        listaCoresBolas.selection = 0;

        // Lista de acabamentos (inicialmente vazia)
        var listaAcabamentos = grupoBolasSelecao.add("dropdownlist", undefined, [t("selecioneAcabamento")]);
        listaAcabamentos.selection = 0;

        // Lista de tamanhos (inicialmente vazia)
        var listaTamanhos = grupoBolasSelecao.add("dropdownlist", undefined, [t("selecioneTamanho")]);
        listaTamanhos.selection = 0;

        // Campo para quantidade de bolas
        var campoQuantidadeBolas = grupoBolasSelecao.add("edittext", undefined, "1");
        campoQuantidadeBolas.characters = 5;
        funcoes.apenasNumerosEVirgula(campoQuantidadeBolas);

        // Botão adicionar bola
        var botaoAdicionarBola = grupoBolasSelecao.add("button", undefined, t("adicionarBola"));

        // Eventos de mudança
        listaCoresBolas.onChange = function() {
            if (logs && logs.logEvento) {
                logs.logEvento("change", "listaCoresBolas - " + (this.selection ? this.selection.text : "nenhuma seleção"));
            }
            funcoesBolas.atualizarAcabamentos(listaCoresBolas, listaAcabamentos, dados, t, funcoes, function() {
                funcoesBolas.atualizarTamanhos(listaCoresBolas, listaAcabamentos, listaTamanhos, dados, t, funcoes);
            });
        };
        listaAcabamentos.onChange = function() {
            if (logs && logs.logEvento) {
                logs.logEvento("change", "listaAcabamentos - " + (this.selection ? this.selection.text : "nenhuma seleção"));
            }
            funcoesBolas.atualizarTamanhos(listaCoresBolas, listaAcabamentos, listaTamanhos, dados, t, funcoes);
        };

        botaoAdicionarBola.onClick = function() {
            funcoesBolas.adicionarBola(
                listaCoresBolas,
                listaAcabamentos,
                listaTamanhos,
                campoQuantidadeBolas,
                dados,
                itensLegenda,
                atualizarListaItens,
                t,
                logs,
                funcoes
            );
        };

        janela.layout.layout(true);
    } else {
        if (grupoBolasExtra) {
            grupoBolasExtra.parent.remove(grupoBolasExtra);
            grupoBolasExtra = null;
            janela.layout.layout(true);
        }
    }
    janela.layout.resize();
};

// Aba 2: Criar
var abaCriar = abasExtra.add("tab", undefined, t("criar"));
abaCriar.alignChildren = ["fill", "top"];
var checkboxMostrarAlfabeto = abaCriar.add("checkbox", undefined, t("criarGX"));
var componentesAlfabeto = null;
checkboxMostrarAlfabeto.onClick = function() {
    if (this.value) {
        componentesAlfabeto = alfabeto.criarInterfaceAlfabeto(
            abaCriar, dados, janela, t, funcoesFiltragem, funcoes, itensLegenda, atualizarListaItens, campoNomeTipo, grupoDimensoes
        );
    } else {
        if (componentesAlfabeto) {
            alfabeto.removerInterfaceAlfabeto(componentesAlfabeto, janela);
            componentesAlfabeto = null;
        }
    }
    janela.layout.layout(true);
    janela.layout.resize();
};
var checkboxCriarPalavraAluminio = abaCriar.add("checkbox", undefined, t("criarPalavraAluminio"));

// Aba 3: Contagem
var abaContagem = abasExtra.add("tab", undefined, t("contador"));
abaContagem.alignChildren = ["fill", "top"];
var checkboxMostrarContar = abaContagem.add("checkbox", undefined, t("mostrarContarElementos"));
// O grupo deve ser criado DEPOIS do checkbox, para ficar abaixo dele
var grupoContador = abaContagem.add("group");
grupoContador.orientation = "column";
grupoContador.alignChildren = ["fill", "top"];
var componentesContador = null;
checkboxMostrarContar.onClick = function() {
    if (logs && logs.logEvento) {
        logs.logEvento("click", "checkboxMostrarContar - valor: " + this.value);
    }
    if (this.value) {
        componentesContador = ui.criarInterfaceContadorBolas(
            grupoContador, dados, itensLegenda, atualizarListaItens
        );
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Interface do contador criada e layout será atualizado", logs.TIPOS_LOG.INFO);
        }
        janela.layout.layout(true);
        janela.layout.resize();
    } else {
        if (componentesContador && componentesContador.grupo) {
            componentesContador.grupo.parent.remove(componentesContador.grupo);
            componentesContador = null;
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Interface do contador removida e layout será atualizado", logs.TIPOS_LOG.INFO);
            }
            janela.layout.layout(true);
            janela.layout.resize();
        }
    }
};
// Aba 4: Texturas
var abaTexturas = abasExtra.add("tab", undefined, t("texturas"));
abaTexturas.alignChildren = ["fill", "top"];
var checkboxMostrarTexturas = abaTexturas.add("checkbox", undefined, t("adicionarTexturas"));
var grupoTexturas = abaTexturas.add("group");
grupoTexturas.orientation = "column";
grupoTexturas.alignChildren = ["fill", "top"];
var componentesTextura = null;
checkboxMostrarTexturas.onClick = function() {
    if (this.value) {
        componentesTextura = ui.criarInterfaceTexturas(grupoTexturas, janela, t, funcoesFiltragem, itensLegenda, atualizarListaItens);
    } else {
        ui.removerInterfaceTexturas(componentesTextura, janela);
        componentesTextura = null;
    }
    janela.layout.resize();
};

// Aba 5: Logs
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

checkboxMostrarObs.onClick = function() {
    if (this.value) {
        // Criar interface de observações usando módulo
        componentesObservacoes = ui.criarInterfaceObservacoes(
            grupoExtra,
            janela,
            t
        );
    } else {
        // Remover interface de observações usando módulo
        ui.removerInterfaceObservacoes(componentesObservacoes, janela);
        componentesObservacoes = null;
    }
    janela.layout.resize();
};

// Variável para armazenar o grupo de componente extra
var grupoComponenteExtra = null;
checkboxMostrarComponenteExtra.onClick = function() {
    if (this.value) {
        if (logs && logs.logEvento) {
            logs.logEvento("click", "checkboxMostrarComponenteExtra - criando campo de componente extra");
        }
        grupoComponenteExtra = abaGeral.add("group");
        grupoComponenteExtra.orientation = "row";
        grupoComponenteExtra.alignChildren = ["left", "center"];
        grupoComponenteExtra.spacing = 5;
        grupoComponenteExtra.add("statictext", undefined, t("nomeComponenteExtra"));
        var campoNomeExtra = grupoComponenteExtra.add("edittext", undefined, "");
        campoNomeExtra.characters = 12;
        grupoComponenteExtra.add("statictext", undefined, t("unidadeComponenteExtra"));
        var opcoesUnidadeExtra = ["m2", "ml", "unit"];
        var campoUnidadeExtra = grupoComponenteExtra.add("dropdownlist", undefined, opcoesUnidadeExtra);
        campoUnidadeExtra.selection = 0;
        grupoComponenteExtra.add("statictext", undefined, t("quantidadeComponenteExtra"));
        var campoQuantidadeExtra = grupoComponenteExtra.add("edittext", undefined, "1");
        campoQuantidadeExtra.characters = 4;
        var botaoAdicionarExtra = grupoComponenteExtra.add("button", undefined, t("adicionarComponenteExtra"));
        botaoAdicionarExtra.onClick = function() {
            var nomeExtra = campoNomeExtra.text;
            var unidadeExtra = campoUnidadeExtra.selection ? campoUnidadeExtra.selection.text : "";
            var quantidadeExtra = parseFloat(campoQuantidadeExtra.text.replace(',', '.'));
            if (nomeExtra === "" || isNaN(quantidadeExtra) || quantidadeExtra <= 0) {
                alert(t("preencherCampos"));
                return;
            }
            var textoExtra = nomeExtra + " (" + unidadeExtra + "): " + quantidadeExtra.toFixed(2).replace('.', ',');
            itensLegenda.push({
                tipo: "extra",
                nome: nomeExtra,
                texto: textoExtra,
                unidade: unidadeExtra,
                quantidade: quantidadeExtra
            });
            atualizarListaItens();
            campoNomeExtra.text = "";
            campoQuantidadeExtra.text = "";
        };
        janela.layout.layout(true);
        janela.layout.resize();
    } else {
        if (grupoComponenteExtra) {
            if (logs && logs.logEvento) {
                logs.logEvento("click", "checkboxMostrarComponenteExtra - removendo campo de componente extra");
            }
            grupoComponenteExtra.parent.remove(grupoComponenteExtra);
            grupoComponenteExtra = null;
            janela.layout.layout(true);
            janela.layout.resize();
        }
    }
};

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

  // Evento de clique no botão gerar
  botaoGerar.onClick = function() {
    if (logs && logs.logEvento) {
        logs.logEvento("click", "botaoGerar");
    }
    // Verificar se o campo L foi selecionado
    if (!listaL.selection) {
        alert("Selecione um valor para o campo L (obrigatório)");
        return;
    }
    // Verificar se o tipo de fixação foi selecionado
    if (!listaFixacao.selection || listaFixacao.selection.index === 0) {
        alert(t("selecionarTipoFixacao"));
        return;
    }
        // Verificar se há dimensões preenchidas
        var temDimensoes = false;
        for (var i = 0; i < dimensoes.length; i++) {
            var valorDimensao = grupoDimensoes.children[i*2 + 1].text;
            if (valorDimensao !== "") {
                temDimensoes = true;
                break;
            }
        }

        // Se não houver dimensões, mostrar alerta
        if (!temDimensoes) {
            if (!confirm(t("confirmacaoSemTamanho"))) {
                return; // Se o usuário clicar em "Cancelar", interrompe a execução
            }
        }

        // Continua com a verificação original
        if (confirm(t("confirmarComponentes"))) {
            try {
                // Preparar parâmetros para a função modularizada
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
                    campoObs: componentesObservacoes ? componentesObservacoes.campoObs : null,
                    campoUsage: campoUsage,
                    campoQuantitePrevu: campoQuantitePrevu,
                    campoPreco: campoPreco
                };
                
                var legendaInfo = funcoesLegenda.atualizarPreview(parametrosPreview);
                
                if (legendaInfo === undefined) {
                    alert(t("erroGerarLegenda"));
                    return;
                }
                
                // Substituir pontos por vírgulas
                var legendaConteudo = legendaInfo.texto.replace(/(\d+)\.(\d+)/g, formatarNumero);
    
                // Encontrar o tamanho do alfabeto nos itens da legenda
                var tamanhoGXSelecionado = obterTamanhoAlfabeto(itensLegenda);
    
                // Capturar a palavra digitada do campo alfabeto
                var palavraDigitada = obterPalavraDigitadaAlfabeto(itensLegenda);
                
                // Usar módulo bridge para adicionar legenda
                if (logs && logs.adicionarLog) {
                    logs.adicionarLog("Tipo de legendaInfo.texturas: " + Object.prototype.toString.call(legendaInfo.texturas), "info");
                    logs.adicionarLog("Valor de legendaInfo.texturas: " + legendaInfo.texturas, "info");
                }
                var pastaBaseLegenda = File($.fileName).parent.fsName.replace(/\\/g, '/');
                bridge.adicionarLegendaViaBridge(
                    nomeDesigner,
                    legendaConteudo,
                    (Object.prototype.toString.call(legendaInfo.texturas) === '[object Array]' ? legendaInfo.texturas.join(',') : ''),
                    palavraDigitada,
                    tamanhoGXSelecionado,
                    t,
                    janela,
                    pastaBaseLegenda, // novo parâmetro
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


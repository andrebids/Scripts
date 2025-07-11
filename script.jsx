#target illustrator
#targetengine maintarget

// Importar o arquivo de regras
$.evalFile(File($.fileName).path + "/json2.js");
$.evalFile(File($.fileName).path + "/regras.jsx");
$.evalFile(File($.fileName).path + "/funcoes.jsx");
$.evalFile(File($.fileName).path + "/database.jsx");
$.evalFile(File($.fileName).path + "/logs.jsx");
$.evalFile(File($.fileName).path + "/config.jsx");
$.evalFile(File($.fileName).path + "/bridge.jsx");
$.evalFile(File($.fileName).path + "/ui.jsx");
$.evalFile(File($.fileName).path + "/translations.js");
$.evalFile(File($.fileName).path + "/update.jsx");
$.evalFile(File($.fileName).path + "/funcoesComponentes.jsx");
$.evalFile(File($.fileName).path + "/funcoesBolas.jsx");    
$.evalFile(File($.fileName).path + "/funcoesLegenda.jsx");
$.evalFile(File($.fileName).path + "/funcoesFiltragem.jsx");

// Adicionar no início do arquivo, após os outros $.evalFile
$.evalFile(File($.fileName).path + "/alfabeto.jsx");

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
// Função para mostrar janela de configuração inicial movida para ui.jsx

(function() {
    // Inicializar sistema de configuração usando o módulo config.jsx
    config.inicializarConfiguracao();
    var caminhoBaseDadosHardcoded = "\\\\192.168.2.22\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\ILLUSTRATOR\\basededados\\database2.json";

    // Adicionar verificação antes de tentar ler o arquivo
    try {
        if (database.arquivoExiste(caminhoBaseDadosHardcoded)) {
            var dadosBase = database.lerArquivoJSON(caminhoBaseDadosHardcoded);
            if (dadosBase) {
                // Processar os dados...
            } else {
                alert("Base de dados vazia ou inválida");
            }
        } else {
            alert("Arquivo da base de dados não encontrado. Por favor, verifique o caminho: " + caminhoBaseDadosHardcoded);
        }
    } catch(e) {
        alert("Erro ao ler o arquivo da base de dados: " + e.message);
    }
// Função criarInterfaceContadorBolas movida para ui.jsx
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

// Função contarBolasNaArtboard movida para funcoes.jsx

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
var textoVersao = grupoUpdate.add("statictext", undefined, "v2.0.0");
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
listaL.selection = 0;
listaL.preferredSize.width = 50; // Reduzir ainda mais para 50px

grupoLFixacao.add("statictext", undefined, t("fixacao"));

// Tipos de fixação
var tiposFixacao = [];
var tiposFixacaoKeys = ["poteau", "suspendue", "murale", "sansFixation", "auSol", "speciale", "aucune"];

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

// Função apenasNumerosEVirgula movida para funcoes.jsx



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

// Função getComponentesComCombinacoes movida para funcoesFiltragem.jsx

// Atualizar a criação da lista de componentes
var componentesNomes = funcoesFiltragem.getComponentesComCombinacoes(dados, t, funcoes.arrayContains, funcoes.encontrarPorId);
var listaComponentes = grupo2.add("dropdownlist", undefined, componentesNomes);
listaComponentes.selection = 0;

// Lista de cores
var coresNomes = [t("selecioneCor")].concat(extrairNomes(dados.cores));
var listaCores = grupo2.add("dropdownlist", undefined, coresNomes);
listaCores.selection = 0;

// Lista de unidades
var listaUnidades = grupo2.add("dropdownlist", undefined, [t("selecioneUnidade")]);
listaUnidades.selection = 0;

// Campo de pesquisa (otimizado) - CRIADO APÓS TODAS AS LISTAS
var campoPesquisa = grupoPesquisa.add("edittext", undefined, "");
campoPesquisa.characters = 15; // Reduzir de 20 para 15
campoPesquisa.preferredSize.width = 120; // Definir largura fixa
campoPesquisa.onChanging = function() {
    funcoesFiltragem.filtrarComponentes(campoPesquisa.text, componentesNomes, listaComponentes, listaCores, listaUnidades, dados, t, funcoes, funcoesComponentes);
};

// Evento para atualizar cores e unidades ao selecionar um componente
listaComponentes.onChange = function() {
    funcoes.atualizarCores(listaComponentes, listaCores, listaUnidades, dados, t, function() {
        if (funcoesComponentes && funcoesComponentes.verificarCMYK) {
            funcoesComponentes.verificarCMYK(listaComponentes, listaCores, listaUnidades, dados, funcoes.encontrarIndicePorNome);
        }
    });
};

// Evento para atualizar unidades ao selecionar uma cor
listaCores.onChange = function() {
    if (funcoesComponentes && funcoesComponentes.atualizarUnidades) {
        funcoesComponentes.atualizarUnidades(listaComponentes, listaCores, listaUnidades, dados, funcoes.selecionarUnidadeMetrica, funcoes.arrayContains);
    }
};

// Campo de quantidade (otimizado)
var campoQuantidade = grupo2.add("edittext", undefined, "");
campoQuantidade.characters = 4; // Reduzir de 5 para 4
campoQuantidade.preferredSize.width = 40; // Definir largura fixa menor
funcoes.apenasNumerosEVirgula(campoQuantidade);
// Campo de multiplicador (otimizado)
grupo2.add("statictext", undefined, "x");
var campoMultiplicador = grupo2.add("edittext", undefined, "1");
campoMultiplicador.characters = 2; // Reduzir de 3 para 2
campoMultiplicador.preferredSize.width = 25; // Definir largura fixa menor
funcoes.apenasNumerosEVirgula(campoMultiplicador);

// Botão adicionar componente
var botaoAdicionarComponente = grupo2.add("button", undefined, t("botaoAdicionar"));

// Evento para adicionar componente ao clicar no botão
botaoAdicionarComponente.onClick = function() {
    if (logs && logs.logEvento) {
        logs.logEvento("click", "botaoAdicionarComponente");
    }
    funcoesComponentes.adicionarComponente(
        listaComponentes,
        listaCores,
        listaUnidades,
        campoQuantidade,
        campoMultiplicador,
        ultimaSelecao,
        dados,
        itensLegenda,
        atualizarListaItens,
        t,
        logs,
        funcoes,
        funcoes.encontrarIndicePorNome
    );
};

// Grupo para bolas
var grupoBolas = conteudoLegenda.add("panel", undefined, t("painelBolas"));
grupoBolas.orientation = "column";
grupoBolas.alignChildren = "left";
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

// Aba 2: Criar
var abaCriar = abasExtra.add("tab", undefined, t("criar"));
abaCriar.alignChildren = ["fill", "top"];
var checkboxMostrarAlfabeto = abaCriar.add("checkbox", undefined, t("criarGX"));
var checkboxCriarPalavraAluminio = abaCriar.add("checkbox", undefined, t("criarPalavraAluminio"));

// Aba 3: Contagem
var abaContagem = abasExtra.add("tab", undefined, t("contador"));
abaContagem.alignChildren = ["fill", "top"];
var checkboxMostrarContar = abaContagem.add("checkbox", undefined, t("mostrarContarElementos"));

// Aba 4: Texturas
var abaTexturas = abasExtra.add("tab", undefined, t("texturas"));
abaTexturas.alignChildren = ["fill", "top"];
var checkboxMostrarTexturas = abaTexturas.add("checkbox", undefined, t("adicionarTexturas"));

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

var grupoBolasSelecao = grupoBolas.add("group");
grupoBolasSelecao.orientation = "row";

// Função getCoresDisponiveisBolas movida para funcoesFiltragem.jsx

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

// Funções de bolas migradas para funcoesBolas.jsx

// Adicionar eventos de mudança
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

// Função atualizarTextoBola migrada para funcoesBolas.jsx


// Adicionar evento para o checkbox de alfabeto
var grupoAlfabeto, campoPalavraChave, dropdownCorBioprint, tamanhoAlfabeto, botaoAdicionarPalavraChave;


// Adicionar evento para o checkbox de componente extra
var grupoComponenteExtra, campoNomeExtra, dropdownUnidadeExtra, campoQuantidadeExtra, botaoAdicionarExtra;
checkboxMostrarComponenteExtra.onClick = function() {
    if (this.value) {
        // Adicionar o grupo de componente extra
        grupoComponenteExtra = grupoExtra.add("panel", undefined, t("componenteExtra"));
        grupoComponenteExtra.orientation = "row";
        grupoComponenteExtra.alignChildren = ["left", "top"];
        grupoComponenteExtra.spacing = 10;

      // Campo de texto para o nome do componente
      campoNomeExtra = grupoComponenteExtra.add("edittext", undefined, "");
      campoNomeExtra.characters = 20;

      // Dropdown para unidade
      dropdownUnidadeExtra = grupoComponenteExtra.add("dropdownlist", undefined, ["m2", "ml", "unit"]);
      dropdownUnidadeExtra.selection = 0;

      // Campo para quantidade
      campoQuantidadeExtra = grupoComponenteExtra.add("edittext", undefined, "");
      campoQuantidadeExtra.characters = 5;
      apenasNumerosEVirgula(campoQuantidadeExtra);

      // Botão para adicionar à legenda
      botaoAdicionarExtra = grupoComponenteExtra.add("button", undefined, t("adicionarALegenda"));

      // Evento de clique para o botão adicionar extra
      botaoAdicionarExtra.onClick = function() {
          var nomeExtra = campoNomeExtra.text;
          var unidadeExtra = dropdownUnidadeExtra.selection.text;
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

          // Limpar os campos após adicionar
          campoNomeExtra.text = "";
          campoQuantidadeExtra.text = "";
      };

      janela.layout.layout(true);
    } else {
        grupoComponenteExtra.parent.remove(grupoComponenteExtra);
        janela.layout.layout(true);
    }
    janela.layout.resize();
};

checkboxMostrarAlfabeto.onClick = function() {
    if (this.value) {
        // Adicionar o grupo de alfabeto
        grupoAlfabeto = grupoExtra.add("panel", undefined, t("alfabeto"));
        grupoAlfabeto.orientation = "column"; // Alterar para "column" para alinhar verticalmente
        grupoAlfabeto.alignChildren = ["fill", "top"]; // Preencher a largura
        grupoAlfabeto.spacing = 10; // Adicionar espaçamento entre os elementos

        var subGrupoAlfabeto = grupoAlfabeto.add("group");
        subGrupoAlfabeto.orientation = "row";
        subGrupoAlfabeto.alignChildren = ["fill", "top"];
        subGrupoAlfabeto.spacing = 10;

        subGrupoAlfabeto.add("statictext", undefined, t("alfabetoLabel"));
        campoPalavraChave = subGrupoAlfabeto.add("edittext", undefined, "");
        campoPalavraChave.characters = 20;

        // Adicionar texto estático para bioprint
        subGrupoAlfabeto.add("statictext", undefined, t("bioprint"));

        // Adicionar dropdown para cor do bioprint
        subGrupoAlfabeto.add("statictext", undefined, t("cor"));
        dropdownCorBioprint = subGrupoAlfabeto.add("dropdownlist", undefined, ["Selecione a cor"]);

        // Manter o dropdown de tamanho existente
        subGrupoAlfabeto.add("statictext", undefined, t("tamanho"));
        tamanhoAlfabeto = subGrupoAlfabeto.add("dropdownlist", undefined, ["1,40 m", "2,00 m"]);
        tamanhoAlfabeto.selection = 0;

        botaoAdicionarPalavraChave = grupoAlfabeto.add("button", undefined, t("adicionar"));

        // Adicionar linha separadora
        var linhaSeparadora = grupoAlfabeto.add("panel");
        linhaSeparadora.preferredSize = [-1, 2]; // Ajustar a largura para preencher e altura para 2px
        linhaSeparadora.graphics.backgroundColor = linhaSeparadora.graphics.newBrush(linhaSeparadora.graphics.BrushType.SOLID_COLOR, [0, 0, 0, 1]);

        // Adicionar texto de informação
        grupoAlfabeto.add("statictext", undefined, t("instrucaoAlfabeto"));

        // Função para preencher o dropdown de cores do bioprint
        // Função preencherCoresBioprint movida para funcoesFiltragem.jsx

        // Chamar a função para preencher as cores do bioprint
        funcoesFiltragem.preencherCoresBioprint(dropdownCorBioprint, dados, funcoes.arrayContains, funcoes.encontrarPorId);

        // Substituir a função processarAlfabeto() existente por:
        botaoAdicionarPalavraChave.onClick = function() {
            adicionarPalavraChaveAlfabeto(
                campoPalavraChave,
                dropdownCorBioprint,
                tamanhoAlfabeto,
                grupoDimensoes,
                itensLegenda,
                atualizarListaItens,
                campoNomeTipo,
                t
            );
        };

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


// Adicionar evento para o checkbox de texturas
var grupoTexturas;

// Modificar a parte onde o checkbox de texturas é criado
checkboxMostrarTexturas.onClick = function() {
  if (this.value) {
      // Criar o grupo de texturas
      grupoTexturas = grupoExtra.add("panel", undefined,  t("texturas"));
      grupoTexturas.orientation = "row"; // Mudado para row para elementos lado a lado
      grupoTexturas.alignChildren = ["left", "top"];
      grupoTexturas.spacing = 10;
      grupoTexturas.margins = 10;

      // Subgrupo para lista e botão
      var grupoLista = grupoTexturas.add("group");
      grupoLista.orientation = "column";
      grupoLista.alignChildren = ["left", "top"];
      grupoLista.spacing = 5;

      // Função obterNumeroTextura movida para funcoesFiltragem.jsx

      // Lista de texturas no subgrupo
      listaTexturas = grupoLista.add("dropdownlist", undefined, [
          t("selecioneTextura"),
          "--- SIMPLE TRAIT ---",
          "Texture 01",
          "Texture 02",
          "Texture 03",
          "Texture 04",
          "Texture 05",
          "Texture 06",
          "Texture 07",
          "Texture 08",
          "--- DOUBLE TRAIT ---",
          "Texture 09",
          "Texture 10",
          "Texture 11",
          "Texture 12",
          "Texture 13",
          "Texture 14",
          "Texture 15",
          "Texture 16",
          "--- FLEXI ---",
          "Flexi Triangle",
          "Flexi Boucle",
          "Flexi Losange",
          "Flexi Meli Melo"
      ]);
      listaTexturas.selection = 0;
      listaTexturas.preferredSize.width = 200;

      // Botão no subgrupo
      botaoInserirTextura = grupoLista.add("button", undefined, t("inserirTextura"));

        // Adicionar o evento onClick para o botão
        botaoInserirTextura.onClick = function() {
            if (listaTexturas.selection && 
                listaTexturas.selection.index > 0 && 
                listaTexturas.selection.text.indexOf("---") === -1) {
                
                var texturaNumero = funcoesFiltragem.obterNumeroTextura(listaTexturas.selection.text);
                var texturaNome = listaTexturas.selection.text;
                
                // Adicionar a textura à lista de itens
                itensLegenda.push({
                    tipo: "textura",
                    nome: texturaNome,
                    texto: texturaNome,
                    referencia: "texture" + texturaNumero
                });
                
                // Atualizar a lista de itens
                atualizarListaItens();
                
                // Resetar a seleção
                listaTexturas.selection = 0;
            } else {
                alert(t("selecioneTexturaAlerta"));
            }
        };

      // Grupo para preview da imagem
      var grupoPreview = grupoTexturas.add("group");
      grupoPreview.orientation = "column";
      grupoPreview.alignChildren = ["left", "top"];
      grupoPreview.spacing = 5;

      // Evento de mudança na lista
      listaTexturas.onChange = function() {
        // Limpar preview anterior
        while(grupoPreview.children.length > 0) {
            grupoPreview.remove(grupoPreview.children[0]);
        }
        
        if (this.selection.index > 0 && this.selection.text.indexOf("---") === -1) {
            try {
                var numeroTextura = funcoesFiltragem.obterNumeroTextura(this.selection.text);
                var nomeArquivo = "texture" + numeroTextura + ".png";
                var caminhoImagem = File($.fileName).parent + "/png/" + nomeArquivo;
                var arquivoImagem = new File(caminhoImagem);
                
                if (arquivoImagem.exists) {
                    var imagem = grupoPreview.add("image", undefined, arquivoImagem);
                    imagem.preferredSize = [100, 100];
                } else {
                    var textoErro = grupoPreview.add("statictext", undefined, "Imagem não encontrada");
                }
            } catch (e) {
              alert(t("erroCarregarImagem") + e.message);
            }
        }
        
        janela.layout.layout(true);
        janela.layout.resize();
    };

      // Texto de informação
      var infoTexto = grupoLista.add("statictext", undefined, 
        t("instrucaoTextura"), 
          {multiline: true});
      infoTexto.preferredSize.width = 200;

      janela.layout.layout(true);
      janela.preferredSize.height += 100;
  } else {
      // Remover o grupo de texturas
      grupoTexturas.parent.remove(grupoTexturas);
      janela.layout.layout(true);
      janela.preferredSize.height -= 100;
  }
  janela.layout.resize();
};


// Adicionar evento para o checkbox de contar elementos
checkboxMostrarContar.onClick = function() {
  if (this.value) {
      // Adicionar o grupo de contar elementos
      grupoContar = grupoExtra.add("panel", undefined, t("contarElementos"));
      grupoContar.orientation = "column";
      grupoContar.alignChildren = ["fill", "top"];
      grupoContar.spacing = 10;

      // Criar a interface do contador de bolas
      var interfaceContador = criarInterfaceContadorBolas(grupoContar, dados, itensLegenda, atualizarListaItens);

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
      grupoObs = grupoExtra.add("panel", undefined, t("observacoes"));
      grupoObs.orientation = "row";
      grupoObs.alignChildren = ["fill", "top"]; // Preencher a largura
      grupoObs.spacing = 0;

      grupoObs.add("statictext", undefined, t("obs"));

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

// Função removerDuplicatas movida para funcoes.jsx


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
    if (logs && logs.logFuncao) {
        logs.logFuncao("atualizarListaItens", {totalItens: itensLegenda.length}, "Lista atualizada");
    }
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
    if (confirm(t("confirmarRemoverTodos"))) {
        itensLegenda = [];
        atualizarListaItens();
    }
};

  // Evento de clique no botão gerar
  botaoGerar.onClick = function() {
    if (logs && logs.logEvento) {
        logs.logEvento("click", "botaoGerar");
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
                    campoObs: campoObs,
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

                // Função scriptIllustrator movida para bridge.jsx
    
                // Capturar a palavra digitada do campo alfabeto
                var palavraDigitada = obterPalavraDigitadaAlfabeto(itensLegenda);
                
                // Usar módulo bridge para adicionar legenda
                bridge.adicionarLegendaViaBridge(
                    nomeDesigner,
                    legendaConteudo,
                    legendaInfo.texturas,
                    palavraDigitada,
                    tamanhoGXSelecionado,
                    t,
                    janela,
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

    // Função criarInterfaceExtra movida para ui.jsx
})();


#target illustrator
#targetengine maintarget illustrator

// Importar o arquivo de regras
$.evalFile(File($.fileName).path + "/json2.js");
$.evalFile(File($.fileName).path + "/regras.jsx");
$.evalFile(File($.fileName).path + "/funcoes.jsx");
$.evalFile(File($.fileName).path + "/database.jsx");
$.evalFile(File($.fileName).path + "/ui.jsx");
$.evalFile(File($.fileName).path + "/translations.js");

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
// Função para mostrar janela de configuração inicial
function mostrarJanelaConfigInicial() {
    var janelaConfig = new Window("dialog", "Configuração Inicial / Configuration Initiale");
    janelaConfig.orientation = "column";
    janelaConfig.alignChildren = "center";
    
    // Grupo para nome
    var grupoNome = janelaConfig.add("group");
    grupoNome.add("statictext", undefined, "Nome do Designer / Nom du Designer:");
    var campoNome = grupoNome.add("edittext", undefined, "");
    campoNome.characters = 30;
    
    // Grupo para idioma
    var grupoIdioma = janelaConfig.add("group");
    grupoIdioma.add("statictext", undefined, "Idioma / Langue:");
    var listaIdiomas = grupoIdioma.add("dropdownlist", undefined, ["Português", "Français"]);
    listaIdiomas.selection = 0;
    
    // Botão OK
    var botaoOK = janelaConfig.add("button", undefined, "OK");
    
    botaoOK.onClick = function() {
        if (campoNome.text.length > 0) {
            nomeDesigner = campoNome.text;
            idiomaUsuario = listaIdiomas.selection.text;
            IDIOMA_ATUAL = idiomaUsuario;
            
            var config = {
                nomeDesigner: nomeDesigner,
                idioma: idiomaUsuario
            };
            
            try {
                escreverArquivoJSON(caminhoConfig, config);
                janelaConfig.close();
            } catch(e) {
                alert("Erro ao salvar configuração / Erreur lors de l'enregistrement de la configuration: " + e.message);
            }
        } else {
            alert("Por favor, insira seu nome / S'il vous plaît, entrez votre nom");
        }
    };
    
    janelaConfig.show();
}

(function() {
    // Verificar se existe arquivo de configuração
    if (arquivoExiste(caminhoConfig)) {
        try {
            var config = lerArquivoJSON(caminhoConfig);
            if (config && config.nomeDesigner && config.idioma) {
                nomeDesigner = config.nomeDesigner;
                idiomaUsuario = config.idioma;
                IDIOMA_ATUAL = config.idioma;
            } else {
                mostrarJanelaConfigInicial();
            }
        } catch(e) {
            mostrarJanelaConfigInicial();
        }
    } else {
        mostrarJanelaConfigInicial();
    }
    var caminhoBaseDadosHardcoded = "\\\\192.168.2.22\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\ILLUSTRATOR\\basededados\\database2.json";

    // Adicionar verificação antes de tentar ler o arquivo
    try {
        if (arquivoExiste(caminhoBaseDadosHardcoded)) {
            var dadosBase = lerArquivoJSON(caminhoBaseDadosHardcoded);
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
    var textoResultado = subgrupoContador.add("edittext", undefined, t("resultado"), {multiline: true, scrollable: true});
    textoResultado.preferredSize.width = 400;
    textoResultado.preferredSize.height = 150; // Linha 56

    // Botão para contar
    var botaoContar = subgrupoContador.add("button", undefined, t("contarElementos"));
    // Botão para adicionar ao preview
    var botaoAdicionarPreview = subgrupoContador.add("button", undefined, t("adicionarAoPreview"));

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
        alert(t("contagemAtualizada"));
    } else {
        alert(t("realizarContagemPrimeiro"));
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
        var caminhoBaseDadosHardcoded = "//192.168.2.22/Olimpo/DS/_BASE DE DADOS/07. TOOLS/ILLUSTRATOR/basededados/database2.json";
        
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
var textoVersao = grupoUpdate.add("statictext", undefined, "v1.9.3");
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
        // Salvar o novo idioma no arquivo de configuração
        var config = lerArquivoJSON(caminhoConfig);
        config.idioma = novoIdioma;
        escreverArquivoJSON(caminhoConfig, config);
        
        // Mostrar mensagem para o usuário
        alert(t("idiomaAlterado") + novoIdioma + t("reiniciarScript"));
        
        // Fechar a janela atual
        janela.close();
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
    try {
        var currentDir = File($.fileName).parent.fsName;
        
        // Verificar se o Git está instalado
        var checkGitFile = new File(currentDir + "/check_git.bat");
        if (checkGitFile.open('w')) {
            checkGitFile.write("@echo off\n");
            checkGitFile.write("git --version > git_check.txt 2>&1\n");
            checkGitFile.write("exit\n");
            checkGitFile.close();
            
            checkGitFile.execute();
            $.sleep(1000);
            
            var gitCheckFile = new File(currentDir + "/git_check.txt");
            if (gitCheckFile.exists) {
                gitCheckFile.open('r');
                var gitCheck = gitCheckFile.read();
                gitCheckFile.close();
                gitCheckFile.remove();
                checkGitFile.remove();
                
                if (gitCheck.indexOf("git version") === -1) {
                    alert(t("gitNaoInstalado"));
                    return;
                }
            }
        }
        
        // Criar arquivo .bat para Windows
        var scriptFile = new File(currentDir + "/update_script.bat");
        
        if (scriptFile.open('w')) {
            scriptFile.write("@echo off\n");
            scriptFile.write("cd /d \"" + currentDir + "\"\n");
            
            // Limpar arquivos de log antigos
            scriptFile.write("del /f /q temp_log.txt update_log.txt 2>nul\n");
            
            // Configurar e forçar atualização de todos os arquivos
            scriptFile.write("git config --global --add safe.directory \"%CD%\" > update_log.txt\n");
            scriptFile.write("git fetch origin main >> update_log.txt\n");
            scriptFile.write("git checkout -f origin/main >> update_log.txt 2>&1\n");  // Força o checkout de todos os arquivos
            scriptFile.write("git clean -fd >> update_log.txt\n");  // Remove arquivos não rastreados
            scriptFile.write("exit\n");
            scriptFile.close();
        }

        if (scriptFile.exists) {
            if (scriptFile.execute()) {
                $.sleep(2000);
                
                var logFile = new File(currentDir + "/update_log.txt");
                if (logFile.exists) {
                    logFile.open('r');
                    var logContent = logFile.read();
                    logFile.close();
                    
                    // Sempre mostra mensagem de sucesso pois os arquivos foram recarregados
                    alert(t("atualizacaoSucesso"));
                    
                    // Limpar arquivo temporário
                    scriptFile.remove();
                }
            }
        }
    } catch (e) {
        alert(t("erroAtualizacao") + ": " + e);
    }
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

// Segunda linha: Nome/Tipo dropdown, L e Tipo de fixação
var linha2 = grupoPrincipal.add("group");
linha2.orientation = "row";
linha2.alignChildren = ["left", "center"];
linha2.spacing = 10;

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

// Dropdown L1-L20 (tamanho reduzido)
linha2.add("statictext", undefined, "L:");
var opcoesL = [];
for (var i = 1; i <= 20; i++) {
    opcoesL.push("L" + i);
}
var listaL = linha2.add("dropdownlist", undefined, opcoesL);
listaL.selection = 0;
listaL.preferredSize.width = 60; // Reduz o tamanho do dropdown

// Tipo de fixação
linha2.add("statictext", undefined, t("tipoFixacao"));

// Tipos de fixação
var tiposFixacao = [];
var tiposFixacaoKeys = ["poteau", "suspendue", "murale", "sansFixation", "auSol", "speciale"];

// Preencher o array com as traduções
for (var i = 0; i < tiposFixacaoKeys.length; i++) {
    tiposFixacao.push(t("tiposFixacao")[tiposFixacaoKeys[i]]);
}

// Criar o dropdown com os tipos traduzidos
var listaFixacao = linha2.add("dropdownlist", undefined, tiposFixacao);
listaFixacao.selection = 0;

// Terceira linha: Dimensões e Structure laqueé
var linha3 = grupoPrincipal.add("group");
linha3.orientation = "row";
linha3.alignChildren = ["left", "center"];
linha3.spacing = 10;

// Campos H, L, P, ⌀
var grupoDimensoes = linha3.add("group");
var dimensoes = ["H", "L", "P", "⌀"];
for (var i = 0; i < dimensoes.length; i++) {
    grupoDimensoes.add("statictext", undefined, dimensoes[i] + ":");
    var campoDimensao = grupoDimensoes.add("edittext", undefined, "");
    campoDimensao.characters = 5;
    apenasNumerosEVirgula(campoDimensao);
}

// Espaço flexível
var espacoFlexivel = linha3.add("group");
espacoFlexivel.alignment = ["fill", "center"];

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
    
// Campo de pesquisa
var campoPesquisa = grupoPesquisa.add("edittext", undefined, "");
campoPesquisa.characters = 20;
campoPesquisa.onChanging = function() {
    filtrarComponentes(campoPesquisa.text);
};

// Função para filtrar componentes
function filtrarComponentes(termo) {
    var componentesFiltrados = [t("selecioneComponente")];
    
    if (termo.length > 0) {
        for (var i = 1; i < componentesNomes.length; i++) {
            if (componentesNomes[i].toLowerCase().indexOf(termo.toLowerCase()) !== -1) {
                componentesFiltrados.push(componentesNomes[i]);
            }
        }
    } else {
        componentesFiltrados = [t("selecioneComponente")].concat(componentesNomes.slice(1));
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
    var componentesDisponiveis = [t("selecioneComponente")]; // Usar t() aqui
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
var coresNomes = [t("selecioneCor")].concat(extrairNomes(dados.cores));
var listaCores = grupo2.add("dropdownlist", undefined, coresNomes);
listaCores.selection = 0;

// Lista de unidades
var unidades = ["ml", "m2", "unit"];
var listaUnidades = grupo2.add("dropdownlist", undefined, unidades);
listaUnidades.selection = 0;

// Campo de quantidade
var campoQuantidade = grupo2.add("edittext", undefined, "");
campoQuantidade.characters = 5;
funcoes.apenasNumerosEVirgula(campoQuantidade);
// Campo de multiplicador
grupo2.add("statictext", undefined, "x");
var campoMultiplicador = grupo2.add("edittext", undefined, "1");
campoMultiplicador.characters = 3;
funcoes.apenasNumerosEVirgula(campoMultiplicador);

// Botão adicionar componente
var botaoAdicionarComponente = grupo2.add("button", undefined, t("botaoAdicionar"));

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

// Selecionar a primeira aba por padrão
abasExtra.selection = abaGeral;


var grupoBolasSelecao = grupoBolas.add("group");
grupoBolasSelecao.orientation = "row";

// Função para obter cores disponíveis para bolas
function getCoresDisponiveisBolas() {
    var coresDisponiveis = [t("selecioneCor")];  // Já inclui o item inicial aqui
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
var coresBolasDisponiveis = getCoresDisponiveisBolas(); // Remover a concatenação extra
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

// Função para atualizar a lista de acabamentos com base na cor selecionada
function atualizarAcabamentos() {
    if (listaCoresBolas.selection.index === 0) {
        listaAcabamentos.removeAll();
        listaAcabamentos.add("item", t("selecioneAcabamento"));
        listaAcabamentos.selection = 0;
        return;
    }

    var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCoresBolas.selection.text)];
    var acabamentosDisponiveis = [t("selecioneAcabamento")];
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
    
    // Atualizar tamanhos após selecionar o acabamento
    atualizarTamanhos();
}

// Função para atualizar a lista de tamanhos com base na cor e acabamento selecionados
function atualizarTamanhos() {
    if (listaCoresBolas.selection.index === 0 || listaAcabamentos.selection.index === 0) {
        listaTamanhos.removeAll();
        listaTamanhos.add("item", t("selecioneTamanho"));
        listaTamanhos.selection = 0;
        return;
    }

    var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCoresBolas.selection.text)];
    var acabamentoSelecionado = dados.acabamentos[encontrarIndicePorNome(dados.acabamentos, listaAcabamentos.selection.text)];
    var tamanhosDisponiveis = [t("selecioneTamanho")];

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
        alert(t("selecionarCor"));
        return;
    }

    var quantidade = parseFloat(campoQuantidadeBolas.text.replace(',', '.'));
    if (isNaN(quantidade) || quantidade <= 0) {
        alert(t("quantidadeInvalida"));
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
            alert(t("erroProcessarBola") + e.message);
        }
    } else {
        alert(t("erroCombinacaoBola"));
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

        // Substituir a função processarAlfabeto() existente por:
        botaoAdicionarPalavraChave.onClick = function() {
            // Extrair o valor numérico do tamanho selecionado
            var tamanhoSelecionado = tamanhoAlfabeto.selection.text;
            var valorNumerico = tamanhoSelecionado.replace(/[^\d,]/g, '').replace(',', '.');
            
            // Procurar o campo H nos campos dimensões
            for (var i = 0; i < grupoDimensoes.children.length; i++) {
                var campo = grupoDimensoes.children[i];
                if (campo.type === "statictext" && campo.text === "H:") {
                    // O campo de input é o próximo elemento após o texto "H:"
                    var campoH = grupoDimensoes.children[i + 1];
                    if (campoH && campoH.type === "edittext") {
                        campoH.text = valorNumerico;
                        break;
                    }
                }
            }
            
            // Usar a função processarAlfabeto do novo arquivo
            var resultado = processarAlfabeto(
                campoPalavraChave.text,
                dropdownCorBioprint.selection ? dropdownCorBioprint.selection.text : "",
                tamanhoSelecionado
            );
            
            if (resultado.referenciasTexto.length > 0) {
                itensLegenda.push({
                    tipo: "alfabeto",
                    nome: "Referências do Alfabeto",
                    texto: resultado.referenciasTexto.join("\n"),
                    referencia: "",
                    quantidade: 1,
                    unidade: "",
                    tamanhoAlfabeto: tamanhoSelecionado,
                    bioprint: "bioprint",
                    corBioprint: dropdownCorBioprint.selection ? dropdownCorBioprint.selection.text : "",
                    palavraDigitada: resultado.palavraDigitada
                });
                
                atualizarListaItens();
                campoPalavraChave.text = "";
                
                // Atualizar o campo nome/tipo apenas com a palavra digitada
                campoNomeTipo.text = resultado.palavraDigitada;
            } else {
                alert(t("nenhumaLetraValida"));
            }
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

      // Função auxiliar para obter o número da textura (colocar ANTES dos eventos)
      function obterNumeroTextura(texturaNome) {
          if (texturaNome.indexOf("Texture") === 0) {
              return parseInt(texturaNome.replace("Texture ", ""));
          }
          // Para texturas Flexi, manter a numeração original
          switch(texturaNome) {
              case "Flexi Triangle": return 17;
              case "Flexi Boucle": return 18;
              case "Flexi Losange": return 19;
              case "Flexi Meli Melo": return 20;
              default: return 1;
          }
      }

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
                
                var texturaNumero = obterNumeroTextura(listaTexturas.selection.text);
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
                var numeroTextura = obterNumeroTextura(this.selection.text);
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




  function atualizarPreview() {
    var previewText = [];
    var frasePrincipal = "";
    var componentesExtras = [];
    var primeiroComponenteExtra = null;
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
    var texturasAdicionadas = [];
    
    var componentesReferencias = [];
    var bolasProcessadas = {};
    var referenciasAlfabeto = [];
    var itensProcessados = {};
    
    // Procurar pela palavra digitada no alfabeto, a cor do bioprint, componentes, bolas e texturas
    for (var i = 0; i < itensLegenda.length; i++) {
        var item = itensLegenda[i];
        
        if (item.tipo === "textura") {
            var numeroTextura = item.referencia.match(/\d+/)[0];
            if (!arrayContains(texturasAdicionadas, numeroTextura)) {
                texturasAdicionadas.push(numeroTextura);
            }
        } else if (item.tipo === "alfabeto" && item.palavraDigitada) {
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
            if (!itensProcessados[item.referencia + item.unidade]) {
                componentesReferencias.push(criarLinhaReferencia(item));
                itensProcessados[item.referencia + item.unidade] = true;
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
            
            if (!bolasProcessadas[chaveBola] || item.unidade === "units") {
                bolasProcessadas[chaveBola] = item;
            }
        }
    }

    // Processar componentes extras
    for (var i = 0; i < itensLegenda.length; i++) {
        if (itensLegenda[i].tipo === "extra") {
            if (!primeiroComponenteExtra) {
                primeiroComponenteExtra = itensLegenda[i];
            } else {
                componentesExtras.push(itensLegenda[i]);
            }
        }
    }

    // Construir a frase principal
    var nomeTipo = palavraDigitada || campoNomeTipo.text;
    var prefixoNomeTipo = escolhaNomeTipo.selection.text === "Tipo" ? "type " : "";
    var preposicao = alfabetoUsado ? "en" : "avec";
    var decorTexto = "décor";

    frasePrincipal = "Logo " + (listaL.selection ? listaL.selection.text : "") + ": " + 
                     decorTexto + " " + prefixoNomeTipo + "\"" + nomeTipo + "\" " + preposicao;

    if (alfabetoUsado) {
        frasePrincipal += " bioprint " + (corBioprint || "");
    }

    // Definir a ordem dos componentes
    var ordemComponentes = [
        'BIOPRINT',
        'RECYPRINT',
        'FLEXIPRINT',
        'MOQUETTE',
        'CAMOUFLAGE',
        'FIL LUMIERE',
        'LUCIOLES',
        'STALACTITS',
        'RIDEAUX',
        'FIL COMÈTE',
        'SOFT XLED',
        'BOULE ANIMÉ',
        'BOULES ANIMÉS',
        'BOUQUETS',
        'ECLAT ANIMÉ',
        'ECLATS ANIMÉS',
        'FLAME BOULE',
        'FLAME BOULES',
        'TIGES X-LED 0,50M',
        'TIGES X-LED 0,80M',
        'XLED SPIRAL',
        'XLED STAR'
    ];

    var ordemUnidades = ['m2', 'ml', 'units'];

    // Funções extrairInfoComponente e encontrarIndice movidas para funcoes.jsx

    // Ordenar componentesReferencias
    componentesReferencias.sort(function(a, b) {
        var infoA = funcoes.extrairInfoComponente(a);
        var infoB = funcoes.extrairInfoComponente(b);
        
        // Primeiro compara pelo componente base usando a ordem definida
        var posA = 999;
        var posB = 999;
        
        for (var i = 0; i < ordemComponentes.length; i++) {
            if (infoA.componente === ordemComponentes[i].toLowerCase()) {
                posA = i;
            }
            if (infoB.componente === ordemComponentes[i].toLowerCase()) {
                posB = i;
            }
        }
        
        if (posA !== posB) {
            return posA - posB;
        }
        
        // Se mesmo componente, ordena por cor
        if (infoA.cor !== infoB.cor) {
            return infoA.cor.localeCompare(infoB.cor);
        }
        
        // Se mesma cor, ordena por unidade (m2 antes de ml)
        var unidadeA = funcoes.encontrarIndice(ordemUnidades, infoA.unidade);
        var unidadeB = funcoes.encontrarIndice(ordemUnidades, infoB.unidade);
        
        if (unidadeA === -1) unidadeA = 999;
        if (unidadeB === -1) unidadeB = 999;
        
        return unidadeA - unidadeB;
    });

    // Modificar a parte onde os componentes são processados
    var componentesOrdenados = [];
    for (var nomeComponente in componentesAgrupados) {
        if (componentesAgrupados.hasOwnProperty(nomeComponente)) {
            componentesOrdenados.push(nomeComponente);
        }
    }
    
    // Ordenar os componentes
    componentesOrdenados.sort(function(a, b) {
        var posA = 999;
        var posB = 999;
        
        // Procurar posição na ordem
        for (var i = 0; i < ordemComponentes.length; i++) {
            if (a === ordemComponentes[i]) {
                posA = i;
            }
            if (b === ordemComponentes[i]) {
                posB = i;
            }
        }
        
        return posA - posB;
    });
    
    // Construir componentesTexto usando a ordem correta
    for (var i = 0; i < componentesOrdenados.length; i++) {
        var nomeComponente = componentesOrdenados[i];
        componentesTexto.push(nomeComponente + " " + componentesAgrupados[nomeComponente].join(", "));
    }

    if (componentesTexto.length > 0) {
        frasePrincipal += " " + componentesTexto.join(", ");
    }

    // Adicionar o primeiro componente extra à frase principal
    if (primeiroComponenteExtra) {
        frasePrincipal += ", " + primeiroComponenteExtra.nome;
    }

    // Adicionar as bolas
    var todasBolas = [];
    var bolasCompostas = [];
    for (var i = 0; i < bolasCores.length; i++) {
        todasBolas.push(bolasCores[i]);
    }
    for (var i = 0; i < bolesContadas.length; i++) {
        todasBolas.push(bolesContadas[i]);
    }
    
    // Separar bolas compostas
    for (var i = 0; i < itensLegenda.length; i++) {
        if (itensLegenda[i].tipo === "bola" && itensLegenda[i].composta) {
            bolasCompostas.push(itensLegenda[i].nome);
        }
    }
    
            todasBolas = funcoes.removerDuplicatas(todasBolas);
        bolasCompostas = funcoes.removerDuplicatas(bolasCompostas);

    if (todasBolas.length > 0 || bolasCompostas.length > 0) {
        var textoBoule = totalBolas > 1 ? "boules" : "boule";
        frasePrincipal += ", " + textoBoule + " " + todasBolas.join(", ");
        if (bolasCompostas.length > 0) {
            frasePrincipal += ", boules composées " + bolasCompostas.join(", ");
        }
    }

    frasePrincipal += ", sur structure aluminium";
    if (checkStructure.value) {
        frasePrincipal += " laquée " + (corStructure.selection ? corStructure.selection.text : "");
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
                dimensao = "\u00D8";
            }
            dimensoesValidas.push(dimensao + ": " + regras.formatarDimensao(valorDimensao));
        }
    }
    if (dimensoesValidas.length > 0) {
        previewText.push("\u200B"); // Adiciona uma linha em branco extra
        previewText.push(dimensoesValidas.join(" - "));
    }

    // Adicionar tipo de fixação
    previewText.push("Fixation: " + (listaFixacao.selection ? listaFixacao.selection.text : ""));

    // Adicionar "Composants:" apenas se houver componentes
    var temComponentes = false;
    for (var i = 0; i < itensLegenda.length; i++) {
        if (itensLegenda[i].tipo === "componente" || itensLegenda[i].tipo === "alfabeto") {
            temComponentes = true;
            break;
        }
    }
    
    if (temComponentes) {
        previewText.push("\u200B"); // Linha em branco antes de "Composants:"
        previewText.push("Composants:");
    }




    // Adicionar referências do alfabeto
    for (var i = 0; i < referenciasAlfabeto.length; i++) {
        previewText = previewText.concat(referenciasAlfabeto[i].texto.split('\n'));
    }

    // Adicionar referências de componentes
    previewText = previewText.concat(componentesReferencias);
    
    // Adicionar contagem de bolas
    if (totalBolas > 0) {
        previewText.push("\u200B");
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

    // Adicionar componentes extras, incluindo o primeiro
    var todosComponentesExtras = [];
    if (primeiroComponenteExtra) {
        todosComponentesExtras.push(primeiroComponenteExtra);
    }
    todosComponentesExtras = todosComponentesExtras.concat(componentesExtras);

    if (todosComponentesExtras.length > 0) {
        // Removemos a linha que adiciona o espaço em branco
        // previewText.push("\u200B"); // Removemos a linha em branco antes dos extras
        
        for (var i = 0; i < todosComponentesExtras.length; i++) {
            previewText.push(todosComponentesExtras[i].texto);
        }
    }

    // Adicionar observações
    if (campoObs && campoObs.text && campoObs.text.toString().replace(/\s/g, '').length > 0) {
        previewText.push("\u200B");
        previewText.push("Obs: " + campoObs.text);
    }

    // Retornar objeto com texto e texturas
    return {
        texto: previewText.join("\n"),
        texturas: texturasAdicionadas
    };
}

// Função formatarUnidade movida para funcoes.jsx

// Modificar a função criarLinhaReferencia
function criarLinhaReferencia(item) {
    var linha = item.referencia ? item.referencia : item.nome;
    if (item.unidade) {
        linha += " (" + funcoes.formatarUnidade(item.unidade) + ")";
    }
    
    var quantidade = funcoes.arredondarComponente(item.quantidade, item.unidade, item.nome);
    
    var quantidadeFormatada;
    if (item.unidade === "units") {
        quantidadeFormatada = Math.round(quantidade).toString();
    } else {
        quantidadeFormatada = quantidade.toFixed(2).replace('.', ',');
    }
    
    if (item.multiplicador && item.multiplicador > 1) {
        linha += " " + quantidadeFormatada + "x" + item.multiplicador + ": ";
        var quantidadeTotal = quantidade * item.multiplicador;
        var quantidadeTotalFormatada;
        if (item.unidade === "units") {
            quantidadeTotalFormatada = Math.round(quantidadeTotal).toString();
        } else {
            quantidadeTotalFormatada = quantidadeTotal.toFixed(2).replace('.', ',');
        }
        linha += quantidadeTotalFormatada;
    } else {
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

// Modificar a função atualizarCores para incluir a verificação de CMYK
function atualizarCores() {
    listaCores.removeAll();
    listaUnidades.removeAll();
    
    if (listaComponentes.selection && listaComponentes.selection.index > 0) {
        var componenteSelecionado = dados.componentes[encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
        var coresDisponiveis = [t("selecioneCor")];
        var coresIds = [];
        var unidadesDisponiveis = [t("selecioneUnidade")];

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
        listaCores.add("item", t("selecioneCor"));
        listaUnidades.add("item", t("selecioneUnidade"));
        listaCores.selection = 0;
        listaUnidades.selection = 0;
    }
    
    // Chamar atualizarUnidades() para atualizar as unidades com base na cor selecionada
    atualizarUnidades();
    
    // Verificar o CMYK da combinação selecionada (sem exibir alerta)
    verificarCMYK();
}

// Modificar a função para apenas verificar o CMYK, sem exibir alertas

    function verificarCMYK() {
        if (listaComponentes.selection && listaComponentes.selection.index > 0 &&
            listaCores.selection && listaCores.selection.index > 0 &&
            listaUnidades.selection && listaUnidades.selection.index > 0) {
            
            var componenteSelecionado = dados.componentes[encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
            var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCores.selection.text)];
            var unidadeSelecionada = listaUnidades.selection.text;
    
            for (var i = 0; i < dados.combinacoes.length; i++) {
                if (dados.combinacoes[i].componenteId === componenteSelecionado.id &&
                    dados.combinacoes[i].corId === corSelecionada.id &&
                    dados.combinacoes[i].unidade === unidadeSelecionada) {
                    
                    // Aqui você pode adicionar qualquer lógica adicional que queira executar
                    // quando um CMYK é encontrado, sem exibir alertas
                    if (dados.combinacoes[i].cmyk) {
                        // Por exemplo, você poderia armazenar o CMYK em uma variável global
                        // ou atualizar algum elemento da interface
                        // cmykAtual = dados.combinacoes[i].cmyk;
                    }
                    break;
                }
            }
        }
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
    
    listaCores.onChange = function() {
        atualizarUnidades();
        verificarCMYK();
    };
    
    listaCores.onChange = atualizarUnidades;
    listaUnidades.onChange = verificarCMYK;

    // Função para arredondar para a próxima décima
    // Função arredondarParaDecima movida para funcoes.jsx
// Função para salvar a seleção atual
function salvarSelecaoAtual() {
    try {
        if (listaComponentes && listaComponentes.selection) {
            ultimaSelecao.componente = listaComponentes.selection.text;
        }
        if (listaCores && listaCores.selection) {
            ultimaSelecao.cor = listaCores.selection.text;
        }
        if (listaUnidades && listaUnidades.selection) {
            ultimaSelecao.unidade = listaUnidades.selection.text;
        }
        // Removemos o salvamento da quantidade
        if (campoMultiplicador) {
            ultimaSelecao.multiplicador = campoMultiplicador.text;
        }
    } catch (e) {
        alert("Erro ao salvar seleção: " + e.message);
    }
}

// Função para restaurar a última seleção
function restaurarUltimaSelecao() {
    try {
        if (ultimaSelecao.componente && listaComponentes) {
            for (var i = 0; i < listaComponentes.items.length; i++) {
                if (listaComponentes.items[i].text === ultimaSelecao.componente) {
                    listaComponentes.selection = i;
                    break;
                }
            }
        }

        // Atualizar cores baseado no componente
        atualizarCores();

        if (ultimaSelecao.cor && listaCores) {
            for (var i = 0; i < listaCores.items.length; i++) {
                if (listaCores.items[i].text === ultimaSelecao.cor) {
                    listaCores.selection = i;
                    break;
                }
            }
        }

        // Atualizar unidades baseado na cor
        atualizarUnidades();

        if (ultimaSelecao.unidade && listaUnidades) {
            for (var i = 0; i < listaUnidades.items.length; i++) {
                if (listaUnidades.items[i].text === ultimaSelecao.unidade) {
                    listaUnidades.selection = i;
                    break;
                }
            }
        }

        // Deixar o campo quantidade vazio
        if (campoQuantidade) {
            campoQuantidade.text = "";
        }
        if (campoMultiplicador) {
            campoMultiplicador.text = ultimaSelecao.multiplicador;
        }
    } catch (e) {
        alert("Erro ao restaurar seleção: " + e.message);
    }
}
    botaoAdicionarComponente.onClick = function() {
        try {
            // Verificar se a quantidade foi preenchida
            var quantidade = campoQuantidade.text;
            if (!quantidade || quantidade.replace(/\s/g, "") === "") {
                alert(t("quantidadeNaoInformada")); // "Por favor, informe a quantidade"
                campoQuantidade.active = true; // Foca no campo
                return;
            }

            // Verificações iniciais
            if (!dados || typeof dados !== 'object') {
                alert("Erro: dados não está definido ou não é um objeto");
                return;
            }
    
            if (!dados.componentes || !dados.cores) {
                alert("Erro: dados.componentes ou dados.cores não estão definidos");
                return;
            }
    
            if (!listaComponentes || !listaCores || !listaUnidades) {
                alert("Erro: Uma ou mais listas não estão definidas\nComponentes: " + 
                      (listaComponentes ? "OK" : "Não definido") + 
                      "\nCores: " + (listaCores ? "OK" : "Não definido") + 
                      "\nUnidades: " + (listaUnidades ? "OK" : "Não definido"));
                return;
            }
    
            if (!listaComponentes.selection || !listaCores.selection || !listaUnidades.selection) {
                alert(t("selecionarComponenteCompleto"));
                return;
            }
    
            if (listaComponentes.selection.index === 0 || listaCores.selection.index === 0 || listaUnidades.selection.index === 0) {
                alert(t("selecionarComponenteCompleto"));
                return;
            }
    
            // Salvar seleção atual antes de qualquer operação
            salvarSelecaoAtual();
    
            // Obter dados selecionados
            var componenteSelecionado = dados.componentes[encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
            var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCores.selection.text)];
            var unidadeSelecionada = listaUnidades.selection.text;
    
            // Verificar se os dados foram obtidos corretamente
            if (!componenteSelecionado || !corSelecionada) {
                alert("Erro ao obter componente ou cor selecionada:\nComponente: " + 
                      (componenteSelecionado ? "OK" : "Não encontrado") + 
                      "\nCor: " + (corSelecionada ? "OK" : "Não encontrada"));
                return;
            }
    
            // Processar quantidade e multiplicador
            var quantidade = parseFloat(campoQuantidade.text.replace(',', '.'));
            var multiplicador = parseFloat(campoMultiplicador.text.replace(',', '.'));
    
            if (isNaN(quantidade) || quantidade <= 0) {
                alert(t("quantidadeInvalida") + "\nValor inserido: " + campoQuantidade.text);
                return;
            }
    
            if (isNaN(multiplicador) || multiplicador <= 0) {
                alert("Multiplicador inválido, usando valor padrão 1\nValor inserido: " + campoMultiplicador.text);
                multiplicador = 1;
            }
    
            // Encontrar combinação
            var combinacaoSelecionada = null;
            for (var i = 0; i < dados.combinacoes.length; i++) {
                if (dados.combinacoes[i].componenteId === componenteSelecionado.id &&
                    dados.combinacoes[i].corId === corSelecionada.id &&
                    dados.combinacoes[i].unidade === unidadeSelecionada) {
                    combinacaoSelecionada = dados.combinacoes[i];
                    break;
                }
            }
    
            if (!combinacaoSelecionada) {
                alert("Combinação não encontrada:\nComponente: " + componenteSelecionado.nome + 
                      "\nCor: " + corSelecionada.nome + 
                      "\nUnidade: " + unidadeSelecionada);
                return;
            }
    
            // Processar o componente
            var nomeComponente = componenteSelecionado.nome + " " + corSelecionada.nome;
            quantidade = funcoes.arredondarComponente(quantidade, unidadeSelecionada, nomeComponente);
    
            // Verificar se o item já existe
            var itemExistente = null;
            for (var i = 0; i < itensLegenda.length; i++) {
                if (itensLegenda[i].tipo === "componente" && 
                    itensLegenda[i].nome === nomeComponente &&
                    itensLegenda[i].unidade === unidadeSelecionada) {
                    itemExistente = itensLegenda[i];
                    break;
                }
            }
    
            // Atualizar ou adicionar item
            if (itemExistente) {
                itemExistente.quantidade = quantidade;
                itemExistente.multiplicador = multiplicador;
                itemExistente.texto = criarTextoComponente(nomeComponente, combinacaoSelecionada.referencia, unidadeSelecionada, quantidade, multiplicador);
            } else {
                itensLegenda.push({
                    tipo: "componente",
                    nome: nomeComponente,
                    texto: criarTextoComponente(nomeComponente, combinacaoSelecionada.referencia, unidadeSelecionada, quantidade, multiplicador),
                    referencia: combinacaoSelecionada.referencia,
                    quantidade: quantidade,
                    multiplicador: multiplicador,
                    unidade: unidadeSelecionada,
                    componenteId: componenteSelecionado.id
                });
            }
    
            // Atualizar interface
            atualizarListaItens();
    
            try {
                // Restaurar a última seleção
                restaurarUltimaSelecao();
            } catch (e) {
                alert("Erro ao restaurar seleção: " + e.message + "\nUsando reset padrão");
                // Reset padrão em caso de erro
                campoQuantidade.text = "1";
                campoMultiplicador.text = "1";
                listaComponentes.selection = 0;
                listaCores.removeAll();
                listaCores.add("item", t("selecioneCor"));
                listaCores.selection = 0;
                listaUnidades.removeAll();
                listaUnidades.add("item", t("selecioneUnidade"));
                listaUnidades.selection = 0;
            }
    
        } catch (e) {
            alert("Erro geral ao adicionar componente:\n" + e.message + "\nLinha: " + e.line);
        }
    };

    // Função para arredondar para o próximo 0,05 ou 0,1
    // Função arredondarComponente movida para funcoes.jsx

// Modificar a função criarTextoComponente
function criarTextoComponente(nome, referencia, unidade, quantidade, multiplicador) {
    var texto = nome;
    if (referencia) {
        texto += " (Ref: " + referencia + ")";
    }
    texto += " (" + funcoes.formatarUnidade(unidade) + ")";
    
    quantidade = funcoes.arredondarComponente(quantidade, unidade, nome);
    
    var quantidadeFormatada = quantidade.toFixed(2).replace('.', ',');
    if (multiplicador > 1) {
        texto += " " + quantidadeFormatada + "x" + multiplicador + ": ";
        var quantidadeTotal = quantidade * multiplicador;
        texto += quantidadeTotal.toFixed(2).replace('.', ',');
    } else {
        texto += ": " + quantidadeFormatada;
    }
    
    return texto;
}
    // Exibir a janela
    janela.show();

    // Modificar o botão para gerar legenda
    botaoGerar.onClick = function() {
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
                var legendaInfo = atualizarPreview();
                
                if (legendaInfo === undefined) {
                    alert(t("erroGerarLegenda"));
                    return;
                }
                
                // Substituir pontos por vírgulas
                var legendaConteudo = legendaInfo.texto.replace(/(\d+)\.(\d+)/g, formatarNumero);
    
                // Encontrar o tamanho do alfabeto nos itens da legenda
                var tamanhoGXSelecionado = "";
                for (var i = 0; i < itensLegenda.length; i++) {
                    if (itensLegenda[i].tipo === "alfabeto") {
                        tamanhoGXSelecionado = itensLegenda[i].tamanhoAlfabeto; // Usar o mesmo nome específico
                        break;
                    }
                }

                var scriptIllustrator = function(nomeDesigner, conteudoLegenda, texturas, palavraDigitada, tamanhoGX) {
                    var doc = app.activeDocument;
    
                    if (!doc) {
                        return "Nenhum documento ativo. Por favor, abra um documento no Illustrator.";
                    }
    
                    if (doc.artboards.length === 0) {
                        return "Erro: O documento não tem artboards. Por favor, crie uma artboard antes de adicionar a legenda.";
                    }
    
                    var novaLayer = doc.layers.add();
                    novaLayer.name = "Legenda";
    
                    var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
                    var artboardBounds = artboard.artboardRect;
                    
                    // Dentro da função scriptIllustrator, na parte que processa as texturas
                    if (texturas && texturas !== "") {
                        try {
                            var caminhoBase = "C:/Program Files/Adobe/Adobe Illustrator 2025/Presets/en_GB/Scripts/Legenda/svg/";
                            // Converter para string e remover espaços manualmente
                            var texturasString = String(texturas);
                            var texturasArray = texturasString.split(',');
                            var larguraTextura = 300;
                            var alturaTextura = 400;
                            var espacamentoHorizontal = 20;
                            
                            // Calcular posição Y inicial para as texturas
                            var posicaoYTexturas = artboardBounds[1] - (palavraDigitada ? alturaLetras + 600 : 500);
                            
                            for (var i = 0; i < texturasArray.length; i++) {
                                // Remover espaços manualmente
                                var numeroTextura = String(texturasArray[i]);
                                numeroTextura = numeroTextura.replace(/^\s+/, '').replace(/\s+$/, '');
                                
                                if (numeroTextura === '') continue;
                                
                                var caminhoAI = caminhoBase + "texture" + numeroTextura + ".ai";
                                var arquivoAI = new File(caminhoAI);
                                
                                if (arquivoAI.exists) {
                                    try {
                                        var placedItem = novaLayer.placedItems.add();
                                        placedItem.file = arquivoAI;
                                        
                                        var posX = artboardBounds[0] + (i * (larguraTextura + espacamentoHorizontal));
                                        placedItem.position = [posX, posicaoYTexturas];
                                        
                                        placedItem.width = larguraTextura;
                                        placedItem.height = alturaTextura;
                                        placedItem.embed();
                                        
                                        app.redraw();
                                    } catch (texError) {
                                        alert("Erro ao adicionar textura " + numeroTextura + ": " + texError);
                                    }
                                } else {
                                    alert("Arquivo não encontrado: texture" + numeroTextura + ".ai");
                                }
                            }
                        } catch (e) {
                            alert("Erro ao processar texturas: " + e);
                        }
                    }
    
                    // Dentro da função scriptIllustrator, após o processamento das texturas:
                    try {
                        
                        if (palavraDigitada && palavraDigitada !== "") {
                            var caminhoAlfabeto = "C:/Program Files/Adobe/Adobe Illustrator 2025/Presets/en_GB/Scripts/Legenda/alfabeto/";
                            
                            // Usar o tamanhoGX passado como parâmetro
                            var espacamentoHorizontal = (tamanhoGX === "1,40 m") ? 150 : 220;
                            var sufixoTamanho = (tamanhoGX === "1,40 m") ? "140" : "200";
                            
                            // Ajustar altura das letras baseado no tamanho
                            var alturaLetras = (tamanhoGX === "1,40 m") ? 200 : 300;
                            
                            // Definir posição inicial X
                            var posicaoX = artboardBounds[0] + 50;
                            
                            for (var i = 0; i < palavraDigitada.length; i++) {
                                var caractere = palavraDigitada[i].toUpperCase();
                                
                                if (caractere === '<' && palavraDigitada[i+1] === '3') {
                                    caractere = '<3';
                                    i++; // Pula o próximo caractere, pois já foi processado
                                }
                                
                                var nomeArquivoAI = "";
                                if (caractere >= 'A' && caractere <= 'Z') {
                                    var numeroLetra = 214 + (caractere.charCodeAt(0) - 'A'.charCodeAt(0));
                                    nomeArquivoAI = "GX" + numeroLetra + "LW_" + sufixoTamanho + ".ai";
                                } else if (caractere === '<3') {
                                    nomeArquivoAI = "GX240LW_" + sufixoTamanho + ".ai";
                                } else if (caractere === '#') {
                                    nomeArquivoAI = "GX241LW_" + sufixoTamanho + ".ai";
                                }
                                
                                if (nomeArquivoAI !== "") {
                                    var caminhoAI = caminhoAlfabeto + nomeArquivoAI;
                                    var arquivoAI = new File(caminhoAI);
                                    
                                    if (arquivoAI.exists) {
                                        var placedItem = novaLayer.placedItems.add();
                                        placedItem.file = arquivoAI;
                                        placedItem.position = [posicaoX, artboardBounds[1] - 100]; // Usar posicaoX aqui
                                        placedItem.embed();
                                        
                                        posicaoX += espacamentoHorizontal; // Incrementar posicaoX para a próxima letra
                                    } else {
                                        alert("Arquivo não encontrado: " + nomeArquivoAI);
                                    }
                                }
                            }
                        }
                    } catch (alfabetoError) {
                        alert("Erro ao processar alfabeto: " + alfabetoError + "\nTamanho: " + tamanhoGX);
                    }
                    
                    // Posicionar o texto da legenda (sempre será executado)
                    var textoLegenda = novaLayer.textFrames.add();
                    var posicaoYLegenda = artboardBounds[1] - (palavraDigitada ? alturaLetras + 150 : 100);
                    textoLegenda.position = [artboardBounds[0] + 50, posicaoYLegenda];
                    
                    var tamanhoFontePrincipal = 40;
                    var tamanhoFonteBids = 30;
                    
                    // Configurar fonte e cor
                    textoLegenda.textRange.characterAttributes.size = tamanhoFontePrincipal;
                    textoLegenda.textRange.characterAttributes.fillColor = new RGBColor(0, 0, 0);
                    
                    try {
                        textoLegenda.textRange.characterAttributes.textFont = app.textFonts.getByName("Apercu-Regular");
                    } catch (e) {
                        textoLegenda.textRange.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
                    }
                    
                    var textoBids = "Bids - " + nomeDesigner;
                    var linhas = conteudoLegenda.split('\n');
                    
                    // Dentro da função scriptIllustrator, modifique a parte onde as linhas são processadas:
                    var textoBids = "Bids - " + nomeDesigner;
                    var paragBids = textoLegenda.paragraphs.add(textoBids);
                    paragBids.characterAttributes.size = tamanhoFonteBids;
                    try {
                        paragBids.characterAttributes.textFont = app.textFonts.getByName("Apercu-Regular");
                    } catch (e) {
                        paragBids.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
                    }
                    paragBids.paragraphAttributes.spaceBefore = 0;
                    paragBids.paragraphAttributes.spaceAfter = 0;

                    for (var i = 0; i < linhas.length; i++) {
                        var linha = linhas[i];
                        
                        // Substituir "moquette blanc" por "moquette blanche" apenas na linha do Logo
                        if (linha.indexOf("Logo") === 0 && linha.toLowerCase().indexOf("moquette blanc") !== -1) {
                            linha = linha.replace(/moquette blanc/i, "moquette blanche");
                        }
                        
                        if (linha.indexOf("Logo") === 0) {
                            var novoParag = textoLegenda.paragraphs.add(linha);
                            novoParag.characterAttributes.size = tamanhoFontePrincipal;
                            try {
                                novoParag.characterAttributes.textFont = app.textFonts.getByName("Apercu-Regular");
                            } catch (e) {
                                novoParag.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
                            }
                            novoParag.paragraphAttributes.spaceBefore = 0;
                            novoParag.paragraphAttributes.spaceAfter = 0;
                        } else if (linha.indexOf("Composants:") === 0) {
                            var novoParag = textoLegenda.paragraphs.add(linha);
                            novoParag.characterAttributes.size = tamanhoFontePrincipal;
                            
                            var textoComposants = novoParag.characters[0];
                            textoComposants.length = "Composants:".length;
                            
                            try {
                                textoComposants.characterAttributes.textFont = app.textFonts.getByName("Apercu-Bold");
                            } catch (e) {
                                textoComposants.characterAttributes.textFont = app.textFonts.getByName("Arial-BoldMT");
                            }
                            
                            if (novoParag.characters.length > "Composants:".length) {
                                var textoRestante = novoParag.characters["Composants:".length];
                                textoRestante.length = novoParag.characters.length - "Composants:".length;
                                try {
                                    textoRestante.characterAttributes.textFont = app.textFonts.getByName("Apercu-Regular");
                                } catch (e) {
                                    textoRestante.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
                                }
                            }
                            
                            novoParag.paragraphAttributes.spaceBefore = 0;
                            novoParag.paragraphAttributes.spaceAfter = 0;
                        } else {
                            var novoParag = textoLegenda.paragraphs.add(linha);
                            novoParag.characterAttributes.size = tamanhoFontePrincipal;
                            try {
                                novoParag.characterAttributes.textFont = app.textFonts.getByName("Apercu-Regular");
                            } catch (e) {
                                novoParag.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
                            }
                            novoParag.paragraphAttributes.spaceBefore = 0;
                            novoParag.paragraphAttributes.spaceAfter = 0;
                        }
                    }
    
                    // Ajustar limites geométricos
                    textoLegenda.geometricBounds = [
                        textoLegenda.geometricBounds[0],
                        textoLegenda.geometricBounds[1],
                        textoLegenda.geometricBounds[2],
                        textoLegenda.geometricBounds[1] + 400
                    ];
    
                    return "success";
                };
    
                // Capturar a palavra digitada do campo alfabeto
                var palavraDigitada = "";
                for (var i = 0; i < itensLegenda.length; i++) {
                    if (itensLegenda[i].tipo === "alfabeto") {
                        palavraDigitada = itensLegenda[i].palavraDigitada;
                        break;
                    }
                }
    
                var scriptString = "(" + scriptIllustrator.toString() + ")";
                scriptString += "('" + escapeString(nomeDesigner) + "', '" + 
                               escapeString(legendaConteudo) + "', '" + 
                               legendaInfo.texturas.join(',') + "', '" + 
                               escapeString(palavraDigitada) + "', '" +
                               escapeString(tamanhoGXSelecionado) + "');";
                
                var bt = new BridgeTalk();
                bt.target = "illustrator";
                bt.body = scriptString;
                bt.onResult = function(resObj) {
                    if (resObj.body === "success") {
                        alert(t("legendaAdicionada"));
                        janela.close();
                        janela = null;
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

    function criarInterfaceExtra(janela) {
        var painelExtra = janela.add("panel", undefined, t("extra"));
        painelExtra.alignChildren = ["fill", "top"];
        
        // Criar TabbedPanel principal
        var tabsExtra = painelExtra.add("tabbedpanel");
        tabsExtra.alignChildren = ["fill", "fill"];
        
        // Tab Geral
        var tabGeral = tabsExtra.add("tab", undefined, t("geral"));
        tabGeral.alignChildren = ["fill", "top"];
        
        // Conteúdo da tab Geral
        var checkObservacoes = tabGeral.add("checkbox", undefined, t("observacoes"));
        var grupoObservacoes = tabGeral.add("group");
        grupoObservacoes.orientation = "column";
        grupoObservacoes.alignChildren = ["fill", "top"];
        // Adicionar conteúdo das observações aqui
        
        // Tab Criar
        var tabCriar = tabsExtra.add("tab", undefined, t("criar"));
        tabCriar.alignChildren = ["fill", "top"];
        // Conteúdo da tab Criar aqui
        
        // Tab Contador
        var tabContador = tabsExtra.add("tab", undefined, t("contador"));
        tabContador.alignChildren = ["fill", "top"];
        var checkContador = tabContador.add("checkbox", undefined, t("mostrarContador"));
        var grupoContador = tabContador.add("group");
        grupoContador.orientation = "column";
        grupoContador.alignChildren = ["fill", "top"];
        // Adicionar conteúdo do contador aqui
        
        // Tab Texturas
        var tabTexturas = tabsExtra.add("tab", undefined, t("texturas"));
        tabTexturas.alignChildren = ["fill", "top"];
        var checkTexturas = tabTexturas.add("checkbox", undefined, t("texturas"));
        var grupoTexturas = tabTexturas.add("group");
        grupoTexturas.orientation = "column";
        grupoTexturas.alignChildren = ["fill", "top"];
        // Adicionar conteúdo das texturas aqui
        
        // Eventos dos checkboxes
        checkObservacoes.onClick = function() {
            grupoObservacoes.visible = this.value;
        };
        
        checkContador.onClick = function() {
            grupoContador.visible = this.value;
        };
        
        checkTexturas.onClick = function() {
            grupoTexturas.visible = this.value;
        };
        
        // Configuração inicial
        grupoObservacoes.visible = false;
        grupoContador.visible = false;
        grupoTexturas.visible = false;
        
        tabsExtra.selection = 0;
        
        return {
            painelExtra: painelExtra,
            checkObservacoes: checkObservacoes,
            checkContador: checkContador,
            checkTexturas: checkTexturas,
            grupoObservacoes: grupoObservacoes,
            grupoContador: grupoContador,
            grupoTexturas: grupoTexturas
        };
    }
})();
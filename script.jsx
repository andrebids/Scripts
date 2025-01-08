#target illustrator
#targetengine maintarget illustrator

// Importar o arquivo de regras
$.evalFile(File($.fileName).path + "/json2.js");
$.evalFile(File($.fileName).path + "/regras.jsx");
$.evalFile(File($.fileName).path + "/funcoes.jsx");
$.evalFile(File($.fileName).path + "/database.jsx");
$.evalFile(File($.fileName).path + "/ui.jsx");
$.evalFile(File($.fileName).path + "/translations.js");

// Definir o caminho do arquivo de configuração primeiro
var caminhoConfig = getPastaDocumentos() + "/cartouche_config.json";

// Variável global para o idioma - começar em francês
var IDIOMA_ATUAL = "Français";

// Quando verificar o arquivo de configuração, definir francês como padrão
if (arquivoExiste(caminhoConfig)) {
    var config = lerArquivoJSON(caminhoConfig);
    nomeDesigner = config.nomeDesigner;
    // Se não houver idioma configurado, usar francês
    idiomaUsuario = config.idioma || "Français";
    IDIOMA_ATUAL = idiomaUsuario;
} else {
    // Se não existir arquivo de configuração, criar com francês como padrão
    var config = {
        nomeDesigner: "",
        idioma: "Français"
    };
    escreverArquivoJSON(caminhoConfig, config);
}

// Função para atualizar o idioma
function atualizarIdioma(novoIdioma) {
    IDIOMA_ATUAL = novoIdioma;
}

(function() {
    
     // Caminho do arquivo de configuração
var caminhoConfig = getPastaDocumentos() + "/cartouche_config.json";

// Caminho hardcoded para a base de dados
var caminhoBaseDadosHardcoded = "\\\\192.168.2.22\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\ILLUSTRATOR\\basededados\\database2.json";
var itensLegenda = [];
var itensNomes = [];
// Verificar se o arquivo de configuração existe
var nomeDesigner;
var idiomaUsuario;
if (arquivoExiste(caminhoConfig)) {
    var config = lerArquivoJSON(caminhoConfig);
    nomeDesigner = config.nomeDesigner;
    idiomaUsuario = config.idioma;
    
    // Se o nome for undefined ou vazio, pedir ao usuário
    if (!nomeDesigner || nomeDesigner === "undefined" || nomeDesigner === "") {
        var janelaNome = new Window("dialog", t("nomeDesigner"));
        janelaNome.add("statictext", undefined, t("inserirNome"));
        var campoNome = janelaNome.add("edittext", undefined, "");
        campoNome.characters = 30;
        
        var botaoOKNome = janelaNome.add("button", undefined, t("botaoOk"));
        
        botaoOKNome.onClick = function() {
            if (campoNome.text && campoNome.text !== "") {
                nomeDesigner = campoNome.text;
                config.nomeDesigner = nomeDesigner;
                escreverArquivoJSON(caminhoConfig, config);
                janelaNome.close();
            } else {
                alert(t("erroNomeVazio"));
            }
        };
        
        janelaNome.show();
    }
    
    // Se não tiver idioma configurado, pedir ao usuário
    if (!idiomaUsuario || idiomaUsuario === "undefined") {
        var janelaIdioma = new Window("dialog", t("configuracaoIdioma"));
        janelaIdioma.add("statictext", undefined, t("selecioneIdioma"));
        var listaIdiomas = janelaIdioma.add("dropdownlist", undefined, [
            "Português",
            "Français"
        ]);
        listaIdiomas.selection = 0;
        
        var botaoOK = janelaIdioma.add("button", undefined, t("botaoOk"));
        
        botaoOK.onClick = function() {
            idiomaUsuario = listaIdiomas.selection.text;
            $.global.idiomaUsuario = idiomaUsuario;
            config.idioma = idiomaUsuario;
            escreverArquivoJSON(caminhoConfig, config);
            janelaIdioma.close();
        };
        
        janelaIdioma.show();
    }
} else {
    // Criar janela para pedir o nome do designer e idioma
    var janelaConfig = new Window("dialog", t("configuracaoInicial"));
    janelaConfig.add("statictext", undefined, t("inserirNome"));
    var campoNome = janelaConfig.add("edittext", undefined, "");
    campoNome.characters = 30;
    
    janelaConfig.add("statictext", undefined, t("selecioneIdioma"));
    var listaIdiomas = janelaConfig.add("dropdownlist", undefined, [
        "Português",
        "Français"
    ]);
    listaIdiomas.selection = 0;
    
    var botaoOK = janelaConfig.add("button", undefined, t("botaoOk"));
    
    botaoOK.onClick = function() {
        if (campoNome.text && campoNome.text !== "") {
            nomeDesigner = campoNome.text;
            idiomaUsuario = listaIdiomas.selection.text;
            janelaConfig.close();
            
            // Salvar as configurações no arquivo
            escreverArquivoJSON(caminhoConfig, {
                nomeDesigner: nomeDesigner,
                idioma: idiomaUsuario
            });
        } else {
            alert(t("erroNomeVazio"));
        }
    };
    
    janelaConfig.show();
}


//function criarQuadradoPreto(layer, posX, posY, tamanho) {
  //  var quadrado = layer.pathItems.rectangle(posY, posX, tamanho, tamanho);
    //quadrado.fillColor = new RGBColor(0, 0, 0); // Preto
    //quadrado.stroked = false; // Sem contorno
    //return quadrado;
//}

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

// Espaço flexível para empurrar o botão para a direita
var espacoFlexivel = grupoUpdate.add("group");
espacoFlexivel.alignment = ["fill", "center"];

// Texto da versão (antes do botão Update)
var textoVersao = grupoUpdate.add("statictext", undefined, "v1.9");
textoVersao.graphics.font = ScriptUI.newFont(textoVersao.graphics.font.family, ScriptUI.FontStyle.REGULAR, 9);
textoVersao.alignment = ["right", "center"];

// Dropdown de idiomas
var dropdownIdiomas = grupoUpdate.add("dropdownlist", undefined, [
    "Português",
    "Français"
]);

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
        alert("Diretório atual: " + currentDir);
        
        // Criar arquivo .bat para Windows
        var scriptFile = new File(currentDir + "/update_script.bat");
        
        if (scriptFile.open('w')) {
            alert("Arquivo .bat aberto para escrita");
            
            // Escrever o conteúdo do arquivo
            scriptFile.write("@echo off\n");
            scriptFile.write("cd /d \"" + currentDir + "\"\n");
            
            // Configurar diretório como seguro e forçar atualização
            scriptFile.write("git config --global --add safe.directory \"%CD%\" > update_log.txt 2>&1\n");
            scriptFile.write("git fetch origin main >> update_log.txt 2>&1\n");
            scriptFile.write("git reset --hard origin/main >> update_log.txt 2>&1\n");
            scriptFile.write("git clean -fd >> update_log.txt 2>&1\n");
            
            scriptFile.write("set /p GIT_OUTPUT=<update_log.txt\n");
            scriptFile.write("if \"%GIT_OUTPUT%\"==\"Already up to date.\" (\n");
            scriptFile.write("    echo Script já está atualizado.\n");
            scriptFile.write(") else if %ERRORLEVEL% NEQ 0 (\n");
            scriptFile.write("    echo Falha na atualização.\n");
            scriptFile.write(") else (\n");
            scriptFile.write("    echo Atualização concluída com sucesso!\n");
            scriptFile.write(")\n");
            scriptFile.write("pause\n");
            
            scriptFile.close();
            
            if (scriptFile.exists) {
                if (scriptFile.execute()) {
                    $.sleep(2000);
                    
                    var logFile = new File(currentDir + "/update_log.txt");
                    if (logFile.exists) {
                        logFile.open('r');
                        var logContent = logFile.read();
                        logFile.close();
                        alert("Conteúdo do log:\n" + logContent);
                        
                        if (logContent.indexOf("Already up to date") !== -1) {
                            alert(t("scriptAtualizado"));
                        } else if (logContent.indexOf("Updating") !== -1 || logContent.indexOf("HEAD is now at") !== -1) {
                            alert(t("atualizacaoSucesso"));
                        } else {
                            alert(t("erroAtualizacao"));
                        }
                    }
                }
            }
        }
    } catch (e) {
        alert("Erro geral: " + e);
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

// Criar array com os tipos de fixação
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

// Função apenasNumerosEVirgula (se não estiver definida em outro lugar)
function apenasNumerosEVirgula(campo) {
    campo.addEventListener('keydown', function(e) {
        var charCode = e.keyCode;
        if (charCode != 188 && charCode != 190 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            e.preventDefault();
        }
    });
}



// Segundo grupo (Componentes)
var grupoComponentes = conteudoLegenda.add("panel", undefined, t("painelComponentes"));
grupoComponentes.orientation = "column";
grupoComponentes.alignChildren = "left";

// Grupo para o campo de pesquisa
var grupoPesquisa = grupoComponentes.add("group");
grupoPesquisa.orientation = "row";
grupoPesquisa.alignChildren = "center";

// Label para o campo de pesquisa
var labelPesquisa = grupoPesquisa.add("statictext", undefined, t("procurar") + ":");
    
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
apenasNumerosEVirgula(campoQuantidadeBolas);

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

          // Limpar os campos ap����s adicionar
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
        grupoAlfabeto = grupoExtra.add("panel", undefined, "Alfabeto");
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
                var caractere = alfabeto[i];
                if (caractere === '<' && alfabeto[i+1] === '3') {
                    caractere = '<3';
                    i++; // Pula o próximo caractere, pois já foi processado
                }
                
                if (referenciasMapeadas.hasOwnProperty(caractere)) {
                    if (!referenciasUsadas[caractere]) {
                        referenciasUsadas[caractere] = 1;
                    } else {
                        referenciasUsadas[caractere]++;
                    }
                }
            }

            var referenciasTexto = [];
            for (var caractere in referenciasUsadas) {
                if (referenciasUsadas.hasOwnProperty(caractere)) {
                    referenciasTexto.push(referenciasMapeadas[caractere] + " (" + caractere + ") bioprint " + corBioprintSelecionada + " " + tamanhoSelecionado + ": " + referenciasUsadas[caractere]);
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
                    palavraDigitada: palavraDigitada
                });
                
                atualizarListaItens();
                campoPalavraChave.text = "";
                
                // Atualizar o campo nome/tipo apenas com a palavra digitada
                campoNomeTipo.text = palavraDigitada;
            } else {
                alert(t("nenhumaLetraValida"));
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

      // Lista de texturas no subgrupo
      listaTexturas = grupoLista.add("dropdownlist", undefined, [
         t("selecioneTextura"),
          "Texture 01",
          "Texture 02",
          "Texture 03",
          "Texture 04",
          "Texture 05",
          "Texture 06",
          "Texture 07",
          "Texture 08",
          "Texture 09",
          "Texture 10",
          "Texture 11",
          "Texture 12",
          "Texture 13",
          "Texture 14",
          "Texture 15",
          "Texture 16",
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
            if (listaTexturas.selection && listaTexturas.selection.index > 0) {
                var texturaNumero = listaTexturas.selection.index;
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
          
          if (this.selection.index > 0) {
              try {
                  var numeroTextura = this.selection.index;
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

// Adicione esta função no início do seu arquivo ou antes de ser usada
function removerDuplicatas(array) {
  var resultado = [];
  var jaVisto = {};
  for (var i = 0; i < array.length; i++) {
      var item = array[i];
      if (!jaVisto[item]) {
          resultado.push(item);
          jaVisto[item] = true;
      }
  }
  return resultado;
}


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

    // Adicionar os componentes agrupados
    for (var nomeComponente in componentesAgrupados) {
        if (componentesAgrupados.hasOwnProperty(nomeComponente)) {
            componentesTexto.push(nomeComponente + " " + componentesAgrupados[nomeComponente].join(", "));
        }
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
        // Remover esta linha que adiciona o espaço em branco
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

// Função para formatar unidades
function formatarUnidade(unidade) {
    if (unidade === "m2") {
        return "m²";
    }
    return unidade;
}

// Modificar a função criarLinhaReferencia
function criarLinhaReferencia(item) {
    var linha = item.referencia ? item.referencia : item.nome;
    if (item.unidade) {
        linha += " (" + formatarUnidade(item.unidade) + ")";
    }
    
    var quantidade = arredondarComponente(item.quantidade, item.unidade, item.nome);
    
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
        listaCores.add("item", "Selecione uma cor");
        listaUnidades.add("item", "Selecione uma unidade");
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
    function arredondarParaDecima(valor) {
        return Math.ceil(valor * 10) / 10;
    }

    // Botão para adicionar componente à legenda
    botaoAdicionarComponente.onClick = function() {
        if (listaComponentes.selection.index === 0 || listaCores.selection.index === 0 || listaUnidades.selection.index === 0) {
            alert(t("selecionarComponenteCompleto"));
            return;
        }
    
        var componenteSelecionado = dados.componentes[encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
        var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCores.selection.text)];
        var unidadeSelecionada = listaUnidades.selection.text;
        var quantidade = parseFloat(campoQuantidade.text.replace(',', '.'));
        var multiplicador = parseFloat(campoMultiplicador.text.replace(',', '.'));
    
        if (isNaN(quantidade) || quantidade <= 0) {
            alert(t("quantidadeInvalida"));
            return;
        }
    
        if (isNaN(multiplicador) || multiplicador <= 0) {
            multiplicador = 1;
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
            var nomeComponente = componenteSelecionado.nome + " " + corSelecionada.nome;
            
            // Aplicar arredondamento
            quantidade = arredondarComponente(quantidade, unidadeSelecionada, nomeComponente);
    
            var itemExistente = null;
            for (var i = 0; i < itensLegenda.length; i++) {
                if (itensLegenda[i].tipo === "componente" && 
                    itensLegenda[i].nome === nomeComponente &&
                    itensLegenda[i].unidade === unidadeSelecionada) {
                    itemExistente = itensLegenda[i];
                    break;
                }
            }
    
            if (itemExistente) {
                // Atualizar o item existente
                itemExistente.quantidade = quantidade;
                itemExistente.multiplicador = multiplicador;
                itemExistente.texto = criarTextoComponente(nomeComponente, combinacaoSelecionada.referencia, unidadeSelecionada, quantidade, multiplicador);
            } else {
                // Adicionar novo item
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
    
            atualizarListaItens();
    
            // Limpar os campos após adicionar
            campoQuantidade.text = "1";
            campoMultiplicador.text = "1";
    
            // Resetar as seleções
            listaComponentes.selection = 0;
            listaCores.removeAll();
            listaCores.add("item", "Selecione uma cor");
            listaCores.selection = 0;
            listaUnidades.removeAll();
            listaUnidades.add("item", "Selecione uma unidade");
            listaUnidades.selection = 0;
    
        } else {
            alert(t("erroCombinacaoComponente"));
        }
    };

    // Função para arredondar para o próximo 0,05 ou 0,1
    function arredondarComponente(valor, unidade, nome) {
        var nomeLowerCase = nome.toLowerCase();
        if (nomeLowerCase.indexOf("fil lumière") !== -1 || 
            nomeLowerCase.indexOf("fil lumiére") !== -1 || 
            nomeLowerCase.indexOf("fil comète") !== -1 || 
            nomeLowerCase.indexOf("fil cométe") !== -1) {
            // Arredondar para o próximo metro inteiro
            return Math.ceil(valor);
        } else if (unidade === "ml" || unidade === "m2") {
            // Arredondar para o próximo 0,05
            return Math.ceil(valor * 20) / 20;
        }
        // Para outras unidades, retornar o valor original
        return valor;
    }

// Modificar a função criarTextoComponente
function criarTextoComponente(nome, referencia, unidade, quantidade, multiplicador) {
    var texto = nome;
    if (referencia) {
        texto += " (Ref: " + referencia + ")";
    }
    texto += " (" + formatarUnidade(unidade) + ")";
    
    quantidade = arredondarComponente(quantidade, unidade, nome);
    
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
        if (confirm("Tens certeza que adicionaste todos os componentes que precisavas?")) {
            try {
                var legendaInfo = atualizarPreview();
                
                if (legendaInfo === undefined) {
                    alert(t("erroGerarLegenda"));
                    return;
                }
                
                // Substituir pontos por vírgulas
                var legendaConteudo = legendaInfo.texto.replace(/(\d+)\.(\d+)/g, formatarNumero);
    
                var scriptIllustrator = function(nomeDesigner, conteudoLegenda, texturas, palavraDigitada) {
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
                    
                    // Primeiro, importar e posicionar as texturas
                    var alturaTexturas = 0;
                    try {
                        // Verificar se há texturas para processar
                        if (texturas && texturas !== "") {
                            var caminhoBase = "C:/Program Files/Adobe/Adobe Illustrator 2025/Presets/en_GB/Scripts/Legenda/svg/";
                            var texturasArray = texturas.split(',');
                            var larguraTextura = 300;
                            var alturaTextura = 400; // Definir altura específica aqui
                            var espacamentoVertical = 50;
                            
                            for (var i = 0; i < texturasArray.length; i++) {
                                var numeroTextura = texturasArray[i];
                                var caminhoAI = caminhoBase + "texture" + numeroTextura + ".ai";
                                var arquivoAI = new File(caminhoAI);
                                
                                if (arquivoAI.exists) {
                                    // Criar o item posicionado
                                    var placedItem = novaLayer.placedItems.add();
                                    placedItem.file = arquivoAI;
                                    
                                    // Posicionar e dimensionar
                                    placedItem.position = [
                                        artboardBounds[0] + (i * (larguraTextura + 20)),
                                        artboardBounds[1] - 40
                                    ];
                                    placedItem.width = larguraTextura;
                                    placedItem.height = alturaTextura; // Usar a nova altura aqui
                                    
                                    // Incorporar a textura no documento
                                    placedItem.embed();
                                    
                                    alturaTexturas = alturaTextura + espacamentoVertical;
                                } else {
                                    alert("Arquivo não encontrado: texture" + numeroTextura + ".ai");
                                }
                            }
                        }
                    } catch (aiError) {
                        alert(t("erroProcessarTexturas") + aiError + "\n" + t("linha") + aiError.line);
                    }
    
                    // Dentro da função scriptIllustrator, após o processamento das texturas:
                    try {
                        
                        if (palavraDigitada && palavraDigitada !== "") {
                            var caminhoAlfabeto = "C:/Program Files/Adobe/Adobe Illustrator 2025/Presets/en_GB/Scripts/Legenda/alfabeto/";
                            
                            var posicaoX = 0;
                            var posicaoY = 300; // Mantendo a mesma altura
                            var espacamentoHorizontal = 220; // Aumentado significativamente o espaçamento entre letras
                            var alturaMaximaLetras = 0;

                            for (var i = 0; i < palavraDigitada.length; i++) {
                                var caractere = palavraDigitada[i].toUpperCase();
                                
                                if (caractere === '<' && palavraDigitada[i+1] === '3') {
                                    caractere = '<3';
                                    i++;
                                }

                                var nomeArquivoAI = "";
                                if (caractere >= 'A' && caractere <= 'Z') {
                                    var numeroLetra = 214 + (caractere.charCodeAt(0) - 'A'.charCodeAt(0));
                                    nomeArquivoAI = "GX" + numeroLetra + "LW.ai";
                                } else if (caractere === '<3') {
                                    nomeArquivoAI = "GX240LW.ai";
                                } else if (caractere === '#') {
                                    nomeArquivoAI = "GX241LW.ai";
                                }

                                if (nomeArquivoAI !== "") {
                                    var caminhoAI = caminhoAlfabeto + nomeArquivoAI;
                                    var arquivoAI = new File(caminhoAI);

                                    if (arquivoAI.exists) {
                                        var placedItem = novaLayer.placedItems.add();
                                        placedItem.file = arquivoAI;
                                        placedItem.position = [posicaoX, posicaoY];
                                        placedItem.embed();
                                        
                                        // Mover para a próxima posição
                                        posicaoX += espacamentoHorizontal;
                                    }
                                }
                            }
                        }
                    } catch (alfabetoError) {
                        alert(t("erroProcessarAlfabeto") + alfabetoError);
                    }
                    
                    // Posicionar o texto da legenda abaixo das letras
                    var textoLegenda = novaLayer.textFrames.add();
                    textoLegenda.position = [0, 0];
                    
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
                               escapeString(palavraDigitada) + "');";
                
                var bt = new BridgeTalk();
                bt.target = "illustrator";
                bt.body = scriptString;
                bt.onResult = function(resObj) {
                    if (resObj.body === "success") {
                        alert("Legenda adicionada com sucesso!");
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
})();
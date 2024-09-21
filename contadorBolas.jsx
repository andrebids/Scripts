// contadorBolas.jsx
#target illustrator
#targetengine maintarget illustrator


function criarInterfaceContadorBolas(aba) {
    var grupo = aba.add("group");
    grupo.orientation = "column";
    grupo.alignChildren = ["left", "top"];
    grupo.spacing = 10;

    var botaoContar = grupo.add("button", undefined, "Contar Círculos Selecionados");
    var textoResultado = grupo.add("edittext", undefined, "Resultado: ", {multiline: true, scrollable: true});
    textoResultado.preferredSize.width = 300;
    textoResultado.preferredSize.height = 150;

    botaoContar.onClick = function() {
        alert("Botão clicado");
        try {
            alert("Iniciando contagem...");
            var bt = new BridgeTalk();
            bt.target = "illustrator";
            bt.body = "(" + contarBolasNaArtboard.toString() + ")()";
            bt.onResult = function(resObj) {
                alert("Resultado recebido: " + resObj.body);
                var resultado = resObj.body.split("|");
                var contagem, cores, tamanhos;

                for (var i = 0; i < resultado.length; i++) {
                    var parte = resultado[i].split(":");
                    if (parte[0] === "contagem") {
                        contagem = parseInt(parte[1]);
                    } else if (parte[0] === "cores") {
                        cores = parte[1].split(",");
                    } else if (parte[0] === "tamanhos") {
                        tamanhos = parte[1].split(",");
                    }
                }

                if (contagem !== undefined) {
                    var textoCompleto = "Resultado: " + contagem + " círculos encontrados\n\n";
                    
                    textoCompleto += "Cores:\n";
                    if (cores && cores.length > 0) {
                        for (var i = 0; i < cores.length; i++) {
                            var corInfo = cores[i].split("=");
                            if (corInfo.length === 2) {
                                textoCompleto += decodeURIComponent(corInfo[0]) + " - Quantidade: " + corInfo[1] + "\n";
                            } else {
                                textoCompleto += "Formato de cor inválido: " + cores[i] + "\n";
                            }
                        }
                    } else {
                        textoCompleto += "Nenhuma informação de cor disponível\n";
                    }
                    
                    textoCompleto += "\nTamanhos:\n";
                    for (var i = 0; i < tamanhos.length; i++) {
                        var tamanhoInfo = tamanhos[i].split("=");
                        textoCompleto += tamanhoInfo[0] + "px: " + tamanhoInfo[1] + "\n";
                    }
                    
                    textoResultado.text = textoCompleto;
                } else {
                    textoResultado.text = "Erro: " + resObj.body;
                }
                textoResultado.notify("onChange");
                alert("Resultado atualizado na interface");
            };
            bt.onError = function(err) {
                alert("Erro no BridgeTalk: " + err.body);
                textoResultado.text = "Erro no BridgeTalk: " + err.body;
                textoResultado.notify("onChange");
            };
            alert("Enviando BridgeTalk...");
            bt.send();
        } catch (e) {
            alert("Erro ao iniciar contagem: " + e.message + "\nTipo de erro: " + e.name);
            textoResultado.text = "Erro ao iniciar contagem: " + e.message + "\nTipo de erro: " + e.name;
            textoResultado.notify("onChange");
        }
    };

    return {
        botaoContar: botaoContar,
        textoResultado: textoResultado
    };
}

function contarBolasNaArtboard() {
    try {
        if (app.documents.length === 0) {
            return "Nenhum documento aberto. Por favor, abra um documento no Illustrator.";
        }
        var doc = app.activeDocument;
        if (!doc) {
            return "Não foi possível acessar o documento ativo.";
        }
        
        var selecao = doc.selection;
        if (selecao.length === 0) {
            return "Nenhum objeto selecionado. Por favor, selecione os círculos que deseja contar.";
        }

        var contagem = 0;
        var cores = {};
        var tamanhos = {};

        for (var i = 0; i < selecao.length; i++) {
            var item = selecao[i];
            if (item.typename === "PathItem" && item.closed && item.filled) {
                contagem++;
                
                // Coletar informações sobre cor
                var cor = item.fillColor;
                var corKey = "";
                if (cor.typename === "RGBColor") {
                    corKey = "HEX:" + rgbToHex(cor.red, cor.green, cor.blue);
                } else if (cor.typename === "CMYKColor") {
                    var rgb = cmykToRgb(cor.cyan, cor.magenta, cor.yellow, cor.black);
                    corKey = "HEX:" + rgbToHex(rgb.r, rgb.g, rgb.b);
                } else if (cor.typename === "SpotColor") {
                    var spotColor = cor.spot.color;
                    if (spotColor.typename === "RGBColor") {
                        corKey = "Spot HEX:" + rgbToHex(spotColor.red, spotColor.green, spotColor.blue);
                    } else if (spotColor.typename === "CMYKColor") {
                        var rgb = cmykToRgb(spotColor.cyan, spotColor.magenta, spotColor.yellow, spotColor.black);
                        corKey = "Spot HEX:" + rgbToHex(rgb.r, rgb.g, rgb.b);
                    } else {
                        corKey = "Spot:" + cor.spot.name;
                    }
                } else {
                    corKey = cor.typename;
                }
                cores[corKey] = (cores[corKey] || 0) + 1;
                
                // Coletar informações sobre tamanho
                var tamanho = Math.round(item.width); // Assumindo que os círculos são perfeitos
                tamanhos[tamanho] = (tamanhos[tamanho] || 0) + 1;
            }
        }
        // Funções auxiliares para conversão de cores
        function rgbToHex(r, g, b) {
            r = Math.round(r);
            g = Math.round(g);
            b = Math.round(b);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        }

        function cmykToRgb(c, m, y, k) {
            c = c / 100;
            m = m / 100;
            y = y / 100;
            k = k / 100;

            var r = 1 - Math.min(1, c * (1 - k) + k);
            var g = 1 - Math.min(1, m * (1 - k) + k);
            var b = 1 - Math.min(1, y * (1 - k) + k);

            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        }
        // Preparar o resultado como uma string formatada
        var resultado = "contagem:" + contagem + "|";
        resultado += "cores:";
        var coresArray = [];
        for (var cor in cores) {
            coresArray.push(encodeURIComponent(cor) + "=" + cores[cor]);
        }
        resultado += coresArray.join(",") + "|";
        
        resultado += "tamanhos:";
        for (var tamanho in tamanhos) {
            resultado += tamanho + "=" + tamanhos[tamanho] + ",";
        }
        resultado = resultado.slice(0, -1); // Remover a última vírgula

        alert("Resultado antes de retornar: " + resultado); // Log para depuração
        return resultado;
    } catch (e) {
        return "Erro ao contar bolas: " + e.message;
    }
}

// Funções auxiliares para conversão de cores
function rgbToHex(r, g, b) {
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function cmykToRgb(c, m, y, k) {
    c = c / 100;
    m = m / 100;
    y = y / 100;
    k = k / 100;

    var r = 1 - Math.min(1, c * (1 - k) + k);
    var g = 1 - Math.min(1, m * (1 - k) + k);
    var b = 1 - Math.min(1, y * (1 - k) + k);

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
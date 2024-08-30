// Script para calcular a área de objetos selecionados no Illustrator com base na escala de 38mm = 1m

function calcularAreaSelecionada() {
    if (app.documents.length === 0) {
        alert("Nenhum documento aberto.");
        return;
    }

    var doc = app.activeDocument;
    var selecao = doc.selection;

    if (selecao.length === 0) {
        alert("Nenhum objeto selecionado.");
        return;
    }

    // Obter a unidade de medida do documento
    var unidade = doc.rulerUnits;
    var fatorConversao = obterFatorConversao(unidade);

    if (fatorConversao === null) {
        alert("Unidade de medida não suportada. Por favor, use milímetros, centímetros, polegadas, pontos ou pixels.");
        return;
    }

    var areaTotal = 0;

    for (var i = 0; i < selecao.length; i++) {
        var item = selecao[i];

        // Verificar se o item é um PathItem válido
        if (item.typename === "PathItem") {
            var areaItem = calcularAreaItem(item, fatorConversao);
            if (areaItem === null) {
                alert("Não foi possível calcular a área do objeto selecionado.");
                return;
            }
            areaTotal += areaItem;
        } else {
            alert("Seleção contém objetos que não são caminhos (PathItems).");
            return;
        }
    }

    alert("Área total selecionada: " + areaTotal.toFixed(4) + " m²");
}

function obterFatorConversao(unidade) {
    // Base: 38mm = 1m => 1mm = 1/38 m
    var mmParaMetro = 1 / 38; // ≈0.026315789

    switch (unidade) {
        case RulerUnits.Millimeters:
            return mmParaMetro;
        case RulerUnits.Centimeters:
            return mmParaMetro * 10; // 1cm = 10mm
        case RulerUnits.Inches:
            return mmParaMetro * 25.4; // 1inch = 25.4mm
        case RulerUnits.Points:
            return mmParaMetro * 0.352778; // 1pt = 0.352778mm
        case RulerUnits.Pixels:
            return mmParaMetro * 0.352778; // Assumindo 72 DPI, 1px = 0.352778mm
        default:
            return null;
    }
}

function calcularAreaItem(item, fatorConversao) {
    if (item.closed && item.pathPoints.length >= 3) {
        // Calcular área para formas fechadas com 3 ou mais pontos (polígonos)
        var area = calcularAreaPoligono(item.pathPoints);
        if (area === null) return null;

        // Converter área para metros quadrados
        var areaEmMetrosQuadrados = Math.abs(area) * Math.pow(fatorConversao, 2);
        return areaEmMetrosQuadrados;
    } else if (item.closed && item.pathPoints.length == 4 && item.pathPoints[0].anchor[1] == item.pathPoints[1].anchor[1]) {
        // Possivelmente um retângulo, podemos usar largura e altura
        var largura = item.width * fatorConversao;
        var altura = item.height * fatorConversao;
        return largura * altura;
    } else {
        // Formatos não suportados
        return null;
    }
}

function calcularAreaPoligono(pontos) {
    var numPontos = pontos.length;
    var area = 0;

    for (var i = 0; i < numPontos; i++) {
        var pontoAtual = pontos[i].anchor;
        var proximoPonto = pontos[(i + 1) % numPontos].anchor;

        area += (pontoAtual[0] * proximoPonto[1]) - (proximoPonto[0] * pontoAtual[1]);
    }

    area = area / 2;

    return area;
}

// Executar o script
calcularAreaSelecionada();

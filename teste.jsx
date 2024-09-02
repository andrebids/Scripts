#target Illustrator
#targetengine main

alert("Versão do script: 1.7");

// Cria uma janela de diálogo não modal (palette)
var janela = new Window("palette", "Meu Script Simples");
janela.orientation = "column";

// Adiciona um botão à janela
var botao = janela.add("button", undefined, "Criar Círculo");

// Função para criar um círculo
function criarCirculo() {
    try {
        var doc = app.activeDocument;
        var circulo = doc.pathItems.ellipse(100, 100, 50, 50);
        circulo.fillColor = new RGBColor();
        circulo.fillColor.red = 255;
        circulo.fillColor.green = 0;
        circulo.fillColor.blue = 0;
        alert("Círculo vermelho criado!");
    } catch (e) {
        alert("Erro ao criar círculo: " + e);
    }
}

// Adiciona um evento de clique ao botão
botao.onClick = criarCirculo;

// Adiciona um botão de fechar
var fecharBotao = janela.add("button", undefined, "Fechar");
fecharBotao.onClick = function() {
    janela.close();
}

// Exibe a janela
janela.show();
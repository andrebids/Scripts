// Aqui você irá colocar o código que precisa ser executado no contexto do Illustrator
// Por exemplo, a função para adicionar a legenda ao documento

function adicionarLegenda(dados) {
    try {
        var doc = app.activeDocument;
        if (!doc) {
            return "Nenhum documento ativo. Por favor, abra um documento no Illustrator.";
        }

        // Resto do código para criar a legenda
        // ...

        return "Legenda adicionada com sucesso!";
    } catch (e) {
        return "Erro ao adicionar legenda: " + e + "\nLinha: " + e.line;
    }
}
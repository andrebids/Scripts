// Script para editar a base de dados de componentes, cores e combinações no Illustrator

#target illustrator

// Adicione estas funções no início do seu script, logo após as funções existentes

// Função para analisar JSON
function parseJSON(str) {
    try {
        return eval('(' + str + ')');
    } catch (e) {
        // Se falhar, tente corrigir problemas comuns
        str = str.replace(/[\u0000-\u001F]+/g, "")
                 .replace(/,\s*}/g, "}")
                 .replace(/,\s*]/g, "]");
        return eval('(' + str + ')');
    }
}

// Função para stringificar JSON (você já tem uma, mas vamos renomeá-la para evitar confusão)
function stringifyJSON(obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        if (t == "string") obj = '"' + obj + '"';
        return String(obj);
    } else {
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n];
            t = typeof(v);
            if (t == "string") v = '"' + v + '"';
            else if (t == "object" && v !== null) v = stringifyJSON(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
}

// Modifique a função carregarJSON para usar parseJSON em vez de JSON.parse
function carregarJSON(arquivo) {
    var file = new File(arquivo);
    if (!file.exists) {
        throw new Error("O arquivo não existe: " + arquivo);
    }
    file.encoding = "UTF-8";
    file.open("r");
    var conteudo = file.read();
    file.close();
    
    if (conteudo === "") {
        throw new Error("O arquivo está vazio: " + arquivo);
    }
    try {
        var dados = parseJSON(conteudo);
        // Verificar se todas as seções necessárias existem
        var secoes = ["componentes", "cores", "combinacoes", "acabamentos", "tamanhos", "bolas"];
        for (var i = 0; i < secoes.length; i++) {
            if (!dados.hasOwnProperty(secoes[i]) || !isArray(dados[secoes[i]])) {
                throw new Error("Seção '" + secoes[i] + "' ausente ou inválida");
            }
        }
        return dados;
    } catch (e) {
        throw new Error("Erro ao analisar o JSON: " + e.message);
    }
}

// Função para salvar o arquivo JSON
function salvarJSON(arquivo, dados) {
    try {
        var arquivo = new File(arquivo);
        arquivo.encoding = "UTF-8";
        arquivo.open('w');
        var conteudo = stringifyJSON(dados);
        arquivo.write(conteudo);
        arquivo.close();
        $.writeln("Arquivo salvo com sucesso: " + arquivo.fsName);
    } catch (e) {
        alert("Erro ao salvar o arquivo: " + e.toString());
        $.writeln("Erro ao salvar o arquivo: " + e.toString());
    }
}

// Obter o caminho do script atual
var scriptFile = new File($.fileName);
var scriptPath = scriptFile.path;

// Caminho para o arquivo de banco de dados na mesma pasta do script
var caminhoDatabase = "\\\\192.168.2.22\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\ILLUSTRATOR\\basededados\\database2.json";

// Função para verificar se um valor é um array
function isArray(value) {
    return value && typeof value === 'object' && value.constructor === Array;
}

// Adicione esta função no início do seu script
function filterArray(array, callback) {
    var filteredArray = [];
    for (var i = 0; i < array.length; i++) {
        if (callback(array[i], i, array)) {
            filteredArray.push(array[i]);
        }
    }
    return filteredArray;
}

// Função principal do script
function executarScript() {
    // Carregar o banco de dados existente
    var database;
    try {
        database = carregarJSON(caminhoDatabase);
        alert("Base de dados carregada com sucesso.");
        
        // Verificar e corrigir a estrutura da base de dados
        if (typeof database !== 'object' || database === null) {
            throw new Error("Estrutura de dados inválida");
        }
        
        if (!isArray(database.componentes)) database.componentes = [];
        if (!isArray(database.cores)) database.cores = [];
        if (!isArray(database.combinacoes)) database.combinacoes = [];
        if (!isArray(database.acabamentos)) database.acabamentos = [];
        if (!isArray(database.tamanhos)) database.tamanhos = [];
        if (!isArray(database.bolas)) database.bolas = [];
        
        salvarJSON(caminhoDatabase, database);
    } catch(e) {
        alert("Erro ao carregar a base de dados: " + e.message);
        return;
    }

    // Garantir que a estrutura do banco de dados está correta
    if (!database.componentes) database.componentes = [];
    if (!database.cores) database.cores = [];
    if (!database.combinacoes) database.combinacoes = [];
    if (!database.acabamentos) database.acabamentos = [];
    if (!database.tamanhos) database.tamanhos = [];
    if (!database.bolas) database.bolas = [];

    // Adicionar referencia aos componentes existentes se não existir
    for (var i = 0; i < database.componentes.length; i++) {
        if (!database.componentes[i].hasOwnProperty('referencia')) {
            database.componentes[i].referencia = "";
        }
    }

    // Função para criar interface de gerenciamento para Componentes
    function criarInterfaceGerenciamentoComponentes(aba) {
        aba.orientation = "column";
        aba.alignChildren = ["fill", "top"];
        aba.spacing = 10;

        // Campo de pesquisa
        var grupoPesquisa = aba.add("group");
        grupoPesquisa.orientation = "row";
        grupoPesquisa.alignChildren = ["left", "center"];
        grupoPesquisa.add("statictext", undefined, "Pesquisar:");
        var campoPesquisa = grupoPesquisa.add("edittext", undefined, "");
        campoPesquisa.preferredSize.width = 200;

        // Lista de itens com barra de rolagem
        var grupoLista = aba.add("group");
        grupoLista.orientation = "row";
        grupoLista.alignChildren = ["fill", "fill"];
        var lista = grupoLista.add("listbox", undefined, [], {multiselect: false});
        lista.preferredSize.width = 500;
        lista.preferredSize.height = 300;

        // Grupo para adicionar novo item
        var grupoAdicionar = aba.add("group");
        grupoAdicionar.orientation = "row";
        grupoAdicionar.alignChildren = ["left", "center"];
        grupoAdicionar.add("statictext", undefined, "Nome:");
        var campoNovo = grupoAdicionar.add("edittext", undefined, "");
        campoNovo.preferredSize.width = 150;
        grupoAdicionar.add("statictext", undefined, "Referência:");
        var campoReferencia = grupoAdicionar.add("edittext", undefined, "");
        campoReferencia.preferredSize.width = 150;
        var botaoAdicionar = grupoAdicionar.add("button", undefined, "Adicionar");

        // Grupo para editar referência
        var grupoEditar = aba.add("group");
        grupoEditar.orientation = "row";
        grupoEditar.alignChildren = ["left", "center"];
        grupoEditar.add("statictext", undefined, "Editar Nome:");
        var campoEditarNome = grupoEditar.add("edittext", undefined, "");
        campoEditarNome.preferredSize.width = 200;
        grupoEditar.add("statictext", undefined, "Editar Referência:");
        var campoEditarReferencia = grupoEditar.add("edittext", undefined, "");
        campoEditarReferencia.preferredSize.width = 300;
        var botaoSalvarNome = grupoEditar.add("button", undefined, "Salvar Nome");
        var botaoSalvarReferencia = grupoEditar.add("button", undefined, "Salvar Referência");

        // Botão para remover item selecionado
        var botaoRemover = aba.add("button", undefined, "Remover Selecionado");

        // Função para atualizar a lista
        function atualizarLista(filtro) {
            lista.removeAll();
            var itens = database.componentes.sort(function(a, b) {
                return a.nome.localeCompare(b.nome);
            });
            for (var i = 0; i < itens.length; i++) {
                if (!filtro || itens[i].nome.toLowerCase().indexOf(filtro.toLowerCase()) !== -1) {
                    var displayText = itens[i].nome;
                    if (itens[i].referencia) {
                        displayText += " (" + itens[i].referencia + ")";
                    }
                    var item = lista.add("item", displayText);
                    item.componenteId = itens[i].id; // Associar o id ao item
                }
            }
            lista.active = true; // Força a atualização visual da lista
        }

        // Evento de pesquisa
        campoPesquisa.onChanging = function() {
            atualizarLista(this.text);
        };

        // Função para adicionar novo item
        function adicionarNovoItem() {
            var novoNome = campoNovo.text;
            var novaReferencia = campoReferencia.text;
            if (novoNome) {
                var existe = false;
                for (var i = 0; i < database.componentes.length; i++) {
                    if (database.componentes[i].nome.toLowerCase() === novoNome.toLowerCase()) {
                        existe = true;
                        break;
                    }
                }
                if (!existe) {
                    var novoId = getNextId(database.componentes);
                    database.componentes.push({"id": novoId, "nome": novoNome, "referencia": novaReferencia});
                    salvarJSON(caminhoDatabase, database);
                    atualizarLista();
                    campoNovo.text = "";
                    campoReferencia.text = "";
                    campoNovo.active = true;
                    alert("Componente '" + novoNome + "' adicionado com sucesso!");
                } else {
                    alert("Este componente já existe.");
                }
            } else {
                alert("Por favor, insira um nome para o componente.");
            }
        }

        // Evento de clique no botão Adicionar
        botaoAdicionar.onClick = adicionarNovoItem;

        // Evento de pressionar Enter no campo de texto
        campoNovo.addEventListener('keydown', function(e) {
            if (e.keyName === 'Enter') {
                adicionarNovoItem();
                e.preventDefault();
            }
        });

        // Função para remover item selecionado
        botaoRemover.onClick = function() {
            var selectedIndex = lista.selection.index;
            if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < database.componentes.length) {
                var itemRemovido = database.componentes[selectedIndex];
                removerItemEDependencias("componentes", itemRemovido.id);
                atualizarLista();
                if (callback) callback();
                alert("Componente '" + itemRemovido.nome + "' removido com sucesso!");
            } else {
                alert("Por favor, selecione um componente válido para remover.");
            }
        }

        // Função para atualizar a referência
        function atualizarReferencia() {
            var selectedItem = lista.selection;
            if (selectedItem) {
                var componenteSelecionado = findById(database.componentes, selectedItem.componenteId);
                if (componenteSelecionado) {
                    componenteSelecionado.referencia = campoEditarReferencia.text;
                    salvarJSON(caminhoDatabase, database);
                    atualizarLista();
                    alert("Referência atualizada com sucesso!");
                }
            } else {
                alert("Por favor, selecione um componente para editar.");
            }
        }

        botaoSalvarReferencia.onClick = atualizarReferencia;

        // Função para atualizar o nome
        function atualizarNome() {
            var selectedItem = lista.selection;
            if (selectedItem) {
                var novoNome = campoEditarNome.text;
                if (!novoNome) {
                    alert("Por favor, insira um nome para o componente.");
                    return;
                }
                // Verificar duplicidade (exceto o próprio)
                for (var i = 0; i < database.componentes.length; i++) {
                    if (database.componentes[i].id !== selectedItem.componenteId && database.componentes[i].nome.toLowerCase() === novoNome.toLowerCase()) {
                        alert("Já existe um componente com este nome.");
                        return;
                    }
                }
                var componenteSelecionado = findById(database.componentes, selectedItem.componenteId);
                if (componenteSelecionado) {
                    componenteSelecionado.nome = novoNome;
                    salvarJSON(caminhoDatabase, database);
                    atualizarLista();
                    alert("Nome atualizado com sucesso!");
                }
            } else {
                alert("Por favor, selecione um componente para editar.");
            }
        }
        botaoSalvarNome.onClick = atualizarNome;

        // Atualizar o campo de edição quando um item é selecionado
        lista.onChange = function() {
            var selectedItem = lista.selection;
            if (selectedItem) {
                var componenteSelecionado = findById(database.componentes, selectedItem.componenteId);
                if (componenteSelecionado) {
                    campoEditarNome.text = componenteSelecionado.nome || "";
                    campoEditarReferencia.text = componenteSelecionado.referencia || "";
                }
            }
        };

        // Atualizar a lista inicial
        atualizarLista();

        return {lista: lista, atualizar: atualizarLista};
    }

    // Função para criar interface de gerenciamento para Componentes, Cores, Acabamentos e Tamanhos
    function criarInterfaceGerenciamento(aba, tipo, callback) {
        aba.orientation = "column";
        aba.alignChildren = ["fill", "top"];
        aba.spacing = 10;

        // Campo de pesquisa
        var grupoPesquisa = aba.add("group");
        grupoPesquisa.orientation = "row";
        grupoPesquisa.alignChildren = ["left", "center"];
        grupoPesquisa.add("statictext", undefined, "Pesquisar:");
        var campoPesquisa = grupoPesquisa.add("edittext", undefined, "");
        campoPesquisa.preferredSize.width = 200;

        // Lista de itens com barra de rolagem
        var grupoLista = aba.add("group");
        grupoLista.orientation = "row";
        grupoLista.alignChildren = ["fill", "fill"];
        var lista = grupoLista.add("listbox", undefined, [], {multiselect: false});
        lista.preferredSize.width = 500;
        lista.preferredSize.height = 300;

        // Grupo para adicionar novo item
        var grupoAdicionar = aba.add("group");
        grupoAdicionar.orientation = "row";
        grupoAdicionar.alignChildren = ["left", "center"];
        var campoNovo = grupoAdicionar.add("edittext", undefined, "");
        campoNovo.preferredSize.width = 200;
        var botaoAdicionar = grupoAdicionar.add("button", undefined, "Adicionar");
        if (tipo === "cores") {
            // Adicionar campos para valores CMYK
            var grupoCMYK = aba.add("group");
            grupoCMYK.orientation = "row";
            grupoCMYK.alignChildren = ["left", "center"];
            grupoCMYK.add("statictext", undefined, "C:");
            var campoCyan = grupoCMYK.add("edittext", undefined, "");
            campoCyan.preferredSize.width = 40;
            grupoCMYK.add("statictext", undefined, "M:");
            var campoMagenta = grupoCMYK.add("edittext", undefined, "");
            campoMagenta.preferredSize.width = 40;
            grupoCMYK.add("statictext", undefined, "Y:");
            var campoYellow = grupoCMYK.add("edittext", undefined, "");
            campoYellow.preferredSize.width = 40;
            grupoCMYK.add("statictext", undefined, "K:");
            var campoBlack = grupoCMYK.add("edittext", undefined, "");
            campoBlack.preferredSize.width = 40;

            // Grupo para editar nome e CMYK
            var grupoEditarCor = aba.add("group");
            grupoEditarCor.orientation = "row";
            grupoEditarCor.alignChildren = ["left", "center"];
            grupoEditarCor.add("statictext", undefined, "Editar Nome:");
            var campoEditarNomeCor = grupoEditarCor.add("edittext", undefined, "");
            campoEditarNomeCor.preferredSize.width = 120;
            grupoEditarCor.add("statictext", undefined, "C:");
            var campoEditarCyan = grupoEditarCor.add("edittext", undefined, "");
            campoEditarCyan.preferredSize.width = 40;
            grupoEditarCor.add("statictext", undefined, "M:");
            var campoEditarMagenta = grupoEditarCor.add("edittext", undefined, "");
            campoEditarMagenta.preferredSize.width = 40;
            grupoEditarCor.add("statictext", undefined, "Y:");
            var campoEditarYellow = grupoEditarCor.add("edittext", undefined, "");
            campoEditarYellow.preferredSize.width = 40;
            grupoEditarCor.add("statictext", undefined, "K:");
            var campoEditarBlack = grupoEditarCor.add("edittext", undefined, "");
            campoEditarBlack.preferredSize.width = 40;
            var botaoSalvarEdicaoCor = grupoEditarCor.add("button", undefined, "Salvar Edição");

            // Modificar a função de atualizar lista para incluir os valores CMYK
        function atualizarLista(filtro) {
            lista.removeAll();
            var itens = database[tipo].sort(function(a, b) {
                return a.nome.localeCompare(b.nome);
            });
            for (var i = 0; i < itens.length; i++) {
                if (!filtro || itens[i].nome.toLowerCase().indexOf(filtro.toLowerCase()) !== -1) {
                    var displayText = itens[i].nome;
                    if (itens[i].cmyk) {
                        displayText += " (CMYK: " + itens[i].cmyk.join(",") + ")";
                    }
                    var item = lista.add("item", displayText);
                    item.correspondingId = itens[i].id;
                }
            }
        }
    
            // Modificar a função de adicionar novo item para incluir os valores CMYK
        function adicionarNovoItem() {
            var novoNome = campoNovo.text;
            var novoCMYK = [
                parseInt(campoCyan.text) || 0,
                parseInt(campoMagenta.text) || 0,
                parseInt(campoYellow.text) || 0,
                parseInt(campoBlack.text) || 0
            ];
            if (novoNome) {
                var existe = false;
                for (var i = 0; i < database[tipo].length; i++) {
                    if (database[tipo][i].nome.toLowerCase() === novoNome.toLowerCase()) {
                        existe = true;
                        break;
                    }
                }
                if (!existe) {
                    var novoId = getNextId(database[tipo]);
                    database[tipo].push({"id": novoId, "nome": novoNome, "cmyk": novoCMYK});
                    salvarJSON(caminhoDatabase, database);
                    atualizarLista();
                    campoNovo.text = "";
                    campoCyan.text = "";
                    campoMagenta.text = "";
                    campoYellow.text = "";
                    campoBlack.text = "";
                    campoNovo.active = true;
                    alert("Cor '" + novoNome + "' adicionada com sucesso!");
                    if (callback) callback();
                } else {
                    alert("Esta cor já existe.");
                }
            } else {
                alert("Por favor, insira um nome para a cor.");
            }
        }

        // Adicionar função para editar os valores CMYK
        function editarCMYK() {
            var selectedIndex = lista.selection.index;
            if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < database[tipo].length) {
                var corSelecionada = database[tipo][selectedIndex];
                corSelecionada.cmyk = [
                    parseInt(campoCyan.text) || 0,
                    parseInt(campoMagenta.text) || 0,
                    parseInt(campoYellow.text) || 0,
                    parseInt(campoBlack.text) || 0
                ];
                salvarJSON(caminhoDatabase, database);
                atualizarLista();
                alert("Valores CMYK atualizados com sucesso!");
            } else {
                alert("Por favor, selecione uma cor para editar os valores CMYK.");
            }
        }

        var botaoEditarCMYK = aba.add("button", undefined, "Editar CMYK");
        botaoEditarCMYK.onClick = editarCMYK;

        // Atualizar os campos CMYK quando uma cor é selecionada
        lista.onChange = function() {
            var selectedItem = lista.selection;
            if (selectedItem && selectedItem.correspondingId !== undefined) {
                var corSelecionada = findById(database[tipo], selectedItem.correspondingId);
                if (corSelecionada.cmyk) {
                    campoCyan.text = corSelecionada.cmyk[0] || "";
                    campoMagenta.text = corSelecionada.cmyk[1] || "";
                    campoYellow.text = corSelecionada.cmyk[2] || "";
                    campoBlack.text = corSelecionada.cmyk[3] || "";
                } else {
                    campoCyan.text = "";
                    campoMagenta.text = "";
                    campoYellow.text = "";
                    campoBlack.text = "";
                }
                // Preencher campos de edição
                campoEditarNomeCor.text = corSelecionada.nome || "";
                if (corSelecionada.cmyk) {
                    campoEditarCyan.text = corSelecionada.cmyk[0] || "";
                    campoEditarMagenta.text = corSelecionada.cmyk[1] || "";
                    campoEditarYellow.text = corSelecionada.cmyk[2] || "";
                    campoEditarBlack.text = corSelecionada.cmyk[3] || "";
                } else {
                    campoEditarCyan.text = "";
                    campoEditarMagenta.text = "";
                    campoEditarYellow.text = "";
                    campoEditarBlack.text = "";
                }
            }
        };

            // Função para salvar edição da cor
            botaoSalvarEdicaoCor.onClick = function() {
                var selectedItem = lista.selection;
                if (selectedItem && selectedItem.correspondingId !== undefined) {
                    var corSelecionada = findById(database[tipo], selectedItem.correspondingId);
                    var novoNome = campoEditarNomeCor.text;
                    var novoCMYK = [
                        parseInt(campoEditarCyan.text) || 0,
                        parseInt(campoEditarMagenta.text) || 0,
                        parseInt(campoEditarYellow.text) || 0,
                        parseInt(campoEditarBlack.text) || 0
                    ];
                    if (!novoNome) {
                        alert("Por favor, insira um nome para a cor.");
                        return;
                    }
                    // Verificar duplicidade de nome (exceto para a cor atual)
                    var existe = false;
                    for (var i = 0; i < database[tipo].length; i++) {
                        if (database[tipo][i].id !== corSelecionada.id && database[tipo][i].nome.toLowerCase() === novoNome.toLowerCase()) {
                            existe = true;
                            break;
                        }
                    }
                    if (existe) {
                        alert("Já existe uma cor com este nome.");
                        return;
                    }
                    corSelecionada.nome = novoNome;
                    corSelecionada.cmyk = novoCMYK;
                    salvarJSON(caminhoDatabase, database);
                    atualizarLista();
                    alert("Cor editada com sucesso!");
                } else {
                    alert("Por favor, selecione uma cor para editar.");
                }
            };
    }
        // Botão para remover item selecionado
        var botaoRemover = aba.add("button", undefined, "Remover Selecionado");

        // Função para atualizar a lista
        function atualizarLista(filtro) {
            lista.removeAll();
            var itens = database[tipo].sort(function(a, b) {
                return a.nome.localeCompare(b.nome);
            });
            for (var i = 0; i < itens.length; i++) {
                if (!filtro || itens[i].nome.toLowerCase().indexOf(filtro.toLowerCase()) !== -1) {
                    lista.add("item", itens[i].nome);
                }
            }
        }

        // Evento de pesquisa
        campoPesquisa.onChanging = function() {
            atualizarLista(this.text);
        };

        // Função para adicionar novo item
        function adicionarNovoItem() {
            var novoNome = campoNovo.text;
            if (novoNome) {
                var existe = false;
                for (var i = 0; i < database[tipo].length; i++) {
                    if (database[tipo][i].nome.toLowerCase() === novoNome.toLowerCase()) {
                        existe = true;
                        break;
                    }
                }
                if (!existe) {
                    var novoId = getNextId(database[tipo]);
                    database[tipo].push({"id": novoId, "nome": novoNome});
                    salvarJSON(caminhoDatabase, database);
                    atualizarLista();
                    campoNovo.text = "";
                    campoNovo.active = true;
                    alert(tipo.charAt(0).toUpperCase() + tipo.slice(1, -1) + " '" + novoNome + "' adicionado com sucesso!");
                    if (callback) callback(); // Chama o callback após adicionar
                } else {
                    alert("Este " + tipo.slice(0, -1) + " já existe.");
                }
            } else {
                alert("Por favor, insira um nome para o " + tipo.slice(0, -1) + ".");
            }
        }

        // Evento de clique no botão Adicionar
        botaoAdicionar.onClick = adicionarNovoItem;

        // Evento de pressionar Enter no campo de texto
        campoNovo.addEventListener('keydown', function(e) {
            if (e.keyName === 'Enter') {
                adicionarNovoItem();
                e.preventDefault();
            }
        });

        // Função para remover item selecionado
        botaoRemover.onClick = function() {
            var selectedIndex = lista.selection.index;
            if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < database[tipo].length) {
                var itemRemovido = database[tipo][selectedIndex];
                removerItemEDependencias(tipo, itemRemovido.id);
                atualizarLista();
                if (callback) callback();
                alert(tipo.charAt(0).toUpperCase() + tipo.slice(1, -1) + " '" + itemRemovido.nome + "' removido com sucesso!");
            } else {
                alert("Por favor, selecione um " + tipo.slice(0, -1) + " válido para remover.");
            }
        }

        // Atualizar a lista inicial
        atualizarLista();

        return {lista: lista, atualizar: atualizarLista};
    }

    // Função para obter o próximo ID disponível
    function getNextId(array) {
        var maxId = 0;
        for (var i = 0; i < array.length; i++) {
            if (array[i].id > maxId) {
                maxId = array[i].id;
            }
        }
        return maxId + 1;
    }

    // Adicione a nova função removerItemEDependencias aqui
        function removerItemEDependencias(tipo, id) {
            alert("Removendo item do tipo: " + tipo + " com ID: " + id);
            
            // Remover o item principal
            var tamanhoAntes = database[tipo].length;
            database[tipo] = filterArray(database[tipo], function(item) {
                return item.id !== id;
            });
            var tamanhoDepois = database[tipo].length;
            
            alert("Itens removidos: " + (tamanhoAntes - tamanhoDepois));    

        // Remover dependências
        if (tipo === "componentes") {
            var combAntes = database.combinacoes.length;
            database.combinacoes = filterArray(database.combinacoes, function(combinacao) {
                return combinacao.componenteId !== id;
            });
            alert("Combinações removidas: " + (combAntes - database.combinacoes.length));
        } else if (tipo === "cores") {
            var combAntes = database.combinacoes.length;
            database.combinacoes = filterArray(database.combinacoes, function(combinacao) {
                return combinacao.corId !== id;
            });
            alert("Combinações removidas: " + (combAntes - database.combinacoes.length));
            
            var bolasAntes = database.bolas.length;
            database.bolas = filterArray(database.bolas, function(bola) {
                return bola.corId !== id;
            });
            alert("Bolas removidas: " + (bolasAntes - database.bolas.length));
        } else if (tipo === "acabamentos") {
            var bolasAntes = database.bolas.length;
            database.bolas = filterArray(database.bolas, function(bola) {
                return bola.acabamentoId !== id;
            });
            alert("Bolas removidas: " + (bolasAntes - database.bolas.length));
        } else if (tipo === "tamanhos") {
            var bolasAntes = database.bolas.length;
            database.bolas = filterArray(database.bolas, function(bola) {
                return bola.tamanhoId !== id;
            });
            alert("Bolas removidas: " + (bolasAntes - database.bolas.length));
        } else if (tipo === "bolas") {
            // Não há dependências para remover no caso das bolas
        }

        salvarJSON(caminhoDatabase, database);
        alert("Base de dados atualizada e salva.");
    }

    // Função para encontrar item por ID
    function findById(array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id === id) {
                return array[i];
            }
        }
        return null;
    }

    // Unidades de medida fixas
    var unidadesMedida = ["m2", "ml", "units"];

    // Função para recarregar a base de dados e atualizar os campos dropdown
    function refreshDatabase() {
        try {
            database = carregarJSON(caminhoDatabase);
            interfaceComponentes.atualizar();
            interfaceCores.atualizar();
            interfaceTamanhos.atualizar();
            atualizarListaCombinacoes();
            atualizarDropdowns();
            atualizarListaBolas();
            atualizarDropdownsBolas();
            alert("Base de dados recarregada com sucesso.");
        } catch (e) {
            alert("Erro ao recarregar a base de dados: " + e.message);
        }
    }

    // Criar janela principal
    var janela = new Window("dialog", "Editor Base de Dados");
    janela.orientation = "column";
    janela.alignChildren = ["center", "top"];
    janela.spacing = 10;
    janela.margins = 16;

    // Aumentar o tamanho da janela
    janela.preferredSize.width = 600;
    janela.preferredSize.height = 700;

    // Abas para Componentes, Cores, Combinações e Bolas
    var abas = janela.add("tabbedpanel");
    abas.alignChildren = ["fill", "fill"];
    var abaComponentes = abas.add("tab", undefined, "Componentes");
    var abaCores = abas.add("tab", undefined, "Cores");
    var abaCombinacoes = abas.add("tab", undefined, "Combinações");
    var abaBolas = abas.add("tab", undefined, "Bolas");
    var abaTamanhos = abas.add("tab", undefined, "Tamanhos");

    // Criar interfaces para Componentes, Cores, Combinações e Bolas
    var interfaceComponentes = criarInterfaceGerenciamentoComponentes(abaComponentes);
    var interfaceCores = criarInterfaceGerenciamento(abaCores, "cores", function() {
        atualizarDropdownsBolas();
        atualizarDropdowns();
    });
    var interfaceTamanhos = criarInterfaceGerenciamento(abaTamanhos, "tamanhos", function() {
        atualizarDropdownsBolas();
    });

    // Modifique a interface para Combinações
abaCombinacoes.orientation = "column";
abaCombinacoes.alignChildren = ["fill", "top"];
abaCombinacoes.spacing = 10;

// Adicionar grupo de pesquisa para combinações
var grupoPesquisaCombinacoes = abaCombinacoes.add("group");
grupoPesquisaCombinacoes.orientation = "row";
grupoPesquisaCombinacoes.alignChildren = ["left", "center"];
grupoPesquisaCombinacoes.add("statictext", undefined, "Pesquisar:");
var campoPesquisaCombinacoes = grupoPesquisaCombinacoes.add("edittext", undefined, "");
campoPesquisaCombinacoes.preferredSize.width = 200;

// Painel para a lista de combinações com barra de rolagem
var painelCombinacoes = abaCombinacoes.add("panel");
painelCombinacoes.orientation = "row";
painelCombinacoes.alignChildren = ["fill", "fill"];
painelCombinacoes.preferredSize.height = 300;
var listaCombinacoes = painelCombinacoes.add("listbox", undefined, [], {multiselect: false});
listaCombinacoes.preferredSize.width = 500;

// Grupo para adicionar nova combinação
var grupoAdicionarCombinacao = abaCombinacoes.add("group");
grupoAdicionarCombinacao.orientation = "column";
grupoAdicionarCombinacao.alignChildren = ["left", "top"];
grupoAdicionarCombinacao.spacing = 5;

// Primeira linha
var primeiraLinha = grupoAdicionarCombinacao.add("group");
primeiraLinha.orientation = "row";
primeiraLinha.alignChildren = ["left", "center"];
primeiraLinha.spacing = 5;
primeiraLinha.add("statictext", undefined, "Componente:");
var dropdownComponentes = primeiraLinha.add("dropdownlist");
dropdownComponentes.preferredSize.width = 200;
primeiraLinha.add("statictext", undefined, "Cor:");
var dropdownCores = primeiraLinha.add("dropdownlist");
dropdownCores.preferredSize.width = 150;
primeiraLinha.add("statictext", undefined, "Unidade:");
var listboxUnidades = primeiraLinha.add("listbox", undefined, [], {multiselect: true});
listboxUnidades.preferredSize.width = 100;
listboxUnidades.preferredSize.height = 60;

// Segunda linha (CMYK)
var segundaLinha = grupoAdicionarCombinacao.add("group");
segundaLinha.orientation = "row";
segundaLinha.alignChildren = ["left", "center"];
segundaLinha.spacing = 5;
segundaLinha.add("statictext", undefined, "C:");
var campoCyan = segundaLinha.add("edittext", undefined, "");
campoCyan.preferredSize.width = 40;
segundaLinha.add("statictext", undefined, "M:");
var campoMagenta = segundaLinha.add("edittext", undefined, "");
campoMagenta.preferredSize.width = 40;
segundaLinha.add("statictext", undefined, "Y:");
var campoYellow = segundaLinha.add("edittext", undefined, "");
campoYellow.preferredSize.width = 40;
segundaLinha.add("statictext", undefined, "K:");
var campoBlack = segundaLinha.add("edittext", undefined, "");
campoBlack.preferredSize.width = 40;

// Terceira linha
var terceiraLinha = grupoAdicionarCombinacao.add("group");
terceiraLinha.orientation = "row";
terceiraLinha.alignChildren = ["left", "center"];
terceiraLinha.spacing = 5;
terceiraLinha.add("statictext", undefined, "Referência:");
var campoReferenciaCombinacao = terceiraLinha.add("edittext", undefined, "");
campoReferenciaCombinacao.preferredSize.width = 400;
var botaoAdicionarCombinacao = terceiraLinha.add("button", undefined, "Adicionar");

// Grupo para editar referência e CMYK da combinação
var grupoEditarCombinacao = abaCombinacoes.add("group");
grupoEditarCombinacao.orientation = "column";
grupoEditarCombinacao.alignChildren = ["left", "center"];
grupoEditarCombinacao.spacing = 5;

var linhaEditarReferencia = grupoEditarCombinacao.add("group");
linhaEditarReferencia.orientation = "row";
linhaEditarReferencia.alignChildren = ["left", "center"];
linhaEditarReferencia.spacing = 5;
linhaEditarReferencia.add("statictext", undefined, "Editar Referência:");
var campoEditarReferenciaCombinacao = linhaEditarReferencia.add("edittext", undefined, "");
campoEditarReferenciaCombinacao.preferredSize.width = 400;

var linhaEditarCMYK = grupoEditarCombinacao.add("group");
linhaEditarCMYK.orientation = "row";
linhaEditarCMYK.alignChildren = ["left", "center"];
linhaEditarCMYK.spacing = 5;
linhaEditarCMYK.add("statictext", undefined, "Editar CMYK:");
linhaEditarCMYK.add("statictext", undefined, "C:");
var campoEditarCyan = linhaEditarCMYK.add("edittext", undefined, "");
campoEditarCyan.preferredSize.width = 40;
linhaEditarCMYK.add("statictext", undefined, "M:");
var campoEditarMagenta = linhaEditarCMYK.add("edittext", undefined, "");
campoEditarMagenta.preferredSize.width = 40;
linhaEditarCMYK.add("statictext", undefined, "Y:");
var campoEditarYellow = linhaEditarCMYK.add("edittext", undefined, "");
campoEditarYellow.preferredSize.width = 40;
linhaEditarCMYK.add("statictext", undefined, "K:");
var campoEditarBlack = linhaEditarCMYK.add("edittext", undefined, "");
campoEditarBlack.preferredSize.width = 40;

var botaoSalvarCombinacao = grupoEditarCombinacao.add("button", undefined, "Salvar Alterações");

// Botão para remover combinação selecionada
var botaoRemoverCombinacao = abaCombinacoes.add("button", undefined, "Remover Selecionado");

// Função para atualizar a lista de combinações
function atualizarListaCombinacoes(filtro) {
    listaCombinacoes.removeAll();
    var combinacoes = database.combinacoes.sort(function(a, b) {
        var compA = findById(database.componentes, a.componenteId).nome;
        var compB = findById(database.componentes, b.componenteId).nome;
        var corA = findById(database.cores, a.corId).nome;
        var corB = findById(database.cores, b.corId).nome;
        return (compA + corA).localeCompare(compB + corB);
    });
    for (var i = 0; i < combinacoes.length; i++) {
        var combinacao = combinacoes[i];
        var componente = findById(database.componentes, combinacao.componenteId).nome;
        var cor = findById(database.cores, combinacao.corId).nome;
        var referencia = combinacao.referencia ? " (Ref: " + combinacao.referencia + ")" : "";
        var cmyk = combinacao.cmyk ? " [CMYK: " + combinacao.cmyk.join(",") + "]" : "";
        var texto = componente + " - " + cor + " - " + combinacao.unidade + referencia + cmyk;
        if (!filtro || texto.toLowerCase().indexOf(filtro.toLowerCase()) !== -1) {
            listaCombinacoes.add("item", texto);
        }
    }
    $.writeln("Lista de combinações atualizada. Total de combinações: " + combinacoes.length);
}

// Evento de pesquisa para combinações
campoPesquisaCombinacoes.onChanging = function() {
    atualizarListaCombinacoes(this.text);
};

// Função para adicionar nova combinação
botaoAdicionarCombinacao.onClick = function() {
    try {
        if (!dropdownComponentes.selection) {
            alert("Por favor, selecione um componente.");
            return;
        }
        if (!dropdownCores.selection) {
            alert("Por favor, selecione uma cor.");
            return;
        }
        // Obter todas as unidades selecionadas
        var unidadesSelecionadas = [];
        for (var i = 0; i < listboxUnidades.items.length; i++) {
            if (listboxUnidades.items[i].selected) {
                unidadesSelecionadas.push(listboxUnidades.items[i].text);
            }
        }
        if (unidadesSelecionadas.length === 0) {
            alert("Por favor, selecione pelo menos uma unidade.");
            return;
        }
        var componenteId = database.componentes[dropdownComponentes.selection.index].id;
        var corId = database.cores[dropdownCores.selection.index].id;
        var referencia = campoReferenciaCombinacao.text;
        var cmyk = [
            parseInt(campoCyan.text) || 0,
            parseInt(campoMagenta.text) || 0,
            parseInt(campoYellow.text) || 0,
            parseInt(campoBlack.text) || 0
        ];
        var criadas = 0;
        for (var u = 0; u < unidadesSelecionadas.length; u++) {
            var unidade = unidadesSelecionadas[u];
            var existe = false;
            for (var i = 0; i < database.combinacoes.length; i++) {
                var c = database.combinacoes[i];
                if (c.componenteId === componenteId && c.corId === corId && c.unidade === unidade) {
                    existe = true;
                    break;
                }
            }
            if (!existe) {
                var novaCombinacao = {
                    "id": getNextId(database.combinacoes),
                    "componenteId": componenteId,
                    "corId": corId,
                    "unidade": unidade,
                    "referencia": referencia,
                    "cmyk": cmyk
                };
                database.combinacoes.push(novaCombinacao);
                criadas++;
            }
        }
        if (criadas > 0) {
            salvarJSON(caminhoDatabase, database);
            atualizarListaCombinacoes();
            campoReferenciaCombinacao.text = "";
            campoCyan.text = "";
            campoMagenta.text = "";
            campoYellow.text = "";
            campoBlack.text = "";
            alert("Foram criadas " + criadas + " combinações!");
        } else {
            alert("Todas as combinações já existem.");
        }
    } catch (e) {
        alert("Erro ao adicionar combinação: " + e.toString());
        $.writeln("Erro ao adicionar combinação: " + e.toString());
    }
}

// Função para atualizar a referência e CMYK da combinação selecionada
botaoSalvarCombinacao.onClick = function() {
    var selectedIndex = listaCombinacoes.selection.index;
    if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < database.combinacoes.length) {
        var combinacaoSelecionada = database.combinacoes[selectedIndex];
        combinacaoSelecionada.referencia = campoEditarReferenciaCombinacao.text;
        combinacaoSelecionada.cmyk = [
            parseInt(campoEditarCyan.text) || 0,
            parseInt(campoEditarMagenta.text) || 0,
            parseInt(campoEditarYellow.text) || 0,
            parseInt(campoEditarBlack.text) || 0
        ];
        salvarJSON(caminhoDatabase, database);
        atualizarListaCombinacoes();
        alert("Combinação atualizada com sucesso!");
    } else {
        alert("Por favor, selecione uma combinação para editar.");
    }
}

// Atualizar os campos de edição quando uma combinação é selecionada
listaCombinacoes.onChange = function() {
    var selectedIndex = listaCombinacoes.selection.index;
    if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < database.combinacoes.length) {
        var combinacaoSelecionada = database.combinacoes[selectedIndex];
        campoEditarReferenciaCombinacao.text = combinacaoSelecionada.referencia || "";
        if (combinacaoSelecionada.cmyk) {
            campoEditarCyan.text = combinacaoSelecionada.cmyk[0] || "";
            campoEditarMagenta.text = combinacaoSelecionada.cmyk[1] || "";
            campoEditarYellow.text = combinacaoSelecionada.cmyk[2] || "";
            campoEditarBlack.text = combinacaoSelecionada.cmyk[3] || "";
        } else {
            campoEditarCyan.text = "";
            campoEditarMagenta.text = "";
            campoEditarYellow.text = "";
            campoEditarBlack.text = "";
        }
    }
}

    // Função para remover combinação selecionada
    botaoRemoverCombinacao.onClick = function() {
        var selectedIndex = listaCombinacoes.selection.index;
        if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < database.combinacoes.length) {
            var combinacaoRemovida = database.combinacoes[selectedIndex];
            removerItemEDependencias("combinacoes", combinacaoRemovida.id);
            atualizarListaCombinacoes();
            alert("Combinação removida com sucesso!");
        } else {
            alert("Por favor, selecione uma combinação válida para remover.");
        }
    }

    // Adicione esta função ao seu código
        function atualizarDropdowns() {
            // Atualizar dropdown de componentes
            dropdownComponentes.removeAll();
            for (var i = 0; i < database.componentes.length; i++) {
                dropdownComponentes.add("item", database.componentes[i].nome);
            }

            // Atualizar dropdown de cores
            dropdownCores.removeAll();
            for (var i = 0; i < database.cores.length; i++) {
                dropdownCores.add("item", database.cores[i].nome);
            }

            // Atualizar listbox de unidades
            listboxUnidades.removeAll();
            for (var i = 0; i < unidadesMedida.length; i++) {
                listboxUnidades.add("item", unidadesMedida[i]);
            }
        }
        // Atualizar listas e dropdowns iniciais
    atualizarListaCombinacoes();
    atualizarDropdowns();

    // Interface para Bolas
    abaBolas.orientation = "column";
    abaBolas.alignChildren = ["fill", "top"];
    abaBolas.spacing = 10;

    // Lista de bolas com barra de rolagem
    var grupoBolas = abaBolas.add("group");
    grupoBolas.orientation = "row";
    grupoBolas.alignChildren = ["fill", "fill"];
    var listaBolas = grupoBolas.add("listbox", undefined, [], {multiselect: false});
    listaBolas.preferredSize.width = 500;
    listaBolas.preferredSize.height = 300;

    // Grupo para adicionar nova bola
    var grupoAdicionarBola = abaBolas.add("group");
    grupoAdicionarBola.orientation = "row";
    grupoAdicionarBola.alignChildren = ["left", "center"];
    grupoAdicionarBola.spacing = 5;
    grupoAdicionarBola.add("statictext", undefined, "Cor:");
    var dropdownCoresBolas = grupoAdicionarBola.add("dropdownlist");
    grupoAdicionarBola.add("statictext", undefined, "Acabamento:");
    var dropdownAcabamentos = grupoAdicionarBola.add("dropdownlist");
    grupoAdicionarBola.add("statictext", undefined, "Tamanho:");
    var dropdownTamanhos = grupoAdicionarBola.add("dropdownlist");
    grupoAdicionarBola.add("statictext", undefined, "Referência:");
    var campoReferenciaBola = grupoAdicionarBola.add("edittext", undefined, "");
    campoReferenciaBola.preferredSize.width = 100;
    var botaoAdicionarBola = grupoAdicionarBola.add("button", undefined, "Adicionar");

    // Grupo para editar referência da bola
    var grupoEditarReferenciaBola = abaBolas.add("group");
    grupoEditarReferenciaBola.orientation = "row";
    grupoEditarReferenciaBola.alignChildren = ["left", "center"];
    grupoEditarReferenciaBola.spacing = 5;
    grupoEditarReferenciaBola.add("statictext", undefined, "Editar Referência:");
    var campoEditarReferenciaBola = grupoEditarReferenciaBola.add("edittext", undefined, "");
    campoEditarReferenciaBola.preferredSize.width = 100;
    var botaoSalvarReferenciaBola = grupoEditarReferenciaBola.add("button", undefined, "Salvar Referência");

    // Botão para remover bola selecionada
    var botaoRemoverBola = abaBolas.add("button", undefined, "Remover Selecionado");

    // Função para remover a bola selecionada
    botaoRemoverBola.onClick = function() {
        var selectedIndex = listaBolas.selection.index;
        if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < database.bolas.length) {
            var bolaRemovida = database.bolas[selectedIndex];
            removerItemEDependencias("bolas", bolaRemovida.id);
            atualizarListaBolas();
            alert("Bola removida com sucesso!");
        } else {
            alert("Por favor, selecione uma bola válida para remover.");
        }
    }

    // Adicione esta nova função para remover bolas incompletas
    function removerBolasIncompletas() {
        var bolasRemovidas = 0;
        var novasBolas = [];
        for (var i = 0; i < database.bolas.length; i++) {
            var bola = database.bolas[i];
            var cor = findById(database.cores, bola.corId);
            var acabamento = findById(database.acabamentos, bola.acabamentoId);
            var tamanho = findById(database.tamanhos, bola.tamanhoId);
            if (cor && acabamento && tamanho) {
                novasBolas.push(bola);
            } else {
                bolasRemovidas++;
            }
        }
        database.bolas = novasBolas;
        if (bolasRemovidas > 0) {
            salvarJSON(caminhoDatabase, database);
            alert(bolasRemovidas + " bola(s) com dados incompletos foram removidas.");
        }
        return bolasRemovidas;
    }

    // Modifique a função atualizarListaBolas para usar a nova função
    function atualizarListaBolas() {
        removerBolasIncompletas();
        listaBolas.removeAll();
        for (var i = 0; i < database.bolas.length; i++) {
            var bola = database.bolas[i];
            var cor = findById(database.cores, bola.corId);
            var acabamento = findById(database.acabamentos, bola.acabamentoId);
            var tamanho = findById(database.tamanhos, bola.tamanhoId);
            var referencia = bola.referencia || "";
            listaBolas.add("item", cor.nome + " - " + acabamento.nome + " - " + tamanho.nome + (referencia ? " (Ref: " + referencia + ")" : ""));
        }
    }

    // Função para atualizar os dropdowns das bolas
    function atualizarDropdownsBolas() {
        dropdownCoresBolas.removeAll();
        dropdownAcabamentos.removeAll();
        dropdownTamanhos.removeAll();
        
        for (var i = 0; i < database.cores.length; i++) {
            dropdownCoresBolas.add("item", database.cores[i].nome);
        }
        
        for (var i = 0; i < database.acabamentos.length; i++) {
            dropdownAcabamentos.add("item", database.acabamentos[i].nome);
        }

        for (var i = 0; i < database.tamanhos.length; i++) {
            dropdownTamanhos.add("item", database.tamanhos[i].nome);
        }
    }

    // Função para adicionar nova bola
    botaoAdicionarBola.onClick = function() {
        if (dropdownCoresBolas.selection && dropdownAcabamentos.selection && dropdownTamanhos.selection) {
            var corId = database.cores[dropdownCoresBolas.selection.index].id;
            var acabamentoId = database.acabamentos[dropdownAcabamentos.selection.index].id;
            var tamanhoId = database.tamanhos[dropdownTamanhos.selection.index].id;
            var referencia = campoReferenciaBola.text;
            
            var existe = false;
            for (var i = 0; i < database.bolas.length; i++) {
                var b = database.bolas[i];
                if (b.corId === corId && b.acabamentoId === acabamentoId && b.tamanhoId === tamanhoId) {
                    existe = true;
                    break;
                }
            }
            
            if (!existe) {
                var novaBola = {
                    "id": getNextId(database.bolas),
                    "corId": corId,
                    "acabamentoId": acabamentoId,
                    "tamanhoId": tamanhoId,
                    "referencia": referencia
                };
                database.bolas.push(novaBola);
                salvarJSON(caminhoDatabase, database);
                atualizarListaBolas();
                campoReferenciaBola.text = "";
                alert("Bola adicionada com sucesso!");
            } else {
                alert("Esta combinação de bola já existe.");
            }
        } else {
            alert("Por favor, selecione uma cor, um acabamento e um tamanho.");
        }
    }

    // Função para atualizar a referência da bola selecionada
    botaoSalvarReferenciaBola.onClick = function() {
        var selectedIndex = listaBolas.selection.index;
        if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < database.bolas.length) {
            var bolaSelecionada = database.bolas[selectedIndex];
            bolaSelecionada.referencia = campoEditarReferenciaBola.text;
            salvarJSON(caminhoDatabase, database);
            atualizarListaBolas();
            alert("Referência da bola atualizada com sucesso!");
        } else {
            alert("Por favor, selecione uma bola para editar a referência.");
        }
    }

    // Atualizar o campo de edição quando uma bola é selecionada
    listaBolas.onChange = function() {
        var selectedIndex = listaBolas.selection.index;
        if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < database.bolas.length) {
            var bolaSelecionada = database.bolas[selectedIndex];
            campoEditarReferenciaBola.text = bolaSelecionada.referencia || "";
        }
    }

    // Atualizar listas e dropdowns iniciais
    atualizarListaBolas();
    atualizarDropdownsBolas();

    // Grupo para conter os botões "Refresh" e "Fechar"
    var grupoBotoes = janela.add("group");
    grupoBotoes.orientation = "row";
    grupoBotoes.alignChildren = ["right", "center"];
    grupoBotoes.spacing = 10;

    // Adicione o botão "Refresh" ao grupo de botões
    var botaoRefresh = grupoBotoes.add("button", undefined, "Refresh");
    botaoRefresh.onClick = refreshDatabase;

    // Botão para fechar a janela
    var botaoFechar = grupoBotoes.add("button", undefined, "Fechar");
    botaoFechar.onClick = function() { janela.close(); };

    // Mostrar a janela
    janela.show();

    // Adicione um botão para limpar manualmente as bolas incompletas
    var botaoLimparBolasIncompletas = abaBolas.add("button", undefined, "Limpar Bolas Incompletas");
    botaoLimparBolasIncompletas.onClick = function() {
        var bolasRemovidas = removerBolasIncompletas();
        if (bolasRemovidas > 0) {
            atualizarListaBolas();
        } else {
            alert("Não foram encontradas bolas com dados incompletos.");
        }
    };

    // Modifique o evento onChange das abas para incluir a atualização dos tamanhos
    abas.onChange = function() {
        if (abas.selection === abaBolas) {
            atualizarDropdownsBolas();
        } else if (abas.selection === abaTamanhos) {
            interfaceTamanhos.atualizar();
        }
    };
}

// Executar o script
executarScript();
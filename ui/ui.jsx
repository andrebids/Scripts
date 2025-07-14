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
    grupoEditar.add("statictext", undefined, "Editar Referência:");
    var campoEditarReferencia = grupoEditar.add("edittext", undefined, "");
    campoEditarReferencia.preferredSize.width = 150;
    var botaoSalvarReferencia = grupoEditar.add("button", undefined, "Salvar");

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
                lista.add("item", displayText);
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
        var selectedIndex = lista.selection.index;
        if (selectedIndex !== null) {
            var componenteSelecionado = database.componentes[selectedIndex];
            componenteSelecionado.referencia = campoEditarReferencia.text;
            salvarJSON(caminhoDatabase, database);
            atualizarLista();
            alert("Referência atualizada com sucesso!");
        } else {
            alert("Por favor, selecione um componente para editar.");
        }
    }

    botaoSalvarReferencia.onClick = atualizarReferencia;

    // Atualizar o campo de edição quando um item é selecionado
    lista.onChange = function() {
        var selectedIndex = lista.selection.index;
        if (selectedIndex !== null) {
            var componenteSelecionado = database.componentes[selectedIndex];
            campoEditarReferencia.text = componenteSelecionado.referencia || "";
        }
    };

    // Atualizar a lista inicial
    atualizarLista();

    return {lista: lista, atualizar: atualizarLista};
}

// Função para mostrar janela de configuração inicial
// Função mostrarJanelaConfigInicial migrada para config.jsx

// Função para criar interface do contador de bolas
function criarInterfaceContadorBolas(grupoContar, dados, itensLegenda, atualizarListaItens) {
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
    textoResultado.preferredSize.height = 150;

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

    botaoContar.onClick = function() {
                    if (logs && logs.logEvento) {
                logs.logEvento("click", "botaoContar - Iniciando contagem de bolas");
            }
        
        // Usar módulo bridge para executar contagem
        bridge.executarContagemBolas(dados, textoResultado, function(erro, resultado) {
            if (erro) {
                if (logs && logs.adicionarLog && logs.TIPOS_LOG) {
                    logs.adicionarLog("Erro na contagem via bridge: " + erro, logs.TIPOS_LOG.ERROR);
                }
            } else {
                if (logs && logs.adicionarLog && logs.TIPOS_LOG) {
                    logs.adicionarLog("Contagem via bridge concluída com sucesso", logs.TIPOS_LOG.INFO);
                }
            }
        });
    };

    return {
        botaoContar: botaoContar,
        textoResultado: textoResultado
    };
}

// Função para criar interface extra
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
    
    // Tab Logs
    var tabLogs = tabsExtra.add("tab", undefined, "Logs");
    tabLogs.alignChildren = ["fill", "fill"];
    
    // Área de logs com barra de rolagem (ocupa toda a aba)
    var areaLogs = tabLogs.add("edittext", undefined, "", {multiline: true, scrollable: true, readonly: true});
    areaLogs.preferredSize.width = 500;
    areaLogs.preferredSize.height = 350;
    
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
        grupoTexturas: grupoTexturas,
        // Retorno para a interface de logs simplificada
        areaLogs: areaLogs
    };
}


/**
 * Cria interface de texturas quando checkbox é marcado
 */
function criarInterfaceTexturas(grupoExtra, janela, t, funcoesFiltragem, itensLegenda, atualizarListaItens) {
    if (logs && logs.logFuncao) {
        logs.logFuncao("criarInterfaceTexturas", "Criando interface de texturas");
    }
    
    try {
        // Validação de parâmetros
        if (!grupoExtra || !janela || !t) {
            throw new Error("Parâmetros obrigatórios não fornecidos");
        }
        
        // Criar o grupo de texturas
        var grupoTexturas = grupoExtra.add("panel", undefined, t("texturas"));
        grupoTexturas.orientation = "row";
        grupoTexturas.alignChildren = ["left", "top"];
        grupoTexturas.spacing = 10;
        grupoTexturas.margins = 10;

        // Subgrupo para lista e botão
        var grupoLista = grupoTexturas.add("group");
        grupoLista.orientation = "column";
        grupoLista.alignChildren = ["left", "top"];
        grupoLista.spacing = 5;

        // Lista de texturas no subgrupo
        var listaTexturas = grupoLista.add("dropdownlist", undefined, [
            t("selecioneTextura"),
            "--- SIMPLE TRAIT ---",
            "Texture 01", "Texture 02", "Texture 03", "Texture 04",
            "Texture 05", "Texture 06", "Texture 07", "Texture 08",
            "--- DOUBLE TRAIT ---",
            "Texture 09", "Texture 10", "Texture 11", "Texture 12",
            "Texture 13", "Texture 14", "Texture 15", "Texture 16",
            "--- FLEXI ---",
            "Flexi Triangle", "Flexi Boucle", "Flexi Losange", "Flexi Meli Melo"
        ]);
        listaTexturas.selection = 0;
        listaTexturas.preferredSize.width = 200;

        // Botão no subgrupo
        var botaoInserirTextura = grupoLista.add("button", undefined, t("inserirTextura"));

        // Grupo para preview da imagem
        var grupoPreview = grupoTexturas.add("group");
        grupoPreview.orientation = "column";
        grupoPreview.alignChildren = ["left", "top"];
        grupoPreview.spacing = 5;

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

        // Evento de mudança na lista para preview
        listaTexturas.onChange = function() {
            // Limpar preview anterior
            while(grupoPreview.children.length > 0) {
                grupoPreview.remove(grupoPreview.children[0]);
            }
            
            if (this.selection.index > 0 && this.selection.text.indexOf("---") === -1) {
                try {
                    var numeroTextura = funcoesFiltragem.obterNumeroTextura(this.selection.text);
                    var nomeArquivo = "texture" + numeroTextura + ".png";
                    // Usar caminho absoluto baseado na estrutura conhecida
                    var pastaScript = "C:/Program Files/Adobe/Adobe Illustrator 2025/Presets/en_GB/Scripts/Legenda";
                    var caminhoImagem = pastaScript + "/resources/png/" + nomeArquivo;
                    var arquivoImagem = new File(caminhoImagem);
                    
                    // Debug: logs detalhados para identificar o problema
                    if (typeof logs !== 'undefined' && logs.adicionarLog) {
                        logs.adicionarLog("Textura selecionada: " + this.selection.text, "info");
                        logs.adicionarLog("Número extraído: " + numeroTextura, "info");
                        logs.adicionarLog("Nome do arquivo: " + nomeArquivo, "info");
                        logs.adicionarLog("Caminho completo: " + caminhoImagem, "info");
                        logs.adicionarLog("Arquivo existe: " + arquivoImagem.exists, "info");
                    }
                    
                    if (arquivoImagem.exists) {
                        var imagem = grupoPreview.add("image", undefined, arquivoImagem);
                        imagem.preferredSize = [100, 100];
                        if (typeof logs !== 'undefined' && logs.adicionarLog) {
                            logs.adicionarLog("SUCESSO: Imagem carregada: " + nomeArquivo, "info");
                        }
                    } else {
                        var textoErro = grupoPreview.add("statictext", undefined, "Imagem não encontrada");
                        if (typeof logs !== 'undefined' && logs.adicionarLog) {
                            logs.adicionarLog("ERRO: Arquivo não encontrado em: " + caminhoImagem, "error");
                        }
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

        // Atualizar layout da janela
        janela.layout.layout(true);
        janela.preferredSize.height += 100;
        
        if (logs && logs.logFuncao) {
            logs.logFuncao("criarInterfaceTexturas", "Interface de texturas criada com sucesso");
        }
        
        return {
            grupoTexturas: grupoTexturas,
            listaTexturas: listaTexturas,
            botaoInserirTextura: botaoInserirTextura,
            grupoPreview: grupoPreview
        };
        
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao criar interface de texturas: " + erro.message, "error");
        }
        return null;
    }
}

/**
 * Remove interface de texturas quando checkbox é desmarcado
 */
function removerInterfaceTexturas(componentes, janela) {
    if (logs && logs.logFuncao) {
        logs.logFuncao("removerInterfaceTexturas", "Removendo interface de texturas");
    }
    
    try {
        if (componentes && componentes.grupoTexturas) {
            componentes.grupoTexturas.parent.remove(componentes.grupoTexturas);
            janela.layout.layout(true);
            janela.preferredSize.height -= 100;
            
            if (logs && logs.logFuncao) {
                logs.logFuncao("removerInterfaceTexturas", "Interface de texturas removida com sucesso");
            }
        }
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao remover interface de texturas: " + erro.message, "error");
        }
    }
}

/**
 * Cria interface de observações quando checkbox é marcado
 */
function criarInterfaceObservacoes(grupoExtra, janela, t) {
    if (logs && logs.logFuncao) {
        logs.logFuncao("criarInterfaceObservacoes", "Criando interface de observações");
    }
    
    try {
        // Validação de parâmetros
        if (!grupoExtra || !janela || !t) {
            throw new Error("Parâmetros obrigatórios não fornecidos");
        }
        
        // Adicionar o grupo de observações
        var grupoObs = grupoExtra.add("panel", undefined, t("observacoes"));
        grupoObs.orientation = "row";
        grupoObs.alignChildren = ["fill", "top"];
        grupoObs.spacing = 0;

        grupoObs.add("statictext", undefined, t("obs"));

        // Adicionar uma caixa de texto para observações
        var campoObs = grupoObs.add("edittext", undefined, "", {multiline: true, scrollable: true});
        campoObs.characters = 60;
        campoObs.preferredSize.height = 100;
        campoObs.alignment = ["fill", "fill"];

        // Atualizar layout da janela
        janela.layout.layout(true);
        janela.preferredSize.height += 100;
        
        if (logs && logs.logFuncao) {
            logs.logFuncao("criarInterfaceObservacoes", "Interface de observações criada com sucesso");
        }
        
        return {
            grupoObs: grupoObs,
            campoObs: campoObs
        };
        
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao criar interface de observações: " + erro.message, "error");
        }
        return null;
    }
}

/**
 * Remove interface de observações quando checkbox é desmarcado
 */
function removerInterfaceObservacoes(componentes, janela) {
    if (logs && logs.logFuncao) {
        logs.logFuncao("removerInterfaceObservacoes", "Removendo interface de observações");
    }
    
    try {
        if (componentes && componentes.grupoObs) {
            componentes.grupoObs.parent.remove(componentes.grupoObs);
            janela.layout.layout(true);
            janela.preferredSize.height -= 100;
            
            if (logs && logs.logFuncao) {
                logs.logFuncao("removerInterfaceObservacoes", "Interface de observações removida com sucesso");
            }
        }
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao remover interface de observações: " + erro.message, "error");
        }
    }
}

// Make functions available globally
$.global.ui = {
    criarInterfaceGerenciamento: criarInterfaceGerenciamento,
    criarInterfaceGerenciamentoComponentes: criarInterfaceGerenciamentoComponentes,
    criarInterfaceTexturas: criarInterfaceTexturas,
    removerInterfaceTexturas: removerInterfaceTexturas,
    criarInterfaceObservacoes: criarInterfaceObservacoes,
    removerInterfaceObservacoes: removerInterfaceObservacoes
};
// Variável global para o idioma - começar em francês
var IDIOMA_ATUAL = "Français";

// Função para atualizar o idioma
function atualizarIdioma(novoIdioma) {
    IDIOMA_ATUAL = novoIdioma;
}

// Função para obter a tradução
function t(key) {
    // Pegar o idioma atual do arquivo de configuração
    var config = lerArquivoJSON(caminhoConfig);
    var idioma = config.idioma;
    
    if (idioma === "Français" && TRANSLATIONS["Français"][key]) {
        return TRANSLATIONS["Français"][key];
    }
    return TRANSLATIONS["Português"][key] || key;
}

// Código de inicialização do idioma
if (arquivoExiste(caminhoConfig)) {
    var config = lerArquivoJSON(caminhoConfig);
    nomeDesigner = config.nomeDesigner;
    idiomaUsuario = config.idioma;
    IDIOMA_ATUAL = idiomaUsuario;
} else {
    // Se não existir arquivo de configuração, pedir idioma primeiro
    var janelaIdioma = new Window("dialog", "Seleção de Idioma / Sélection de la Langue");
    janelaIdioma.orientation = "column";
    janelaIdioma.alignChildren = "center";
    
    // Texto em ambos os idiomas
    janelaIdioma.add("statictext", undefined, "Por favor, selecione seu idioma:");
    janelaIdioma.add("statictext", undefined, "S'il vous plaît, sélectionnez votre langue:");
    
    var listaIdiomas = janelaIdioma.add("dropdownlist", undefined, [
        "Português",
        "Français"
    ]);
    listaIdiomas.selection = 0;
    
    var botaoOK = janelaIdioma.add("button", undefined, "OK");
    var idiomaEscolhido;
    
    botaoOK.onClick = function() {
        idiomaEscolhido = listaIdiomas.selection.text;
        IDIOMA_ATUAL = idiomaEscolhido;
        
        // Criar objeto de configuração
        var configData = {
            idioma: idiomaEscolhido,
            nomeDesigner: ""  // Será preenchido na próxima janela
        };
        
        // Fechar janela de idioma
        janelaIdioma.close();
        
        // Criar janela para nome do designer
        var janelaNome = new Window("dialog", t("nomeDesigner"));
        janelaNome.orientation = "column";
        janelaNome.alignChildren = "center";
        
        // Adicionar campos
        janelaNome.add("statictext", undefined, t("inserirNome"));
        var campoNome = janelaNome.add("edittext", undefined, "");
        campoNome.preferredSize.width = 200;
        
        // Adicionar botão OK
        var botaoOKNome = janelaNome.add("button", undefined, t("botaoOk"));
        
        botaoOKNome.onClick = function() {
            if (campoNome.text.length > 0) {
                // Salvar nome no objeto de configuração
                configData.nomeDesigner = campoNome.text;
                
                // Salvar configuração em arquivo
                try {
                    salvarArquivoJSON(caminhoConfig, configData);
                    nomeDesigner = campoNome.text;
                    janelaNome.close();
                } catch(e) {
                    alert("Erro ao salvar configuração: " + e);
                }
            } else {
                alert(t("erroNomeVazio"));
            }
        };
        
        janelaNome.show();
    };
    
    janelaIdioma.show();
}

// Objeto com as traduções
var TRANSLATIONS = {
    "Português": {
        "nomeDesigner": "Nome do Designer",
        "inserirNome": "Insira seu nome:",
        "botaoOk": "OK",
        "erroNomeVazio": "Por favor, insira um nome válido.",
        "configuracaoIdioma": "Configuração de Idioma",
        "selecioneIdioma": "Selecione o idioma:",
        "configuracaoInicial": "Configuração Inicial",
        "informacoesPrincipais": "Informações Principais",
        "legenda": "Legenda",
        "tipoFixacao": "Tipo de fixação",
        "structureLaqueada": "Structure laquée",
        "painelComponentes": "Componentes",
        "procurar": "procurar:",
        "selecioneComponente": "Selecione um componente",
        "botaoAdicionar": "Adicionar",
        "painelBolas": "Bolas",
        "selecioneCor": "Selecione a cor",
        "selecioneAcabamento": "Selecione um acabamento",
        "selecioneTamanho": "Selecione um tamanho",
        "adicionarBola": "Adicionar Bola",
        "painelExtra": "Extra",
        "geral": "Geral",
        "criar": "Criar",
        "contador": "Contador",
        "texturas": "Texturas",
        "adicionarObservacoes": "Adicionar Observações",
        "adicionarComponenteExtra": "Adicionar Componente Extra",
        "removerSelecionado": "Remover Selecionado",
        "removerTodos": "Remover Todos",
        "adicionarLegenda": "Adicionar Legenda",
        "botaoUpdate": "Update",
        "resultadoContagem": "Resultado:",
        "contarElementos": "Contar Elementos (bolas para já)",
        "adicionarPreview": "Adicionar ao Preview",
        "contagemAtualizada": "Contagem atualizada no preview.",
        "realizarContagem": "Por favor, realize uma contagem antes de adicionar ao preview.",
        "erroBaseDados": "Erro: A base de dados não está acessível ou está em um formato inválido.",
        "nenhumObjetoSelecionado": "Nenhum objeto selecionado",
        "total": "Total de",
        "boule": "boule",
        "boules": "boules",
        "erroContagem": "Erro ao iniciar contagem:",
        "nome": "nome:",
        "Nome": "Nome",
        "criarGX": "Criar GX (alfabeto)",
        "criarPalavraAluminio": "Criar palavra de alumínio (em desenvolvimento)",
        "alfabeto": "Alfabeto",
        "alfabetoLabel": "Alfabeto:",
        "bioprint": "Bioprint",
        "cor": "Cor:",
        "tamanho": "Tamanho:",
        "adicionar": "Adicionar",
        "instrucaoGX": "Escreve a tua frase GX, e adiciona à legenda, não precisas de preencher o Nome/tipo. Para fazer o coração é: <3",
        "mostrarContarElementos": "Mostrar Contar Elementos (em desenvolvimento)",
        "observacoes": "Observações",
        "obs": "Obs:",
        "componenteExtra": "Componente Extra",
        "adicionarALegenda": "Adicionar à Legenda",
        "resultado": "Resultado:",
        "botaoContarElementos": "Contar elementos",
        "adicionarAoPreview": "Adicionar ao Preview",
        "adicionarTexturas": "Adicionar Texturas",
        "selecioneTextura": "Selecione uma textura",
        "inserirTextura": "Inserir Textura",
        "instrucaoTextura": "Selecione uma textura para inserir\nao lado da legenda.",
        "selecioneTexturaAlerta": "Por favor, selecione uma textura primeiro.",
        "instrucaoAlfabeto": "Escreve a tua frase GX, e adiciona à legenda, não precisas de preencher o Nome/tipo. Para fazer o coração é: <3",
        "erroProcessarBola": "Erro ao processar a bola: ",
        "erroCombinacaoBola": "Erro: Combinação de bola não encontrada na base de dados.",
        "selecionarCor": "Por favor, selecione uma cor, um acabamento e um tamanho para a bola.",
        "quantidadeInvalida": "Por favor, insira uma quantidade válida de bolas.",
        "preencherCampos": "Por favor, preencha todos os campos corretamente.",
        "erroCarregarImagem": "Erro ao carregar a imagem: ",
        "imagemNaoEncontrada": "Imagem não encontrada",
        "erroProcessarAlfabeto": "Erro ao processar alfabeto: ",
        "nenhumaLetraValida": "Nenhuma letra válida foi inserida.",
        "erroCombinacaoComponente": "Erro: Combinação de componente não encontrada na base de dados.",
        "erroGerarLegenda": "Erro: Não foi possível gerar o conteúdo da legenda.",
        "erroProcessarTexturas": "Erro ao processar texturas: ",
        "linha": "Linha: ",
        "realizarContagemPrimeiro": "Por favor, realize uma contagem antes de adicionar ao preview.",
        "idiomaAlterado": "O idioma foi alterado para ",
        "reiniciarScript": ".\nPor favor, reinicie o script para aplicar as alterações.",
        "tituloJanela": "Cartouche by Bids",
        "tiposFixacao": {
            "poteau": "poteau",
            "suspendue": "suspendue/transversal",
            "murale": "murale",
            "sansFixation": "sans fixation",
            "auSol": "au sol",
            "speciale": "spéciale"
        },
        "Tipo": "Tipo",
        "selecioneUnidade": "Selecione uma unidade",
        "confirmacaoSemTamanho": "Não foi inserido nenhum tamanho. Pretende continuar mesmo assim?",
        "confirmarRemoverTodos": "Tem certeza que deseja remover todos os itens?",
        "selecionarComponenteCompleto": "Por favor, selecione um componente, uma cor e uma unidade.",
        "scriptAtualizado": "O script já está na versão mais recente.",
        "atualizacaoSucesso": "Atualização concluída! Por favor, reinicie o script para usar a nova versão.",
        "erroAtualizacao": "Erro ao atualizar. Por favor, tente novamente.",
        "gitNaoInstalado": "O Git não está instalado neste computador.\n\nPor favor:\n1. Baixe o Git em https://git-scm.com/downloads\n2. Execute o instalador\n3. Reinicie o computador\n4. Tente atualizar novamente",
        "confirmarComponentes": "Tens certeza que adicionaste todos os componentes que precisavas?",
        "legendaAdicionada": "Legenda adicionada com sucesso!",
        "quantidadeNaoInformada": "Por favor, informe a quantidade"
    },
    "Français": {
        "nomeDesigner": "Nom du Designer",
        "inserirNome": "Entrez votre nom:",
        "botaoOk": "OK",
        "erroNomeVazio": "Veuillez entrer un nom valide.",
        "configuracaoIdioma": "Configuration de la Langue",
        "selecioneIdioma": "Sélectionnez la langue:",
        "configuracaoInicial": "Configuration Initiale",
        "informacoesPrincipais": "Informations Principales",
        "legenda": "Légende",
        "tipoFixacao": "Type de fixation",
        "structureLaqueada": "Structure laquée",
        "painelComponentes": "Composants",
        "procurar": "chercher:",
        "selecioneComponente": "Sélectionnez un composant",
        "botaoAdicionar": "Ajouter",
        "painelBolas": "Boules",
        "selecioneCor": "Sélectionnez la couleur",
        "selecioneAcabamento": "Sélectionnez une finition",
        "selecioneTamanho": "Sélectionnez une taille",
        "adicionarBola": "Ajouter Boule",
        "painelExtra": "Extra",
        "geral": "Général",
        "criar": "Créer",
        "contador": "Compteur",
        "texturas": "Textures",
        "adicionarObservacoes": "Ajouter des Observations",
        "adicionarComponenteExtra": "Ajouter Composant Extra",
        "removerSelecionado": "Supprimer Sélectionné",
        "removerTodos": "Supprimer Tout",
        "adicionarLegenda": "Ajouter Légende",
        "botaoUpdate": "Update",
        "resultadoContagem": "Résultat:",
        "contarElementos": "Compter Éléments (boules pour l'instant)",
        "adicionarPreview": "Ajouter à l'Aperçu",
        "contagemAtualizada": "Comptage mis à jour dans l'aperçu.",
        "realizarContagem": "Veuillez effectuer un comptage avant d'ajouter à l'aperçu.",
        "erroBaseDados": "Erreur: La base de données n'est pas accessible ou est dans un format invalide.",
        "nenhumObjetoSelecionado": "Aucun objet sélectionné",
        "total": "Total de",
        "boule": "boule",
        "boules": "boules",
        "erroContagem": "Erreur lors du comptage:",
        "nome": "nom:",
        "Nome": "Nom",
        "criarGX": "Créer GX (alphabet)",
        "criarPalavraAluminio": "Créer mot en aluminium (en développement)",
        "alfabeto": "Alphabet",
        "alfabetoLabel": "Alphabet:",
        "bioprint": "Bioprint",
        "cor": "Couleur:",
        "tamanho": "Taille:",
        "adicionar": "Ajouter",
        "instrucaoGX": "Écrivez votre phrase GX et ajoutez-la à la légende, pas besoin de remplir le Nom/type. Pour faire un cœur utilisez: <3",
        "mostrarContarElementos": "Afficher Compteur d'Éléments (en développement)",
        "observacoes": "Observations",
        "obs": "Obs:",
        "componenteExtra": "Composant Extra",
        "adicionarALegenda": "Ajouter à la Légende",
        "resultado": "Résultat:",
        "botaoContarElementos": "Compter éléments",
        "adicionarAoPreview": "Ajouter à l'Aperçu",
        "adicionarTexturas": "Ajouter Textures",
        "selecioneTextura": "Sélectionnez une texture",
        "inserirTextura": "Insérer Texture",
        "instrucaoTextura": "Sélectionnez une texture à insérer\nà côté de la légende.",
        "selecioneTexturaAlerta": "Veuillez d'abord sélectionner une texture.",
        "instrucaoAlfabeto": "Écrivez votre phrase GX et ajoutez-la à la légende, pas besoin de remplir le Nom/type. Pour faire un cœur utilisez: <3",
        "erroProcessarBola": "Erreur lors du traitement de la boule : ",
        "erroCombinacaoBola": "Erreur : Combinaison de boule non trouvée dans la base de données.",
        "selecionarCor": "Veuillez sélectionner une couleur, une finition et une taille pour la boule.",
        "quantidadeInvalida": "Veuillez saisir une quantité valide de boules.",
        "preencherCampos": "Veuillez remplir tous les champs correctement.",
        "erroCarregarImagem": "Erreur lors du chargement de l'image : ",
        "imagemNaoEncontrada": "Image non trouvée",
        "erroProcessarAlfabeto": "Erreur lors du traitement de l'alphabet : ",
        "nenhumaLetraValida": "Aucune lettre valide n'a été saisie.",
        "erroCombinacaoComponente": "Erreur : Combinaison de composant non trouvée dans la base de données.",
        "erroGerarLegenda": "Erreur : Impossible de générer le contenu de la légende.",
        "erroProcessarTexturas": "Erreur lors du traitement des textures : ",
        "linha": "Ligne : ",
        "realizarContagemPrimeiro": "Veuillez effectuer un comptage avant d'ajouter à l'aperçu.",
        "idiomaAlterado": "La langue a été changée pour ",
        "reiniciarScript": ".\nVeuillez redémarrer le script pour appliquer les changements.",
        "tituloJanela": "Cartouche",
        "tiposFixacao": {
            "poteau": "poteau",
            "suspendue": "suspendue/transversal",
            "murale": "murale",
            "sansFixation": "sans fixation",
            "auSol": "au sol",
            "speciale": "spéciale"
        },
        "Nome": "Nom",
        "Tipo": "Type",
        "selecioneUnidade": "Sélectionnez une unité",
        "confirmacaoSemTamanho": "Aucune dimension n'a été saisie. Voulez-vous continuer quand même ?",
        "confirmarRemoverTodos": "Êtes-vous sûr de vouloir supprimer tous les éléments ?",
        "selecionarComponenteCompleto": "Veuillez sélectionner un composant, une couleur et une unité.",
        "scriptAtualizado": "Le script est déjà à jour.",
        "atualizacaoSucesso": "Mise à jour terminée ! Veuillez redémarrer le script pour utiliser la nouvelle version.",
        "erroAtualizacao": "Erreur lors de la mise à jour. Veuillez réessayer.",
        "gitNaoInstalado": "Git n'est pas installé sur cet ordinateur.\n\nVeuillez :\n1. Télécharger Git sur https://git-scm.com/downloads\n2. Exécuter l'installateur\n3. Redémarrer l'ordinateur\n4. Réessayer la mise à jour",
        "confirmarComponentes": "Êtes-vous sûr d'avoir ajouté tous les composants dont vous aviez besoin?",
        "legendaAdicionada": "Légende ajoutée avec succès!",
        "quantidadeNaoInformada": "Veuillez indiquer la quantité"
    }
};

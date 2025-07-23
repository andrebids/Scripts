#target illustrator
#targetengine maintarget

/**
 * inicializacao.jsx
 * Domínio: Inicialização e configuração do sistema
 * Responsabilidades:
 *   - Carregar dados da base de dados
 *   - Verificar integridade dos dados carregados
 *   - Configurar variáveis globais do sistema
 *   - Validar ambiente de execução
 *   - Tratamento de erros de inicialização
 */

/**
 * Carrega dados da base de dados do caminho especificado
 */
function carregarDadosBase(caminhoBaseDados) {
    if (logs && logs.logFuncao) {
        logs.logFuncao("carregarDadosBase", "Iniciando carregamento da base de dados");
    }
    
    try {
        // Validação de entrada
        if (!caminhoBaseDados || typeof caminhoBaseDados !== 'string') {
            throw new Error("Caminho da base de dados inválido");
        }
        
        // Verificar se o arquivo existe
        if (!database.arquivoExiste(caminhoBaseDados)) {
            throw new Error("Arquivo da base de dados não encontrado: " + caminhoBaseDados);
        }
        
        // Carregar dados
        var dadosBase = database.lerArquivoJSON(caminhoBaseDados);
        
        if (!dadosBase) {
            throw new Error("Base de dados vazia ou inválida");
        }
        
        if (logs && logs.logFuncao) {
            logs.logFuncao("carregarDadosBase", "Base de dados carregada com sucesso");
        }
        
        return dadosBase;
        
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao carregar base de dados: " + erro.message, "error");
        }
        throw erro;
    }
}

/**
 * Verifica se os dados carregados estão em formato válido
 */
function verificarDadosCarregados(dados) {
    if (logs && logs.logFuncao) {
        logs.logFuncao("verificarDadosCarregados", "Iniciando verificação dos dados");
    }
    
    try {
        // Validação básica
        if (!dados || typeof dados !== 'object') {
            throw new Error("Dados não são um objeto válido");
        }
        
        // Verificar propriedades essenciais
        if (!dados.componentes) {
            throw new Error("Propriedade 'componentes' não encontrada");
        }
        
        // Verificar se componentes é um array
        if (!funcoes.isArray(dados.componentes)) {
            throw new Error("Propriedade 'componentes' não é um array");
        }
        
        // Verificar outras propriedades essenciais
        var propriedadesObrigatorias = ['cores', 'combinacoes', 'bolas'];
        for (var i = 0; i < propriedadesObrigatorias.length; i++) {
            var prop = propriedadesObrigatorias[i];
            if (!dados[prop]) {
                if (logs && logs.adicionarLog) {
                    logs.adicionarLog("Aviso: Propriedade '" + prop + "' não encontrada nos dados", "warning");
                }
            }
        }
        
        if (logs && logs.logFuncao) {
            logs.logFuncao("verificarDadosCarregados", "Dados verificados com sucesso - " + dados.componentes.length + " componentes encontrados");
        }
        
        return true;
        
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro na verificação dos dados: " + erro.message, "error");
        }
        throw erro;
    }
}

/**
 * Configura variáveis globais necessárias para o sistema
 */
function configurarVariaveisGlobais() {
    if (logs && logs.logFuncao) {
        logs.logFuncao("configurarVariaveisGlobais", "Configurando variáveis globais");
    }
    
    try {
        // Inicializar arrays globais se não existirem
        if (typeof itensLegenda === 'undefined') {
            $.global.itensLegenda = [];
        }
        
        if (typeof itensNomes === 'undefined') {
            $.global.itensNomes = [];
        }
        
        // Inicializar última seleção se não existir
        if (typeof ultimaSelecao === 'undefined') {
            $.global.ultimaSelecao = {
                componente: null,
                cor: null,
                unidade: null,
                multiplicador: "1"
            };
        }
        
        if (logs && logs.logFuncao) {
            logs.logFuncao("configurarVariaveisGlobais", "Variáveis globais configuradas com sucesso");
        }
        
        return true;
        
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao configurar variáveis globais: " + erro.message, "error");
        }
        return false;
    }
}

/**
 * Função principal de inicialização do sistema
 */
function inicializarSistema() {
    if (logs && logs.logFuncao) {
        logs.logFuncao("inicializarSistema", "Iniciando inicialização completa do sistema");
    }
    
    try {
        // 1. Inicializar sistema de configuração
        config.inicializarConfiguracao();
        
        // 2. Configurar variáveis globais
        configurarVariaveisGlobais();
        
        // 3. Definir caminho da base de dados
        var caminhoBaseDadosHardcoded = "\\\\192.168.2.22\\Olimpo\\DS\\_BASE DE DADOS\\07. TOOLS\\ILLUSTRATOR\\basededados\\database2.json";
        
        // 4. Carregar dados da base
        var dados = carregarDadosBase(caminhoBaseDadosHardcoded);
        
        // 5. Verificar integridade dos dados
        verificarDadosCarregados(dados);
        
        if (logs && logs.logFuncao) {
            logs.logFuncao("inicializarSistema", "Sistema inicializado com sucesso");
        }
        
        return dados;
        
    } catch (erro) {
        var mensagemErro = "Erro durante a inicialização do sistema: " + erro.message;
        
        if (logs && logs.adicionarLog) {
            logs.adicionarLog(mensagemErro, "error");
        }
        
        // Mostrar alerta para o usuário
        alert("Error Illustrator DB\nO script será encerrado.");
        
        throw erro;
    }
}

// Export global
$.global.inicializacao = {
    carregarDadosBase: carregarDadosBase,
    verificarDadosCarregados: verificarDadosCarregados,
    configurarVariaveisGlobais: configurarVariaveisGlobais,
    inicializarSistema: inicializarSistema
}; 
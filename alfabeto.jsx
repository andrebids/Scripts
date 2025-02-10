// Função para processar o alfabeto e retornar as referências
function processarAlfabeto(alfabeto, corBioprintSelecionada, tamanhoSelecionado) {
    var referenciasUsadas = {};
    
    // Armazenar a palavra digitada
    var palavraDigitada = alfabeto;
    
    var referenciasMapeadas = {
        'A': 'GX214LW', 'B': 'GX215LW', 'C': 'GX216LW', 'D': 'GX217LW',
        'E': 'GX218LW', 'F': 'GX219LW', 'G': 'GX220LW', 'H': 'GX221LW',
        'I': 'GX222LW', 'J': 'GX223LW', 'K': 'GX224LW', 'L': 'GX225LW',
        'M': 'GX226LW', 'N': 'GX227LW', 'O': 'GX228LW', 'P': 'GX229LW',
        'Q': 'GX230LW', 'R': 'GX231LW', 'S': 'GX232LW', 'T': 'GX233LW',
        'U': 'GX234LW', 'V': 'GX235LW', 'W': 'GX236LW', 'X': 'GX237LW',
        'Y': 'GX238LW', 'Z': 'GX239LW', '<3': 'GX240LW', '#': 'GX241LW'
    };
    
    alfabeto = alfabeto.toUpperCase();
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
    
    return {
        referenciasTexto: referenciasTexto,
        palavraDigitada: palavraDigitada
    };
} 
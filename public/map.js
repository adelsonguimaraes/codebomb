// map.js - Lógica de geração do mapa
export const LARGURA_MAPA = 20;
export const ALTURA_MAPA = 20;
export const TAMANHO_BLOCO = 40;
export const CHANCE_BLOCO_DESTRUTIVEL = 0.6;

export const mapa = [];
export let fechamentoNivel = 0; // Nova variável para controlar o nível de fechamento

// Inicializa o mapa apenas com as paredes fixas
for (let y = 0; y < ALTURA_MAPA; y++) {
    mapa[y] = [];
    for (let x = 0; x < LARGURA_MAPA; x++) {
        // Bloco 1: Parede indestrutível nas bordas do mapa e em padrão de xadrez
        if (x === 0 || x === LARGURA_MAPA - 1 || y === 0 || y === ALTURA_MAPA - 1 || (x % 2 === 1 && y % 2 === 1)) {
            mapa[y][x] = 1;
        } else {
            // Bloco 0: Espaços vazios iniciais
            mapa[y][x] = 0;
        }
    }
}

// Encontra uma posição inicial aleatória e segura para o jogador
export function encontrarPosicaoInicialSegura() {
    let x, y;
    let encontrado = false;
    while (!encontrado) {
        // Pega uma posição aleatória, garantindo que não seja nas bordas ou em paredes fixas
        x = Math.floor(Math.random() * (LARGURA_MAPA - 2)) + 1;
        y = Math.floor(Math.random() * (ALTURA_MAPA - 2)) + 1;

        // Checa se a posição é um espaço vazio
        if (mapa[y][x] === 0) {
            encontrado = true;
        }
    }
    return { x, y };
}

// Gera os blocos destrutíveis após as posições dos jogadores serem definidas
export function gerarBlocosDestrutiveis(posicoesJogadores) {
    for (let y = 1; y < ALTURA_MAPA - 1; y++) {
        for (let x = 1; x < LARGURA_MAPA - 1; x++) {
            // Se for um espaço vazio e não for perto de nenhum jogador, pode ser um bloco destrutível
            if (mapa[y][x] === 0) {
                let pertoDeJogador = false;
                posicoesJogadores.forEach(pos => {
                    if (Math.abs(pos.x - x) <= 1 && Math.abs(pos.y - y) <= 1) {
                        pertoDeJogador = true;
                    }
                });

                if (!pertoDeJogador) {
                    mapa[y][x] = Math.random() < CHANCE_BLOCO_DESTRUTIVEL ? 3 : 0;
                }
            }
        }
    }
}

// Função para fechar as bordas da arena em um nível
export function fecharArena() {
    const nivel = fechamentoNivel;
    for (let y = nivel; y < ALTURA_MAPA - nivel; y++) {
        for (let x = nivel; x < LARGURA_MAPA - nivel; x++) {
            if (y === nivel || y === ALTURA_MAPA - 1 - nivel || x === nivel || x === LARGURA_MAPA - 1 - nivel) {
                mapa[y][x] = 1; // Coloca uma parede indestrutível
            }
        }
    }
    fechamentoNivel++;
}

// map.js - Lógica do mapa e blocos
// A importação de 'players' foi removida, pois não é mais exportada por main.js
export const LARGURA_MAPA = 17;
export const ALTURA_MAPA = 13;
export const TAMANHO_BLOCO = 50;

// O mapa agora armazena instâncias da classe Block
export const mapa = [];

// Classe para representar um bloco no mapa
export class Block {
    constructor(x, y, type) {
        this.x = x * TAMANHO_BLOCO;
        this.y = y * TAMANHO_BLOCO;
        this.type = type; // 0: vazio, 1: indestrutível (mapa fixo), 2: indestrutível (fechamento), 3: destrutível
    }
}

// Inicializa a estrutura básica do mapa com paredes e espaços vazios
function inicializarMapa() {
    for (let y = 0; y < ALTURA_MAPA; y++) {
        mapa[y] = [];
        for (let x = 0; x < LARGURA_MAPA; x++) {
            if (x === 0 || x === LARGURA_MAPA - 1 || y === 0 || y === ALTURA_MAPA - 1 || (x % 2 === 0 && y % 2 === 0)) {
                mapa[y][x] = new Block(x, y, 1); // Parede indestrutível do mapa fixo
            } else {
                mapa[y][x] = new Block(x, y, 0); // Espaço vazio
            }
        }
    }
}

inicializarMapa();

export function encontrarPosicaoInicialSegura() {
    for (let y = 1; y < ALTURA_MAPA - 1; y++) {
        for (let x = 1; x < LARGURA_MAPA - 1; x++) {
            if (mapa[y][x].type === 0) {
                return { x, y };
            }
        }
    }
    return { x: 1, y: 1 };
}

export function gerarBlocosDestrutiveis(posicoesIniciais) {
    for (let y = 1; y < ALTURA_MAPA - 1; y++) {
        for (let x = 1; x < LARGURA_MAPA - 1; x++) {
            const isPosicaoInicial = posicoesIniciais.some(p => p.x === x && p.y === y);
            const isPosicaoAoLado = posicoesIniciais.some(p =>
                (p.x === x + 1 && p.y === y) ||
                (p.x === x - 1 && p.y === y) ||
                (p.x === x && p.y === y + 1) ||
                (p.x === x && p.y === y - 1)
            );
            if (mapa[y][x].type === 0 && !isPosicaoInicial && !isPosicaoAoLado && Math.random() < 0.7) {
                mapa[y][x].type = 3; // Bloco destrutível
            }
        }
    }
}

// Fechamento de Arena
export let fechamentoNivel = 0;

export function fecharArena() {
    if (fechamentoNivel >= LARGURA_MAPA / 2) return;

    // Lógica para colocar as novas paredes (tipo 2)
    for (let y = 0; y < ALTURA_MAPA; y++) {
        if (y >= fechamentoNivel && y < ALTURA_MAPA - fechamentoNivel) {
            mapa[y][fechamentoNivel].type = 2; // Novo tipo de bloco para fechamento
            mapa[y][LARGURA_MAPA - 1 - fechamentoNivel].type = 2; // Novo tipo de bloco para fechamento
        }
    }
    for (let x = 0; x < LARGURA_MAPA; x++) {
        if (x >= fechamentoNivel && x < LARGURA_MAPA - fechamentoNivel) {
            mapa[fechamentoNivel][x].type = 2; // Novo tipo de bloco para fechamento
            mapa[ALTURA_MAPA - 1 - fechamentoNivel][x].type = 2; // Novo tipo de bloco para fechamento
        }
    }

    fechamentoNivel++;
}

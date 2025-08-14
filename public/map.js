// map.js - Lógica do mapa e blocos
export const LARGURA_MAPA = 20;
export const ALTURA_MAPA = 20;
export const TAMANHO_BLOCO = 50;

// O mapa agora armazena instâncias da classe Block
export const mapa = [];

// Array para armazenar os power-ups
export const powerups = [];

// Configuração para a distribuição de power-ups
export const POWERUP_CONFIG = {
    explosionRadius: 5, // Quantidade de power-ups de raio de explosão
    speed: 3, // Quantidade de power-ups de velocidade
    bombCount: 3 // Quantidade de power-ups de quantidade de bombas
};

// Classe para representar um bloco no mapa
export class Block {
    constructor(x, y, type) {
        this.x = x * TAMANHO_BLOCO;
        this.y = y * TAMANHO_BLOCO;
        this.type = type; // 0: vazio, 1: indestrutível (mapa fixo), 2: indestrutível (fechamento), 3: destrutível
        this.powerupType = null; // null: sem power-up, 'explosionRadius': power-up de raio de explosão
    }
}

// Inicializa a estrutura básica do mapa com paredes e espaços vazios
export function inicializarMapa() {
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

/**
 * Encontra uma posição inicial segura e aleatória no mapa.
 */
export function encontrarPosicaoInicialSegura() {
    const posicoesVazias = [];
    for (let y = 1; y < ALTURA_MAPA - 1; y++) {
        for (let x = 1; x < LARGURA_MAPA - 1; x++) {
            if (mapa[y][x].type === 0) {
                posicoesVazias.push({ x, y });
            }
        }
    }

    if (posicoesVazias.length > 0) {
        const randomIndex = Math.floor(Math.random() * posicoesVazias.length);
        return posicoesVazias[randomIndex];
    }

    // Retorna uma posição padrão se nenhuma for encontrada, para evitar erros.
    return { x: 1, y: 1 };
}

// Função refatorada para gerar blocos destrutíveis e power-ups de forma mais robusta
export function gerarBlocosDestrutiveis(posicoesIniciais) {
    const CHANCE_DESTRUTIVEL = 0.7;
    const posicoesElegiveis = [];

    // Primeira passagem: Identifica todas as posições elegíveis para blocos destrutíveis/power-ups
    for (let y = 1; y < ALTURA_MAPA - 1; y++) {
        for (let x = 1; x < LARGURA_MAPA - 1; x++) {
            const isPosicaoInicial = posicoesIniciais.some(p => p.x === x && p.y === y);
            const isPosicaoAoLado = posicoesIniciais.some(p =>
                (p.x === x + 1 && p.y === y) ||
                (p.x === x - 1 && p.y === y) ||
                (p.x === x && p.y === y + 1) ||
                (p.x === x && p.y === y - 1)
            );
            if (mapa[y][x].type === 0 && !isPosicaoInicial && !isPosicaoAoLado) {
                posicoesElegiveis.push({ x, y });
            }
        }
    }

    // Segunda passagem: Distribui os power-ups nas posições elegíveis
    let powerupCount = { ...POWERUP_CONFIG };
    for (let type in powerupCount) {
        for (let i = 0; i < powerupCount[type]; i++) {
            if (posicoesElegiveis.length > 0) {
                const randomIndex = Math.floor(Math.random() * posicoesElegiveis.length);
                const { x, y } = posicoesElegiveis.splice(randomIndex, 1)[0];
                mapa[y][x].powerupType = type;
            }
        }
    }

    // Terceira passagem: Preenche o resto das posições elegíveis com blocos destrutíveis
    posicoesElegiveis.forEach(({ x, y }) => {
        if (Math.random() < CHANCE_DESTRUTIVEL) {
            mapa[y][x].type = 3; // Bloco destrutível
        }
    });

    // Quarta passagem: Garante que os blocos com power-up também sejam destrutíveis
    for (let y = 1; y < ALTURA_MAPA - 1; y++) {
        for (let x = 1; x < LARGURA_MAPA - 1; x++) {
            if (mapa[y][x].powerupType !== null) {
                mapa[y][x].type = 3;
            }
        }
    }
}

// NOVO: Função para encontrar posições seguras para inimigos
export function encontrarPosicoesInimigos(numeroInimigos, posicoesJogadores) {
    const posicoesInimigos = [];
    const posicoesElegiveis = [];

    // Encontra todas as posições vazias que não estão perto dos jogadores
    for (let y = 1; y < ALTURA_MAPA - 1; y++) {
        for (let x = 1; x < LARGURA_MAPA - 1; x++) {
            const isPosicaoInicial = posicoesJogadores.some(p => p.x === x && p.y === y);
            const isPosicaoAoLado = posicoesJogadores.some(p =>
                (p.x === x + 1 && p.y === y) ||
                (p.x === x - 1 && p.y === y) ||
                (p.x === x && p.y === y + 1) ||
                (p.x === x && p.y === y - 1)
            );

            // A posição é elegível se for um espaço vazio e não estiver perto de um jogador
            if (mapa[y][x].type === 0 && !isPosicaoInicial && !isPosicaoAoLado) {
                posicoesElegiveis.push({ x, y });
            }
        }
    }

    // Sortear posições para os inimigos
    for (let i = 0; i < numeroInimigos && posicoesElegiveis.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * posicoesElegiveis.length);
        posicoesInimigos.push(posicoesElegiveis.splice(randomIndex, 1)[0]);
    }

    return posicoesInimigos;
}

// Fechamento de Arena - Agora retorna os blocos de fechamento para que game.js possa lidar com a destruição de entidades.
export let fechamentoNivel = 0;

export function fecharArena() {
    const novosFechamentos = [];
    if (fechamentoNivel >= LARGURA_MAPA / 2) return novosFechamentos;

    // Lógica para colocar as novas paredes (tipo 2)
    // Fechamento da parede de cima e de baixo
    for (let x = fechamentoNivel; x < LARGURA_MAPA - fechamentoNivel; x++) {
        // Parede de cima
        mapa[fechamentoNivel][x].type = 2;
        novosFechamentos.push({ x: x, y: fechamentoNivel });

        // Parede de baixo
        mapa[ALTURA_MAPA - 1 - fechamentoNivel][x].type = 2;
        novosFechamentos.push({ x: x, y: ALTURA_MAPA - 1 - fechamentoNivel });
    }

    // Fechamento das paredes laterais, excluindo os cantos que já foram fechados
    for (let y = fechamentoNivel + 1; y < ALTURA_MAPA - 1 - fechamentoNivel; y++) {
        // Parede da esquerda
        mapa[y][fechamentoNivel].type = 2;
        novosFechamentos.push({ x: fechamentoNivel, y: y });

        // Parede da direita
        mapa[y][LARGURA_MAPA - 1 - fechamentoNivel].type = 2;
        novosFechamentos.push({ x: LARGURA_MAPA - 1 - fechamentoNivel, y: y });
    }

    fechamentoNivel++;

    // Retorna as coordenadas dos novos blocos de fechamento
    return novosFechamentos;
}

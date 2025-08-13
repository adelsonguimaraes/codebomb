// A taxa de chance de uma parede destrutível aparecer.
const CHANCE_PAREDE_DESTRUTIVEL = 0.4;
const LARGURA = 30;
const ALTURA = 30;

// Exporta uma função que gera um mapa aleatório
function gerarMapa() {
    const mapa = [];

    for (let y = 0; y < ALTURA; y++) {
        mapa[y] = new Array(LARGURA).fill(0);
    }

    for (let x = 0; x < LARGURA; x++) {
        mapa[0][x] = 1; // Borda superior
        mapa[ALTURA - 1][x] = 1; // Borda inferior
    }
    for (let y = 0; y < ALTURA; y++) {
        mapa[y][0] = 1; // Borda esquerda
        mapa[y][LARGURA - 1] = 1; // Borda direita
    }

    // Preenche o mapa com paredes destrutíveis
    for (let y = 1; y < ALTURA - 1; y++) {
        for (let x = 1; x < LARGURA - 1; x++) {
            // Garante que não haja paredes nas posições iniciais dos jogadores
            if ((x < 3 && y < 3) || (x > LARGURA - 4 && y > ALTURA - 4)) {
                continue;
            }

            if (Math.random() < CHANCE_PAREDE_DESTRUTIVEL) {
                mapa[y][x] = 2; // Coloca uma parede destrutível
            }
        }
    }

    return mapa;
}

// Exporta as funções e variáveis que queremos que outros módulos acessem
module.exports = {
    gerarMapa,
    LARGURA,
    ALTURA,
};
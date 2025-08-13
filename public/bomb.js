// bomb.js - Lógica de bombas e explosões
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa, Block } from './map.js';
import { players } from './main.js'; // Importando a lista de jogadores

export const TEMPO_BOMBA = 120; // Tempo em frames antes da explosão
export const TAMANHO_EXPLOSAO = 1; // Alcance da explosão (1 bloco para cada lado)
export const bombas = [];

// Classe Explosion para encapsular a lógica de cada explosão
export class Explosion {
    constructor(x, y) {
        this.x = x * TAMANHO_BLOCO;
        this.y = y * TAMANHO_BLOCO;
        this.timer = 20; // Tempo de vida da explosão em frames
    }

    atualizar() {
        this.timer--;
        // Retorna true se a explosão deve ser removida
        return this.timer <= 0;
    }
}

export const explosoes = [];

// A classe Bomb agora encapsula as propriedades e o comportamento de uma bomba.
export class Bomb {
    constructor(player) {
        this.gridX = Math.floor(player.x / TAMANHO_BLOCO);
        this.gridY = Math.floor(player.y / TAMANHO_BLOCO);
        this.x = this.gridX * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
        this.y = this.gridY * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
        this.timer = TEMPO_BOMBA;
        this.podePassar = true;
        this.colocadorId = player.id;

        // Incrementa a contagem de bombas ativas do jogador que plantou
        const playerQuePlantou = players.find(p => p.id === this.colocadorId);
        if (playerQuePlantou) {
            playerQuePlantou.bombasAtivas++;
        }
    }

    // Método para atualizar o estado da bomba (diminuir o timer)
    atualizar() {
        this.timer--;
        if (this.timer <= 0) {
            this.explodir();
            return true; // Retorna true para indicar que a bomba deve ser removida
        }
        return false;
    }

    // Método para lidar com a explosão da bomba
    explodir() {
        // Encontra o jogador que plantou a bomba e decrementa a contagem
        const playerQuePlantou = players.find(p => p.id === this.colocadorId);
        if (playerQuePlantou) {
            playerQuePlantou.bombasAtivas--;
        }

        const areaExplosao = [
            { x: this.gridX, y: this.gridY },
            { x: this.gridX, y: this.gridY - 1 },
            { x: this.gridX, y: this.gridY + 1 },
            { x: this.gridX - 1, y: this.gridY },
            { x: this.gridX + 1, y: this.gridY },
        ];

        areaExplosao.forEach(pos => {
            if (pos.x >= 0 && pos.x < LARGURA_MAPA && pos.y >= 0 && pos.y < ALTURA_MAPA) {
                // Checa se o bloco é destrutível (type 3)
                const bloco = mapa[pos.y][pos.x];
                if (bloco instanceof Block && bloco.type === 3) {
                    bloco.type = 0; // Torna o bloco vazio
                }
                // Cria uma nova instância da classe Explosion
                explosoes.push(new Explosion(pos.x, pos.y));
            }
        });
    }
}

export function plantarBomba(player) {
    const gridX = Math.floor(player.x / TAMANHO_BLOCO);
    const gridY = Math.floor(player.y / TAMANHO_BLOCO);

    // Verifica se já existe uma bomba na mesma posição
    const bombaExistente = bombas.some(b => b.gridX === gridX && b.gridY === gridY);
    if (bombaExistente) return;

    // Cria uma nova instância da classe Bomb e a adiciona ao array
    bombas.push(new Bomb(player));
}

export function atualizarBombas() {
    for (let i = bombas.length - 1; i >= 0; i--) {
        // Chama o método atualizar() da bomba. Se retornar true, a bomba deve ser removida.
        if (bombas[i].atualizar()) {
            bombas.splice(i, 1);
        }
    }
}

export function atualizarExplosoes() {
    for (let i = explosoes.length - 1; i >= 0; i--) {
        // Chama o método atualizar() da explosão. Se retornar true, a explosão deve ser removida.
        if (explosoes[i].atualizar()) {
            explosoes.splice(i, 1);
        }
    }
}

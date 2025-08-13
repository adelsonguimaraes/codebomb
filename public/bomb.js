// bomb.js - Lógica de bombas e explosões
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa } from './map.js';
import { players } from './main.js'; // Importando a lista de jogadores

export const TEMPO_BOMBA = 120; // Tempo em frames antes da explosão
export const TAMANHO_EXPLOSAO = 1; // Alcance da explosão (1 bloco para cada lado)
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
                if (mapa[pos.y][pos.x] === 3) {
                    mapa[pos.y][pos.x] = 0;
                }
                explosoes.push({
                    x: pos.x * TAMANHO_BLOCO,
                    y: pos.y * TAMANHO_BLOCO,
                    timer: 20,
                });
            }
        });
    }
}

export const bombas = [];

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
        explosoes[i].timer--;
        if (explosoes[i].timer <= 0) {
            explosoes.splice(i, 1);
        }
    }
}

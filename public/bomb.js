// bomb.js - Lógica de bombas e explosões
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa, Block, powerups } from './map.js';
import { ExplosionRadiusPowerup, SpeedPowerup, BombCountPowerup } from './powerup.js';

export const TEMPO_BOMBA = 120; // Tempo em frames antes da explosão
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

        // CORREÇÃO: Armazena a referência direta ao objeto player e seu raio de explosão
        this.playerRef = player;
        this.playerRef.bombasAtivas++;
        this.explosionRadius = player.explosionRadius;
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
        // CORREÇÃO: Usa a referência do jogador armazenada na classe
        this.playerRef.bombasAtivas--;

        const areaExplosao = [
            { x: this.gridX, y: this.gridY },
            // Lógica para explosão em cruz usando o raio
        ];

        // Expansão para cima
        for (let i = 1; i <= this.explosionRadius; i++) {
            const y = this.gridY - i;
            if (y >= 0 && mapa[y][this.gridX] instanceof Block && mapa[y][this.gridX].type !== 1 && mapa[y][this.gridX].type !== 2) {
                areaExplosao.push({ x: this.gridX, y: y });
                if (mapa[y][this.gridX].type === 3) break;
            } else {
                break;
            }
        }
        // Expansão para baixo
        for (let i = 1; i <= this.explosionRadius; i++) {
            const y = this.gridY + i;
            if (y < ALTURA_MAPA && mapa[y][this.gridX] instanceof Block && mapa[y][this.gridX].type !== 1 && mapa[y][this.gridX].type !== 2) {
                areaExplosao.push({ x: this.gridX, y: y });
                if (mapa[y][this.gridX].type === 3) break;
            } else {
                break;
            }
        }
        // Expansão para a esquerda
        for (let i = 1; i <= this.explosionRadius; i++) {
            const x = this.gridX - i;
            if (x >= 0 && mapa[this.gridY][x] instanceof Block && mapa[this.gridY][x].type !== 1 && mapa[this.gridY][x].type !== 2) {
                areaExplosao.push({ x: x, y: this.gridY });
                if (mapa[this.gridY][x].type === 3) break;
            } else {
                break;
            }
        }
        // Expansão para a direita
        for (let i = 1; i <= this.explosionRadius; i++) {
            const x = this.gridX + i;
            if (x < LARGURA_MAPA && mapa[this.gridY][x] instanceof Block && mapa[this.gridY][x].type !== 1 && mapa[this.gridY][x].type !== 2) {
                areaExplosao.push({ x: x, y: this.gridY });
                if (mapa[this.gridY][x].type === 3) break;
            } else {
                break;
            }
        }


        areaExplosao.forEach(pos => {
            if (pos.x >= 0 && pos.x < LARGURA_MAPA && pos.y >= 0 && pos.y < ALTURA_MAPA) {
                const bloco = mapa[pos.y][pos.x];
                // Checa se o bloco é destrutível (type 3)
                if (bloco instanceof Block && bloco.type === 3) {
                    bloco.type = 0; // Torna o bloco vazio

                    // Lógica para criar o power-up correto
                    if (bloco.powerupType === 'explosionRadius') {
                        powerups.push(new ExplosionRadiusPowerup(pos.x, pos.y));
                    } else if (bloco.powerupType === 'speed') {
                        powerups.push(new SpeedPowerup(pos.x, pos.y));
                    } else if (bloco.powerupType === 'bombCount') { // NOVO: Lógica para o power-up de quantidade de bombas
                        powerups.push(new BombCountPowerup(pos.x, pos.y));
                    }
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

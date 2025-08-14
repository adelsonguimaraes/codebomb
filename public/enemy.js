// enemy.js - Classe para inimigos NPC
import { TAMANHO_BLOCO, LARGURA_MAPA, ALTURA_MAPA, mapa, Block } from './map.js';
import { bombas } from './bomb.js';
import { Player } from './player.js'; // NOVO: Importa a classe Player

const DIRECTIONS = ['up', 'down', 'left', 'right'];

export class Enemy {
    constructor(gridX, gridY, player) { // MODIFICADO: Recebe uma referência ao jogador
        this.gridX = gridX;
        this.gridY = gridY;
        // Posição inicial centralizada no bloco
        this.x = gridX * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
        this.y = gridY * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
        this.tamanho = TAMANHO_BLOCO * 0.7; // Um pouco menor que o jogador
        this.velocidade = 1; // Velocidade um pouco menor que o jogador
        this.direction = null; // Começa sem direção definida
        this.targetX = this.x;
        this.targetY = this.y;
        this.player = player; // NOVO: Armazena a referência do jogador
        this.isIrritated = false; // NOVO: Flag para o estado de irritação
    }

    // Método para verificar se o inimigo pode se mover para uma direção específica
    podeMoverPara(direction) {
        let nextGridX = this.gridX;
        let nextGridY = this.gridY;

        switch (direction) {
            case 'up':
                nextGridY--;
                break;
            case 'down':
                nextGridY++;
                break;
            case 'left':
                nextGridX--;
                break;
            case 'right':
                nextGridX++;
                break;
        }

        // Verifica se está fora dos limites do mapa
        if (nextGridX < 0 || nextGridX >= LARGURA_MAPA || nextGridY < 0 || nextGridY >= ALTURA_MAPA) {
            return false;
        }

        // Verifica se há um bloco na próxima posição
        const bloco = mapa[nextGridY][nextGridX];
        if (bloco instanceof Block && (bloco.type === 1 || bloco.type === 2 || bloco.type === 3)) {
            return false;
        }

        // Verifica se há uma bomba na próxima posição
        const temBomba = bombas.find(b => b.gridX === nextGridX && b.gridY === nextGridY);
        if (temBomba) {
            return false;
        }

        return true;
    }

    // Lógica principal de movimento e IA
    mover() {
        // Calcula a distância do inimigo ao jogador em blocos
        const distGridX = Math.abs(Math.floor(this.player.x / TAMANHO_BLOCO) - this.gridX);
        const distGridY = Math.abs(Math.floor(this.player.y / TAMANHO_BLOCO) - this.gridY);
        const playerDistanceBlocks = distGridX + distGridY;

        // NOVO: Lógica de irritação
        if (playerDistanceBlocks <= 2) {
            this.isIrritated = true;
        }
        if (playerDistanceBlocks >= 3) {
            this.isIrritated = false;
        }

        // Se o inimigo atingiu o ponto central do bloco atual, ele toma uma nova decisão
        if (this.x === this.targetX && this.y === this.targetY) {
            this.direction = null;

            if (this.isIrritated) {
                // Lógica de perseguição: move em direção ao jogador
                const playerGridX = Math.floor(this.player.x / TAMANHO_BLOCO);
                const playerGridY = Math.floor(this.player.y / TAMANHO_BLOCO);

                let direcaoX = (playerGridX > this.gridX) ? 'right' : (playerGridX < this.gridX) ? 'left' : null;
                let direcaoY = (playerGridY > this.gridY) ? 'down' : (playerGridY < this.gridY) ? 'up' : null;

                const direcoesPossiveis = [];
                if (direcaoX && this.podeMoverPara(direcaoX)) {
                    direcoesPossiveis.push(direcaoX);
                }
                if (direcaoY && this.podeMoverPara(direcaoY)) {
                    direcoesPossiveis.push(direcaoY);
                }

                // Se não puder se mover em direção ao jogador, tenta uma direção aleatória
                if (direcoesPossiveis.length > 0) {
                    this.direction = direcoesPossiveis[Math.floor(Math.random() * direcoesPossiveis.length)];
                } else {
                    const validDirections = DIRECTIONS.filter(dir => this.podeMoverPara(dir));
                    if (validDirections.length > 0) {
                        this.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
                    }
                }
            } else {
                // Lógica de movimento aleatório
                const validDirections = DIRECTIONS.filter(dir => this.podeMoverPara(dir));
                if (validDirections.length > 0) {
                    this.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
                }
            }

            // Calcula a nova posição alvo (centro do próximo bloco)
            switch (this.direction) {
                case 'up':
                    this.targetY = (this.gridY - 1) * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
                    break;
                case 'down':
                    this.targetY = (this.gridY + 1) * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
                    break;
                case 'left':
                    this.targetX = (this.gridX - 1) * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
                    break;
                case 'right':
                    this.targetX = (this.gridX + 1) * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
                    break;
            }
        }

        // Move-se em direção ao alvo
        if (this.direction) {
            if (this.x < this.targetX) {
                this.x = Math.min(this.x + this.velocidade, this.targetX);
            } else if (this.x > this.targetX) {
                this.x = Math.max(this.x - this.velocidade, this.targetX);
            }

            if (this.y < this.targetY) {
                this.y = Math.min(this.y + this.velocidade, this.targetY);
            } else if (this.y > this.targetY) {
                this.y = Math.max(this.y - this.velocidade, this.targetY);
            }

            // Atualiza a posição do grid
            this.gridX = Math.floor(this.x / TAMANHO_BLOCO);
            this.gridY = Math.floor(this.y / TAMANHO_BLOCO);
        }
    }
}

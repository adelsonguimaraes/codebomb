// enemy.js - Classe para inimigos NPC
import { TAMANHO_BLOCO, LARGURA_MAPA, ALTURA_MAPA, mapa, Block } from './map.js';
import { bombas } from './bomb.js';
import { Player } from './player.js';

const DIRECTIONS = ['up', 'down', 'left', 'right'];

export class Enemy {
    // VARIÁVEL CONFIGURÁVEL: Vida inicial do inimigo
    static initialLife = 2;

    constructor(gridX, gridY, player) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.x = gridX * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
        this.y = gridY * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
        this.tamanho = TAMANHO_BLOCO * 0.7;
        this.velocidade = 1;
        this.direction = null;
        this.targetX = this.x;
        this.targetY = this.y;
        this.player = player;
        this.isIrritated = false;
        // NOVO: Variáveis para a nova lógica de vida e atordoamento
        this.life = Enemy.initialLife;
        this.isStunned = false;
        this.stunTimer = 0;
        this.isDamaged = false; // NOVO: Flag para o estado de dano
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

    // NOVO: Método para o inimigo sofrer dano
    takeDamage() {
        if (!this.isStunned) {
            this.life--;
            this.isDamaged = true;
            this.isStunned = true;
            this.stunTimer = 120; // 2 segundos * 60 FPS

            // Retorna true se o inimigo foi derrotado
            return this.life <= 0;
        }
        return false;
    }

    // Lógica principal de movimento e IA
    mover() {
        // NOVO: Se o inimigo estiver atordoado, ele não se move
        if (this.isStunned) {
            this.stunTimer--;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
                this.isDamaged = false;
            }
            return;
        }

        // Calcula a distância do inimigo ao jogador em blocos
        const distGridX = Math.abs(Math.floor(this.player.x / TAMANHO_BLOCO) - this.gridX);
        const distGridY = Math.abs(Math.floor(this.player.y / TAMANHO_BLOCO) - this.gridY);
        const playerDistanceBlocks = distGridX + distGridY;

        // Lógica de irritação
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

    // Método para desenhar o inimigo e o seu rosto
    desenhar(ctx) {
        // NOVO: Apenas desenha se o inimigo não estiver atordoado e piscando
        if (this.isStunned && (Math.floor(this.stunTimer / 10) % 2 === 0)) {
            return; // Não desenha para simular o piscar
        }

        // Desenha o corpo do inimigo (círculo)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.tamanho / 2, 0, Math.PI * 2, false);
        ctx.fillStyle = this.isIrritated ? '#c0392b' : '#e74c3c'; // Cor muda para indicar irritação
        ctx.fill();

        // Desenha o rosto do inimigo
        ctx.fillStyle = '#ecf0f1';
        ctx.font = `${this.tamanho * 0.4}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // O rosto muda de acordo com o estado de irritação ou dano
        let face;
        if (this.isDamaged) {
            face = '@c@'; // Rosto de dano
        } else if (this.isIrritated) {
            face = 'Ù_Ú'; // Rosto de irritação
        } else {
            face = '-u-'; // Rosto padrão
        }
        ctx.fillText(face, this.x, this.y);
    }
}

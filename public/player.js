// player.js - Lógica do jogador e input
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa, Block } from './map.js';
import { bombas, Bomb } from './bomb.js';
import { GameManager } from './game.js';

// NOVO: Constantes para configurar a vida e a invencibilidade
const VIDAS_INICIAIS = 2; // Quantidade de vidas do jogador
const TEMPO_INVENCIBILIDADE = 1.5 * 60; // 1.5 segundos de invencibilidade (em frames, 60 fps)

export const teclasPressionadas = {};

window.addEventListener('keydown', (e) => {
    teclasPressionadas[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    teclasPressionadas[e.key.toLowerCase()] = false;
});

export class Player {
    constructor(id, x, y) {
        this.id = id;
        this.gridX = Math.floor(x / TAMANHO_BLOCO); // Posição inicial no grid X
        this.gridY = Math.floor(y / TAMANHO_BLOCO); // Posição inicial no grid Y
        this.x = this.gridX * TAMANHO_BLOCO + TAMANHO_BLOCO / 2; // Posição centralizada no bloco
        this.y = this.gridY * TAMANHO_BLOCO + TAMANHO_BLOCO / 2; // Posição centralizada no bloco
        this.targetX = this.x; // Ponto de destino X inicial
        this.targetY = this.y; // Ponto de destino Y inicial
        this.tamanho = TAMANHO_BLOCO * 0.8;
        this.velocidade = 2; // Agora é uma propriedade da instância
        this.maxBombas = 1;
        this.bombasAtivas = 0;
        this.explosionRadius = 1;

        // Propriedades de vida e dano
        this.vidas = VIDAS_INICIAIS;
        this.invincibilityTimer = 0; // Temporizador em frames
        this.isAtivo = true; // Estado de vida do jogador
    }

    // Método para o jogador tomar dano
    takeDamage() {
        // Se o jogador já está invencível ou inativo, não toma mais dano
        if (this.invincibilityTimer > 0 || !this.isAtivo) {
            return false;
        }

        // CORREÇÃO: A mensagem de log agora está aqui, garantindo que seja
        // exibida apenas uma vez quando o dano é realmente aplicado.
        this.vidas--;

        // this.logEvent(`Jogador ${player.id}  dano de uma explosão! Vidas restantes: ${player.vidas}`);

        this.invincibilityTimer = TEMPO_INVENCIBILIDADE;

        if (this.vidas <= 0) {
            this.isAtivo = false;
            return true; // Retorna true se o jogador morreu
        }

        return false; // Retorna false se o jogador ainda está vivo
    }

    // Método para atualizar o estado do jogador a cada frame
    update() {
        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer--;
        }
    }

    // O método agora verifica se o novo bloco no grid é válido
    podeMover(novoGridX, novoGridY) {
        if (novoGridX < 0 || novoGridX >= LARGURA_MAPA || novoGridY < 0 || novoGridY >= ALTURA_MAPA) {
            return false;
        }

        const bloco = mapa[novoGridY][novoGridX];
        if (bloco instanceof Block && (bloco.type === 1 || bloco.type === 2 || bloco.type === 3)) {
            return false;
        }

        const temBomba = bombas.find(b => b.gridX === novoGridX && b.gridY === novoGridY);
        if (temBomba) {
            return false;
        }

        return true;
    }

    mover() {
        // O jogador só para de se mover se estiver inativo (morto).
        if (!this.isAtivo) {
            this.targetX = this.x;
            this.targetY = this.y;
            return;
        }

        const playerGridXAnterior = this.gridX;
        const playerGridYAnterior = this.gridY;

        // Verifica se o jogador já chegou ao seu alvo atual
        if (this.x === this.targetX && this.y === this.targetY) {
            let novoTargetGridX = this.gridX;
            let novoTargetGridY = this.gridY;

            // Pega o input para determinar a nova direção
            if (teclasPressionadas['arrowup'] || teclasPressionadas['w']) {
                novoTargetGridY--;
            } else if (teclasPressionadas['arrowdown'] || teclasPressionadas['s']) {
                novoTargetGridY++;
            } else if (teclasPressionadas['arrowleft'] || teclasPressionadas['a']) {
                novoTargetGridX--;
            } else if (teclasPressionadas['arrowright'] || teclasPressionadas['d']) {
                novoTargetGridX++;
            }

            // Se o novo destino for diferente da posição atual e for um movimento válido
            if ((novoTargetGridX !== this.gridX || novoTargetGridY !== this.gridY) && this.podeMover(novoTargetGridX, novoTargetGridY)) {
                // Atualiza o ponto de destino e a posição do grid
                this.targetX = novoTargetGridX * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
                this.targetY = novoTargetGridY * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
                this.gridX = novoTargetGridX;
                this.gridY = novoTargetGridY;
            }
        }

        // Move o jogador em direção ao alvo com a velocidade definida
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

        // Lógica para a bomba "podePassar"
        // Se o jogador se moveu para um novo bloco
        if (this.gridX !== playerGridXAnterior || this.gridY !== playerGridYAnterior) {
            // A bomba que estava no bloco anterior agora não pode ser atravessada
            const bomba = bombas.find(b => b.gridX === playerGridXAnterior && b.gridY === playerGridYAnterior && b.playerRef.id === this.id);
            if (bomba) {
                bomba.podePassar = false;
            }
        }
    }

    aumentarRaioExplosao() {
        this.explosionRadius++;
    }

    aumentarVelocidade() {
        this.velocidade++;
    }

    aumentarContadorBombas() {
        this.maxBombas += 1;
    }
}

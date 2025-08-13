// powerup.js - Classes de Power-ups e Blocos do Mapa
import { TAMANHO_BLOCO } from './map.js';

// Classe para representar um bloco no mapa
export class Block {
    constructor(x, y, type) {
        this.x = x * TAMANHO_BLOCO;
        this.y = y * TAMANHO_BLOCO;
        this.type = type;
        this.powerupType = null; // Tipo de power-up escondido no bloco
    }
}

// Classe base para todos os power-ups
export class Powerup {
    constructor(x, y, type) {
        this.x = x * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
        this.y = y * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
        this.gridX = x;
        this.gridY = y;
        this.type = type;
        this.collected = false;
    }
}

// Power-up de aumento de raio de explosão
export class ExplosionRadiusPowerup extends Powerup {
    constructor(x, y) {
        super(x, y, 'explosionRadius');
    }

    applyEffect(player) {
        player.aumentarRaioExplosao();
    }
}

// Power-up de aumento de velocidade
export class SpeedPowerup extends Powerup {
    constructor(x, y) {
        super(x, y, 'speed');
    }

    applyEffect(player) {
        player.aumentarVelocidade();
    }
}

// NOVO: Power-up de aumento de quantidade de bombas
export class BombCountPowerup extends Powerup {
    constructor(x, y) {
        super(x, y, 'bombCount');
    }

    applyEffect(player) {
        player.aumentarContadorBombas();
    }
}

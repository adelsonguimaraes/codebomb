// game.js - Classe de gerenciamento do jogo
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa, encontrarPosicaoInicialSegura, gerarBlocosDestrutiveis, fecharArena, fechamentoNivel, powerups, inicializarMapa, encontrarPosicoesInimigos } from './map.js';
import { Player, teclasPressionadas } from './player.js';
import { bombas, explosoes, atualizarBombas, atualizarExplosoes, plantarBomba } from './bomb.js';
import { desenharTudo } from './render.js';
import { Enemy } from './enemy.js';
import { updateLivesDisplay } from './ui.js';

// Constantes e variáveis de estado do jogo
const ZOOM_NIVEL = 1.5;
const CAMERA_SEGUIR_JOGADOR = true;
const TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS = 10;
const TEMPO_PISCAR_SEGUNDOS = 5;
const TAMANHO_MINIMO_ARENA = 7;
const TEMPO_TOTAL_SEGUNDOS = 120;

// Configuração dos inimigos
const NUMBER_OF_ENEMIES = 3;

const DEATH_REASONS = {
    explosion: "foi derrotado por uma explosão!",
    enemy: "foi derrotado por um inimigo!",
    smash: "foi esmagado pelo fechamento da arena!"
};

export class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.players = [];
        this.enemies = [];
        this.fechamentoAtivo = false;
        this.fechamentoTimer = TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS * 60;
        this.areaPiscaTimer = -1;
        this.tempoRestante = TEMPO_TOTAL_SEGUNDOS * 60;
        this.hudElement = document.getElementById('timer-display');
        this.eventLogElement = document.getElementById('event-log');
        this.maxLogMessages = 5;
        this.fechamentoAvisoFeito = false;
    }

    iniciarJogo() {
        this._resetGameState();
        const posicoesEntidades = this._setupPlayers();
        this._setupEnemies(posicoesEntidades);
        gerarBlocosDestrutiveis(posicoesEntidades);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.logEvent('Jogo iniciado! Prepare-se para a batalha!');
    }

    _resetGameState() {
        inicializarMapa();
        this.fechamentoAtivo = false;
        this.fechamentoTimer = TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS * 60;
        this.areaPiscaTimer = -1;
        this.tempoRestante = TEMPO_TOTAL_SEGUNDOS * 60;
        this.fechamentoAvisoFeito = false;
        this.players = [];
        this.enemies = [];
    }

    _setupPlayers() {
        const posicaoInicial = encontrarPosicaoInicialSegura();
        const player1 = new Player(1, posicaoInicial.x * TAMANHO_BLOCO, posicaoInicial.y * TAMANHO_BLOCO);
        this.players.push(player1);
        updateLivesDisplay(player1.vidas);
        return [{ x: posicaoInicial.x, y: posicaoInicial.y }];
    }

    _setupEnemies(posicoesJogadores) {
        if (NUMBER_OF_ENEMIES > 0) {
            const posicoesInimigos = encontrarPosicoesInimigos(NUMBER_OF_ENEMIES, posicoesJogadores);
            posicoesInimigos.forEach(enemyPos => {
                const enemy = new Enemy(enemyPos.x, enemyPos.y, this.players[0]);
                this.enemies.push(enemy);
                posicoesJogadores.push(enemyPos);
            });
        }
    }

    logEvent(message) {
        if (this.eventLogElement) {
            Array.from(this.eventLogElement.children).forEach(p => {
                p.classList.add('old-message');
            });
            const messageElement = document.createElement('p');
            messageElement.textContent = message;
            this.eventLogElement.prepend(messageElement);
            while (this.eventLogElement.children.length > this.maxLogMessages) {
                this.eventLogElement.removeChild(this.eventLogElement.lastChild);
            }
        }
    }

    verificarDestruicaoPowerups() {
        for (let i = powerups.length - 1; i >= 0; i--) {
            const powerup = powerups[i];
            const powerupGridX = Math.floor(powerup.x / TAMANHO_BLOCO);
            const powerupGridY = Math.floor(powerup.y / TAMANHO_BLOCO);

            const atingido = explosoes.some(exp => {
                if (Math.floor(exp.x / TAMANHO_BLOCO) === powerupGridX && Math.floor(exp.y / TAMANHO_BLOCO) === powerupGridY && powerup.immunityTimer <= 0) {
                    return true;
                }
                return false;
            });

            if (atingido) {
                this.logEvent(`Power-up ${powerup.type} foi destruído por uma explosão!`);
                powerups.splice(i, 1);
            }
        }
    }

    destruirEntidadesPorFechamento(novosFechamentos) {
        if (!novosFechamentos || novosFechamentos.length === 0) return;
        this.players.forEach(player => {
            const playerGridX = player.gridX;
            const playerGridY = player.gridY;
            if (novosFechamentos.some(f => f.x === playerGridX && f.y === playerGridY)) {
                this.logEvent(`Jogador ${player.id} ${DEATH_REASONS.smash}`);
                player.takeDamage();
                player.takeDamage();
                player.takeDamage();
            }
        });
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const enemyGridX = enemy.gridX;
            const enemyGridY = enemy.gridY;
            if (novosFechamentos.some(f => f.x === enemyGridX && f.y === enemyGridY)) {
                this.logEvent(`Um inimigo foi esmagado pelo fechamento da arena!`);
                this.enemies.splice(i, 1);
            }
        }
        for (let i = powerups.length - 1; i >= 0; i--) {
            const powerup = powerups[i];
            const powerupGridX = Math.floor(powerup.x / TAMANHO_BLOCO);
            const powerupGridY = Math.floor(powerup.y / TAMANHO_BLOCO);
            if (novosFechamentos.some(f => f.x === powerupGridX && f.y === powerupGridY)) {
                this.logEvent(`Um power-up foi esmagado pelo fechamento da arena!`);
                powerups.splice(i, 1);
            }
        }
    }

    _verificarDano() {
        this.players.forEach(player => {
            if (!player.isAtivo) return;
            const playerGridX = player.gridX;
            const playerGridY = player.gridY;
            const atingidoPorExplosao = explosoes.some(exp => {
                return (Math.floor(exp.x / TAMANHO_BLOCO) === playerGridX && Math.floor(exp.y / TAMANHO_BLOCO) === playerGridY);
            });
            if (atingidoPorExplosao) {
                player.takeDamage();
            }
            this.enemies.forEach(enemy => {
                if (player.gridX === enemy.gridX && player.gridY === enemy.gridY) {
                    player.takeDamage();
                }
            });
        });
    }

    _handleArenaClosing() {
        if (this.tempoRestante > 0) {
            this.tempoRestante--;
        } else {
            if (!this.fechamentoAtivo) {
                this.fechamentoAtivo = true;
                this.logEvent('Aviso: A arena está começando a fechar!');
            }
            if (this.fechamentoTimer > 0) {
                this.fechamentoTimer--;
            } else {
                if (this.areaPiscaTimer === -1) {
                    this.areaPiscaTimer = TEMPO_PISCAR_SEGUNDOS * 60;
                }
                if (this.areaPiscaTimer > 0) {
                    this.areaPiscaTimer--;
                } else {
                    const tamanhoAtualArena = LARGURA_MAPA - 2 * fechamentoNivel;
                    if (tamanhoAtualArena > TAMANHO_MINIMO_ARENA) {
                        const novosFechamentos = fecharArena();
                        this.destruirEntidadesPorFechamento(novosFechamentos);
                        this.fechamentoTimer = TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS * 60;
                        this.areaPiscaTimer = -1;
                    } else {
                        this.fechamentoAtivo = false;
                    }
                }
            }
        }
    }

    _handlePowerups() {
        powerups.forEach(powerup => {
            if (powerup.immunityTimer > 0) {
                powerup.immunityTimer--;
                powerup.visible = (Math.floor(powerup.immunityTimer / 5) % 2) === 0;
            } else {
                powerup.visible = true;
            }
        });
        this.players.forEach(player => {
            for (let i = powerups.length - 1; i >= 0; i--) {
                const powerup = powerups[i];
                if (
                    player.x > powerup.x - TAMANHO_BLOCO / 2 &&
                    player.x < powerup.x + TAMANHO_BLOCO / 2 &&
                    player.y > powerup.y - TAMANHO_BLOCO / 2 &&
                    player.y < powerup.y + TAMANHO_BLOCO / 2
                ) {
                    this.logEvent(`Jogador ${player.id} pegou o power-up: ${powerup.type}!`);
                    powerup.applyEffect(player);
                    powerups.splice(i, 1);
                }
            }
        });
    }

    atualizarEstado() {
        // NOVO: Chama o novo método para lidar com power-ups
        this._handlePowerups();

        this.players.forEach(player => {
            player.mover();
            player.update();
        });

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.mover();
            const atingido = explosoes.some(exp => {
                return (Math.floor(exp.x / TAMANHO_BLOCO) === enemy.gridX && Math.floor(exp.y / TAMANHO_BLOCO) === enemy.gridY);
            });
            if (atingido) {
                const isDefeated = enemy.takeDamage();
                if (isDefeated) {
                    this.logEvent(`Inimigo derrotado!`);
                    this.enemies.splice(i, 1);
                }
            }
        }

        this._verificarDano();
        atualizarBombas();
        atualizarExplosoes();
        this.verificarDestruicaoPowerups();

        if (teclasPressionadas[' '] && this.players[0].bombasAtivas < this.players[0].maxBombas) {
            plantarBomba(this.players[0], this.logEvent.bind(this));
        }

        this._handleArenaClosing();

        if (this.players.length > 0) {
            updateLivesDisplay(this.players[0].vidas);
        }
    }

    atualizarHUD() {
        const segundos = Math.floor(this.tempoRestante / 60);
        const minutos = Math.floor(segundos / 60);
        const segundosFormatados = (segundos % 60).toString().padStart(2, '0');

        if (this.hudElement) {
            this.hudElement.textContent = `${minutos}:${segundosFormatados}`;
        }
    }

    configurarCamera() {
        let cameraX = 0;
        let cameraY = 0;
        const zoom = ZOOM_NIVEL;

        if (CAMERA_SEGUIR_JOGADOR) {
            const player1 = this.players[0];
            cameraX = -player1.x * zoom + this.canvas.width / 2;
            cameraY = -player1.y * zoom + this.canvas.height / 2;
        } else {
            const mapaLargura = LARGURA_MAPA * TAMANHO_BLOCO;
            const mapaAltura = ALTURA_MAPA * TAMANHO_BLOCO;
            cameraX = (this.canvas.width / 2) - (mapaLargura * zoom) / 2;
            cameraY = (this.canvas.height / 2) - (mapaAltura * zoom) / 2;
        }

        this.ctx.translate(cameraX, cameraY);
        this.ctx.scale(zoom, zoom);
    }

    gameLoop() {
        this.atualizarEstado();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.configurarCamera();
        const arenaFechando = this.areaPiscaTimer > 0;
        desenharTudo(this.ctx, mapa, this.players, bombas, explosoes, powerups, this.enemies, arenaFechando, this.areaPiscaTimer);
        this.ctx.restore();
        this.atualizarHUD();
        requestAnimationFrame(() => this.gameLoop());
    }
}

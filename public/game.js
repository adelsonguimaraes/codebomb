// game.js - Classe de gerenciamento do jogo
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa, encontrarPosicaoInicialSegura, gerarBlocosDestrutiveis, fecharArena, fechamentoNivel, powerups, inicializarMapa, encontrarPosicoesInimigos } from './map.js';
import { Player, teclasPressionadas } from './player.js';
import { bombas, explosoes, atualizarBombas, atualizarExplosoes, plantarBomba } from './bomb.js';
import { desenharTudo } from './render.js';
import { Enemy } from './enemy.js';

// Constantes e variáveis de estado do jogo
const ZOOM_NIVEL = 1.5;
const CAMERA_SEGUIR_JOGADOR = true;
const TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS = 10;
const TEMPO_PISCAR_SEGUNDOS = 5;
const TAMANHO_MINIMO_ARENA = 7;
const TEMPO_TOTAL_SEGUNDOS = 120;

// Configuração dos inimigos
const ENABLE_ENEMIES = true;
const NUMBER_OF_ENEMIES = 3;

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
        inicializarMapa();
        this.fechamentoAtivo = false;
        this.fechamentoTimer = TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS * 60;
        this.areaPiscaTimer = -1;
        this.tempoRestante = TEMPO_TOTAL_SEGUNDOS * 60;
        this.fechamentoAvisoFeito = false;

        const posicaoInicial = encontrarPosicaoInicialSegura();
        const posicoesJogadores = [{ x: posicaoInicial.x, y: posicaoInicial.y }];

        const player1 = new Player(1, posicaoInicial.x * TAMANHO_BLOCO, posicaoInicial.y * TAMANHO_BLOCO);
        this.players.push(player1);

        let posicoesEntidades = [...posicoesJogadores];
        if (ENABLE_ENEMIES) {
            const posicoesInimigos = encontrarPosicoesInimigos(NUMBER_OF_ENEMIES, posicoesJogadores);
            posicoesInimigos.forEach(enemyPos => {
                const enemy = new Enemy(enemyPos.x, enemyPos.y, player1);
                this.enemies.push(enemy);
                posicoesEntidades.push(enemyPos);
            });
        }

        gerarBlocosDestrutiveis(posicoesEntidades);

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.logEvent('Jogo iniciado! Prepare-se para a batalha!');
    }

    // NOVO: Método para logar eventos na caixa de mensagens
    logEvent(message) {
        if (this.eventLogElement) {
            // Torna todas as mensagens existentes em "antigas"
            Array.from(this.eventLogElement.children).forEach(p => {
                p.classList.add('old-message');
            });

            // Cria um novo parágrafo para a mensagem
            const messageElement = document.createElement('p');
            messageElement.textContent = message;

            // Adiciona a mensagem ao início da lista (mas com flex-direction-reverse, ela aparecerá no final visualmente)
            this.eventLogElement.prepend(messageElement);

            // Mantém o número máximo de mensagens
            while (this.eventLogElement.children.length > this.maxLogMessages) {
                this.eventLogElement.removeChild(this.eventLogElement.lastChild);
            }
        }
    }

    // Lógica para destruir power-ups atingidos por explosões
    verificarDestruicaoPowerups() {
        for (let i = powerups.length - 1; i >= 0; i--) {
            const powerup = powerups[i];
            const powerupGridX = Math.floor(powerup.x / TAMANHO_BLOCO);
            const powerupGridY = Math.floor(powerup.y / TAMANHO_BLOCO);

            // Verifica se o power-up está na mesma célula de alguma explosão ativa
            const atingido = explosoes.some(exp => {
                // A explosão atinge o powerup apenas se o timer de imunidade dele for 0
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


    atualizarEstado() {
        if (this.tempoRestante > 0) {
            this.tempoRestante--;
        } else {
            if (!this.fechamentoAtivo) {
                this.fechamentoAtivo = true;
            }
        }

        powerups.forEach(powerup => {
            if (powerup.immunityTimer > 0) {
                powerup.immunityTimer--;
                powerup.visible = (Math.floor(powerup.immunityTimer / 5) % 2) === 0;
            } else {
                powerup.visible = true;
            }
        });

        this.players.forEach(player => {
            player.mover();
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

        // NOVO: Verifica colisão entre inimigos e explosões
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            // Move o inimigo
            enemy.mover();

            // Verifica se o inimigo colidiu com alguma explosão
            const atingido = explosoes.some(exp => {
                return (Math.floor(exp.x / TAMANHO_BLOCO) === enemy.gridX && Math.floor(exp.y / TAMANHO_BLOCO) === enemy.gridY);
            });

            // Se o inimigo foi atingido, ele toma dano
            if (atingido) {
                const isDefeated = enemy.takeDamage();
                if (isDefeated) {
                    this.logEvent(`Inimigo derrotado!`);
                    this.enemies.splice(i, 1);
                }
            }
        }

        atualizarBombas();
        atualizarExplosoes();
        this.verificarDestruicaoPowerups();

        if (teclasPressionadas[' '] && this.players[0].bombasAtivas < this.players[0].maxBombas) {
            plantarBomba(this.players[0], this.logEvent.bind(this));
        }

        if (this.fechamentoAtivo) {
            if (!this.fechamentoAvisoFeito) {
                this.logEvent('Aviso: A arena está começando a fechar!');
                this.fechamentoAvisoFeito = true;
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
                        fecharArena();
                        this.fechamentoTimer = TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS * 60;
                        this.areaPiscaTimer = -1;
                    } else {
                        this.fechamentoAtivo = false;
                    }
                }
            }
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

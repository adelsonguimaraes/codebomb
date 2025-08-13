// game.js - Classe de gerenciamento do jogo
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa, encontrarPosicaoInicialSegura, gerarBlocosDestrutiveis, fecharArena, fechamentoNivel, powerups } from './map.js';
import { Player, teclasPressionadas } from './player.js';
import { bombas, explosoes, atualizarBombas, atualizarExplosoes, plantarBomba } from './bomb.js';
import { desenharTudo } from './render.js';

// Constantes e variáveis de estado do jogo
const ZOOM_NIVEL = 1.5;
const CAMERA_SEGUIR_JOGADOR = true;
const TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS = 10;
const TEMPO_PISCAR_SEGUNDOS = 5;
const TAMANHO_MINIMO_ARENA = 7;

export class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.players = [];
        this.fechamentoAtivo = true;
        this.fechamentoTimer = TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS * 60; // em frames
        this.areaPiscaTimer = -1;
    }

    iniciarJogo() {
        const posicaoInicial = encontrarPosicaoInicialSegura();
        const posicoesJogadores = [{ x: posicaoInicial.x, y: posicaoInicial.y }];
        gerarBlocosDestrutiveis(posicoesJogadores);

        const player1 = new Player(1, posicaoInicial.x * TAMANHO_BLOCO, posicaoInicial.y * TAMANHO_BLOCO);
        this.players.push(player1);

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Adiciona os event listeners diretamente no GameManager para melhor encapsulamento
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        teclasPressionadas[e.key.toLowerCase()] = true;
        if (e.key === ' ' && this.players[0].bombasAtivas < this.players[0].maxBombas) {
            plantarBomba(this.players[0]);
        }
    }

    handleKeyUp(e) {
        teclasPressionadas[e.key.toLowerCase()] = false;
    }

    atualizarEstado() {
        this.players.forEach(player => {
            player.mover();
            // Lógica para coletar power-ups
            for (let i = powerups.length - 1; i >= 0; i--) {
                console.log(powerups[i]);

                const powerup = powerups[i];
                if (
                    player.x > powerup.x - TAMANHO_BLOCO / 2 &&
                    player.x < powerup.x + TAMANHO_BLOCO / 2 &&
                    player.y > powerup.y - TAMANHO_BLOCO / 2 &&
                    player.y < powerup.y + TAMANHO_BLOCO / 2
                ) {
                    powerup.applyEffect(player);
                    powerups.splice(i, 1);
                }
            }
        });
        atualizarBombas();
        atualizarExplosoes();

        if (this.fechamentoAtivo) {
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
        desenharTudo(this.ctx, mapa, this.players, bombas, explosoes, powerups, arenaFechando, this.areaPiscaTimer);
        this.ctx.restore();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// game.js - Classe de gerenciamento do jogo
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa, encontrarPosicaoInicialSegura, gerarBlocosDestrutiveis, fecharArena, fechamentoNivel, powerups, inicializarMapa, encontrarPosicoesInimigos } from './map.js';
import { Player, teclasPressionadas } from './player.js';
import { bombas, explosoes, atualizarBombas, atualizarExplosoes, plantarBomba } from './bomb.js';
import { desenharTudo } from './render.js';
import { Enemy } from './enemy.js'; // NOVO: Importa a classe Enemy

// Constantes e variáveis de estado do jogo
const ZOOM_NIVEL = 1.5;
const CAMERA_SEGUIR_JOGADOR = true;
const TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS = 10;
const TEMPO_PISCAR_SEGUNDOS = 5;
const TAMANHO_MINIMO_ARENA = 7;
const TEMPO_TOTAL_SEGUNDOS = 120; // NOVO: 2 minutos de jogo por padrão

// NOVO: Configuração dos inimigos
const ENABLE_ENEMIES = true;
const NUMBER_OF_ENEMIES = 3;

export class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.players = [];
        this.enemies = []; // NOVO: Array para armazenar os inimigos
        this.fechamentoAtivo = false; // Alterado para começar como false
        this.fechamentoTimer = TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS * 60; // em frames
        this.areaPiscaTimer = -1;
        this.tempoRestante = TEMPO_TOTAL_SEGUNDOS * 60; // NOVO: Tempo restante do jogo em frames
        this.hudElement = document.getElementById('timer-display'); // NOVO: Elemento do HUD
        // NOVO: Elemento e limite para o log de eventos
        this.eventLogElement = document.getElementById('event-log');
        this.maxLogMessages = 5;
        this.fechamentoAvisoFeito = false; // NOVO: Flag para avisar do fechamento apenas uma vez
    }

    iniciarJogo() {
        // CORREÇÃO: Reseta o estado do jogo e o mapa para evitar artefatos visuais
        inicializarMapa();
        this.fechamentoAtivo = false;
        this.fechamentoTimer = TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS * 60;
        this.areaPiscaTimer = -1;
        this.tempoRestante = TEMPO_TOTAL_SEGUNDOS * 60;
        this.fechamentoAvisoFeito = false;

        const posicaoInicial = encontrarPosicaoInicialSegura();
        const posicoesJogadores = [{ x: posicaoInicial.x, y: posicaoInicial.y }];

        // CORREÇÃO: Primeiro, encontramos as posições seguras para os inimigos...
        let posicoesEntidades = [...posicoesJogadores];
        if (ENABLE_ENEMIES) {
            const posicoesInimigos = encontrarPosicoesInimigos(NUMBER_OF_ENEMIES, posicoesJogadores);
            posicoesInimigos.forEach(enemyPos => {
                // ...e depois centralizamos e criamos o inimigo.
                const xCentralizado = enemyPos.x;
                const yCentralizado = enemyPos.y;
                const enemy = new Enemy(xCentralizado, yCentralizado);
                this.enemies.push(enemy);
                posicoesEntidades.push(enemyPos);
            });
        }

        // ...E só agora geramos os blocos destrutíveis, evitando as posições dos jogadores e inimigos
        gerarBlocosDestrutiveis(posicoesEntidades);

        // A classe Player agora espera as coordenadas do grid, o offset é calculado internamente
        const player1 = new Player(1, posicaoInicial.x * TAMANHO_BLOCO, posicaoInicial.y * TAMANHO_BLOCO);
        this.players.push(player1);


        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // NOVO: Loga o evento de início do jogo
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
        // NOVO: Decrementa o tempo restante do jogo
        if (this.tempoRestante > 0) {
            this.tempoRestante--;
        } else {
            // Quando o tempo termina, inicia o fechamento da arena
            if (!this.fechamentoAtivo) {
                this.fechamentoAtivo = true;
            }
        }

        // NOVO: Lógica para o timer de imunidade do power-up
        powerups.forEach(powerup => {
            if (powerup.immunityTimer > 0) {
                powerup.immunityTimer--;
                // Lógica de piscar: torna o power-up visível/invisível a cada 5 quadros
                powerup.visible = (Math.floor(powerup.immunityTimer / 5) % 2) === 0;
            } else {
                powerup.visible = true;
            }
        });

        this.players.forEach(player => {
            player.mover();
            // Lógica para coletar power-ups
            for (let i = powerups.length - 1; i >= 0; i--) {

                const powerup = powerups[i];
                if (
                    player.x > powerup.x - TAMANHO_BLOCO / 2 &&
                    player.x < powerup.x + TAMANHO_BLOCO / 2 &&
                    player.y > powerup.y - TAMANHO_BLOCO / 2 &&
                    player.y < powerup.y + TAMANHO_BLOCO / 2
                ) {
                    // NOVO: Loga o evento de power-up coletado
                    this.logEvent(`Jogador ${player.id} pegou o power-up: ${powerup.type}!`);

                    // Adicionando a chamada do método correto para o novo power-up
                    powerup.applyEffect(player);
                    powerups.splice(i, 1);
                }
            }
        });

        // NOVO: Atualiza a posição dos inimigos
        this.enemies.forEach(enemy => {
            enemy.mover();
        });

        atualizarBombas();
        atualizarExplosoes();
        this.verificarDestruicaoPowerups(); // NOVO: Chama a nova função para verificar a destruição dos powerups

        // NOVO: Verifica se a tecla de espaço está pressionada para plantar uma bomba
        if (teclasPressionadas[' '] && this.players[0].bombasAtivas < this.players[0].maxBombas) {
            plantarBomba(this.players[0], this.logEvent.bind(this)); // NOVO: Passa a função de log como callback
        }

        if (this.fechamentoAtivo) {
            // NOVO: Loga o aviso de fechamento da arena apenas uma vez
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

    // NOVO: Método para atualizar o HUD
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
        this.atualizarHUD(); // NOVO: Chama a atualização do HUD
        requestAnimationFrame(() => this.gameLoop());
    }
}

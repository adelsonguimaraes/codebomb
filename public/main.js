// main.js - Ponto de entrada do jogo
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa, encontrarPosicaoInicialSegura, gerarBlocosDestrutiveis, fecharArena, fechamentoNivel } from './map.js';
import { Player, teclasPressionadas } from './player.js'; // Importa a nova classe Player e o objeto de teclas
import { bombas, explosoes, atualizarBombas, atualizarExplosoes, plantarBomba } from './bomb.js';
import { desenharTudo } from './render.js';

// --- Configurações Globais do Jogo ---
const ZOOM_NIVEL = 1.0; // Constante para controlar o zoom da câmera
const CAMERA_SEGUIR_JOGADOR = false; // Define se a câmera segue o jogador (true) ou fica fixa (false)

// --- Configurações do Fechamento de Arena ---
let FECHAMENTO_ARENA_ATIVO = true;
const TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS = 10;
const TEMPO_PISCAR_SEGUNDOS = 5;
const TAMANHO_MINIMO_ARENA = 7;

// Variáveis de estado do fechamento da arena
let fechamentoTimer = TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS * 60; // Convertendo segundos para frames (60fps)
let areaPiscaTimer = -1;

// --- Configuração do Canvas e Contexto ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Array de jogadores
export const players = [];

// --- Event Listeners para controle do jogador ---
window.addEventListener('keydown', (e) => {
    teclasPressionadas[e.key.toLowerCase()] = true;
    // Verifica se o jogador pode plantar uma bomba (se ele tem bombas disponíveis)
    if (e.key === ' ' && players[0].bombasAtivas < players[0].maxBombas) {
        plantarBomba(players[0]);
    }
});

window.addEventListener('keyup', (e) => {
    teclasPressionadas[e.key.toLowerCase()] = false;
});

// --- Inicialização do Jogo ---
function iniciarJogo() {
    const posicaoInicial = encontrarPosicaoInicialSegura();
    const posicoesJogadores = [{ x: posicaoInicial.x, y: posicaoInicial.y }];

    gerarBlocosDestrutiveis(posicoesJogadores);

    // Cria uma nova instância da classe Player
    const player1 = new Player(1, posicaoInicial.x * TAMANHO_BLOCO, posicaoInicial.y * TAMANHO_BLOCO);
    players.push(player1);

    // Ajusta o tamanho do canvas para o modo de tela cheia
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// --- Funções de Atualização e Câmera ---
function atualizarEstado() {
    // Lógica de movimento e ações do jogador
    players.forEach(player => player.mover());

    // Lógica de bombas e explosões
    atualizarBombas();
    atualizarExplosoes();

    // Lógica de fechamento de arena
    if (FECHAMENTO_ARENA_ATIVO) {
        if (fechamentoTimer > 0) {
            fechamentoTimer--;
        } else {
            if (areaPiscaTimer === -1) {
                // Inicia o piscar da área
                areaPiscaTimer = TEMPO_PISCAR_SEGUNDOS * 60;
            }

            if (areaPiscaTimer > 0) {
                areaPiscaTimer--;
            } else {
                // Verifica se a arena já atingiu o tamanho mínimo
                const tamanhoAtualArena = LARGURA_MAPA - 2 * fechamentoNivel;
                if (tamanhoAtualArena > TAMANHO_MINIMO_ARENA) {
                    // Fecha a arena e reseta o temporizador
                    fecharArena();
                    fechamentoTimer = TEMPO_ENTRE_FECHAMENTOS_SEGUNDOS * 60;
                    areaPiscaTimer = -1;
                } else {
                    // Desativa o fechamento da arena
                    FECHAMENTO_ARENA_ATIVO = false;
                }
            }
        }
    }
}

function configurarCamera() {
    let cameraX = 0;
    let cameraY = 0;
    const zoom = ZOOM_NIVEL;

    if (CAMERA_SEGUIR_JOGADOR) {
        const player1 = players[0];
        cameraX = -player1.x * zoom + canvas.width / 2;
        cameraY = -player1.y * zoom + canvas.height / 2;
    } else {
        // Centraliza o mapa no meio da tela
        const mapaLargura = LARGURA_MAPA * TAMANHO_BLOCO;
        const mapaAltura = ALTURA_MAPA * TAMANHO_BLOCO;
        cameraX = (canvas.width / 2) - (mapaLargura * zoom) / 2;
        cameraY = (canvas.height / 2) - (mapaAltura * zoom) / 2;
    }

    ctx.translate(cameraX, cameraY);
    ctx.scale(zoom, zoom);
}

// --- Loop Principal do Jogo ---
function gameLoop() {
    // 1. Atualiza o estado do jogo
    atualizarEstado();

    // 2. Limpa a tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Configura a câmera
    ctx.save();
    configurarCamera();

    // 4. Desenha todos os elementos
    const arenaFechando = areaPiscaTimer > 0;
    desenharTudo(ctx, mapa, players, bombas, explosoes, arenaFechando, areaPiscaTimer);

    ctx.restore();

    // 5. Solicita o próximo quadro
    requestAnimationFrame(gameLoop);
}

// Inicia o jogo e o loop principal
iniciarJogo();
gameLoop();

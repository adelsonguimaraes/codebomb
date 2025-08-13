// main.js - Ponto de entrada do jogo
import { GameManager } from './game.js';

// --- Configuração do Canvas ---
const canvas = document.getElementById('gameCanvas');

// --- Inicialização do Jogo ---
const game = new GameManager(canvas);
game.iniciarJogo();
game.gameLoop();

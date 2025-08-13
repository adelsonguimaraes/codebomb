// render.js - Lógica de desenho
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, fechamentoNivel } from './map.js';

function desenharMapa(ctx, mapa) {
    for (let y = 0; y < ALTURA_MAPA; y++) {
        for (let x = 0; x < LARGURA_MAPA; x++) {
            const block = mapa[y][x];

            // A lógica agora desenha com base no tipo de bloco
            if (block.type === 1) { // Parede do mapa fixo (X)
                ctx.fillStyle = '#1abc9c';
            } else if (block.type === 2) { // Parede de fechamento da arena (=)
                ctx.fillStyle = '#c0392b'; // Cor vermelho-marrom
            } else if (block.type === 3) { // Bloco destrutível (*)
                ctx.fillStyle = '#f1c40f';
            } else { // Espaço vazio (-)
                ctx.fillStyle = '#7f8c8d';
            }

            ctx.fillRect(block.x, block.y, TAMANHO_BLOCO, TAMANHO_BLOCO);
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1;
            ctx.strokeRect(block.x, block.y, TAMANHO_BLOCO, TAMANHO_BLOCO);

            ctx.fillStyle = '#ecf0f1';
            ctx.font = `${TAMANHO_BLOCO * 0.5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (block.type === 1) {
                ctx.fillText('X', block.x + TAMANHO_BLOCO / 2, block.y + TAMANHO_BLOCO / 2);
            } else if (block.type === 2) {
                ctx.fillText('=', block.x + TAMANHO_BLOCO / 2, block.y + TAMANHO_BLOCO / 2);
            } else if (block.type === 3) {
                ctx.fillText('*', block.x + TAMANHO_BLOCO / 2, block.y + TAMANHO_BLOCO / 2);
            } else {
                ctx.fillText('-', block.x + TAMANHO_BLOCO / 2, block.y + TAMANHO_BLOCO / 2);
            }
        }
    }
}

function desenharPlayers(ctx, players) {
    players.forEach(player => {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.tamanho / 2, 0, Math.PI * 2, false);
        ctx.fillStyle = '#3498db';
        ctx.fill();
    });
}

function desenharBombas(ctx, bombas) {
    bombas.forEach(bomba => {
        // Lógica de piscar da bomba
        if (Math.floor(bomba.timer / 10) % 2 === 0) {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(bomba.x, bomba.y, TAMANHO_BLOCO / 2 * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function desenharExplosoes(ctx, explosoes) {
    explosoes.forEach(exp => {
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(exp.x, exp.y, TAMANHO_BLOCO, TAMANHO_BLOCO);
    });
}

// Nova função para desenhar as áreas que vão fechar
function desenharAreasDeFechamento(ctx, arenaFechando, areaPiscaTimer) {
    if (arenaFechando && Math.floor(areaPiscaTimer / 10) % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Cor vermelha piscante
        const nivel = fechamentoNivel;
        const offset = nivel * TAMANHO_BLOCO;
        const larguraArena = LARGURA_MAPA * TAMANHO_BLOCO;
        const alturaArena = ALTURA_MAPA * TAMANHO_BLOCO;

        // Borda superior e inferior
        ctx.fillRect(offset, offset, larguraArena - 2 * offset, TAMANHO_BLOCO);
        ctx.fillRect(offset, alturaArena - TAMANHO_BLOCO - offset, larguraArena - 2 * offset, TAMANHO_BLOCO);

        // Borda esquerda e direita
        ctx.fillRect(offset, offset, TAMANHO_BLOCO, alturaArena - 2 * offset);
        ctx.fillRect(larguraArena - TAMANHO_BLOCO - offset, offset, TAMANHO_BLOCO, alturaArena - 2 * offset);
    }
}

export function desenharTudo(ctx, mapa, players, bombas, explosoes, arenaFechando, areaPiscaTimer) {
    desenharMapa(ctx, mapa);
    desenharBombas(ctx, bombas);
    desenharExplosoes(ctx, explosoes);
    desenharPlayers(ctx, players);
    desenharAreasDeFechamento(ctx, arenaFechando, areaPiscaTimer);
}

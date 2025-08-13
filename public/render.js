// render.js - Lógica de renderização
import { Block, TAMANHO_BLOCO, LARGURA_MAPA, ALTURA_MAPA, fechamentoNivel } from './map.js';

export function desenharTudo(ctx, mapa, players, bombas, explosoes, powerups, arenaFechando, areaPiscaTimer) {
    desenharFundo(ctx, LARGURA_MAPA, ALTURA_MAPA);
    desenharMapa(ctx, mapa);
    // Nova função para desenhar a área de fechamento piscando
    desenharAreasDeFechamento(ctx, arenaFechando, areaPiscaTimer);
    desenharBombas(ctx, bombas);
    desenharExplosoes(ctx, explosoes);
    desenharPowerups(ctx, powerups);
    desenharPlayers(ctx, players);
}

function desenharFundo(ctx, larguraMapa, alturaMapa) {
    // Cor do fundo restaurada para a original
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(0, 0, larguraMapa * TAMANHO_BLOCO, alturaMapa * TAMANHO_BLOCO);
}

function desenharMapa(ctx, mapa) {
    for (let y = 0; y < mapa.length; y++) {
        for (let x = 0; x < mapa[y].length; x++) {
            const bloco = mapa[y][x];
            let conteudo = '';

            if (bloco instanceof Block) {
                switch (bloco.type) {
                    case 1: // Parede indestrutível do mapa fixo
                        conteudo = 'X';
                        ctx.fillStyle = '#1abc9c';
                        break;
                    case 2: // Parede de fechamento da arena (agora com cor fixa)
                        conteudo = '=';
                        ctx.fillStyle = '#c0392b';
                        break;
                    case 3: // Bloco destrutível
                        conteudo = '*';
                        ctx.fillStyle = '#f1c40f';
                        break;
                    default:
                        // Espaço vazio
                        conteudo = '-';
                        ctx.fillStyle = '#7f8c8d';
                        break;
                }
            } else {
                // Caso não seja um objeto Block, assume-se que é um espaço vazio
                conteudo = '-';
                ctx.fillStyle = '#7f8c8d';
            }

            ctx.fillRect(bloco.x, bloco.y, TAMANHO_BLOCO, TAMANHO_BLOCO);
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1;
            ctx.strokeRect(bloco.x, bloco.y, TAMANHO_BLOCO, TAMANHO_BLOCO);

            ctx.fillStyle = '#ecf0f1';
            ctx.font = `${TAMANHO_BLOCO * 0.5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(conteudo, bloco.x + TAMANHO_BLOCO / 2, bloco.y + TAMANHO_BLOCO / 2);
        }
    }
}

// Nova função para desenhar as áreas que vão fechar, agora com a lógica correta
function desenharAreasDeFechamento(ctx, arenaFechando, areaPiscaTimer) {
    // Desenha a área de fechamento apenas se o timer estiver ativo e a arena estiver fechando
    if (arenaFechando && Math.floor(areaPiscaTimer / 10) % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Cor vermelha piscante
        const nivel = fechamentoNivel;
        const offset = nivel * TAMANHO_BLOCO;
        const larguraArena = LARGURA_MAPA * TAMANHO_BLOCO;
        const alturaArena = ALTURA_MAPA * TAMANHO_BLOCO;

        // Borda superior
        ctx.fillRect(offset, offset, larguraArena - 2 * offset, TAMANHO_BLOCO);
        // Borda inferior
        ctx.fillRect(offset, alturaArena - TAMANHO_BLOCO - offset, larguraArena - 2 * offset, TAMANHO_BLOCO);

        // Borda esquerda
        ctx.fillRect(offset, offset + TAMANHO_BLOCO, TAMANHO_BLOCO, alturaArena - 2 * offset - 2 * TAMANHO_BLOCO);
        // Borda direita
        ctx.fillRect(larguraArena - TAMANHO_BLOCO - offset, offset + TAMANHO_BLOCO, TAMANHO_BLOCO, alturaArena - 2 * offset - 2 * TAMANHO_BLOCO);
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
    explosoes.forEach(ex => {
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(ex.x, ex.y, TAMANHO_BLOCO, TAMANHO_BLOCO);
    });
}

function desenharPowerups(ctx, powerups) {
    powerups.forEach(p => {
        if (p.type === 'explosionRadius') {
            ctx.fillStyle = '#FFD700'; // Cor amarela para o power-up de raio
            ctx.beginPath();
            ctx.arc(p.x, p.y, TAMANHO_BLOCO * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

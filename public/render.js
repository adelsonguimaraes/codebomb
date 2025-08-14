// render.js - Lógica de renderização
import { TAMANHO_BLOCO, LARGURA_MAPA, ALTURA_MAPA, fechamentoNivel } from './map.js';
import { Block } from './powerup.js'; // A classe Block agora é importada de powerup.js

// Função principal de desenho
export function desenharTudo(ctx, mapa, players, bombas, explosoes, powerups, enemies, arenaFechando, areaPiscaTimer) {
    desenharFundo(ctx, LARGURA_MAPA, ALTURA_MAPA);
    desenharMapa(ctx, mapa);
    desenharAreasDeFechamento(ctx, arenaFechando, areaPiscaTimer);
    desenharBombas(ctx, bombas);
    desenharExplosoes(ctx, explosoes);
    desenharPowerups(ctx, powerups);
    desenharPlayers(ctx, players);
    desenharEnemies(ctx, enemies); // NOVO: Chama a função para desenhar os inimigos
}

function desenharFundo(ctx, larguraMapa, alturaMapa) {
    // Cor de fundo alterada para não confundir com os blocos de espaço vazio
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, larguraMapa * TAMANHO_BLOCO, alturaMapa * TAMANHO_BLOCO);
}

function desenharMapa(ctx, mapa) {
    for (let y = 0; y < mapa.length; y++) {
        for (let x = 0; x < mapa[y].length; x++) {
            const bloco = mapa[y][x];
            let conteudo = '';
            let fillStyle = '#7f8c8d'; // Cor padrão para espaço vazio

            // CORREÇÃO: Verifica se o bloco é um objeto para extrair a propriedade 'type'
            const blockType = typeof bloco === 'object' ? bloco.type : bloco;

            switch (blockType) {
                case 1: // Parede indestrutível do mapa fixo
                    conteudo = 'X';
                    fillStyle = '#1abc9c';
                    break;
                case 2: // Parede de fechamento da arena
                    conteudo = '=';
                    fillStyle = '#c0392b';
                    break;
                case 3: // Bloco destrutível
                    conteudo = '*';
                    fillStyle = '#f1c40f';
                    break;
                default: // Espaço vazio
                    conteudo = '-';
                    fillStyle = '#7f8c8d';
                    break;
            }

            const xPos = x * TAMANHO_BLOCO;
            const yPos = y * TAMANHO_BLOCO;

            ctx.fillStyle = fillStyle;
            // CORREÇÃO: Usando xPos e yPos para o desenho
            ctx.fillRect(xPos, yPos, TAMANHO_BLOCO, TAMANHO_BLOCO);
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1;
            // CORREÇÃO: Usando xPos e yPos para o desenho
            ctx.strokeRect(xPos, yPos, TAMANHO_BLOCO, TAMANHO_BLOCO);

            ctx.fillStyle = '#ecf0f1';
            ctx.font = `${TAMANHO_BLOCO * 0.5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // CORREÇÃO: Usando xPos e yPos para o desenho
            ctx.fillText(conteudo, xPos + TAMANHO_BLOCO / 2, yPos + TAMANHO_BLOCO / 2);
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
        // Desenha o corpo do jogador
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.tamanho / 2, 0, Math.PI * 2, false);
        ctx.fillStyle = '#3498db';
        ctx.fill();

        // Desenha o rosto do jogador
        ctx.fillStyle = '#ecf0f1';
        ctx.font = `${player.tamanho * 0.4}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('^-^', player.x, player.y);
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
    // Adicionada a verificação para desenhar apenas power-ups visíveis
    powerups.forEach(p => {
        if (p.visible) {
            if (p.type === 'explosionRadius') {
                ctx.fillStyle = '#FFD700'; // Cor amarela para o power-up de raio
                ctx.beginPath();
                ctx.arc(p.x, p.y, TAMANHO_BLOCO * 0.3, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'speed') {
                // Desenha o novo power-up de velocidade
                ctx.fillStyle = '#6F4E37'; // Cor marrom (café) para o power-up de velocidade
                ctx.fillRect(p.x - TAMANHO_BLOCO * 0.2, p.y - TAMANHO_BLOCO * 0.2, TAMANHO_BLOCO * 0.4, TAMANHO_BLOCO * 0.4);
            } else if (p.type === 'bombCount') { // NOVO: Renderiza o power-up de contagem de bombas
                ctx.fillStyle = '#95a5a6'; // Cor cinza para o power-up de contagem de bombas
                ctx.beginPath();
                ctx.arc(p.x, p.y, TAMANHO_BLOCO * 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ecf0f1';
                ctx.font = `${TAMANHO_BLOCO * 0.3}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('B', p.x, p.y);
            }
        }
    });
}

// NOVO: Função para desenhar os inimigos com o rosto
function desenharEnemies(ctx, enemies) {
    enemies.forEach(enemy => {
        // Desenha o corpo do inimigo (círculo vermelho)
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.tamanho / 2, 0, Math.PI * 2, false);
        ctx.fillStyle = enemy.isIrritated ? '#c0392b' : '#e74c3c'; // Cor muda para indicar irritação
        ctx.fill();

        // Desenha o rosto do inimigo
        ctx.fillStyle = '#ecf0f1';
        ctx.font = `${enemy.tamanho * 0.38}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // O rosto muda de acordo com o estado de irritação
        const face = enemy.isIrritated ? 'Ù_Ú' : '-u-';
        ctx.fillText(face, enemy.x, enemy.y);
    });
}

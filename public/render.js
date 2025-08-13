// render.js - Lógica de desenho
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa, fechamentoNivel } from './map.js';

function desenharMapa(ctx) {
  for (let y = 0; y < ALTURA_MAPA; y++) {
    for (let x = 0; x < LARGURA_MAPA; x++) {
      const xPos = x * TAMANHO_BLOCO;
      const yPos = y * TAMANHO_BLOCO;
      const tipoBloco = mapa[y][x];

      let conteudo = '';
      
      if (tipoBloco === 1) { // Parede (X)
        conteudo = 'X';
        ctx.fillStyle = '#1abc9c'; 
      } else if (tipoBloco === 3) { // Bloco destrutível (*)
        conteudo = '*';
        ctx.fillStyle = '#f1c40f'; 
      } else { // Espaço vazio (-)
        conteudo = '-';
        ctx.fillStyle = '#7f8c8d'; 
      }

      ctx.fillRect(xPos, yPos, TAMANHO_BLOCO, TAMANHO_BLOCO);
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 1;
      ctx.strokeRect(xPos, yPos, TAMANHO_BLOCO, TAMANHO_BLOCO);

      ctx.fillStyle = '#ecf0f1';
      ctx.font = `${TAMANHO_BLOCO * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(conteudo, xPos + TAMANHO_BLOCO / 2, yPos + TAMANHO_BLOCO / 2);
    }
  }
}

function desenharJogadores(ctx, players) {
  players.forEach(player => {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.tamanho / 2, 0, Math.PI * 2, false);
    ctx.fillStyle = '#3498db';
    ctx.fill();
  });
}

function desenharBombas(ctx, bombas) {
  bombas.forEach(bomba => {
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
function desenharAreasDeFechamento(ctx, areaPiscaTimer) {
  if (areaPiscaTimer > 0 && Math.floor(areaPiscaTimer / 10) % 2 === 0) {
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
  desenharMapa(ctx);
  desenharBombas(ctx, bombas);
  desenharExplosoes(ctx, explosoes);
  desenharJogadores(ctx, players);
  if (arenaFechando) {
      desenharAreasDeFechamento(ctx, areaPiscaTimer);
  }
}

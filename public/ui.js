// ui.js - Lógica para gerenciar a interface do usuário

/**
 * Atualiza o display de vidas do jogador na interface HTML.
 * @param {number} lives - O número atual de vidas do jogador.
 */
export function updateLivesDisplay(lives) {
    const livesElement = document.getElementById('player-lives');
    if (livesElement) {
        livesElement.textContent = `Vidas: ${lives}`;
    }
}

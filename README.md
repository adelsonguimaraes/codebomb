Documentação do Projeto: Multiplayer Bomberman
Este documento detalha as funcionalidades e a arquitetura do jogo "Multiplayer Bomberman" desenvolvido. Ele serve como um guia para desenvolvedores que desejam entender, modificar ou expandir o projeto.

Estrutura do Projeto
O projeto é dividido em módulos JavaScript para garantir a organização e a manutenibilidade do código.

main.js: Ponto de entrada principal que inicializa o GameManager.

game.js: Classe central (GameManager) que gerencia o estado do jogo, a lógica de atualização e o loop principal.

render.js: Módulo responsável por toda a lógica de desenho e renderização no Canvas.

map.js: Lida com a geração e o gerenciamento do mapa, incluindo blocos, paredes, power-ups e o evento de fechamento da arena.

player.js: Define a classe Player e gerencia as entradas de teclado.

bomb.js: Contém a lógica para plantar bombas, gerenciar seus temporizadores e criar as explosões.

powerup.js: Define a classe Block e os diferentes tipos de power-ups, como BombCount, Speed e ExplosionRadius.

index.html: Arquivo HTML que hospeda o Canvas e os elementos da interface (HUD).

Funcionalidades Implementadas
1. Jogador e Controles
Movimento do Jogador: O jogador pode se mover para cima, baixo, esquerda e direita usando as teclas W, A, S e D. A movimentação é baseada em pixels, mas alinhada com a grade do mapa para evitar movimentos em áreas com blocos.

Colisões: O sistema de colisão impede que o jogador passe por paredes indestrutíveis, blocos destrutíveis e outras bombas.

Plantar Bombas: Ao pressionar a barra de espaço, o jogador planta uma bomba em sua posição atual.

2. Mapa e Ambiente
Geração de Mapa: O mapa é gerado dinamicamente com paredes indestrutíveis (X), espaços vazios e blocos destrutíveis (*). As posições iniciais dos jogadores são garantidas como seguras.

Blocos Destrutíveis: Os blocos * podem ser destruídos por explosões de bombas, revelando caminhos ou power-ups.

Fechamento da Arena: Um evento de fechamento da arena é ativado ao final de 2 minutos de jogo. O fechamento ocorre em fases, onde a borda externa do mapa se move para dentro a cada 10 segundos, reduzindo o tamanho do campo de jogo.

HUD (Interface do Usuário): Um cronômetro fixo é exibido no canto superior direito da tela, mostrando o tempo restante da partida, para que os jogadores possam se preparar para o evento de fechamento.

3. Bombas e Explosões
Temporizador de Bomba: A bomba plantada tem um temporizador que a faz piscar, indicando que está prestes a explodir.

Explosão em Cruz: A explosão se espalha em uma forma de cruz (horizontal e vertical), destruindo blocos e outros jogadores dentro de seu raio.

Encadeamento de Bombas: Uma explosão pode detonar outras bombas que estejam em seu raio de alcance.

4. Power-ups
Os power-ups aparecem aleatoriamente ao destruir blocos e concedem melhorias temporárias ou permanentes ao jogador.

BombCount (Contagem de Bombas): Aumenta o número máximo de bombas que o jogador pode plantar simultaneamente.

Speed (Velocidade): Aumenta a velocidade de movimento do jogador.

ExplosionRadius (Raio de Explosão): Aumenta o alcance da explosão da bomba.
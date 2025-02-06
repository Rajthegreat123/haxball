const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreboard = document.getElementById('scoreboard');

const ws = new WebSocket('ws://remove-tonight.gl.at.ply.gg:53317');
const username = localStorage.getItem('username');

let keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  sendInput();
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
  sendInput();
});

function sendInput() {
  ws.send(JSON.stringify({
    type: 'input',
    keys: keys
  }));
}

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'join',
    username: username
  }));
};

function drawField() {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  
  // Center line
  ctx.beginPath();
  ctx.moveTo(400, 0);
  ctx.lineTo(400, 600);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(400, 300, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Penalty areas
  ctx.strokeRect(0, 200, 100, 200); // Left
  ctx.strokeRect(700, 200, 100, 200); // Right

  // Penalty spots
  ctx.beginPath();
  ctx.arc(50, 300, 5, 0, Math.PI * 2); // Left
  ctx.arc(750, 300, 5, 0, Math.PI * 2); // Right
  ctx.fillStyle = 'white';
  ctx.fill();

  // Goals
  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.fillRect(0, 200, 10, 200); // Left
  ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
  ctx.fillRect(790, 200, 10, 200); // Right
}

ws.onmessage = (message) => {
  const gameState = JSON.parse(message.data);
  
  ctx.fillStyle = '#008000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawField();

  // Draw players
  Object.entries(gameState.players).forEach(([username, player], index) => {
    ctx.fillStyle = index === 0 ? '#e74c3c' : '#3498db';
    ctx.beginPath();
    ctx.arc(player.x + 15, player.y + 15, 15, 0, Math.PI * 2);
    ctx.fill();

    // Username text
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(username, player.x + 15, player.y - 5);
  });

  // Draw ball (centered properly)
  ctx.beginPath();
  ctx.arc(gameState.ball.x + 5, gameState.ball.y + 5, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  // Update scoreboard
  const players = Object.keys(gameState.players);
  scoreboard.textContent = `${players[0] || 'Waiting...'}: ${gameState.score.player1} - ${players[1] || 'Waiting...'}: ${gameState.score.player2}`;

  if (gameState.score.player1 >= 5 || gameState.score.player2 >= 5) {
    localStorage.removeItem('username');
    window.location.href = '/';
  }
};

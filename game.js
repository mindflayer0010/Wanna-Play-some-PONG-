const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;
const PADDLE_SPEED = 5;
const BALL_SPEED = 5;

// Paddle objects
let playerPaddle = {
  x: PLAYER_X,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2
};

let aiPaddle = {
  x: AI_X,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2
};

// Ball object
let ball = {
  x: canvas.width / 2 - BALL_SIZE / 2,
  y: canvas.height / 2 - BALL_SIZE / 2,
  vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
  vy: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
};

// Particle trail for ball
let particles = [];

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  playerPaddle.y = mouseY - PADDLE_HEIGHT / 2;
  // Clamp paddle within canvas
  if (playerPaddle.y < 0) playerPaddle.y = 0;
  if (playerPaddle.y + PADDLE_HEIGHT > canvas.height)
    playerPaddle.y = canvas.height - PADDLE_HEIGHT;
});

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Ball collision with top/bottom walls
  if (ball.y <= 0 || ball.y + BALL_SIZE >= canvas.height) {
    ball.vy *= -1;
    ball.y = Math.max(0, Math.min(ball.y, canvas.height - BALL_SIZE));
  }

  // Ball collision with player paddle
  if (
    ball.x <= playerPaddle.x + PADDLE_WIDTH &&
    ball.y + BALL_SIZE >= playerPaddle.y &&
    ball.y <= playerPaddle.y + PADDLE_HEIGHT
  ) {
    ball.vx *= -1;
    ball.x = playerPaddle.x + PADDLE_WIDTH;
    // Add a little randomness to ball's vertical direction
    ball.vy += (Math.random() - 0.5) * 2;
  }

  // Ball collision with AI paddle
  if (
    ball.x + BALL_SIZE >= aiPaddle.x &&
    ball.y + BALL_SIZE >= aiPaddle.y &&
    ball.y <= aiPaddle.y + PADDLE_HEIGHT
  ) {
    ball.vx *= -1;
    ball.x = aiPaddle.x - BALL_SIZE;
    ball.vy += (Math.random() - 0.5) * 2;
  }

  // Ball out of bounds (left or right)
  if (ball.x < 0 || ball.x + BALL_SIZE > canvas.width) {
    resetBall();
  }

  // Add particle trail
  particles.push({
    x: ball.x + BALL_SIZE / 2,
    y: ball.y + BALL_SIZE / 2,
    life: 1
  });

  // Update and remove old particles
  particles = particles.filter(p => {
    p.life -= 0.02;
    return p.life > 0;
  });

  // AI paddle logic: follow the ball
  let aiCenter = aiPaddle.y + PADDLE_HEIGHT / 2;
  if (aiCenter < ball.y + BALL_SIZE / 2 - 10) {
    aiPaddle.y += PADDLE_SPEED;
  } else if (aiCenter > ball.y + BALL_SIZE / 2 + 10) {
    aiPaddle.y -= PADDLE_SPEED;
  }
  // Clamp AI paddle within canvas
  if (aiPaddle.y < 0) aiPaddle.y = 0;
  if (aiPaddle.y + PADDLE_HEIGHT > canvas.height)
    aiPaddle.y = canvas.height - PADDLE_HEIGHT;
}

function resetBall() {
  ball.x = canvas.width / 2 - BALL_SIZE / 2;
  ball.y = canvas.height / 2 - BALL_SIZE / 2;
  ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ball.vy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

function draw() {
  // Create fade effect instead of clearing completely
  ctx.fillStyle = 'rgba(20, 20, 30, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw center line with glow
  ctx.strokeStyle = '#4488ff';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#4488ff';
  ctx.setLineDash([8, 12]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;

  // Draw particle trail
  particles.forEach(p => {
    const alpha = p.life * 0.8;
    const size = p.life * 6;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
    gradient.addColorStop(0, `rgba(255, 100, 255, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(100, 150, 255, ${alpha * 0.5})`);
    gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw player paddle with gradient and glow
  const playerGradient = ctx.createLinearGradient(
    playerPaddle.x, 
    playerPaddle.y, 
    playerPaddle.x + PADDLE_WIDTH, 
    playerPaddle.y
  );
  playerGradient.addColorStop(0, '#00ff88');
  playerGradient.addColorStop(1, '#00cc66');
  ctx.fillStyle = playerGradient;
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#00ff88';
  roundRect(ctx, playerPaddle.x, playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
  ctx.fill();

  // Draw AI paddle with gradient and glow
  const aiGradient = ctx.createLinearGradient(
    aiPaddle.x, 
    aiPaddle.y, 
    aiPaddle.x + PADDLE_WIDTH, 
    aiPaddle.y
  );
  aiGradient.addColorStop(0, '#ff6644');
  aiGradient.addColorStop(1, '#ff4422');
  ctx.fillStyle = aiGradient;
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#ff6644';
  roundRect(ctx, aiPaddle.x, aiPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
  ctx.fill();

  // Draw ball with gradient and glow
  const ballGradient = ctx.createRadialGradient(
    ball.x + BALL_SIZE / 2, 
    ball.y + BALL_SIZE / 2, 
    0,
    ball.x + BALL_SIZE / 2, 
    ball.y + BALL_SIZE / 2, 
    BALL_SIZE
  );
  ballGradient.addColorStop(0, '#ffffff');
  ballGradient.addColorStop(0.3, '#ffaaff');
  ballGradient.addColorStop(1, '#8844ff');
  ctx.fillStyle = ballGradient;
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#ff44ff';
  ctx.beginPath();
  ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowBlur = 0;
}

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Start the game
gameLoop();
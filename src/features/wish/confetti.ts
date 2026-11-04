/** Canvas celebration effects: confetti bursts and rising balloons. */

const CONFETTI_COLORS = [
  "#FF5252", "#FF4081", "#E040FB", "#7C4DFF", "#536DFE",
  "#FFD700", "#FF6E40", "#69F0AE", "#ffffff",
];

const BALLOON_COLORS = ["#ff4d6d", "#ffb703", "#4cc9f0", "#b5179e", "#80ed99", "#f72585"];

function prepare(canvas: HTMLCanvasElement | null) {
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return ctx;
}

interface Confetto {
  x: number; y: number; vx: number; vy: number; size: number; color: string;
  rotation: number; rotSpeed: number; shape: "rect" | "circle" | "heart"; opacity: number;
}

export function burstConfetti(canvas: HTMLCanvasElement | null, count = 80): () => void {
  const ctx = prepare(canvas);
  if (!canvas || !ctx) return () => {};

  const originX = canvas.width / 2;
  const originY = canvas.height * 0.6;
  const pieces: Confetto[] = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 4;
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      size: Math.random() * 8 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.4 ? "rect" : Math.random() > 0.5 ? "circle" : "heart",
      opacity: 1,
    };
  });

  let frame = 0;
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of pieces) {
      if (p.opacity <= 0.02) continue;
      alive++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25;
      p.vx *= 0.98;
      p.rotation += p.rotSpeed;
      p.opacity -= 0.008;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.font = `${p.size * 1.5}px serif`;
        ctx.fillText("♥", -p.size / 2, p.size / 2);
      }
      ctx.restore();
    }
    if (alive > 0) frame = requestAnimationFrame(render);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  render();
  return () => cancelAnimationFrame(frame);
}

interface Balloon {
  x: number; y: number; r: number; speed: number; sway: number; phase: number; color: string;
}

export function floatBalloons(canvas: HTMLCanvasElement | null, count = 14): () => void {
  const ctx = prepare(canvas);
  if (!canvas || !ctx) return () => {};

  const balloons: Balloon[] = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height + 60 + Math.random() * canvas.height * 0.6,
    r: 18 + Math.random() * 14,
    speed: 1.4 + Math.random() * 1.6,
    sway: 0.6 + Math.random() * 1.2,
    phase: Math.random() * Math.PI * 2,
    color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
  }));

  let frame = 0;
  let t = 0;
  const render = () => {
    t += 0.03;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const b of balloons) {
      b.y -= b.speed;
      const x = b.x + Math.sin(t * b.sway + b.phase) * 18;
      if (b.y < -b.r * 3) continue;
      alive++;

      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, b.y + b.r * 1.2);
      ctx.quadraticCurveTo(x - 6, b.y + b.r * 2.2, x, b.y + b.r * 3);
      ctx.stroke();

      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.ellipse(x, b.y, b.r * 0.82, b.r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.ellipse(x - b.r * 0.28, b.y - b.r * 0.35, b.r * 0.16, b.r * 0.3, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (alive > 0) frame = requestAnimationFrame(render);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  render();
  return () => cancelAnimationFrame(frame);
}


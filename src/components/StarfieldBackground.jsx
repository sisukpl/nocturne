import React, { useEffect, useRef } from 'react';

export default function StarfieldBackground({ auroraIntensity = 30 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate random stars
    const numStars = Math.min(180, Math.floor((width * height) / 10000));
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.015 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1,
    }));

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Render stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha += star.speed * star.direction;
        if (star.alpha > 0.95) {
          star.alpha = 0.95;
          star.direction = -1;
        } else if (star.alpha < 0.15) {
          star.alpha = 0.15;
          star.direction = 1;
        }

        ctx.fillStyle = `rgba(226, 232, 240, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render subtle undulating aurora curtain along the top
      const curtainHeight = Math.min(240, height * 0.35);
      const intensity = Math.max(0.08, Math.min(0.35, auroraIntensity / 250));

      const grad = ctx.createLinearGradient(0, 0, 0, curtainHeight);
      grad.addColorStop(0, `rgba(16, 185, 129, ${intensity})`);
      grad.addColorStop(0.4, `rgba(6, 182, 212, ${intensity * 0.7})`);
      grad.addColorStop(0.8, `rgba(139, 92, 246, ${intensity * 0.4})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);

      const waveSteps = 14;
      const stepW = width / waveSteps;
      for (let i = 0; i <= waveSteps; i++) {
        const x = i * stepW;
        const wave = Math.sin(time + i * 0.45) * 35 + Math.cos(time * 0.7 + i * 0.2) * 20;
        ctx.lineTo(x, curtainHeight * 0.5 + wave);
      }

      ctx.lineTo(width, 0);
      ctx.closePath();
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [auroraIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ background: 'radial-gradient(circle at 50% 10%, #080e22 0%, #040711 70%)' }}
    />
  );
}

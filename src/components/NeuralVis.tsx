import React, { useEffect, useRef, memo } from 'react';

interface NeuralVisProps {
  gravity: number;
}

export const NeuralVis = memo(({ gravity }: NeuralVisProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previousGravityRef = useRef(gravity);

  useEffect(() => {
    if (!canvasRef.current || previousGravityRef.current === gravity) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 800, 200);

    // Draw neural network visualization
    const drawNeuron = (x: number, y: number, value: number) => {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(107, 70, 193, ${value})`;
      ctx.fill();
    };

    const drawConnection = (x1: number, y1: number, x2: number, y2: number, value: number) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(96, 165, 250, ${value})`;
      ctx.stroke();
    };

    // Normalize gravity value between 0 and 1
    const normalizedGravity = gravity / 25;

    // Draw simple 3-layer network
    for (let i = 0; i < 3; i++) {
      drawNeuron(100 + i * 300, 100, normalizedGravity);
      if (i < 2) {
        drawConnection(110 + i * 300, 100, 390 + i * 300, 100, normalizedGravity);
      }
    }

    previousGravityRef.current = gravity;
  }, [gravity]);

  return (
    <div className="bg-space-purple/10 p-4 rounded-lg backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4">Neural Network Visualization</h2>
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full bg-space-black/50 rounded-lg"
      />
    </div>
  );
});

NeuralVis.displayName = 'NeuralVis';
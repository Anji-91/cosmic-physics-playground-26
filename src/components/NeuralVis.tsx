import React, { useEffect, useRef, memo } from 'react';

interface NeuralVisProps {
  gravity: number;
}

const gravityInfo: Record<string, string> = {
  venus: "Venus, Earth's 'sister planet,' has a surface gravity of 8.87 m/s², which is 90% of Earth's gravity. Despite being slightly smaller than Earth, its dense atmosphere and rocky composition contribute to this strong gravitational pull, making it the most Earth-like in terms of gravity.",
  
  earth: "Earth's gravity, at 9.81 m/s², is our reference point for comparing other celestial bodies. This gravitational force is perfect for human evolution, maintaining our atmosphere, and creating the conditions necessary for life as we know it.",
  
  moon: "The Moon's gravity is just 1.62 m/s², about one-sixth of Earth's. This lower gravity is why astronauts can make those iconic bouncing leaps on the lunar surface. Despite its weak gravity, it's strong enough to create Earth's tides and stabilize our planet's axial tilt.",
  
  mars: "Mars has a gravity of 3.72 m/s², about 38% of Earth's. This reduced gravity is due to Mars' smaller size and mass. Future Mars colonists will need to adapt to this environment, which could affect muscle and bone density over time.",
  
  jupiter: "Jupiter, the solar system's largest planet, has a powerful gravity of 24.79 m/s², about 2.4 times stronger than Earth's. This intense gravitational field helps Jupiter maintain its massive atmosphere and capture passing objects, protecting inner planets from potential impacts.",
  
  saturn: "Saturn's gravity at its surface (defined at the top of its atmosphere) is 10.44 m/s², slightly stronger than Earth's. However, as a gas giant, Saturn's gravity varies significantly with depth, and its low density means that despite its size, its surface gravity isn't as strong as Jupiter's.",
  
  uranus: "Uranus has a gravity of 8.69 m/s². This ice giant's gravity helps maintain its unique sideways rotation and hold onto its system of rings and moons, despite being about four times less massive than Jupiter.",
  
  neptune: "Neptune's gravity is 11.15 m/s², about 1.14 times stronger than Earth's. This strong gravitational pull, combined with its powerful winds, creates the fastest wind speeds in the solar system, reaching up to 1,200 mph."
};

const planetImages: Record<string, string> = {
  venus: "/lovable-uploads/venus.jpg",
  earth: "/lovable-uploads/earth.jpg",
  moon: "/lovable-uploads/moon.jpg",
  mars: "/lovable-uploads/mars.jpg",
  jupiter: "/lovable-uploads/jupiter.jpg",
  saturn: "/lovable-uploads/saturn.jpg",
  uranus: "/lovable-uploads/uranus.jpg",
  neptune: "/lovable-uploads/08afcaed-6954-4638-a11a-71fc8661e17f.png",
  mercury: "/lovable-uploads/mercury.jpg"
};

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

  // Find the matching planet based on gravity value
  const getCurrentPlanet = () => {
    const gravityMap: Record<number, string> = {
      3.7: 'mercury',
      8.87: 'venus',
      9.81: 'earth',
      1.62: 'moon',
      3.72: 'mars',
      24.79: 'jupiter',
      10.44: 'saturn',
      8.69: 'uranus',
      11.15: 'neptune'
    };

    // Find the closest gravity value
    const closest = Object.keys(gravityMap).reduce((prev, curr) => {
      return Math.abs(Number(curr) - gravity) < Math.abs(Number(prev) - gravity) 
        ? curr 
        : prev;
    });

    return gravityMap[Number(closest)];
  };

  const currentPlanet = getCurrentPlanet();
  const currentInfo = gravityInfo[currentPlanet] || '';
  const currentImage = planetImages[currentPlanet] || '';

  return (
    <div className="bg-space-purple/10 p-4 rounded-lg backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4">Neural Network Visualization</h2>
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full bg-space-black/50 rounded-lg mb-4"
      />
      <div className="mt-4 p-4 bg-space-black/30 rounded-lg">
        <div className="flex items-start gap-4">
          {currentImage && (
            <img 
              src={currentImage} 
              alt={`${currentPlanet} visualization`}
              className="w-24 h-24 rounded-lg object-cover"
            />
          )}
          <p className="text-white/90 leading-relaxed flex-1">
            {currentInfo}
          </p>
        </div>
      </div>
    </div>
  );
});

NeuralVis.displayName = 'NeuralVis';
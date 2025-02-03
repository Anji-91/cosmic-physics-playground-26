import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { PlanetSelector } from './PlanetSelector';
import { ShapeControls } from './ShapeControls';
import { NeuralVis } from './NeuralVis';

const PhysicsPlayground = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create());
  const [selectedPlanet, setSelectedPlanet] = useState('earth');
  const [showNeural, setShowNeural] = useState(false);

  useEffect(() => {
    if (!sceneRef.current) return;

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engineRef.current,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: '#0B0B0F',
      },
    });

    Matter.Runner.run(engineRef.current);
    Matter.Render.run(render);

    return () => {
      Matter.Render.stop(render);
      Matter.Engine.clear(engineRef.current);
    };
  }, []);

  const addShape = (type: 'circle' | 'rectangle') => {
    const world = engineRef.current.world;
    const shape = type === 'circle'
      ? Matter.Bodies.circle(400, 50, 30, {
          render: { fillStyle: '#6B46C1' },
        })
      : Matter.Bodies.rectangle(400, 50, 60, 60, {
          render: { fillStyle: '#60A5FA' },
        });
    
    Matter.World.add(world, shape);
    toast('Shape added!');
  };

  const updateGravity = (planet: string) => {
    const gravityMap = {
      mercury: 3.7,
      venus: 8.87,
      earth: 9.81,
      moon: 1.62,
      mars: 3.72,
      jupiter: 24.79,
      saturn: 10.44,
      uranus: 8.87,
      neptune: 11.15,
    };

    setSelectedPlanet(planet);
    engineRef.current.gravity.y = gravityMap[planet as keyof typeof gravityMap];
    toast(`Gravity set to ${planet}'s gravity!`);
  };

  return (
    <div className="min-h-screen bg-space-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-8">
          <div className="w-3/4">
            <div ref={sceneRef} className="rounded-lg overflow-hidden border border-space-purple/30" />
          </div>
          
          <div className="w-1/4 space-y-6">
            <div className="bg-space-purple/10 p-4 rounded-lg backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4">Controls</h2>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => addShape('circle')}
                  className="w-full bg-space-purple hover:bg-space-purple/80 animate-float"
                >
                  Add Circle
                </Button>
                
                <Button 
                  onClick={() => addShape('rectangle')}
                  className="w-full bg-space-blue hover:bg-space-blue/80 animate-float"
                >
                  Add Rectangle
                </Button>

                <Button
                  onClick={() => setShowNeural(!showNeural)}
                  className="w-full bg-space-accent hover:bg-space-accent/80 animate-glow"
                >
                  <Brain className="mr-2" />
                  Neural Visualization
                </Button>
              </div>
            </div>

            <PlanetSelector 
              selected={selectedPlanet}
              onSelect={updateGravity}
            />

            <ShapeControls engine={engineRef.current} />
          </div>
        </div>

        {showNeural && (
          <div className="mt-8">
            <NeuralVis gravity={engineRef.current.gravity.y} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhysicsPlayground;
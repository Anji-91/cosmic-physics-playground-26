import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { Brain, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PlanetSelector } from './PlanetSelector';
import { ShapeControls } from './ShapeControls';
import { NeuralVis } from './NeuralVis';

const PhysicsPlayground = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create());
  const renderRef = useRef<Matter.Render | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState('earth');
  const [showNeural, setShowNeural] = useState(false);
  const shapesRef = useRef<Matter.Body[]>([]);

  // Initialize physics engine
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

    renderRef.current = render;

    // Add walls to contain shapes
    const walls = [
      Matter.Bodies.rectangle(400, 610, 810, 20, { isStatic: true }), // bottom
      Matter.Bodies.rectangle(-10, 300, 20, 620, { isStatic: true }), // left
      Matter.Bodies.rectangle(810, 300, 20, 620, { isStatic: true }), // right
    ];

    Matter.World.add(engineRef.current.world, walls);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engineRef.current);
    Matter.Render.run(render);

    return () => {
      // Cleanup
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      if (render.canvas) {
        render.canvas.remove();
      }
      shapesRef.current = [];
    };
  }, []);

  const addShape = useCallback((type: 'circle' | 'rectangle') => {
    const world = engineRef.current.world;
    
    const shape = type === 'circle'
      ? Matter.Bodies.circle(400, 50, 30, {
          render: { fillStyle: '#6B46C1' },
          restitution: 0.6,
          friction: 0.1,
        })
      : Matter.Bodies.rectangle(400, 50, 60, 60, {
          render: { fillStyle: '#60A5FA' },
          restitution: 0.6,
          friction: 0.1,
        });
    
    Matter.World.add(world, shape);
    shapesRef.current.push(shape);
    toast('Shape added!');
  }, []);

  const clearShapes = useCallback(() => {
    const world = engineRef.current.world;
    shapesRef.current.forEach(shape => {
      Matter.World.remove(world, shape);
    });
    shapesRef.current = [];
    toast('All shapes cleared!');
  }, []);

  const updateGravity = useCallback((planet: string) => {
    const gravityMap = {
      mercury: 3.7,
      venus: 8.87,
      earth: 9.81,
      moon: 1.62,
      mars: 3.72,
      jupiter: 24.79,
      saturn: 10.44,
      uranus: 8.69,
      neptune: 11.15,
    };

    setSelectedPlanet(planet);
    engineRef.current.gravity.y = gravityMap[planet as keyof typeof gravityMap];
    toast(`Gravity set to ${planet}'s gravity!`);
  }, []);

  return (
    <div className="min-h-screen bg-space-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/4">
            <div ref={sceneRef} className="rounded-lg overflow-hidden border border-space-purple/30" />
          </div>
          
          <div className="w-full lg:w-1/4 space-y-6">
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
                  onClick={clearShapes}
                  className="w-full bg-space-accent hover:bg-space-accent/80"
                >
                  <Trash2 className="mr-2" />
                  Clear Shapes
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
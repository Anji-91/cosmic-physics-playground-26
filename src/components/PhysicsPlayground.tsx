import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { Brain, Trash2, RotateCcw, Zap, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PlanetSelector } from './PlanetSelector';
import { ShapeControls } from './ShapeControls';
import { NeuralVis } from './NeuralVis';
import { Slider } from '@/components/ui/slider';

const PhysicsPlayground = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create());
  const renderRef = useRef<Matter.Render | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState('earth');
  const [showNeural, setShowNeural] = useState(false);
  const shapesRef = useRef<Matter.Body[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    const walls = [
      Matter.Bodies.rectangle(400, 610, 810, 20, { 
        isStatic: true,
        render: { fillStyle: '#1a1a1a' }
      }),
      Matter.Bodies.rectangle(-10, 300, 20, 620, { 
        isStatic: true,
        render: { fillStyle: '#1a1a1a' }
      }),
      Matter.Bodies.rectangle(810, 300, 20, 620, { 
        isStatic: true,
        render: { fillStyle: '#1a1a1a' }
      }),
    ];

    Matter.World.add(engineRef.current.world, walls);

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engineRef.current);
    Matter.Render.run(render);

    return () => {
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

  const addShape = useCallback((type: 'circle' | 'rectangle' | 'triangle') => {
    const world = engineRef.current.world;
    let shape;
    
    const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
    
    switch(type) {
      case 'circle':
        shape = Matter.Bodies.circle(400, 50, 30, {
          render: { fillStyle: randomColor },
          restitution: 0.6,
          friction: 0.1,
        });
        break;
      case 'rectangle':
        shape = Matter.Bodies.rectangle(400, 50, 60, 60, {
          render: { fillStyle: randomColor },
          restitution: 0.6,
          friction: 0.1,
        });
        break;
      case 'triangle':
        shape = Matter.Bodies.polygon(400, 50, 3, 40, {
          render: { fillStyle: randomColor },
          restitution: 0.6,
          friction: 0.1,
        });
        break;
    }
    
    Matter.World.add(world, shape);
    shapesRef.current.push(shape);
    toast('Shape added!', {
      description: `Added a ${type} to the playground`,
    });
  }, []);

  const clearShapes = useCallback(() => {
    const world = engineRef.current.world;
    shapesRef.current.forEach(shape => {
      Matter.World.remove(world, shape);
    });
    shapesRef.current = [];
    toast('All shapes cleared!', {
      description: 'The playground has been reset',
    });
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
    toast(`Gravity changed!`, {
      description: `Now simulating ${planet}'s gravity`,
    });
  }, []);

  const togglePause = useCallback(() => {
    if (runnerRef.current) {
      if (isPaused) {
        Matter.Runner.run(runnerRef.current, engineRef.current);
      } else {
        Matter.Runner.stop(runnerRef.current);
      }
      setIsPaused(!isPaused);
      toast(isPaused ? 'Simulation resumed' : 'Simulation paused');
    }
  }, [isPaused]);

  const updateTimeScale = useCallback((value: number[]) => {
    const newTimeScale = value[0];
    setTimeScale(newTimeScale);
    if (engineRef.current) {
      engineRef.current.timing.timeScale = newTimeScale;
    }
    toast('Time scale updated', {
      description: `Simulation speed set to ${newTimeScale}x`,
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0 bg-black" />
      
      <div className="relative z-10 min-h-screen bg-gradient-to-b from-transparent to-space-black/90 text-white p-8">
        <div className="max-w-6xl mx-auto backdrop-blur-sm rounded-xl p-8 border border-white/10 shadow-2xl">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
            Cosmic Physics Playground
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-3/4">
              <div 
                ref={sceneRef} 
                className="rounded-lg overflow-hidden border border-space-purple/30 shadow-lg transform hover:scale-[1.01] transition-transform duration-300"
              />
              
              <div className="mt-4 flex gap-4 flex-wrap">
                <Button
                  onClick={togglePause}
                  variant="outline"
                  className="bg-space-purple/10 hover:bg-space-purple/20"
                >
                  {isPaused ? <Play className="mr-2" /> : <Pause className="mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                
                <div className="flex-1 flex items-center gap-4 bg-space-purple/10 rounded-lg px-4">
                  <Zap className="text-yellow-400" />
                  <div className="flex-1">
                    <Slider
                      value={[timeScale]}
                      onValueChange={updateTimeScale}
                      min={0.1}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <span className="text-sm text-white/70">{timeScale}x</span>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/4 space-y-6">
              <div className="bg-space-purple/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
                <h2 className="text-xl font-bold mb-4">Controls</h2>
                
                <div className="space-y-4">
                  <Button 
                    onClick={() => addShape('circle')}
                    className="w-full bg-space-purple hover:bg-space-purple/80 animate-float shadow-lg"
                  >
                    Add Circle
                  </Button>
                  
                  <Button 
                    onClick={() => addShape('rectangle')}
                    className="w-full bg-space-blue hover:bg-space-blue/80 animate-float shadow-lg"
                  >
                    Add Rectangle
                  </Button>

                  <Button 
                    onClick={() => addShape('triangle')}
                    className="w-full bg-space-accent hover:bg-space-accent/80 animate-float shadow-lg"
                  >
                    Add Triangle
                  </Button>

                  <Button
                    onClick={clearShapes}
                    variant="destructive"
                    className="w-full shadow-lg group"
                  >
                    <Trash2 className="mr-2 group-hover:rotate-12 transition-transform" />
                    Clear Shapes
                  </Button>
                </div>
              </div>

              <PlanetSelector 
                selected={selectedPlanet}
                onSelect={updateGravity}
              />

              <ShapeControls engine={engineRef.current} />

              <Button
                onClick={() => setShowNeural(!showNeural)}
                className="w-full bg-space-accent hover:bg-space-accent/80 animate-glow shadow-lg group"
              >
                <Brain className="mr-2 group-hover:rotate-12 transition-transform" />
                Neural Visualization
              </Button>
            </div>
          </div>

          {showNeural && (
            <div className="mt-8 transform hover:scale-[1.01] transition-transform duration-300">
              <NeuralVis gravity={engineRef.current.gravity.y} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhysicsPlayground;
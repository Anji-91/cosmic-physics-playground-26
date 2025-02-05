import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { Brain, Trash2, RotateCcw, Zap, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PlanetSelector } from './PlanetSelector';
import { ShapeControls } from './ShapeControls';
import { NeuralVis } from './NeuralVis';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Get the container width for responsive canvas
    const containerWidth = sceneRef.current.clientWidth;
    const canvasHeight = isMobile ? 400 : 600; // Adjust height for mobile

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engineRef.current,
      options: {
        width: containerWidth,
        height: canvasHeight,
        wireframes: false,
        background: '#0B0B0F',
      },
    });

    renderRef.current = render;

    // Create walls based on container size
    const walls = [
      Matter.Bodies.rectangle(containerWidth / 2, canvasHeight + 10, containerWidth + 20, 20, { 
        isStatic: true,
        render: { fillStyle: '#1a1a1a' }
      }),
      Matter.Bodies.rectangle(-10, canvasHeight / 2, 20, canvasHeight + 20, { 
        isStatic: true,
        render: { fillStyle: '#1a1a1a' }
      }),
      Matter.Bodies.rectangle(containerWidth + 10, canvasHeight / 2, 20, canvasHeight + 20, { 
        isStatic: true,
        render: { fillStyle: '#1a1a1a' }
      }),
    ];

    Matter.World.add(engineRef.current.world, walls);

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engineRef.current);
    Matter.Render.run(render);

    // Handle window resize
    const handleResize = () => {
      if (!sceneRef.current || !render.canvas) return;
      const newWidth = sceneRef.current.clientWidth;
      const newHeight = isMobile ? 400 : 600;
      
      render.canvas.width = newWidth;
      render.canvas.height = newHeight;
      render.options.width = newWidth;
      render.options.height = newHeight;
      
      // Update walls position
      walls.forEach(wall => Matter.World.remove(engineRef.current.world, wall));
      const newWalls = [
        Matter.Bodies.rectangle(newWidth / 2, newHeight + 10, newWidth + 20, 20, { 
          isStatic: true,
          render: { fillStyle: '#1a1a1a' }
        }),
        Matter.Bodies.rectangle(-10, newHeight / 2, 20, newHeight + 20, { 
          isStatic: true,
          render: { fillStyle: '#1a1a1a' }
        }),
        Matter.Bodies.rectangle(newWidth + 10, newHeight / 2, 20, newHeight + 20, { 
          isStatic: true,
          render: { fillStyle: '#1a1a1a' }
        }),
      ];
      Matter.World.add(engineRef.current.world, newWalls);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      if (render.canvas) {
        render.canvas.remove();
      }
      window.removeEventListener('resize', handleResize);
      shapesRef.current = [];
    };
  }, [isMobile]);

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
      
      <div className="relative z-10 min-h-screen bg-gradient-to-b from-transparent to-space-black/90 text-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto backdrop-blur-sm rounded-xl p-4 md:p-8 border border-white/10 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
            Cosmic Physics Playground
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
            <div className="w-full lg:w-3/4">
              <div 
                ref={sceneRef} 
                className="rounded-lg overflow-hidden border border-space-purple/30 shadow-lg transform hover:scale-[1.01] transition-transform duration-300"
              />
              
              <div className="mt-4 flex flex-wrap gap-4">
                <Button
                  onClick={togglePause}
                  variant="outline"
                  className="bg-space-purple/10 hover:bg-space-purple/20 transform hover:-translate-y-1 hover:rotate-3 transition-all duration-500 hover:shadow-[0_10px_20px_rgba(147,51,234,0.3)] border border-purple-500/50 hover:border-purple-500"
                >
                  {isPaused ? <Play className="mr-2 animate-bounce" /> : <Pause className="mr-2 animate-pulse" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                
                <div className="flex-1 flex items-center gap-4 bg-space-purple/10 rounded-lg px-4 py-2 hover:bg-space-purple/20 transition-all duration-300">
                  <Zap className="text-yellow-400 hidden sm:block animate-pulse" />
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
            
            <div className="w-full lg:w-1/4 space-y-4">
              <div className="bg-space-purple/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
                <h2 className="text-xl font-bold mb-4">Controls</h2>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => addShape('circle')}
                    className="w-full bg-space-purple hover:bg-space-purple/90 transform hover:scale-105 hover:-translate-y-1 hover:rotate-2 transition-all duration-500 hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:border-purple-400"
                  >
                    Add Circle
                  </Button>
                  
                  <Button 
                    onClick={() => addShape('rectangle')}
                    className="w-full bg-space-blue hover:bg-space-blue/90 transform hover:scale-105 hover:-translate-y-1 hover:-rotate-2 transition-all duration-500 hover:shadow-[0_0_30px_rgba(96,165,250,0.4)] hover:border-blue-400"
                  >
                    Add Rectangle
                  </Button>

                  <Button 
                    onClick={() => addShape('triangle')}
                    className="w-full bg-space-accent hover:bg-space-accent/90 transform hover:scale-105 hover:-translate-y-1 hover:rotate-3 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,61,113,0.4)] hover:border-pink-400"
                  >
                    Add Triangle
                  </Button>

                  <Button
                    onClick={clearShapes}
                    variant="destructive"
                    className="w-full shadow-lg group transform hover:scale-105 hover:-translate-y-1 transition-all duration-500 hover:bg-red-600/90 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:border-red-400"
                  >
                    <Trash2 className="mr-2 group-hover:rotate-12 transition-transform duration-500" />
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
                className="w-full bg-space-accent hover:bg-space-accent/90 transform hover:scale-105 hover:-translate-y-1 hover:skew-x-2 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,61,113,0.4)] group"
              >
                <Brain className="mr-2 group-hover:rotate-[360deg] transition-all duration-700" />
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

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
import { ShapeRenderer } from './physics/ShapeRenderer';
import { PhysicsInspector } from './physics/PhysicsInspector';
import { Tutorial } from './physics/Tutorial';
import { ParticleEffect } from './physics/ParticleEffect';

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

  const [selectedBody, setSelectedBody] = useState<Matter.Body | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [particleEffects, setParticleEffects] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (!sceneRef.current) return;

    const containerWidth = sceneRef.current.clientWidth;
    const canvasHeight = isMobile ? 400 : 600;

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

    // Update collision detection to correctly access position
    Matter.Events.on(engineRef.current, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const collisionPoint = {
          x: (bodyA.position.x + bodyB.position.x) / 2,
          y: (bodyA.position.y + bodyB.position.y) / 2
        };
        setParticleEffects(prev => [...prev, collisionPoint]);
      });
    });

    // Add mouse control
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engineRef.current, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });

    Matter.World.add(engineRef.current.world, mouseConstraint);
    render.mouse = mouse;

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
      Matter.Events.off(engineRef.current, 'collisionStart');
    };
  }, [isMobile]);

  const addShape = useCallback((type: 'circle' | 'rectangle' | 'triangle', color?: string) => {
    const world = engineRef.current.world;
    const canvasWidth = renderRef.current?.canvas.width || 800;
    const startX = canvasWidth / 2;
    
    let shape;
    const shapeColor = color || `hsl(${Math.random() * 360}, 70%, 60%)`;
    
    switch(type) {
      case 'circle':
        shape = Matter.Bodies.circle(startX, 50, 30, {
          render: { fillStyle: shapeColor },
          restitution: 0.6,
          friction: 0.1,
        });
        break;
      case 'rectangle':
        shape = Matter.Bodies.rectangle(startX, 50, 60, 60, {
          render: { fillStyle: shapeColor },
          restitution: 0.6,
          friction: 0.1,
        });
        break;
      case 'triangle':
        shape = Matter.Bodies.polygon(startX, 50, 3, 40, {
          render: { fillStyle: shapeColor },
          restitution: 0.6,
          friction: 0.1,
        });
        break;
    }
    
    Matter.World.add(world, shape);
    shapesRef.current.push(shape);
    
    // Add particle effect at shape creation
    setParticleEffects(prev => [...prev, { x: startX, y: 50 }]);
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
      {/* Parallax Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-1/4 w-4 h-4 bg-purple-500/30 rounded-full animate-float" 
             style={{animationDelay: '0s', transform: `translateY(${scrollY * 0.2}px)`}} />
        <div className="absolute top-20 right-1/3 w-6 h-6 bg-blue-500/30 rounded-full animate-float" 
             style={{animationDelay: '0.5s', transform: `translateY(${scrollY * 0.3}px)`}} />
        <div className="absolute top-40 left-1/3 w-8 h-8 bg-pink-500/30 rounded-full animate-float" 
             style={{animationDelay: '1s', transform: `translateY(${scrollY * 0.4}px)`}} />
        <div className="absolute bottom-20 right-1/4 w-5 h-5 bg-yellow-500/30 rounded-full animate-float" 
             style={{animationDelay: '1.5s', transform: `translateY(${scrollY * 0.25}px)`}} />
        
        {/* Star field effect */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-glow"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              transform: `translateY(${scrollY * (0.1 + Math.random() * 0.3)}px)`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen bg-gradient-to-b from-transparent to-space-black/90 text-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto backdrop-blur-sm rounded-xl p-4 md:p-8 border border-white/10 shadow-2xl">
          {showTutorial && (
            <div className="mb-8">
              <Tutorial />
              <Button 
                onClick={() => setShowTutorial(false)}
                className="mt-4"
              >
                Got it!
              </Button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
            <div className="w-full lg:w-3/4">
              <div ref={sceneRef} className="rounded-lg overflow-hidden border border-space-purple/30 shadow-lg" />
              
              <div className="mt-4 space-y-4">
                <ShapeRenderer engine={engineRef.current} addShape={addShape} />
                
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={togglePause}
                    variant="outline"
                    className="bg-space-purple/10 hover:bg-space-purple/20"
                  >
                    {isPaused ? <Play className="mr-2" /> : <Pause className="mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  
                  <div className="flex-1 flex items-center gap-4 bg-space-purple/10 rounded-lg px-4 py-2">
                    <Zap className="text-yellow-400 hidden sm:block" />
                    <Slider
                      value={[timeScale]}
                      onValueChange={updateTimeScale}
                      min={0.1}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                    <span className="text-sm text-white/70">{timeScale}x</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/4 space-y-4">
              <PlanetSelector selected={selectedPlanet} onSelect={updateGravity} />
              <PhysicsInspector selectedBody={selectedBody} />
              <ShapeControls engine={engineRef.current} />
            </div>
          </div>

          {showNeural && (
            <div className="mt-8">
              <NeuralVis gravity={engineRef.current.gravity.y} />
            </div>
          )}

          {/* Particle Effects */}
          {particleEffects.map((effect, index) => (
            <ParticleEffect key={index} x={effect.x} y={effect.y} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhysicsPlayground;
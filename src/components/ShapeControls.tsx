
import React, { useState, useEffect } from 'react';
import { Engine, Bodies, Body, World } from 'matter-js';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShapeControlsProps {
  engine: Matter.Engine;
}

export const ShapeControls = ({ engine }: ShapeControlsProps) => {
  const [size, setSize] = useState(30);
  const [rotation, setRotation] = useState(0);
  const [frameRate, setFrameRate] = useState(60);
  const isMobile = useIsMobile();

  // Set initial optimized settings based on device
  useEffect(() => {
    const initialFrameRate = isMobile ? 30 : 60;
    setFrameRate(initialFrameRate);
    updateFrameRate(initialFrameRate);

    // Set engine optimizations
    if (engine) {
      // Increase position iterations for better stability
      engine.positionIterations = isMobile ? 3 : 6;
      // Adjust velocity iterations for performance
      engine.velocityIterations = isMobile ? 2 : 4;
      // Enable sleeping for better performance
      engine.enableSleeping = true;
    }
  }, [engine, isMobile]);

  const updateShapeSizes = (newSize: number) => {
    setSize(newSize);
    engine.world.bodies.forEach((body) => {
      if (body.label !== 'Rectangle Body' && body.label !== 'Circle Body') return;
      
      const scale = newSize / 30;
      // Use Body.scale with a single operation
      Body.scale(body, scale, scale);
    });
    toast('Shape size updated');
  };

  const updateRotation = (newRotation: number) => {
    setRotation(newRotation);
    engine.world.bodies.forEach((body) => {
      // Skip static bodies and circles (circles don't show rotation visually)
      if (body.isStatic || body.label === 'Circle Body') return;
      
      // Convert rotation from degrees to radians
      const angleInRadians = (newRotation * Math.PI) / 180;
      
      // Reset angular velocity to prevent continuous rotation
      Body.setAngularVelocity(body, 0);
      
      // Set the new angle in a single operation
      Body.setAngle(body, angleInRadians);
      
      // Make sure the body is awake to apply changes
      Body.setStatic(body, false);
    });
    toast('Shape rotation updated');
  };

  const resetRotation = () => {
    updateRotation(0);
    toast('Rotation reset to 0°');
  };

  const updateFrameRate = (newFrameRate: number) => {
    setFrameRate(newFrameRate);
    if (engine.timing) {
      // Update engine timing settings
      engine.timing.timeScale = 60 / newFrameRate;
      // Cap the maximum physics step to prevent large jumps
      engine.timing.timestep = 1000 / newFrameRate;
    }
    toast('Frame rate updated');
  };

  return (
    <div className="bg-space-purple/10 p-4 rounded-lg backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4">Shape Controls</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Size</Label>
          <Slider
            value={[size]}
            onValueChange={([value]) => updateShapeSizes(value)}
            min={10}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Rotation (degrees)</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[rotation]}
              onValueChange={([value]) => updateRotation(value)}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
            <RotateCcw 
              className="h-4 w-4 cursor-pointer hover:text-primary"
              onClick={resetRotation}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Frame Rate</Label>
          <Slider
            value={[frameRate]}
            onValueChange={([value]) => updateFrameRate(value)}
            min={15}
            max={isMobile ? 60 : 120}
            step={1}
            className="w-full"
          />
          <div className="text-sm text-gray-400">{frameRate} FPS</div>
        </div>
      </div>
    </div>
  );
};


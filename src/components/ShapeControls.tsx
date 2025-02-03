import React, { useState } from 'react';
import { Engine, Bodies, Body, World } from 'matter-js';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ShapeControlsProps {
  engine: Matter.Engine;
}

export const ShapeControls = ({ engine }: ShapeControlsProps) => {
  const [size, setSize] = useState(30);

  const updateShapeSizes = (newSize: number) => {
    setSize(newSize);
    engine.world.bodies.forEach((body) => {
      if (body.label !== 'Rectangle Body' && body.label !== 'Circle Body') return;
      
      const scale = newSize / 30;
      Body.scale(body, scale, scale);
    });
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
      </div>
    </div>
  );
};
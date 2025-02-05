import React from 'react';
import Matter from 'matter-js';
import { toast } from 'sonner';

interface ShapeRendererProps {
  engine: Matter.Engine;
  addShape: (type: 'circle' | 'rectangle' | 'triangle', color?: string) => void;
}

export const ShapeRenderer = ({ engine, addShape }: ShapeRendererProps) => {
  const colors = [
    'rgb(239, 68, 68)', // red
    'rgb(59, 130, 246)', // blue
    'rgb(16, 185, 129)', // green
    'rgb(217, 70, 239)', // purple
    'rgb(251, 146, 60)', // orange
  ];

  const handleAddShape = (type: 'circle' | 'rectangle' | 'triangle') => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    addShape(type, randomColor);
    toast(`Added ${type}`, {
      description: 'Try adding more shapes to see them interact!',
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleAddShape('circle')}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Add Circle
      </button>
      <button
        onClick={() => handleAddShape('rectangle')}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Add Rectangle
      </button>
      <button
        onClick={() => handleAddShape('triangle')}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        Add Triangle
      </button>
    </div>
  );
};
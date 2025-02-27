import React from 'react';
import { Button } from '@/components/ui/button';

const planets = [
  { id: 'mercury', name: 'Mercury', color: '#A5A5A5' },
  { id: 'venus', name: 'Venus', color: '#E8B882' },
  { id: 'earth', name: 'Earth', color: '#4B9CD3' },
  { id: 'moon', name: 'Moon', color: '#D3D3D3' },
  { id: 'mars', name: 'Mars', color: '#E27B58' },
  { id: 'jupiter', name: 'Jupiter', color: '#C88B3A' },
  { id: 'saturn', name: 'Saturn', color: '#E4C87F' },
  { id: 'uranus', name: 'Uranus', color: '#B8E6E6' },
  { id: 'neptune', name: 'Neptune', color: '#3E66F9' },
];

interface PlanetSelectorProps {
  selected: string;
  onSelect: (planet: string) => void;
}

export const PlanetSelector = ({ selected, onSelect }: PlanetSelectorProps) => {
  return (
    <div className="bg-space-purple/10 p-4 rounded-lg backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4">Select Planet Gravity</h2>
      <div className="grid grid-cols-2 gap-2">
        {planets.map((planet) => (
          <Button
            key={planet.id}
            onClick={() => onSelect(planet.id)}
            className={`relative overflow-hidden transform hover:scale-110 hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_0_20px_${planet.color}80] ${
              selected === planet.id ? 'ring-2 ring-white/50' : ''
            } group`}
            style={{ 
              backgroundColor: planet.color,
              transform: selected === planet.id ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <span className="relative z-10 font-semibold group-hover:tracking-wider transition-all duration-300">
              {planet.name}
            </span>
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/30 group-hover:to-transparent transition-all duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
          </Button>
        ))}
      </div>
    </div>
  );
};
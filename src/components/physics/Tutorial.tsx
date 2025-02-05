import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Tutorial = () => {
  return (
    <Card className="bg-space-purple/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Welcome to Physics Playground!</CardTitle>
        <CardDescription>Learn how to use the simulator</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Adding Shapes</h3>
          <p>Click the shape buttons to add different objects to the playground.</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Gravity Control</h3>
          <p>Change the gravity to simulate different planetary environments.</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Time Control</h3>
          <p>Use the slider to speed up or slow down the simulation.</p>
        </div>
      </CardContent>
    </Card>
  );
};
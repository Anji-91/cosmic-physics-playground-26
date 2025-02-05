import React from 'react';
import Matter from 'matter-js';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PhysicsInspectorProps {
  selectedBody: Matter.Body | null;
  onRotationChange?: (angle: number) => void;
}

export const PhysicsInspector = ({ selectedBody, onRotationChange }: PhysicsInspectorProps) => {
  if (!selectedBody) return null;

  return (
    <Card className="p-4 bg-space-purple/10 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4">Physics Inspector</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Position X</TableCell>
            <TableCell>{selectedBody.position.x.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Position Y</TableCell>
            <TableCell>{selectedBody.position.y.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Velocity X</TableCell>
            <TableCell>{selectedBody.velocity.x.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Velocity Y</TableCell>
            <TableCell>{selectedBody.velocity.y.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Angular Velocity</TableCell>
            <TableCell>{selectedBody.angularVelocity.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Mass</TableCell>
            <TableCell>{selectedBody.mass.toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
};
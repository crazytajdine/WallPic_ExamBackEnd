// components/Canvas.tsx
"use client";

import React, { useState, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";

interface CanvasProps {
  onSave: (dataUrl: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ onSave }) => {
  const [lines, setLines] = useState<
    Array<{ points: number[]; color: string; lineWidth: number }>
  >([]);
  const isDrawing = useRef<boolean>(false);
  const stageRef = useRef(null);

  const handleMouseDown = () => {
    isDrawing.current = true;
    setLines([...lines, { points: [], color: "#000000", lineWidth: 2 }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    if (lastLine) {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      setLines(lines.slice(0, -1).concat(lastLine));
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleSave = () => {
    const uri = stageRef.current.toDataURL();
    onSave(uri);
  };

  return (
    <div>
      <Stage
        width={800}
        height={400}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        ref={stageRef}
        style={{ border: "1px solid grey" }}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.lineWidth}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation={
                line.color === "white" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
      <button
        onClick={handleSave}
        className="mt-2 p-2 bg-blue-500 text-white rounded"
      >
        Save Drawing
      </button>
    </div>
  );
};

export default Canvas;

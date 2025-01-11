// components/DrawingGrid.tsx
"use client";

import React, { useState } from "react";
import { Drawing } from "@/app/page";
import DrawingCard from "./DrawingCard";
import CommentsPanel from "./CommentsPanel";

interface DrawingGridProps {
  drawings: Drawing[];
}

const DrawingGrid: React.FC<DrawingGridProps> = ({ drawings }) => {
  // State to store the currently selected drawing
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);

  // Handle closing the comments panel
  const handleClosePanel = () => {
    setSelectedDrawing(null);
  };

  return (
    <>
      {/* Drawing Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {drawings.map((drawing) => (
          <DrawingCard
            key={drawing.id}
            drawing={drawing}
            onClick={() => setSelectedDrawing(drawing)}
          />
        ))}
      </div>

      {/* Comments Panel Overlay */}
      {selectedDrawing && (
        <CommentsPanel
          drawing={selectedDrawing}
          onClose={handleClosePanel}
        />
      )}
    </>
  );
};

export default DrawingGrid;

// components/DrawingGrid.tsx
"use client";

import React from "react";
import VoteButtons from "./VoteButtons";
import { Drawing } from "@/app/page";
import DrawingCard from "./DrawingCard";

interface DrawingGridProps {
  drawings: Drawing[];
  onVote: () => void; // Function to refresh drawings after a vote
}

const DrawingGrid: React.FC<DrawingGridProps> = ({ drawings }) => {
  if (drawings.length === 0) {
    return <p className="text-center text-gray-500">No drawings found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {drawings.map((drawing) => (
        <DrawingCard key={drawing.id} drawing={drawing}  />
      ))}
    </div>
  );
};

export default DrawingGrid;

// components/DrawingGrid.tsx
"use client";

import React from "react";
import VoteButtons from "./VoteButtons";
import { Drawing } from "@/app/page";

interface DrawingGridProps {
  drawings: Drawing[];
  onVote: () => void; // Function to refresh drawings after a vote
}

const DrawingGrid: React.FC<DrawingGridProps> = ({ drawings, onVote }) => {
  if (drawings.length === 0) {
    return <p className="text-center text-gray-500">No drawings found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {drawings.map((drawing) => (
        <div
          key={drawing.id}
          className="p-4 rounded-lg shadow-lg  bg-white flex flex-col"
          style={{
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Image */}
          <img
            src={drawing.image_url}
            alt={drawing.name}
            className="w-full border-2 border-black object-fill rounded-md"
          />

          {/* Name and Vote Count Container */}
          <div className="flex justify-between items-center mt-3">
            <h3 className="text-xl font-serif font-semibold text-gray-800">
              {drawing.name}
            </h3>
            <VoteButtons
              drawingId={drawing.id}
              upvotes={drawing.upvoteCount}
              downvotes={drawing.downvoteCount}
              onVote={onVote}
            />
          </div>

          {/* Author */}
          <p className="text-sm text-gray-600 mt-1">{drawing.user}</p>
        </div>
      ))}
    </div>
  );
};

export default DrawingGrid;

// components/DrawingGrid.tsx
"use client";

import React from "react";
import VoteButtons from "./VoteButtons";

interface Drawing {
  id: number;
  name: string;
  image_url: string;
  votes: number;
  user: { username: string };
}

interface DrawingGridProps {
  drawings: Drawing[];
  onVote: () => void; // Function to refresh drawings after a vote
}

const DrawingGrid: React.FC<DrawingGridProps> = ({ drawings, onVote }) => {
  if (drawings.length === 0) {
    return <p>No drawings found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {drawings.map((drawing) => (
        <div
          key={drawing.id}
          className="border p-4 rounded shadow flex flex-col"
        >
          {/* Image */}
          <img
            src={drawing.image_url}
            alt={drawing.name}
            className="w-full h-48 object-cover rounded"
          />

          {/* Name and Vote Count Container */}
          <div className="flex justify-between items-center mt-2">
            <h3 className="text-lg font-semibold">{drawing.name}</h3>
            <span className="text-sm text-gray-600">{drawing.votes} Votes</span>
          </div>

          {/* Author */}
          <p className="text-sm text-gray-600">By {drawing.user?.username}</p>

          {/* Vote Buttons */}
          <VoteButtons
            drawingId={drawing.id}
            currentVotes={drawing.votes}
            onVote={onVote} // Pass the onVote handler from props
          />
        </div>
      ))}
    </div>
  );
};

export default DrawingGrid;

// components/DrawingCard.tsx
import React from "react";
import VoteButtons from "./VoteButtons";
import { Drawing } from "@/app/page";

interface DrawingCardProps {
  drawing: Drawing;
}

const DrawingCard: React.FC<DrawingCardProps> = ({ drawing }) => {
  return (
    <div
      className="p-4 rounded-lg shadow-lg bg-white flex flex-col"
      style={{
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Image */}
      <img
        src={drawing.image_url}
        alt={drawing.name}
        className="w-full border-2 border-black object-fill rounded-md pointer-events-none"
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
          voted={drawing.voted}
        />
      </div>

      {/* Author */}
      <p className="text-sm text-gray-600 mt-1">{drawing.user}</p>
    </div>
  );
};

export default DrawingCard;

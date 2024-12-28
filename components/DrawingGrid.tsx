"use client";
// components/DrawingGrid.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import VoteButtons from "./VoteButtons";

interface Drawing {
  id: number;
  name: string;
  drawingUrl: string;
  votes: number;
  user: { username: string };
}

interface DrawingGridProps {
  categoryId?: number | null;
}

const DrawingGrid: React.FC<DrawingGridProps> = ({ categoryId }) => {
  const [drawings, setDrawings] = useState<Drawing[]>([]);

  const fetchDrawings = () => {
    const url = categoryId
      ? `/api/drawings?categoryId=${categoryId}`
      : "/api/drawings";
    axios.get(url).then((res) => setDrawings(res.data));
  };

  useEffect(() => {
    fetchDrawings();
  }, [categoryId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {drawings.map((drawing) => (
        <div key={drawing.id} className="border p-2 rounded shadow">
          <img
            src={drawing.drawingUrl}
            alt={drawing.name}
            className="w-full h-48 object-cover"
          />
          <h3 className="mt-2 text-lg">{drawing.name}</h3>
          <p className="text-sm text-gray-600">By {drawing.user?.username}</p>
          <VoteButtons
            drawingId={drawing.id}
            currentVotes={drawing.votes}
            onVote={fetchDrawings}
          />
        </div>
      ))}
    </div>
  );
};

export default DrawingGrid;

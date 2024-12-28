"use client";
// components/VoteButtons.tsx
import axios from "axios";
import { useState } from "react";

interface VoteButtonsProps {
  drawingId: number;
  currentVotes: number;
  onVote: () => void;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  drawingId,
  currentVotes,
  onVote,
}) => {
  const [votes, setVotes] = useState(currentVotes);
  const [voted, setVoted] = useState(false);

  const handleVote = async (type: "upvote" | "downvote") => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to vote.");
      return;
    }

    try {
      await axios.post("/api/votes/vote", {
        token,
        drawingId,
        voteType: type,
      });
      setVotes(votes + (type === "upvote" ? 1 : -1));
      setVoted(true);
      onVote();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error voting");
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-2">
      <button
        onClick={() => handleVote("upvote")}
        disabled={voted}
        className="px-2 py-1 bg-green-500 text-white rounded disabled:opacity-50"
      >
        Upvote
      </button>
      <span>{votes}</span>
      <button
        onClick={() => handleVote("downvote")}
        disabled={voted}
        className="px-2 py-1 bg-red-500 text-white rounded disabled:opacity-50"
      >
        Downvote
      </button>
    </div>
  );
};

export default VoteButtons;

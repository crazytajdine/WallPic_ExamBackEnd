// components/VoteButtons.tsx
"use client";

import axios from "axios";
import { useState, useEffect } from "react";

interface VoteButtonsProps {
  drawingId: number;
  currentVotes: number;
  onVote: () => void;
}

interface UserVoteResponse {
  voteType: "upvote" | "downvote" | null;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  drawingId,
  currentVotes,
  onVote,
}) => {
  const [votes, setVotes] = useState<number>(currentVotes);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [userVoteType, setUserVoteType] = useState<
    "upvote" | "downvote" | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's vote status on component mount
  useEffect(() => {
    const fetchUserVote = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      try {
        const response = await axios.get<UserVoteResponse>(
          `/api/votes/${drawingId}/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.voteType) {
          setHasVoted(true);
          setUserVoteType(response.data.voteType);
        }
      } catch (err) {
        console.error("Error fetching user vote:", err);
        // Optionally, handle errors here
      }
    };

    fetchUserVote();
  }, [drawingId]);

  const handleVote = async (type: "upvote" | "downvote") => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to vote.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await axios.post(
        "/api/votes/vote",
        {
          drawingId,
          voteType: type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Optimistically update the votes
      setVotes((prevVotes) =>
        type === "upvote" ? prevVotes + 1 : prevVotes - 1
      );
      setHasVoted(true);
      setUserVoteType(type);

      // Trigger parent to refresh drawings
      onVote();
    } catch (error: any) {
      console.error("Error voting:", error);
      setError(error.response?.data?.message || "Error voting");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2 flex items-center space-x-2">
      <button
        onClick={() => handleVote("upvote")}
        disabled={hasVoted || isLoading}
        className={`px-3 py-1 rounded ${
          hasVoted
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}
        title="Upvote"
      >
        Upvote
      </button>
      <span>{votes}</span>
      <button
        onClick={() => handleVote("downvote")}
        disabled={hasVoted || isLoading}
        className={`px-3 py-1 rounded ${
          hasVoted
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
        title="Downvote"
      >
        Downvote
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default VoteButtons;

// components/VoteButtons.tsx
"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

interface VoteButtonsProps {
  drawingId: number;
  upvotes: number;
  downvotes: number;
  onVote: () => void; // Function to refresh drawings after a vote
}

interface UserVoteResponse {
  voteType: "up" | "down" | null;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  drawingId,
  upvotes,
  downvotes,
  onVote,
}) => {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
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
          setUserVote(response.data.voteType);
        }
      } catch (err) {
        console.error("Error fetching user vote:", err);
        // Optionally, handle errors here
      }
    };

    fetchUserVote();
  }, [drawingId]);

  const handleVote = async (type: "up" | "down") => {
    const token = localStorage.getItem("token");
    console.log(token);
    // Prevent multiple voting
    if (userVote === type) return;

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
            Authorization: `${token}`,
          },
        }
      );

      // Optimistically update the vote counts
      onVote();

      // Update the user's vote state
      setUserVote(type);
    } catch (error: any) {
      console.error("Error voting:", error);
      setError(error.response?.data?.message || "Error voting");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Upvotes */}
      <div className="flex items-center text-green-600">
        <button
          className="mr-1"
          onClick={() => handleVote("up")}
          title="up"
          aria-label="up"
        >
          <FaThumbsUp />
        </button>
        <span>{upvotes}</span>
      </div>
      {/* Downvotes */}
      <div className="flex items-center text-red-600">
        <button
          className="mr-1"
          title="Down"
          onClick={() => handleVote("down")}
          aria-label="Down"
        >
          <FaThumbsDown className="mr-1" />
        </button>
        <span>{downvotes}</span>
      </div>
    </div>
  );
};

export default VoteButtons;

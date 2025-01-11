// components/VoteButtons.tsx
"use client";

import { votes_vote_type } from "@prisma/client";
import axios from "axios";
import { useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

interface VoteButtonsProps {
  drawingId: number;
  upvotes: number;
  downvotes: number;
  voted: votes_vote_type | null;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  drawingId,
  upvotes,
  downvotes,
  voted,
}) => {
  const [upvotesCount, setUpvotesCount] = useState<number>(upvotes);
  const [downvotesCount, setDownvotesCount] = useState<number>(downvotes);
  const [userVote, setUserVote] = useState<votes_vote_type | null>(voted);

  const handleVote = async (type: votes_vote_type) => {
    try {
      const res = await axios.post(
        "/api/votes/vote",
        {
          drawingId,
          voteType: type,
        },
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        const { countdown, countup, typenew } = calculateCounts({
          current: type,
          old: userVote,
        });
        setDownvotesCount(Number(downvotesCount) + countdown);
        setUpvotesCount(Number(upvotesCount) + countup);
        setUserVote(typenew);
      }
    } catch (error) {
      console.error("Error voting:", error); // Log the error for debugging
      // Optionally, implement user-facing error handling (e.g., toast notifications)
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Upvotes */}
      <div className="flex items-center text-green-600">
        <button
          className="mr-1 focus:outline-none"
          onClick={() => handleVote("up")}
          title="Upvote"
          aria-label="Upvote"
        >
          <FaThumbsUp
            className={`w-5 h-5 ${userVote === "up" ? "text-green-900" : ""}`}
          />
        </button>
        <span>{upvotesCount}</span>
      </div>
      {/* Downvotes */}
      <div className="flex items-center text-red-600">
        <button
          className="mr-1 focus:outline-none"
          onClick={() => handleVote("down")}
          title="Downvote"
          aria-label="Downvote"
        >
          <FaThumbsDown
            className={`w-5 h-5 ${userVote === "down" ? "text-red-900" : ""}`}
          />
        </button>
        <span>{downvotesCount}</span>
      </div>
    </div>
  );
};

export default VoteButtons;

function calculateCounts({
  current,
  old,
}: {
  current: votes_vote_type | null;
  old: votes_vote_type | null;
}) {
  let countup = 0;
  let countdown = 0;
  let typenew = current;
  if (old === null) {
    if (current === "up") {
      countup = 1;
      countdown = 0;
    } else if (current === "down") {
      countup = 0;
      countdown = 1;
    }
  } else if (current === "up" && old === "up") {
    countup = -1;
    countdown = 0;
    typenew = null;
  } else if (current === "up" && old === "down") {
    countup = 1;
    countdown = -1;
  } else if (current === "down" && old === "up") {
    countup = -1;
    countdown = 1;
  } else if (current === "down" && old === "down") {
    countup = 0;
    countdown = -1;
    typenew = null;
  }

  return { countup, countdown, typenew };
}

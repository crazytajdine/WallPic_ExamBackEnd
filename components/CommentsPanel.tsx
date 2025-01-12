// components/CommentsPanel.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Drawing } from "@/app/page";
import VoteButtons from "./VoteButtons";

interface Comment {
  user: {
    username: string;
  };
  id: number;
  comment: string;
  created_at: string;
  user_id: number;
  image_id: number;
}

interface CommentsPanelProps {
  drawing: Drawing;
  onClose: () => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ drawing, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments when the panel mounts
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments?imageId=${drawing.id}`);
        const data = await res.json();
        if (!data.error) {
          setComments(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setError("Failed to load comments.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [drawing.id]);

  // Handle new comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_id: drawing.id,
          comment: newComment.trim(),
        }),
        credentials: "include", // Ensure cookies are sent
      });

      const data = await res.json();

      if (res.ok) {
        // Add the new comment to the list
        setComments([data, ...comments]);
        setNewComment("");
      } else {
        setError(data.error || "Failed to add comment.");
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      setError("An error occurred while adding your comment.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose} // Close when clicking on the backdrop
      >
        {/* Stop propagation to prevent closing when clicking inside the panel */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-white w-11/12 md:w-3/4 lg:w-2/3 h-5/6 rounded-lg shadow-lg flex flex-row overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* LEFT: Show the selected drawing */}
          <div className="w-1/2 p-4 flex flex-col border-r">
            {/* Header with additional buttons */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{drawing.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => alert("Share functionality not implemented")}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Share
                </button>
                <button
                  onClick={() =>
                    alert("Favorite functionality not implemented")
                  }
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Favorite
                </button>
              </div>
            </div>

            {/* Drawing Image */}
            <div className="flex-grow flex justify-center items-center">
              <img
                src={`${drawing.image_url}`} // Adjust the path as needed
                alt={drawing.name}
                className="max-h-full max-w-full object-contain border border-black rounded-md"
              />
            </div>

            {/* Footer with VoteButtons and Author */}
            <div className="mt-4 flex justify-between items-center">
              {/* Replace with your actual VoteButtons component */}
              <VoteButtons
                drawingId={drawing.id}
                upvotes={drawing.upvoteCount}
                downvotes={drawing.downvoteCount}
                voted={drawing.voted}
              />
              <p className="text-sm text-gray-600">By {drawing.user}</p>
            </div>
          </div>

          {/* RIGHT: Comments list + add comment form */}
          <div className="w-1/2 p-4 flex flex-col">
            <h2 className="text-xl font-semibold mb-3">
              Comments for "{drawing.name}&quot;
            </h2>

            {/* List of comments */}
            <div className="flex-grow overflow-y-auto mb-4">
              {loading ? (
                <p className="text-gray-500">Loading comments...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : comments.length === 0 ? (
                <p className="text-gray-500">No comments yet.</p>
              ) : (
                comments.map((comment, index) => (
                  <div key={comment.id}>
                    {/* Comment Content */}
                    <div className="mb-3">
                      <p className="text-gray-800">{comment.comment}</p>
                      <span className="text-xs text-gray-500">
                        {comment.user.username} —{" "}
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>

                    {index < comments.length - 1 && (
                      <hr className="border-t border-gray-300" />
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmitComment} className="border-t pt-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                className="w-full p-2 rounded border mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Comment
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommentsPanel;

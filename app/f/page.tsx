// pages/index.tsx
"use client";
import PaintBoardModal from "@/components/DrawingBoard";
import type { NextPage } from "next";
import { useState } from "react";

const Home: NextPage = () => {
  const [isPaintBoardOpen, setIsPaintBoardOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to My Paint App</h1>
      <button
        onClick={() => setIsPaintBoardOpen(true)}
        className="px-6 py-3 rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        Open Paint Board
      </button>

      {/* PaintBoard Modal */}
      <PaintBoardModal
        isOpen={isPaintBoardOpen}
        onClose={() => setIsPaintBoardOpen(false)}
      />
    </div>
  );
};

export default Home;

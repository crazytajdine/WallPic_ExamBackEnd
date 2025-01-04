// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import DrawingGrid from "@/components/DrawingGrid";
import PaintBoardModal from "@/components/DrawingBoard";

export interface Drawing {
  id: number;
  name: string;
  image_url: string;
  votes: number;
  user: { username: string };
}

const MainPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategoryId = searchParams.get("categoryId")
    ? Number(searchParams.get("categoryId"))
    : null;
  const initialSearchQuery = searchParams.get("searchQuery") || "";

  const [categoryId, setCategoryId] = useState<number | null>(
    initialCategoryId
  );
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [searchResults, setSearchResults] = useState<Drawing[]>([]);
  const [isPaintBoardOpen, setIsPaintBoardOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch drawings based on categoryId and searchQuery
  const fetchDrawings = async (
    selectedCategoryId: number | null,
    query: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/drawings", {
        params: {
          categoryId: selectedCategoryId,
          query: query,
        },
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error("Error fetching drawings:", err);
      setError("Failed to fetch drawings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for search from SearchBar
  const handleSearch = (selectedCategoryId: number | null, query: string) => {
    setCategoryId(selectedCategoryId);
    setSearchQuery(query);

    // Update URL query parameters
    const params = new URLSearchParams();
    if (selectedCategoryId) {
      params.set("categoryId", selectedCategoryId.toString());
    }
    if (query) {
      params.set("searchQuery", query);
    }
    router.replace(`?${params.toString()}`);

    fetchDrawings(selectedCategoryId, query);
  };

  // Handler to open PaintBoardModal
  const handleOpenPaintBoard = () => {
    setIsPaintBoardOpen(true);
  };

  // Handler to close PaintBoardModal
  const handleClosePaintBoard = () => {
    setIsPaintBoardOpen(false);
  };

  // Handler to refresh drawings after a vote
  const handleVote = () => {
    fetchDrawings(categoryId, searchQuery);
  };

  // Handler to add a new drawing to the grid
  const handleAddDrawing = (newDrawing: Drawing) => {
    setSearchResults((prev) => [newDrawing, ...prev]);
  };

  // Initial fetch based on URL query params
  useEffect(() => {
    fetchDrawings(categoryId, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="p-4">
      <SearchBar
        onSearch={handleSearch}
        onOpenPaintBoard={handleOpenPaintBoard}
        initialCategoryId={categoryId}
        initialSearchQuery={searchQuery}
      />

      {/* Optional: Display loading or error messages */}
      {isLoading && <p>Loading drawings...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Render search results using DrawingGrid */}
      <div className="mt-4">
        <DrawingGrid drawings={searchResults} onVote={handleVote} />
      </div>

      {/* PaintBoardModal */}
      <PaintBoardModal
        isOpen={isPaintBoardOpen}
        onClose={handleClosePaintBoard}
        onAddDrawing={handleAddDrawing}
      />
    </div>
  );
};

export default MainPage;

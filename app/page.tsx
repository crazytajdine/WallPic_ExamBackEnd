// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import DrawingGrid from "@/components/DrawingGrid";
import PaintBoardModal from "@/components/DrawingBoard";
import { votes_vote_type } from "@prisma/client";
import DrawingGridDrag from "@/components/DrawingGridDrag";

export interface Drawing {
  id: number;
  name: string;
  image_url: string;
  user: string;
  upvoteCount: number;
  downvoteCount: number;
  voted: votes_vote_type | null;
  categoryId: number; // Ensure this field exists
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
  const [allDrawings, setAllDrawings] = useState<Drawing[]>([]);
  const [searchResults, setSearchResults] = useState<Drawing[]>([]);
  const [isPaintBoardOpen, setIsPaintBoardOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for toggling between modes
  const [isDragMode, setIsDragMode] = useState<boolean>(true);

  // Function to fetch drawings based on categoryId
  const fetchDrawingsByCategory = async (selectedCategoryId: number | null) => {
    if (selectedCategoryId === null) {
      setAllDrawings([]);
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/drawings", {
        params: {
          categoryId: selectedCategoryId,
          // Optionally, include other params like pagination
        },
        withCredentials: true,
      });
      setAllDrawings(response.data);
      setSearchResults(response.data);
    } catch (err) {
      console.error("Error fetching drawings:", err);
      setError("Failed to fetch drawings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for category selection (server-side)
  const handleCategorySelect = (selectedCategoryId: number | null) => {
    console.log("Category selected:", selectedCategoryId);
    setCategoryId(selectedCategoryId);
    setSearchQuery(""); // Reset search query on category change

    // Update URL query parameters
    const params = new URLSearchParams();
    if (selectedCategoryId) {
      params.set("categoryId", selectedCategoryId.toString());
    }
    router.replace(`?${params.toString()}`);

    // Fetch drawings for the selected category
    fetchDrawingsByCategory(selectedCategoryId);
  };

  // Handler for name input changes (client-side)
  const handleNameChange = (nameQuery: string) => {
    console.log("Name query changed to:", nameQuery);
    setSearchQuery(nameQuery);

    // Update URL query parameters
    const params = new URLSearchParams();
    if (categoryId) {
      params.set("categoryId", categoryId.toString());
    }
    if (nameQuery) {
      params.set("searchQuery", nameQuery);
    }
    router.replace(`?${params.toString()}`);

    // Perform client-side filtering
    if (nameQuery.trim() === "") {
      setSearchResults(allDrawings);
    } else {
      const queryLower = nameQuery.toLowerCase();
      const filtered = allDrawings.filter((drawing) =>
        drawing.name.toLowerCase().includes(queryLower)
      );
      setSearchResults(filtered);
    }
  };

  // Handler to open PaintBoardModal
  const handleOpenPaintBoard = () => {
    setIsPaintBoardOpen(true);
  };

  // Handler to close PaintBoardModal
  const handleClosePaintBoard = () => {
    setIsPaintBoardOpen(false);
  };

  // Handler to add a new drawing to the grid
  const handleAddDrawing = (newDrawing: Drawing) => {
    setAllDrawings((prev) => [newDrawing, ...prev]);
    // Apply current search query to include/exclude the new drawing
    if (
      searchQuery.trim() === "" ||
      newDrawing.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      setSearchResults((prev) => [newDrawing, ...prev]);
    }
  };

  // Handler to toggle between modes
  const toggleMode = () => {
    setIsDragMode((prev) => !prev);
  };

  // Initial fetch based on URL query params
  useEffect(() => {
    if (initialCategoryId) {
      fetchDrawingsByCategory(initialCategoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategoryId]);

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <SearchBar
          onCategorySelect={handleCategorySelect}
          onNameChange={handleNameChange}
          onOpenPaintBoard={handleOpenPaintBoard}
          initialCategoryId={categoryId}
          initialSearchQuery={searchQuery}
          toggleMode={toggleMode}
          isDragMode={isDragMode}
        />
      </div>

      {/* Display loading or error messages */}
      {isLoading && <p>Loading drawings...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && searchResults.length === 0 && !error && (
        <p>No drawings found for your search criteria.</p>
      )}

      {/* Render search results using DrawingGrid or DrawingGridDrag based on mode */}
      <div className={`mt-4 ${isDragMode ? "w-full" : "container mx-auto"}`}>
        {isDragMode ? (
          <DrawingGridDrag drawings={searchResults} />
        ) : (
          <DrawingGrid drawings={searchResults} />
        )}
      </div>

      {/* PaintBoardModal */}
      <PaintBoardModal
        category_id={categoryId}
        isOpen={isPaintBoardOpen}
        onClose={handleClosePaintBoard}
        onAddDrawing={handleAddDrawing}
      />
    </div>
  );
};

export default MainPage;

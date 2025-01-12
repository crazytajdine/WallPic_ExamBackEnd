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
  categoryId: number;
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
  const [allDrawings, setAllDrawings] = useState<Drawing[]>([]); // Server-fetched drawings
  const [searchResults, setSearchResults] = useState<Drawing[]>([]); // Filtered results
  const [isPaintBoardOpen, setIsPaintBoardOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for toggling between modes
  const [isDragMode, setIsDragMode] = useState<boolean>(true);

  // Function to fetch drawings based on categoryId (server-side)
  const fetchDrawings = async (selectedCategoryId: number | null) => {
    console.log("Fetching drawings for categoryId:", selectedCategoryId);
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (selectedCategoryId !== null) {
        params.categoryId = selectedCategoryId;
      }
      // Remove 'query' parameter to handle name search client-side
      const response = await axios.get("/api/drawings", {
        params,
        withCredentials: true,
      });
      console.log("Fetched Drawings:", response.data);
      setAllDrawings(response.data);
      // Apply client-side filter if searchQuery exists
      if (searchQuery.trim() !== "") {
        const queryLower = searchQuery.toLowerCase();
        const filtered = response.data.filter((drawing: Drawing) =>
          drawing.name.toLowerCase().includes(queryLower)
        );
        setSearchResults(filtered);
      } else {
        setSearchResults(response.data);
      }
    } catch (err) {
      console.error("Error fetching drawings:", err);
      setError("Failed to fetch drawings. Please try again.");
      setAllDrawings([]);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for search from SearchBar
  const handleSearch = (selectedCategoryId: number | null, query: string) => {
    console.log("Handle Search called with:", selectedCategoryId, query);
    const categoryChanged = selectedCategoryId !== categoryId;

    if (categoryChanged) {
      // Category changed: perform server-side fetch
      setCategoryId(selectedCategoryId);
      setSearchQuery(query);

      // Update URL query parameters
      const params = new URLSearchParams();
      if (selectedCategoryId) {
        params.set("categoryId", selectedCategoryId.toString());
      } else {
        params.delete("categoryId");
      }
      if (query) {
        params.set("searchQuery", query);
      } else {
        params.delete("searchQuery");
      }
      router.replace(`?${params.toString()}`);

      // Fetch drawings for the selected category
      fetchDrawings(selectedCategoryId);
    } else {
      // Only query changed: perform client-side filtering
      setSearchQuery(query);

      // Update URL query parameters
      const params = new URLSearchParams();
      if (selectedCategoryId) {
        params.set("categoryId", selectedCategoryId.toString());
      } else {
        params.delete("categoryId");
      }
      if (query) {
        params.set("searchQuery", query);
      } else {
        params.delete("searchQuery");
      }
      router.replace(`?${params.toString()}`);

      // Perform client-side filtering
      if (query.trim() === "") {
        setSearchResults(allDrawings);
      } else {
        const queryLower = query.toLowerCase();
        const filtered = allDrawings.filter((drawing: Drawing) =>
          drawing.name.toLowerCase().includes(queryLower)
        );
        setSearchResults(filtered);
      }
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
    fetchDrawings(categoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <SearchBar
          onSearch={handleSearch}
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

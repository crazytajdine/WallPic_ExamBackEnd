// components/DrawingGridDrag.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Drawing } from "@/app/page";
import DrawingCard from "./DrawingCard";
import { motion } from "framer-motion";

interface DrawingGridDragProps {
  drawings: Drawing[];
}

interface PositionRotation {
  x: number;
  y: number;
  rotation: number;
}

const DrawingGridDrag: React.FC<DrawingGridDragProps> = ({ drawings }) => {
  const [positions, setPositions] = useState<PositionRotation[]>([]);
  const [zIndices, setZIndices] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMaxZ, setCurrentMaxZ] = useState<number>(1);

  useEffect(() => {
    const calculatePositions = () => {
      const container = containerRef.current;
      if (container) {
        const { clientWidth, clientHeight } = container;
        const cardWidth = 350; // Adjusted width
        const cardHeight = 225; // Adjusted height

        const initialPositions = drawings.map(() => ({
          x: Math.random() * (clientWidth - cardWidth),
          y: Math.random() * (clientHeight - cardHeight),
          rotation: Math.random() * 20 - 10,
        }));
        setPositions(initialPositions);
        setZIndices(Array(drawings.length).fill(1)); // Initialize zIndices
        setCurrentMaxZ(1);
      }
    };

    // Calculate positions on mount
    calculatePositions();

    // Recalculate positions on window resize
    window.addEventListener("resize", calculatePositions);
    return () => {
      window.removeEventListener("resize", calculatePositions);
    };
  }, [drawings]);

  // Handler to bring a card to front
  const handleBringToFront = (index: number) => {
    setZIndices((prev) => {
      const newZIndices = [...prev];
      newZIndices[index] = currentMaxZ + 1;
      return newZIndices;
    });
    setCurrentMaxZ((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden rounded-md shadow-md bg-gray-100"
    >
      {drawings.map((drawing, index) => {
        const pos = positions[index] || { x: 0, y: 0, rotation: 0 };
        return (
          <motion.div
            key={drawing.id}
            className="absolute cursor-grab "
            style={{
              x: pos.x,
              y: pos.y,
              rotate: pos.rotation,
              zIndex: zIndices[index] || 1,
              width: "300px",
            }}
            drag
            dragConstraints={containerRef}
            whileTap={{ cursor: "grabbing" }}
            dragElastic={0.2}
            onClick={() => handleBringToFront(index)}
          >
            <DrawingCard drawing={drawing} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default DrawingGridDrag;

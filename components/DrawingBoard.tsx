// components/PaintBoardModal.tsx

"use client";

import React, {
  useRef,
  useState,
  useEffect,
  MouseEvent,
  WheelEvent,
  Fragment,
} from "react";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import {
  FaEraser,
  FaFillDrip,
  FaTrash,
  FaUndo,
  FaDownload,
  FaPalette,
  FaPaintBrush, // New Paint Brush Icon
} from "react-icons/fa";
import BrushSizeSlider from "./BrushSizeSlider";
import { Drawing } from "@/app/page";

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface PaintBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDrawing: (newDrawing: Drawing) => void;
  category_id: number | null;
}

const predefinedColors: string[] = [
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFFFFF",
  "#808080",
  "#800000",
  "#808000",
];

type Tool = "brush" | "eraser" | "paintBucket";

const PaintBoardModal: React.FC<PaintBoardModalProps> = ({
  isOpen,
  onClose,
  onAddDrawing,
  category_id,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [brushColor, setBrushColor] = useState<string>("#000000");
  const [brushSize, setBrushSize] = useState<number>(5);
  const [selectedTool, setSelectedTool] = useState<Tool>("brush"); // Tool Selection
  const [painting, setPainting] = useState<boolean>(false);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [exportTitle, setExportTitle] = useState<string>("");
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const maxUndoStackSize = 20;
  const backgroundColor = "#FFFFFF"; // Define the canvas background color

  const handleSubmit = () => {
    axios
      .post("/api/drawings/create", {
        name: exportTitle,
        category_id: category_id,
        image_url: canvasRef.current?.toDataURL("image/png"),
      })
      .then((response) => {
        if (response.status == 201) {
          onClose();
          onAddDrawing(response.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Initialize canvas context
  const getCanvasContext = (): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext("2d") : null;
  };

  // Convert hex color to RGBA
  const hexToRGBA = (hex: string): RGBA => {
    const bigint = parseInt(hex.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
      a: 255,
    };
  };

  // Update custom cursor
  const updateCursor = () => {
    if (cursorRef.current) {
      cursorRef.current.style.width = `${brushSize * 2}px`;
      cursorRef.current.style.height = `${brushSize * 2}px`;
      if (selectedTool === "eraser") {
        cursorRef.current.style.backgroundColor =
          getOppositeColor(backgroundColor);
      } else {
        cursorRef.current.style.backgroundColor = `rgba(${
          hexToRGBA(brushColor).r
        }, ${hexToRGBA(brushColor).g}, ${hexToRGBA(brushColor).b}, 0.3)`;
      }
      cursorRef.current.style.borderColor =
        selectedTool === "eraser"
          ? getOppositeColor(backgroundColor)
          : "#000000";
    }
  };

  // Calculate the opposite color of the background
  const getOppositeColor = (hex: string): string => {
    const rgba = hexToRGBA(hex);
    const invertedR = 255 - rgba.r;
    const invertedG = 255 - rgba.g;
    const invertedB = 255 - rgba.b;
    return `rgba(${invertedR}, ${invertedG}, ${invertedB}, 0.3)`;
  };

  // Save the current canvas state for undo
  const saveState = () => {
    const ctx = getCanvasContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setUndoStack((prev) => {
        const newStack = [...prev, imageData];
        if (newStack.length > maxUndoStackSize) {
          newStack.shift();
        }
        return newStack;
      });
    }
  };

  // Undo function
  const undo = () => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const previousState = newStack.pop();
      const ctx = getCanvasContext();
      const canvas = canvasRef.current;
      if (ctx && canvas && previousState) {
        ctx.putImageData(previousState, 0, 0);
      }
      return newStack;
    });
  };

  // Handle drawing
  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!painting || selectedTool === "paintBucket") return;
    const ctx = getCanvasContext();
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = selectedTool === "eraser" ? backgroundColor : brushColor;

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  // Handle mouse down
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    setPainting(true);
    const ctx = getCanvasContext();
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    if (selectedTool === "paintBucket") {
      saveState();
      doPaintBucket(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setPainting(false);
    } else {
      saveState();
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setPainting(false);
    const ctx = getCanvasContext();
    if (ctx) {
      ctx.beginPath();
    }
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    setBrushColor(color);
    setSelectedTool("brush"); // Automatically switch to brush when a color is selected
    setShowColorPicker(false);
  };

  // Handle brush size change
  const handleBrushSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let size = parseInt(e.target.value, 10);
    if (isNaN(size) || size < 1) size = 1;
    if (size > 50) size = 50;
    setBrushSize(size);
  };

  // Handle wheel event for brush size
  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent page scrolling
    if (e.deltaY < 0) {
      setBrushSize((prev) => Math.min(prev + 1, 50));
    } else {
      setBrushSize((prev) => Math.max(prev - 1, 1));
    }
  };

  // Toggle eraser
  const toggleEraser = () => {
    setSelectedTool((prev) => (prev === "eraser" ? "brush" : "eraser"));
  };

  // Toggle paint bucket
  const togglePaintBucket = () => {
    setSelectedTool((prev) =>
      prev === "paintBucket" ? "brush" : "paintBucket"
    );
  };

  // Clear canvas
  const clearCanvas = () => {
    const ctx = getCanvasContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      saveState();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "z") {
      e.preventDefault();
      undo();
    }
    // Additional shortcuts can be added here
  };

  useEffect(() => {
    updateCursor();
  }, [brushSize, selectedTool, brushColor]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => handleKeyDown(e);
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [undoStack]);

  // Initialize canvas background only once when the component mounts
  useEffect(() => {
    const ctx = getCanvasContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Initialize background
    }
  }, []); // Empty dependency array ensures this runs only once

  // Update stroke settings whenever brushSize, brushColor, or selectedTool changes
  useEffect(() => {
    const ctx = getCanvasContext();
    if (ctx) {
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.strokeStyle =
        selectedTool === "eraser" ? backgroundColor : brushColor;
    }
  }, [brushSize, brushColor, selectedTool]);

  // Update cursor position
  const handleCanvasMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const cursor = cursorRef.current;
    const canvas = canvasRef.current;
    if (cursor && canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      cursor.style.display = "block";
    }
    draw(e);
  };

  // Hide cursor when leaving the canvas
  const handleMouseLeave = () => {
    if (cursorRef.current) {
      cursorRef.current.style.display = "none";
    }
    setPainting(false);
  };

  // Paint bucket functionality
  const doPaintBucket = (x: number, y: number) => {
    const ctx = getCanvasContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const startColor = getPixelColor(imageData, x, y);
    const fillColor = hexToRGBA(brushColor);

    if (colorsMatch(startColor, fillColor)) return;

    const pixelStack: [number, number][] = [[x, y]];

    while (pixelStack.length) {
      const [px, py] = pixelStack.pop()!;
      const currentColor = getPixelColor(imageData, px, py);

      if (colorsMatch(currentColor, startColor)) {
        setPixelColor(imageData, px, py, fillColor);

        if (px > 0) pixelStack.push([px - 1, py]);
        if (px < canvas.width - 1) pixelStack.push([px + 1, py]);
        if (py > 0) pixelStack.push([px, py - 1]);
        if (py < canvas.height - 1) pixelStack.push([px, py + 1]);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Get the color of a pixel
  const getPixelColor = (imageData: ImageData, x: number, y: number): RGBA => {
    const pos = (y * imageData.width + x) * 4;
    return {
      r: imageData.data[pos],
      g: imageData.data[pos + 1],
      b: imageData.data[pos + 2],
      a: imageData.data[pos + 3],
    };
  };

  // Set the color of a pixel
  const setPixelColor = (
    imageData: ImageData,
    x: number,
    y: number,
    color: RGBA
  ) => {
    const pos = (y * imageData.width + x) * 4;
    imageData.data[pos] = color.r;
    imageData.data[pos + 1] = color.g;
    imageData.data[pos + 2] = color.b;
    imageData.data[pos + 3] = color.a;
  };

  // Check if two colors match
  const colorsMatch = (c1: RGBA, c2: RGBA): boolean => {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed   inset-0 z-50 overflow-auto"
        onClose={onClose}
      >
        {/* Prevent clicks inside the modal from propagating to the backdrop */}
        <div className="min-h-screen px-4  text-center flex  w-full bg-black bg-opacity-30">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            {/* Modal Content */}
            <div
              className="  max-w-2xl p-6 m-auto overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
              // Prevent event propagation to the backdrop
              onClick={(e) => e.stopPropagation()}
              style={{ width: "700px", height: "60vh" }} // Further reduced width for compactness
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Paint Board</h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-3xl"
                  title="Close"
                >
                  &times;
                </button>
              </div>

              {/* Main Content */}
              <div className="flex justify-start items-start gap-4 h-full">
                {/* Left Section: Color Palette */}
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col items-center space-y-2">
                    <FaPalette className="text-lg" />
                    <div className="grid grid-cols-2 grid-rows-6 gap-2">
                      {/* Render first 12 predefined colors */}
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`w-8 h-8 rounded-full border-2  ${
                            brushColor === color && selectedTool === "brush"
                              ? "border-black"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        ></button>
                      ))}
                      {/* Custom Color Picker Button */}
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-8 h-8 rounded-full border-2 border-transparent flex items-center justify-center bg-gray-200"
                        title="Custom Color"
                      >
                        <FaFillDrip className="text-sm text-gray-700" />
                      </button>
                    </div>
                    {/* Color Picker Modal */}
                    {showColorPicker && (
                      <div className="absolute z-10 mt-2">
                        <input
                          type="color"
                          value={brushColor}
                          onChange={(e) => handleColorChange(e.target.value)}
                          className="w-10 h-10 p-0 border-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle Section: Canvas */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  {/* Styled Canvas */}
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={400} // Fixed width for a compact look
                      height={250} // Fixed height for a compact look
                      className="border-4 border-black cursor-none rounded-lg shadow-inner"
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onWheel={handleWheel}
                    ></canvas>
                    {/* Custom cursor */}
                    <div
                      ref={cursorRef}
                      className="absolute pointer-events-none border border-black rounded-full"
                      style={{
                        display: "none",
                        transform: "translate(-50%, -50%)",
                        backgroundColor:
                          selectedTool === "eraser"
                            ? getOppositeColor(backgroundColor)
                            : `rgba(${hexToRGBA(brushColor).r}, ${
                                hexToRGBA(brushColor).g
                              }, ${hexToRGBA(brushColor).b}, 0.3)`,
                      }}
                    ></div>
                  </div>

                  {/* Export Title and Button */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={exportTitle}
                      onChange={(e) => setExportTitle(e.target.value)}
                      className="border rounded p-2 w-48"
                      placeholder="Title"
                      title="Enter Title"
                    />
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 rounded bg-green-200 hover:bg-green-300 flex items-center justify-center"
                      title="Export"
                    >
                      <FaDownload className="text-lg text-green-700" />
                    </button>
                  </div>
                </div>

                {/* Right Section: Brush Size Slider & Tool Buttons */}
                <div className="flex gap-3  items-center space-y-2">
                  {/* Brush Size Slider */}
                  <div className="flex relative flex-col items-center space-y-2">
                    <span className="text-sm">Size</span>
                    <BrushSizeSlider
                      brushSize={brushSize}
                      handleBrushSizeChange={handleBrushSizeChange}
                    />
                    <span className="text-xs">{brushSize}</span>
                  </div>

                  {/* Tool Buttons */}
                  <div className="flex flex-col space-y-2">
                    {/* Brush Tool Button */}
                    <button
                      onClick={() => setSelectedTool("brush")}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        selectedTool === "brush"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                      title="Brush"
                    >
                      <FaPaintBrush className="text-sm" />
                    </button>

                    {/* Eraser Button */}
                    <button
                      onClick={toggleEraser}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        selectedTool === "eraser"
                          ? "bg-gray-500 text-white"
                          : "bg-gray-200"
                      }`}
                      title="Eraser"
                    >
                      <FaEraser className="text-sm" />
                    </button>

                    {/* Paint Bucket Button */}
                    <button
                      onClick={togglePaintBucket}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        selectedTool === "paintBucket"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                      title="Paint Bucket"
                    >
                      <FaFillDrip className="text-sm" />
                    </button>

                    {/* Undo Button */}
                    <button
                      onClick={undo}
                      className="w-8 h-8 rounded-full border-2 bg-yellow-200 hover:bg-yellow-300 flex items-center justify-center"
                      title="Undo"
                    >
                      <FaUndo className="text-sm text-yellow-800" />
                    </button>

                    {/* Clear Canvas Button */}
                    <button
                      onClick={clearCanvas}
                      className="w-8 h-8 rounded-full border-2 bg-red-200 hover:bg-red-300 flex items-center justify-center"
                      title="Clear Canvas"
                    >
                      <FaTrash className="text-sm text-red-800" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 flex items-center space-x-1"
                  title="Close"
                >
                  Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PaintBoardModal;

import React, { ChangeEvent } from "react";

interface BrushSizeSliderProps {
  brushSize: number;
  handleBrushSizeChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const BrushSizeSlider: React.FC<BrushSizeSliderProps> = ({
  brushSize,
  handleBrushSizeChange,
}) => {
  return (
    <div className="relative flex items-center justify-center h-36">
      <input
        type="range"
        min={1}
        max={50}
        value={brushSize}
        onChange={handleBrushSizeChange}
        className={`appearance-none w-36 h-2 bg-gray-300 rounded-full rotate-90 transform absolute
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition duration-300 ease-in-out`}
        title="Adjust Brush Size"
        aria-orientation="vertical"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
            ((brushSize - 1) / 49) * 100
          }%, #d1d5db ${((brushSize - 1) / 49) * 100}%, #d1d5db 100%)`,
        }}
      />

      {/* Custom Thumb and Track Styling */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 2px solid #fff;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 2px solid #fff;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
        }

        /* Track Styling for Firefox */
        input[type="range"]::-moz-range-track {
          height: 8px;
          background: #d1d5db;
          border-radius: 4px;
        }

        /* IE Styling */
        input[type="range"]::-ms-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 2px solid #fff;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
        }

        input[type="range"]::-ms-thumb:hover {
          transform: scale(1.2);
        }

        input[type="range"]::-ms-track {
          height: 8px;
          background: transparent;
          border-color: transparent;
          color: transparent;
        }

        input[type="range"]::-ms-fill-lower {
          background: #3b82f6;
          border-radius: 4px;
        }

        input[type="range"]::-ms-fill-upper {
          background: #d1d5db;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default BrushSizeSlider;

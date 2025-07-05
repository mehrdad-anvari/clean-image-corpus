'use client';
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import {
  resetSelectedAnnotation,
  resetSelectedVertex,
  setSelectedTool,
} from "@/features/tools/canvas";
import { Move, Pencil, Edit, Square, CircleDot } from "lucide-react";
import { useAppDispatch } from "@/app/hooks";
import { useState } from "react";

const drawSubtools = [
  { id: "DRAW_RECT",  icon: <Square size={16} /> },
  { id: "DRAW_POINT",  icon: <CircleDot size={16} /> },
];

const tools = [
  { id: "SELECT", icon: <Move size={18} />, label: "Select" },
  { id: "EDIT_RECT", icon: <Edit size={18} />, label: "Edit" },
];

export default function ToolSelector() {
  const dispatch = useAppDispatch();
  const selectedTool = useSelector((state: RootState) => state.canvas.selectedTool);
  const [drawTool, setDrawTool] = useState<"DRAW_RECT" | "DRAW_POINT">("DRAW_RECT");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelectTool = (id: string) => {
    dispatch(setSelectedTool(id));
    dispatch(resetSelectedAnnotation());
    dispatch(resetSelectedVertex());
  };

  const handleDrawToolChange = (id: "DRAW_RECT" | "DRAW_POINT") => {
    setDrawTool(id);
    handleSelectTool(id);
    setShowDropdown(false);
  };

  return (
    <div className="absolute top-4 left-4 z-20 flex gap-2">
      {/* Normal Tools */}
      {tools.map(({ id, icon, label }) => (
        <button
          key={id}
          title={label}
          onClick={() => handleSelectTool(id)}
          className={`w-10 h-10 flex items-center justify-center shadow border border-zinc-600 transition
            ${selectedTool === id ? "bg-blue-600/80 text-white" : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80"}`}
        >
          {icon}
        </button>
      ))}

      {/* Draw Tool with Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            handleSelectTool(drawTool);
            setShowDropdown((prev) => !prev);
          }}
          title="Draw Tool"
          className={`w-10 h-10 flex items-center justify-center shadow border border-zinc-600 transition
            ${selectedTool.startsWith("DRAW") ? "bg-blue-600/80 text-white" : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80"}`}
        >
          {
            drawSubtools.find((tool) => tool.id === drawTool)?.icon || <Pencil size={18} />
          }
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
            className="absolute top-12 left-0 w-10 bg-zinc-800 border border-zinc-600 shadow z-30"
          >
            {drawSubtools.map(({ id, icon }) => (
              <button
                key={id}
                onClick={() => handleDrawToolChange(id as 'DRAW_RECT' | 'DRAW_POINT')}
                className="w-full h-9 flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                {icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

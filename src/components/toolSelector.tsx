// components/ToolSelector.tsx
'use client';

import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
// import { setTool } from "@/features/tools/canvas";
import { Move, Pencil, Edit } from "lucide-react"; // Import relevant icons
// import { useAppDispatch } from "@/app/hooks";

const tools = [
  { id: "SELECT", icon: <Move size={18} />, label: "Select" },
  { id: "DRAW_RECT", icon: <Pencil size={18} />, label: "Draw" },
  { id: "EDIT_RECT", icon: <Edit size={18} />, label: "Edit" },
] as const;

export default function ToolSelector() {
//   const dispatch = useAppDispatch();
  const selectedTool = useSelector((state: RootState) => state.canvas.selectedTool);

  return (
    <div className="absolute top-4 left-4 z-20 flex gap-2">
      {tools.map(({ id, icon, label }) => (
        <button
          key={id}
          title={label}
        //   onClick={() => dispatch(setTool(id))}
          className={`w-10 h-10 flex items-center justify-center shadow border border-zinc-600 transition
            ${selectedTool === id ? "bg-blue-600/80 text-white" : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80"}`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

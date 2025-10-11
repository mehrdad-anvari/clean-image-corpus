"use client";

import React, { useState } from "react";

type ExportFormat = "yolo" | "coco";

type ToolbarProps = {
  onSync: () => void;
  onSettings: () => void;
  onExport: (format: ExportFormat) => void;
  onDelete: () => void;
};

export default function Toolbar({ onSync, onSettings, onExport, onDelete }: ToolbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap">
      <button
        onClick={onSettings}
        className="bg-zinc-800 text-zinc-100 px-4 py-2 border border-zinc-600 hover:bg-zinc-700 hover:border-blue-500 transition"
      >
        ⚙️ Settings
      </button>

      <button
        onClick={onSync}
        className="bg-zinc-800 text-zinc-100 px-4 py-2 border border-zinc-600 hover:bg-zinc-700 hover:border-blue-500 transition"
      >
        🔄 Sync
      </button>

      {/* Export dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="bg-zinc-800 text-zinc-100 px-4 py-2 border border-zinc-600 hover:bg-zinc-700 hover:border-blue-500 transition flex items-center gap-2"
        >
          💾 Export
          <span className="text-xs">▾</span>
        </button>
        {open && (
          <div className="absolute left-0 w-full bg-zinc-900 border border-zinc-700 rounded shadow-md z-100">
            <button
              onClick={() => { setOpen(false); onExport("yolo"); }}
              className="block w-full text-center text-sm px-4 py-2 hover:bg-zinc-800"
            >
              YOLO
            </button>
            <button
              onClick={() => { setOpen(false); onExport("coco"); }}
              className="block w-full text-center text-sm px-4 py-2 hover:bg-zinc-800"
            >
              COCO
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onDelete}
        className="bg-zinc-800 text-zinc-100 px-4 py-2 border border-zinc-600 hover:bg-zinc-700 hover:border-blue-500 transition"
      > 
        🗑️ Delete
      </button>
    </div>
  );
}

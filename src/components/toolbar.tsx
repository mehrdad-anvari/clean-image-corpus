"use client";

import React from "react";

type ToolbarProps = {
  onSync: () => void;
  onSettings: () => void;
  onExport: () => void;
  onDelete: () => void;
};

export default function Toolbar({ onSync, onSettings, onExport, onDelete }: ToolbarProps) {
  return (
    <div className="flex flex-wrap ">
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

      <button
        onClick={onExport}
        className="bg-zinc-800 text-zinc-100 px-4 py-2 border border-zinc-600 hover:bg-zinc-700 hover:border-blue-500 transition"
      > 
        💾 Export
      </button>

      <button
        onClick={onDelete}
        className="bg-zinc-800 text-zinc-100 px-4 py-2 border border-zinc-600 hover:bg-zinc-700 hover:border-blue-500 transition"
      > 
        🗑️ Delete
      </button>
    </div>
  );
}

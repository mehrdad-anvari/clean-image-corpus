"use client";

import React from "react";

type ToolbarProps = {
  onLoadImages: () => void;
  onSync: () => void;
  onSettings: () => void;
};

export default function Toolbar({ onLoadImages, onSync, onSettings }: ToolbarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onSettings}
        className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-md border border-zinc-600 hover:bg-zinc-700 hover:border-blue-500 transition"
      >
        ⚙️ Settings
      </button>

      <button
        onClick={onLoadImages}
        className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-md border border-zinc-600 hover:bg-zinc-700 hover:border-blue-500 transition"
      >
        📁 Load Images
      </button>

      <button
        onClick={onSync}
        className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-md border border-zinc-600 hover:bg-zinc-700 hover:border-blue-500 transition"
      >
        🔄 Sync Images
      </button>
    </div>
  );
}

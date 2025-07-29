import { indexedImage } from "@/interfaces";
import React from "react";

interface Props {
  cards: indexedImage[];
  onSelect: (index: number) => void;
  imagesLen: number;
}

export default function ImageSidebar({
  cards,
  onSelect,
  imagesLen,
}: Props) {
  const currentIndex = cards[2]?.[0] ?? 0;
  // const [inputValue, setInputValue] = useState(currentIndex + 1); // human-friendly

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   if (/^\d*$/.test(value)) setInputValue(value === "" ? "" : Number(value));
  // };

  // const jumpToIndex = () => {
  //   const target = Number(inputValue) - 1;
  //   if (!isNaN(target) && target >= 0 && target < imagesLen) {
  //     onSelect(2, target); // assumes your `onSelect(index)` maps to cards[2] pointing to `target`
  //   }
  // };

  return (
    <aside className="w-full flex-1 md:w-64 p-4 bg-zinc-900 border-r border-zinc-700 overflow-y-auto h-[90vh] max-h-screen shadow-inner flex flex-col gap-4 text-zinc-100">
      {/* Navigation and Index Display */}
      <div className="flex flex-col gap-2">
        {/* <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`px-3 py-1 text-sm font-medium rounded border transition duration-150 ${currentIndex === 0
                ? "bg-zinc-700 text-zinc-500 border-zinc-600 cursor-not-allowed"
                : "bg-zinc-800 hover:bg-zinc-700 text-blue-400 border-blue-500"
              }`}
          >
            ← Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === imagesLen - 1}
            className={`px-3 py-1 text-sm font-medium rounded border transition duration-150 ${currentIndex === imagesLen - 1
                ? "bg-zinc-700 text-zinc-500 border-zinc-600 cursor-not-allowed"
                : "bg-zinc-800 hover:bg-zinc-700 text-blue-400 border-blue-500"
              }`}
          >
            Next →
          </button>
        </div> */}

        <div className="text-center text-xs text-zinc-400">
          Image <span className="font-semibold text-zinc-100">{currentIndex + 1}</span> of{" "}
          <span className="font-semibold text-zinc-100">{imagesLen}</span>
        </div>

        {/* Optional Jump to Index */}
        {/* 
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="w-20 px-2 py-1 border border-zinc-600 rounded text-sm bg-zinc-800 text-white"
        value={inputValue}
        min={1}
        max={imagesLen}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") jumpToIndex();
        }}
      />
      <button
        onClick={jumpToIndex}
        className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go
      </button>
    </div>
    */}
      </div>

      {/* Image Previews */}
      <div className="grid grid-cols-1 gap-3 justify-items-center">
        {cards.map(([imageIndex, imageUrl], index) =>
          imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={index}
              src={imageUrl}
              alt={`Image ${imageIndex}`}
              onClick={() => onSelect(index)}
              className={`object-cover cursor-pointer rounded-md border transition-all duration-200 ${index === 2
                  ? "w-48 h-32 border-blue-500 shadow-lg opacity-100"
                  : "w-40 h-28 border-zinc-600 opacity-60 hover:opacity-90 hover:border-blue-400"
                }`}
            />
          ) : (
            <div
              key={index}
              className="w-40 h-28 bg-zinc-700 text-zinc-400 flex items-center justify-center rounded-md"
            >
              Empty
            </div>
          )
        )}
      </div>
    </aside>

  );
}

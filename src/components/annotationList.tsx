import React, { useEffect, useState } from "react";
import { RectangleObject } from "@/interfaces";
import { useAppDispatch } from "@/app/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { removeAnnotation, saveAnnotationsHistory, setSelectedAnnotation, setSelectedClassID, updateRect } from "@/features/tools/canvas";

export default function AnnotationList() {
  const dispatch = useAppDispatch();
  const selectedIndex = useSelector((state: RootState) => state.canvas.selectedAnnotation)
  const annotations = useSelector((state: RootState) => state.canvas.annotations)
  const settings = useSelector((state: RootState) => state.settings)
  const entries = Object.entries(annotations);
  let selectedObject = selectedIndex !== -1 ? annotations[selectedIndex]?.object : null;
  const [editValues, setEditValues] = useState<RectangleObject | null>(
    selectedObject ? { ...selectedObject } : null
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    selectedObject = selectedIndex !== -1 ? annotations[selectedIndex]?.object : null;
    setEditValues(selectedObject)
  }, [selectedIndex, annotations])

  const handleSelect = (id: number) => {
    dispatch(setSelectedAnnotation(id))
    setEditValues({ ...annotations[id].object });
  };

  const handleChange = (key: keyof RectangleObject, value: number) => {
    if (!editValues) return;
    setEditValues({ ...editValues, [key]: value });
  };

  const handleSave = () => {
    if (selectedIndex !== null && editValues) {
      if (settings.rectClasses[editValues.class_id]) {
        dispatch(updateRect({ updatedRect: editValues, Index: selectedIndex }))
        dispatch(setSelectedClassID(editValues.class_id))
        dispatch(saveAnnotationsHistory())
      } else {

      }
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 border-l border-zinc-700 text-zinc-100 flex flex-col">

      {/* Annotation List Section */}
      <div className="flex flex-col border-b border-zinc-700 flex-grow min-h-0">
        <div className="bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200">
          Annotations ({entries.length})
        </div>
        <div className="overflow-y-auto flex-grow divide-y divide-zinc-700">
          {entries.length === 0 ? (
            <p className="p-3 text-sm text-zinc-500">No annotations yet.</p>
          ) : (
            entries.map(([id]) => {
              const numId = Number(id);
              const isSelected = numId === selectedIndex;

              return (
                <div
                  key={id}
                  className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer ${isSelected ? "bg-zinc-800 border-l-4 border-blue-500" : "hover:bg-zinc-800"
                    }`}
                  onClick={() => handleSelect(numId)}
                >
                  <span className="text-zinc-300 font-medium">#{numId}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(removeAnnotation(numId))
                      dispatch(saveAnnotationsHistory())
                      if (numId === selectedIndex) {
                        dispatch(setSelectedAnnotation(-1));
                        setEditValues(null);
                      }
                    }}
                    className="text-red-400 hover:underline text-xs"
                  >
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Section */}
      <div className="border-t border-zinc-700 ">
        <div className="bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200">
          {selectedObject ? `Selected Annotation #${selectedIndex}` : `No annotation selected`}
        </div>
        {selectedObject && editValues && (
          <div className="p-4 flex flex-col gap-2 text-xs bg-zinc-900">
            {(["class_id", "x1", "y1", "x2", "y2"] as (keyof RectangleObject)[]).map((key) => (
              <label key={key} className="flex justify-between items-center gap-2">
                <span className="text-zinc-400">{key}</span>
                <input
                  type="number"
                  value={editValues[key]}
                  onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                  className="bg-zinc-800 text-zinc-100 px-2 py-1 text-right w-24 border border-zinc-600 focus:outline-none focus:ring focus:ring-blue-500"
                />
              </label>
            ))}
            <button
              onClick={handleSave}
              className="mt-2 w-full py-1 bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

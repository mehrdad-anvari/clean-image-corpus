import React, { useEffect, useMemo, useState } from "react";
import { AnnotationObject, Vertex } from "@/interfaces";
import { useAppDispatch } from "@/app/hooks";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@/app/store";
import { removeAnnotation, saveAnnotationsHistory, setSelectedAnnotation, setSelectedClassID, updateAnnotation } from "@/features/tools/canvas";

export default function AnnotationList() {
  const dispatch = useAppDispatch();
  const selectedIndex = useSelector((state: RootState) => state.canvas.selectedAnnotation, shallowEqual)
  const selectedVertexIndex = useSelector((state: RootState) => state.canvas.selectedVertex, shallowEqual)
  const annotationsHistory = useSelector((state: RootState) => state.canvas.annotationsHistory, shallowEqual)
  const historyIndex = useSelector((state: RootState) => state.canvas.historyIndex, shallowEqual)
  const settings = useSelector((state: RootState) => state.settings, shallowEqual)

  const annotations = annotationsHistory[historyIndex].annotations
  const entries = useMemo(() => Object.entries(annotations), [annotations]);
  const selectedObject = (selectedIndex !== -1 ? annotations[selectedIndex]?.object : null)
  const [selectedVertex, setSelectedVertex] = useState<Vertex | null>(null)
  const [previousVertexIndex, setPreviousVertexIndex] = useState(-1)


  const [editValues, setEditValues] = useState<AnnotationObject | null>(
    selectedObject ? { ...selectedObject } : null
  );

  useEffect(() => {
    if (selectedObject) {
      setEditValues({ ...selectedObject })
      if (selectedObject.type === 'polygon') {
        if (selectedVertexIndex != -1) {
          const newSelectedVertex = selectedObject.shell[selectedVertexIndex];
          setSelectedVertex(newSelectedVertex)
          setPreviousVertexIndex(selectedVertexIndex)
        } else if (previousVertexIndex != -1) {
          const newSelectedVertex = selectedObject.shell[previousVertexIndex];
          setSelectedVertex(newSelectedVertex)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedObject, selectedVertexIndex])

  const handleSelect = (id: number) => {
    dispatch(setSelectedAnnotation(id))
    if (selectedObject)
      setEditValues({ ...selectedObject });
  };

  const handleChange = (key: string, value: number) => {
    if (!editValues) return;
    setEditValues({ ...editValues, [key]: value });
  };

  const handleSave = () => {
    if (selectedIndex !== null && editValues) {
      if (editValues.type != 'polygon' && settings[editValues.type][editValues.class_id]) {
        dispatch(updateAnnotation({ updatedAnnotation: editValues, Index: selectedIndex }))
        dispatch(setSelectedClassID(editValues.class_id))
        dispatch(saveAnnotationsHistory())
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
            {(Object.entries(editValues))
              .map(([key, value]) => {
                if (editValues.type === 'polygon' && key === 'shell') return null;
                return (
                  <label key={key} className="flex justify-between items-center gap-2">
                    <span className="text-zinc-400">{key}</span>
                    {(key == "type") ? <span
                      className="bg-zinc-800 text-zinc-100 px-2 py-1 text-left w-24 ">
                      {editValues.type}
                    </span> : <input
                      type="number"
                      value={value as number}
                      onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                      className="bg-zinc-800 text-zinc-100 px-2 py-1 text-left w-24 border border-zinc-600 focus:outline-none focus:ring focus:ring-blue-500"
                    />}
                  </label>
                )
              })}
            {
              editValues.type === "polygon" && selectedIndex !== -1 && selectedVertex && (
                <div className="flex flex-col gap-1 text-xs mt-2">
                  <span className="text-zinc-400">Selected Vertex</span>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">x:</span>
                    <span className="text-zinc-100">{selectedVertex.x.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">y:</span>
                    <span className="text-zinc-100">{selectedVertex.y.toFixed(2)}</span>
                  </div>
                </div>
              )
            }
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

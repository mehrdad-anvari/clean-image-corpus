'use client';
import { useState } from 'react';
import { useAppDispatch } from "@/app/hooks";
import {
  addRectClass, deleteRectClass,
  addPointClass, deletePointClass,
  addPolygonClass, deletePolygonClass,
  addLineClass, deleteLineClass,
  addObbClass, deleteObbClass,
  AnnotationSettingsState
} from '@/features/tools/settings';

const annotationTypes = ['rect', 'point', 'polygon', 'line', 'obb'] as const;
type AnnotationType = typeof annotationTypes[number];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AnnotationSettingsState; 
}

const getRandomColor = (): [number, number, number] => {
    const r = Math.floor(Math.random() * 256); 
    const g = Math.floor(Math.random() * 256); 
    const b = Math.floor(Math.random() * 256); 
    return [r, g, b]; 
};

const ColorBullet = ({ color = [255, 255, 255] }) => (
    <div
        className="w-5 h-5 rounded shadow-sm"
        style={{
            backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        }}
    />
);

const SettingsModal = ({ isOpen, onClose, settings }: SettingsModalProps) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<AnnotationType>('rect');
  const [newClassName, setNewClassName] = useState('');
  const [newClassColor, setNewClassColor] = useState(getRandomColor());
  const [newClassId, setNewClassId] = useState(Object.keys(settings[`rectClasses`]).length);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const getClasses = () => settings[`${activeTab}Classes`] || {};

  const handleAddClass = () => {
    if (newClassName.trim() === '') {
      setError('Class name cannot be empty.');
      return;
    }

    const currentClasses = getClasses();

    const isDuplicateName = Object.values(currentClasses).some(
      (cls) => cls.name === newClassName
    );
    const isDuplicateColor = Object.values(currentClasses).some(
      (cls) =>
        cls.color[0] === newClassColor[0] &&
        cls.color[1] === newClassColor[1] &&
        cls.color[2] === newClassColor[2]
    );

    if (isDuplicateName) {
      setError('Class name already exists.');
      return;
    }

    if (isDuplicateColor) {
      setError('Class color already exists.');
      return;
    }

    const actionMap = {
      rect: addRectClass,
      point: addPointClass,
      polygon: addPolygonClass,
      line: addLineClass,
      obb: addObbClass
    };

    dispatch(actionMap[activeTab]({ id: newClassId, attrs: { name: newClassName, color: newClassColor } }));
    setNewClassName('');
    setNewClassColor(getRandomColor());
    setNewClassId(newClassId + 1);
    setError('');
  };

  const handleDeleteClass = (id: number) => {
    const actionMap = {
      rect: deleteRectClass,
      point: deletePointClass,
      polygon: deletePolygonClass,
      line: deleteLineClass,
      obb: deleteObbClass
    };

    dispatch(actionMap[activeTab](id));
  };

  const currentClasses = getClasses();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-zinc-900 p-6 rounded-xl shadow-2xl w-full max-w-xl border border-zinc-700">
        <div className="text-zinc-100">
          <h2 className="text-xl font-bold mb-4">Annotation Class Settings</h2>

          <div className="flex space-x-2 mb-4">
            {annotationTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setActiveTab(type);
                  setNewClassId(Object.keys(settings[`${type}Classes`]).length);
                  setError('');
                }}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === type ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 mb-2">{error}</p>}

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Class Name"
                className="bg-zinc-800 text-white border border-zinc-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="color"
                value={`#${newClassColor.map(c => c.toString(16).padStart(2, '0')).join('')}`}
                onChange={(e) => {
                  const color = e.target.value.slice(1).match(/.{1,2}/g)!.map(hex => parseInt(hex, 16)) as [number, number, number];
                  setNewClassColor(color);
                }}
                onClick={() => setNewClassColor(getRandomColor())}
                className="cursor-pointer border border-zinc-600 rounded-md w-10 h-10"
              />
            </div>
            <button
              onClick={handleAddClass}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              Add Class
            </button>
          </div>

          <div className="overflow-y-auto max-h-72 border-t border-zinc-700 pt-4">
            <ul className="space-y-3">
              {Object.entries(currentClasses).map(([id, { name, color }]) => (
                <li
                  key={id}
                  className="flex items-center justify-between gap-3 text-sm bg-zinc-800 p-2 rounded-md shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <ColorBullet color={color} />
                    <span className="text-zinc-400">#{id}</span>
                    <span className="text-zinc-100">{name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteClass(Number(id))}
                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md transition"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            className="mt-6 w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-md transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
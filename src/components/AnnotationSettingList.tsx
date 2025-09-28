'use client';

import { Trash2, Plus } from "lucide-react";
import { ColorBulletText, DotBulletText } from "./colorBullet";
import { useEffect, useRef, useState } from "react";
import { AnnotationSettingsState } from "@/features/tools/settings";

interface AnnotationSettingListProps {
  setting: Record<number, { name: string; color: [number, number, number] }>;
  onAdd: (clsId: number, name: string, color: [number, number, number]) => void;
  onDelete: (id: number) => void;
}

const getRandomColor = (): [number, number, number] => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return [r, g, b];
};

export default function AnnotationSettingList({
  setting,
  onAdd,
  onDelete,
}: AnnotationSettingListProps) {
  const [classID, setClassID] = useState<undefined | number>(undefined);
  const [name, setName] = useState("");
  const [color, setColor] = useState<[number, number, number]>([255, 255, 255])

  const handleClick = (id: number, cls: { name: string; color: [number, number, number]; }) => {
    setClassID(id)
    setName(cls.name)
    setColor(cls.color)
  }
  return (
    <div className="flex flex-row gap-2">
      <div className="flex flex-col w-55 gap-3 p-2">
        <div className="flex items-center gap-2 justify-between">
          <input
            className="w-15 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded"
            type="number"
            min={0}
            value={classID ?? ""}
            placeholder="ID"
            onChange={(e) => {
              setClassID(e.target.value === "" ? undefined: Number(e.target.value))
              setColor(getRandomColor())
            }}
          >
          </input>
          <input
            className="w-full px-2 py-1 bg-zinc-800 border border-zinc-600 rounded"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          >
          </input>
        </div>
        <div className="flex items-center justify-between">
          <div className="w-30">
            <input type="color"
              value={`#${color.map(c => c.toString(16).padStart(2, '0')).join('')}`}
              onChange={(e) => {
                const color = e.target.value.slice(1).match(/.{1,2}/g)!.map(hex => parseInt(hex, 16)) as [number, number, number];
                setColor(color);
              }}
              className="w-12 h-8 rounded border"
              onClick={() => setColor(getRandomColor())}></input>
          </div>
        </div>
        <button onClick={() => { if (classID != null) onAdd(classID, name, color) }} className="h-8 px-3 inline-flex items-center justify-center border rounded-md text-sm border-gray-500 bg-zinc-800 hover:border-zinc-100 w-35 mt-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Class
        </button>
      </div>
      <div className="flex-grow">
        <div className="space-y-2 px-3 border-gray-600 h-65 overflow-y-auto border-l">
          {Object.entries(setting).map(([id, cls]) => (
            <div
              key={id}
              className={`flex justify-between w-107 items-center bg-gray-1000 px-2 rounded border ${Number(id) === classID ? "border-green-400" : "border-zinc-700"}`}
              onClick={() => handleClick(Number(id), cls)}
            >
              <ColorBulletText text={id + ": " + cls.name} color={cls.color}></ColorBulletText>
              <button className=" text-zinc-400 hover:text-zinc-100 p-3" onClick={() => onDelete(Number(id))}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type classAttributes = { name: string, color: [number, number, number] }

interface AnnotationSettingListPoseProps {
  settings: AnnotationSettingsState;
  onAddPose: (poseId: number, pose: {
    name: string, color: [number, number, number],
    keypoints: { [key: number]: classAttributes },
    skeleton: [number, number][]
  }) => void;
  onDeletePose: (id: number) => void;
  onAddKeypoint: (poseId: number, keypointId: number, name: string, color: [number, number, number]) => void;
  onDeleteKeypoint: (poseId: number, keypointId: number) => void;
  onAddEdge: (poseId: number, from: number, to: number) => void;
  onDeleteEdge: (poseId: number, edgeIndex: number) => void;
}
export function AnnotationSettingListPose({
  settings,
  onAddPose,
  onDeletePose,
  onAddKeypoint,
  onDeleteKeypoint,
  onAddEdge,
  onDeleteEdge,
}: AnnotationSettingListPoseProps) {
  const [selectedPoseId, setSelectedPoseId] = useState<null | number>(null);

  const [newPose, setNewPose] = useState<{ id: undefined | number, name: string, color: [number, number, number] }>({
    id: undefined,
    name: "",
    color: [255, 255, 255],
  });

  const [newKeypoint, setNewKeypoint] = useState<{ id: undefined | number, name: string, color: [number, number, number] }>({
    name: "",
    color: [255, 255, 255],
    id: undefined,
  });

  const [newEdge, setNewEdge] = useState<{ from: undefined | number, to: undefined | number, name: string }>({
    from: undefined,
    to: undefined,
    name: ""
  });


  useEffect(() => {
    if (newPose.id != undefined && settings.pose[newPose.id]) {
      const pose = settings.pose[newPose.id];
      setNewPose({ id: newPose.id, name: pose.name, color: pose.color });
    } else {
      setNewPose({ id: newPose.id, name: "", color: getRandomColor() });
    }
  }, [newPose.id, settings]);

  useEffect(() => {
    if (selectedPoseId != null && newKeypoint.id != undefined && settings.pose[selectedPoseId].keypoints[newKeypoint.id]) {
      const keypoint = settings.pose[selectedPoseId].keypoints[newKeypoint.id]
      setNewKeypoint({ id: newKeypoint.id, name: keypoint.name, color: keypoint.color })
    } else {
      setNewKeypoint({ id: newKeypoint.id, name: "", color: getRandomColor() })
    }

  }, [selectedPoseId, settings, newKeypoint.id])

  useEffect(() => {
    if (selectedPoseId != null) {
      const fromName = (newEdge.from != undefined && settings.pose[selectedPoseId].keypoints[newEdge.from]) ? settings.pose[selectedPoseId].keypoints[newEdge.from].name : ""
      const toName = (newEdge.to != undefined && settings.pose[selectedPoseId].keypoints[newEdge.to]) ? settings.pose[selectedPoseId].keypoints[newEdge.to].name : ""
      setNewEdge({ from: newEdge.from, to: newEdge.to, name: fromName + "-" + toName })
    } else {
      setNewEdge({ from: newEdge.from, to: newEdge.to, name: "" })
    }

  }, [selectedPoseId, settings, newEdge.from, newEdge.to])

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    poseId: number;
    index: number;
    objType: string;
  } | null>(null);

  type ContextMenuProps = {
    x: number;
    y: number;
    onClose: () => void;
    handleDeleteKeypoint: () => void;
    handleDeleteEdge: () => void;
  };

  const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, handleDeleteKeypoint, handleDeleteEdge }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    return (
      <div
        ref={menuRef}
        className="absolute bg-black border rounded shadow-md text-sm"
        style={{ top: y, left: x }}
        onMouseLeave={() => onClose()}
      >

        <div
          className="p-2 hover:bg-gray-200 cursor-pointer"
          onClick={contextMenu?.objType === "keypoint" ? handleDeleteKeypoint : handleDeleteEdge}
        >Delete</div>
      </div>
    );
  };

  const closeMenu = () => setContextMenu(null);

  const handleEditPose = (id: string, pose: { id: string, name: string, color: [number, number, number] }) => {
    setNewPose({ id: Number(id), name: pose.name, color: pose.color });
    setSelectedPoseId(Number(id));
  };

  const handleEditKeypoint = (index: number, kp: { name: string, color: [number, number, number] }) => {
    setNewKeypoint({ name: kp.name, color: kp.color, id: index });
  };

  const handleEditEdge = (from: number, to: number) => {
    if (selectedPoseId != null) {
      const fromName = (newEdge.from != undefined && settings.pose[selectedPoseId].keypoints[newEdge.from]) ? settings.pose[selectedPoseId].keypoints[newEdge.from].name : ""
      const toName = (newEdge.to != undefined && settings.pose[selectedPoseId].keypoints[newEdge.to]) ? settings.pose[selectedPoseId].keypoints[newEdge.to].name : ""
      setNewEdge({ from: from, to: to, name: fromName + "-" + toName });
    }
  };

  const handleAddKeypoint = () => {
    if (selectedPoseId != null && newKeypoint.id != null && newKeypoint.color && newKeypoint.name)
      onAddKeypoint(selectedPoseId, newKeypoint.id, newKeypoint.name, newKeypoint.color)
  }

  const handleAddEdge = () => {
    if (selectedPoseId != null && newEdge.from != undefined && newEdge.to != undefined)
      onAddEdge(selectedPoseId, newEdge.from, newEdge.to);
  };

  const handleAddPose = () => {
    if (newPose.id != undefined && newPose.name && newPose.color) {
      let newKeypoints = {}
      let newSkeleton: [number, number][] = []
      if (settings.pose[newPose.id]) {
        newKeypoints = settings.pose[newPose.id].keypoints
        newSkeleton = settings.pose[newPose.id].skeleton
      }
      onAddPose(newPose.id, { name: newPose.name, color: newPose.color, keypoints: newKeypoints, skeleton: newSkeleton })
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-900 text-white rounded shadow">
      {/* Left Panel: Form Inputs */}
      <div className="flex flex-col max-w-45 min-w-45 gap-4  md:w-1/3">
        <div className="space-y-2 border-b pb-2">
          <h2 className="text-sm text-gray-400">Add Pose</h2>
          <div className="flex justify-between gap-1">
            <input
              type="number"
              className="w-15 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded"
              placeholder="ID"
              value={newPose.id ?? ""}
              min={0}
              onChange={(e) => setNewPose({ ...newPose, id: Number(e.target.value) })}
            />
            <input
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-600 rounded"
              placeholder="Name"
              value={newPose.name ?? ""}
              onChange={(e) => setNewPose({ ...newPose, name: e.target.value })}
            />
          </div>

          <div className="flex justify-between">
            <input
              type="color"
              value={`#${newPose.color.map((c) => c.toString(16).padStart(2, "0")).join("")}`}
              onChange={(e) =>
                setNewPose({
                  ...newPose,
                  color: (e.target.value
                    .slice(1)
                    .match(/.{1,2}/g) as [string, string, string])
                    .map((h) => parseInt(h, 16)) as [number, number, number],
                })
              }
              className="w-12 h-8 rounded border"
            />
            <button onClick={handleAddPose} className="h-8 px-3 inline-flex items-center justify-center border rounded-md text-sm border-gray-500 bg-zinc-800 hover:border-zinc-100 w-20 mt-auto"
            >
              Add
            </button>
          </div>

        </div>

        <div className="space-y-2 border-b pb-2">
          <h2 className="text-sm text-gray-400">Add Keypoint</h2>
          <div className="flex justify-between gap-1">
            <input
              type="number"
              className="w-15 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded"
              placeholder="ID"
              value={newKeypoint.id ?? ""}
              min={0}
              onChange={(e) => setNewKeypoint({ ...newKeypoint, id: Number(e.target.value) })}
            />
            <input
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-600 rounded"
              placeholder="Name"
              value={newKeypoint.name}
              onChange={(e) => setNewKeypoint({ ...newKeypoint, name: e.target.value })}
            />
          </div>

          <div className="flex justify-between">
            <input
              type="color"
              value={`#${newKeypoint.color.map((c) => c.toString(16).padStart(2, "0")).join("")}`}
              onChange={(e) =>
                setNewKeypoint({
                  ...newKeypoint,
                  color: (e.target.value
                    .slice(1)
                    .match(/.{1,2}/g) as [string, string, string])
                    .map((h) => parseInt(h, 16)) as [number, number, number],
                })
              }
              className="w-12 h-8 rounded border"
            />
            <button
              onClick={handleAddKeypoint}
              disabled={selectedPoseId === null}
              className="h-8 px-3 inline-flex items-center justify-center border rounded-md text-sm border-gray-500 bg-zinc-800 hover:border-zinc-100 w-20 mt-auto"
            >
              Add
            </button>

          </div>

        </div>

        <div className="space-y-2">
          <h2 className="text-sm text-gray-400">Add Skeleton Edge</h2>
          <div className="flex gap-2">
            <input
              type="number"
              disabled={selectedPoseId === null}
              className={`w-1/2 px-2 py-1 bg-zinc-800 border rounded ${(selectedPoseId != null && newEdge.from != undefined && settings.pose[selectedPoseId].keypoints[newEdge.from]) ? 'border-zinc-600' : 'border-red-600'}`}
              placeholder="From"
              min={0}
              value={newEdge.from ?? ""}
              onChange={(e) => setNewEdge({ ...newEdge, from: Number(e.target.value) })}
            />
            <input
              type="number"
              disabled={selectedPoseId === null}
              className={`w-1/2 px-2 py-1 bg-zinc-800 border rounded ${(selectedPoseId != null && newEdge.to != undefined && settings.pose[selectedPoseId].keypoints[newEdge.to]) ? 'border-zinc-600' : 'border-red-600'}`}
              placeholder="To"
              min={0}
              value={newEdge.to ?? ""}
              onChange={(e) => setNewEdge({ ...newEdge, to: Number(e.target.value) })}
            />
          </div>
          <div className="flex gap-2 justify-between">
            <span>
              {newEdge.name}
            </span>
            <button
              onClick={() =>
                handleAddEdge()
              }
              disabled={selectedPoseId === null}
              className="h-8 px-3 inline-flex items-center justify-center border rounded-md text-sm border-gray-500 bg-zinc-800 hover:border-zinc-100 w-20 mt-auto">
              Add
            </button>
          </div>

        </div>
      </div>

      {/* Right Panel: List View */}
      <div className="flex flex-col flex-grow gap-2 max-h-[40vh] overflow-y-auto px-2 border-l border-zinc-700">

        {Object.entries(settings.pose).map(([id, pose]) => (
          <div
            key={id}
            className={`rounded border p-2 cursor-pointer ${Number(id) === selectedPoseId ? "border-green-400" : "border-zinc-700"
              }`}
            onClick={() => handleEditPose(id, { id: id, name: pose.name, color: pose.color })}
          >
            <div className="flex justify-between items-center"
            >
              <ColorBulletText text={`${id}: ${pose.name}`} color={pose.color} />
              <div className="flex gap-1">
                <button
                  className="text-zinc-400 hover:text-zinc-100 p-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePose(Number(id));
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* List of keypoints */}
            <div>
              <div className="flex flex-wrap gap-1 mt-2 ml-2">
                {Object.entries(pose.keypoints).map(([i, kp]) => (
                  <div
                    key={i}
                    className="hover:bg-zinc-700 rounded px-1 flex items-center "
                    onClick={() => handleEditKeypoint(Number(i), kp)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({
                        x: e.pageX,
                        y: e.pageY,
                        poseId: Number(id),
                        index: Number(i),
                        objType: "keypoint"
                      });
                    }}
                  >
                    <DotBulletText color={kp.color} text={`${i}: ${kp.name}`} size={8} />
                  </div>
                ))}
              </div>
            </div>

            {/* List of edges */}
            <div className="flex flex-wrap gap-1 mt-2 ml-2">
              {pose.skeleton.map(([from, to], i) => (
                <div
                  key={i}
                  className="hover:bg-zinc-700 rounded px-1 flex items-center "
                  onClick={() => handleEditEdge(from, to)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      x: e.pageX,
                      y: e.pageY,
                      poseId: Number(id),
                      index: Number(i),
                      objType: "edge"
                    });
                  }}
                >
                  <span>{from}-{to}</span>
                  {/* <DotBulletText color={pose.keypoints[from].color} text={kp.name} size={8} /> */}
                </div>
              ))}
            </div>
          </div>
        ))}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeMenu}
            handleDeleteKeypoint={() => onDeleteKeypoint(contextMenu.poseId, contextMenu.index)}
            handleDeleteEdge={() => onDeleteEdge(contextMenu.poseId, contextMenu.index)}
          />
        )}
      </div>
    </div>
  );
}
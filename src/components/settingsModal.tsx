'use client';

import AnnotationSettingList, { AnnotationSettingListPose } from "@/components/AnnotationSettingList";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import {
  addObbClass,
  addPointClass,
  addPolygonClass,
  addRectClass,
  addLineClass,
  addPoseClass,
  deleteObbClass,
  deletePointClass,
  deletePolygonClass,
  deleteRectClass,
  deleteLineClass,
  deletePoseClass,
  addKeypointToPose,
  deletePoseKeypointClass,
  addEdgeToPose,
  deletePoseEdge,
} from '@/features/tools/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {

  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
    >
      <div
        className="bg-zinc-900 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <Tabs defaultValue="bbox" className="w-full">
          <TabsList className="w-full grid grid-cols-6">
            <TabsTrigger value="bbox">BBOX</TabsTrigger>
            <TabsTrigger value="obb">OBB</TabsTrigger>
            <TabsTrigger value="keypoint">Keypoint</TabsTrigger>
            <TabsTrigger value="pose">Pose</TabsTrigger>
            <TabsTrigger value="polygon">Polygon</TabsTrigger>
            <TabsTrigger value="line">Line</TabsTrigger>
          </TabsList>

          <TabsContent value="bbox">
            <AnnotationSettingList
              setting={settings.bbox}
              onAdd={(clsId, name, color) => dispatch(addRectClass({ id: clsId, attrs: { name: name, color: color } }))}
              onDelete={(id) => dispatch(deleteRectClass(id))}
            />
          </TabsContent>

          <TabsContent value="obb">
            <AnnotationSettingList
              setting={settings.obb}
              onAdd={(clsId, name, color) => dispatch(addObbClass({ id: clsId, attrs: { name: name, color: color } }))}
              onDelete={(id) => dispatch(deleteObbClass(id))}
            />
          </TabsContent>

          <TabsContent value="keypoint">
            <AnnotationSettingList
              setting={settings.keypoint}
              onAdd={(clsId, name, color) => dispatch(addPointClass({ id: clsId, attrs: { name: name, color: color } }))}
              onDelete={(id) => dispatch(deletePointClass(id))}
            />
          </TabsContent>

          <TabsContent value="pose">
            <AnnotationSettingListPose
              settings={settings}
              onAddPose={(id, pose) =>
                dispatch(
                  addPoseClass({
                    id,
                    pose
                  })
                )
              }
              onDeletePose={(id) => dispatch(deletePoseClass(id))}
              onAddKeypoint={(id, kid, name, color) => dispatch(
                addKeypointToPose({
                  poseId: id,
                  keypointId: kid,
                  keypoint: { name: name, color: color },
                })
              )}
              onDeleteKeypoint={(id, kid) => dispatch(
                deletePoseKeypointClass({
                  poseId: id,
                  keypointId: kid,
                })
              )}
              onAddEdge={(poseId, from, to) => { dispatch(addEdgeToPose({ poseId, from, to })) }}
              onDeleteEdge={(poseId, edgeIndex) => {dispatch(deletePoseEdge({poseId, edgeIndex})) }}
            >
            </AnnotationSettingListPose>
          </TabsContent>

          <TabsContent value="polygon">
            <AnnotationSettingList
              setting={settings.polygon}
              onAdd={(clsId, name, color) => dispatch(addPolygonClass({ id: clsId, attrs: { name: name, color: color } }))}
              onDelete={(id) => dispatch(deletePolygonClass(id))}
            />
          </TabsContent>

          <TabsContent value="line">
            <AnnotationSettingList
              setting={settings.line}
              onAdd={(clsId, name, color) => dispatch(addLineClass({ id: clsId, attrs: { name: name, color: color } }))}
              onDelete={(id) => dispatch(deleteLineClass(id))}
            />
          </TabsContent>
        </Tabs>
        <button
          onClick={onClose}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div >
  );
}
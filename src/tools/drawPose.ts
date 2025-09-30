import { getNormalizedCoords } from "@/lib/utils";
import {
    saveAnnotationsHistory,
    setDrawingKeypointIndex,
    setIsDrawing,
    setSelectedClassID,
    startDrawPoseBbox,
    startDrawPosePoint,
    updateDrawPoseBbox,
    updateDrawPoseKeypoint
} from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";


export function drawPoseTool(
    event: React.MouseEvent<HTMLDivElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
    canvas: HTMLCanvasElement
) {
    switch (event.type) {
        case 'mousedown':
            if (event.button == 0) {
                const startPoint = getNormalizedCoords(event, canvas)
                if (canvasState.isDrawing == false) {
                    dispatch(startDrawPoseBbox({ classID: canvasState.selectedClassID, mousePosition: startPoint }))
                    dispatch(setIsDrawing(true))
                } else {
                    const poseObj = canvasState.annotations[canvasState.selectedAnnotation].object
                    if (poseObj.type != 'pose') return
                    const poseSettings = settings.pose[poseObj.class_id]
                    const keypointsIDs = Object.keys(poseSettings.keypoints)
                    let flag = true
                    keypointsIDs.forEach((id) => {
                        if (!poseObj.keypoints[Number(id)]) {
                            if (flag) {
                                console.log('new id:', id)
                                dispatch(setDrawingKeypointIndex(Number(id)))
                                dispatch(startDrawPosePoint({ id: Number(id), mousePosition: startPoint }))
                                flag = false
                            }
                        }
                    })
                    if (flag) {
                        console.log('end')
                        console.log(canvasState.annotations[canvasState.selectedAnnotation].object)
                        dispatch(setIsDrawing(false))
                        dispatch(setDrawingKeypointIndex(-1))
                        dispatch(saveAnnotationsHistory())
                    }
                }

            } else if (event.button == 2) {
                const poseSettings = settings['pose']
                const classID = canvasState.selectedClassID
                if (poseSettings[classID + 1]) {
                    dispatch(setSelectedClassID(classID + 1))
                } else {
                    dispatch(setSelectedClassID(0))
                }
            }
            break;

        case 'mouseup':
            break;

        case 'mousemove':
            const newCoords = getNormalizedCoords(event, canvas);
            const selectedAnnotation = canvasState.annotations[canvasState.selectedAnnotation]?.object

            if (canvasState.isDrawing && selectedAnnotation.type == 'pose') {
                if (Object.keys(selectedAnnotation.keypoints).length == 0) {
                    console.log('update bbox')
                    dispatch(updateDrawPoseBbox(newCoords));
                }
                else {
                    console.log('update keypoint')
                    dispatch(updateDrawPoseKeypoint(newCoords))
                }
            }
            break;
    }
}
import { getNormalizedCoords } from "@/lib/utils";
import {
    saveAnnotationsHistory,
    updateHoveringVertex,
    updateHoveringAnnotation,
    moveVertex,
    resetSelectedVertex,
    selectVertexFromHover,
    selectAnnotationFromHover,
    resetSelectedAnnotation,
    setSelectedTool,
    updateAnnotation,
    setSelectedClassID,
    setIsEditing,
    setPreviousMousePosition,
    resetPreviousMousePosition,
    setHandle,
    updateHoveringPoseKeypoint,
    selectKeypointFromHover,
    resetSelectedKeypoint
} from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";
import { PoseObject } from "@/interfaces";
import Pose from "@/annotations/pose";
import { switchTools } from "./utils";

export function editPoseTool(
    event: React.MouseEvent<HTMLDivElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
    canvas: HTMLCanvasElement
) {
    switch (event.type) {
        case 'mousedown':
            if (event.button == 0) {
                if (canvasState.hoveringVertex != -1) {
                    dispatch(selectVertexFromHover())
                    return
                }
                dispatch(resetSelectedVertex())

                if (canvasState.hoveringPoseKeypoint != -1) {
                    dispatch(selectKeypointFromHover())
                    return
                }
                dispatch(resetSelectedKeypoint())

                if (canvasState.hoveringAnnotation != -1) {
                    if (canvasState.selectedAnnotation == canvasState.hoveringAnnotation &&
                        canvasState.annotations[canvasState.selectedAnnotation].object.type == 'pose') {
                        dispatch(setIsEditing(true))
                        const newCoords = getNormalizedCoords(event, canvas);
                        dispatch(setPreviousMousePosition(newCoords))
                    } else {
                        const annotationObj = canvasState.annotations[canvasState.hoveringAnnotation].object
                        switchTools(annotationObj.type, annotationObj.class_id, dispatch)
                        dispatch(selectAnnotationFromHover())
                    }
                } else {
                    dispatch(setSelectedTool('SELECT'))
                    dispatch(resetSelectedAnnotation())
                    dispatch(resetSelectedVertex())
                }

            } else if (event.button == 2) {
                const poseSettings = settings['pose']
                const selectedAnnotationIndex = canvasState.selectedAnnotation
                const Pose = canvasState.annotations[selectedAnnotationIndex].object
                const classID = Pose.class_id
                if (poseSettings[classID + 1]) {
                    const updatedPose = { ...Pose, class_id: classID + 1 }
                    dispatch(updateAnnotation({ updatedAnnotation: updatedPose, Index: selectedAnnotationIndex }))
                    dispatch(setSelectedClassID(classID + 1))
                } else {
                    const updatedPose = { ...Pose, class_id: 0 }
                    dispatch(updateAnnotation({ updatedAnnotation: updatedPose, Index: selectedAnnotationIndex }))
                    dispatch(setSelectedClassID(0))
                }
                dispatch(saveAnnotationsHistory())
            }
            break;

        case 'mouseup':
            if (event.button == 0) {
                if (canvasState.selectedVertex != -1) {
                    dispatch(saveAnnotationsHistory())
                    dispatch(resetSelectedVertex())
                }
                if (canvasState.selectedPoseKeypoint != -1) {
                    dispatch(saveAnnotationsHistory())
                    dispatch(resetSelectedKeypoint())
                }
                if (canvasState.isEditing) {
                    dispatch(setIsEditing(false))
                    dispatch(resetPreviousMousePosition())
                    dispatch(saveAnnotationsHistory())
                    dispatch(setHandle(false))
                }
            }
            break;

        case 'mousemove':
            const newCoords = getNormalizedCoords(event, canvas);
            if (canvasState.isEditing && canvasState.previousMousePosition && canvasState.annotations[canvasState.selectedAnnotation]) {
                const dx = newCoords.x - canvasState.previousMousePosition.x
                const dy = newCoords.y - canvasState.previousMousePosition.y
                const pose = canvasState.annotations[canvasState.selectedAnnotation].object as PoseObject
                const newPose = Pose.move(pose, dx, dy)
                dispatch(updateAnnotation({ updatedAnnotation: newPose, Index: canvasState.selectedAnnotation }))
                dispatch(setPreviousMousePosition(newCoords))
            }

            if (canvasState.selectedVertex != -1 && canvasState.annotations[canvasState.selectedAnnotation]) {
                dispatch(moveVertex(newCoords))
            }

            if (canvasState.selectedPoseKeypoint != -1 && canvasState.annotations[canvasState.selectedAnnotation]) {
                const pose = canvasState.annotations[canvasState.selectedAnnotation].object as PoseObject
                const newPose = Pose.moveKeypoint(pose, newCoords.x, newCoords.y, canvasState.selectedPoseKeypoint)
                dispatch(updateAnnotation({ updatedAnnotation: newPose, Index: canvasState.selectedAnnotation }))
            }

            dispatch(updateHoveringAnnotation(newCoords))
            dispatch(updateHoveringVertex(newCoords))
            dispatch(updateHoveringPoseKeypoint(newCoords))
            break;
    }
}
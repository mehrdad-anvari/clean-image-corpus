import { getNormalizedCoords } from "@/lib/utils";
import {
    saveAnnotationsHistory, moveSelectedPoint,
    updateHoveringAnnotation, resetSelectedVertex,
    selectAnnotationFromHover, resetSelectedAnnotation,
    setSelectedTool,
    setIsEditing,
    updateAnnotation,
    setSelectedClassID,
} from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";
import { switchTools } from "./utils";

export function editPointTool(
    event: React.MouseEvent<HTMLCanvasElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
) {
    switch (event.type) {
        case 'mousedown':
            if (event.button == 0) {
                if (canvasState.hoveringAnnotation != -1) {
                    const annotationObj = canvasState.annotations[canvasState.hoveringAnnotation].object
                    switchTools(annotationObj.type, annotationObj.class_id, dispatch)
                    dispatch(selectAnnotationFromHover())
                } else {
                    dispatch(setSelectedTool('SELECT'))
                    dispatch(setIsEditing(false))
                    dispatch(resetSelectedAnnotation())
                    dispatch(resetSelectedVertex())
                }
            } else if (event.button == 2) {
                const keypointSettings = settings['keypoint']
                const selectedAnnotationIndex = canvasState.selectedAnnotation
                const keypoint = canvasState.annotations[selectedAnnotationIndex].object
                const classID = keypoint.class_id
                if (keypointSettings[classID + 1]) {
                    const updatedKeypoint = { ...keypoint, class_id: classID + 1 }
                    dispatch(updateAnnotation({ updatedAnnotation: updatedKeypoint, Index: selectedAnnotationIndex }))
                    dispatch(setSelectedClassID(classID + 1))
                } else {
                    const updatedKeypoint = { ...keypoint, class_id: 0 }
                    dispatch(updateAnnotation({ updatedAnnotation: updatedKeypoint, Index: selectedAnnotationIndex }))
                    dispatch(setSelectedClassID(0))
                }
                dispatch(saveAnnotationsHistory())
            }
            break;

        case 'mouseup':
            if (event.button == 0) {
                if (canvasState.selectedAnnotation != -1) {
                    dispatch(saveAnnotationsHistory())
                    dispatch(setIsEditing(false))
                }
            }
            break;

        case 'mousemove':
            const newCoords = getNormalizedCoords(event);
            dispatch(updateHoveringAnnotation(newCoords))
            if (canvasState.isEditing) { dispatch(moveSelectedPoint(newCoords)) }
            break;
    }
}
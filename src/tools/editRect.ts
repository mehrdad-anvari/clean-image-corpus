import { getNormalizedCoords } from "@/lib/utils";
import {
    saveAnnotationsHistory, updateHoveringVertex,
    updateHoveringAnnotation, moveVertex, resetSelectedVertex, selectVertexFromHover,
    selectAnnotationFromHover, resetSelectedAnnotation, setSelectedTool,
    updateAnnotation,
    setSelectedClassID,
    setIsEditing,
    setPreviousMousePosition,
    resetPreviousMousePosition,
} from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";
import { RectangleObject } from "@/interfaces";
import Rectangle from "@/annotations/rectangle";

export function editRectTool(
    event: React.MouseEvent<HTMLCanvasElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
) {
    switch (event.type) {
        case 'mousedown':
            if (event.button == 0) {
                if (canvasState.hoveringVertex != -1) {
                    dispatch(selectVertexFromHover())
                } else {
                    dispatch(resetSelectedVertex())
                    if (canvasState.hoveringAnnotation != -1) {
                        if (canvasState.selectedAnnotation == canvasState.hoveringAnnotation &&
                            canvasState.annotations[canvasState.selectedAnnotation].object.type == 'bbox') {
                            dispatch(setIsEditing(true))
                            const newCoords = getNormalizedCoords(event);
                            dispatch(setPreviousMousePosition(newCoords))
                        } else {
                            const newClassID = canvasState.annotations[canvasState.hoveringAnnotation].object.class_id
                            switch (canvasState.annotations[canvasState.hoveringAnnotation].object.type) {
                                case 'bbox':
                                    dispatch(setSelectedTool('EDIT_RECT'));
                                    dispatch(setSelectedClassID(newClassID))
                                    break;
                                case 'keypoint':
                                    dispatch(setSelectedTool('EDIT_POINT'))
                                    dispatch(setSelectedClassID(newClassID))
                                    break;
                                case 'obb':
                                    dispatch(setSelectedTool('EDIT_OBB'))
                                    dispatch(setSelectedClassID(newClassID))
                                    break;
                                case 'polygon':
                                    dispatch(setSelectedTool('EDIT_POLY'))
                                    dispatch(setSelectedClassID(newClassID))
                                    break;
                            }
                            dispatch(selectAnnotationFromHover())
                        }
                    } else {
                        dispatch(setSelectedTool('SELECT'))
                        dispatch(resetSelectedAnnotation())
                        dispatch(resetSelectedVertex())
                    }
                }
            } else if (event.button == 2) {
                const rectSettings = settings['bbox']
                const selectedAnnotationIndex = canvasState.selectedAnnotation
                const Rect = canvasState.annotations[selectedAnnotationIndex].object
                const classID = Rect.class_id
                if (rectSettings[classID + 1]) {
                    const updatedRect = { ...Rect, class_id: classID + 1 }
                    dispatch(updateAnnotation({ updatedAnnotation: updatedRect, Index: selectedAnnotationIndex }))
                    dispatch(setSelectedClassID(classID + 1))
                } else {
                    const updatedRect = { ...Rect, class_id: 0 }
                    dispatch(updateAnnotation({ updatedAnnotation: updatedRect, Index: selectedAnnotationIndex }))
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
                if (canvasState.isEditing) {
                    dispatch(setIsEditing(false))
                    dispatch(resetPreviousMousePosition())
                    dispatch(saveAnnotationsHistory())
                }
            }
            break;

        case 'mousemove':
            const newCoords = getNormalizedCoords(event);
            if (canvasState.isEditing && canvasState.previousMousePosition) {
                const dx = newCoords.x - canvasState.previousMousePosition.x
                const dy = newCoords.y - canvasState.previousMousePosition.y
                const rect: RectangleObject = canvasState.annotations[canvasState.selectedAnnotation].object as RectangleObject
                const newRect = Rectangle.move(rect,dx,dy)
                dispatch(updateAnnotation({updatedAnnotation: newRect, Index: canvasState.selectedAnnotation}))
                dispatch(setPreviousMousePosition(newCoords))
            }
            dispatch(updateHoveringAnnotation(newCoords))
            dispatch(updateHoveringVertex(newCoords))
            if (canvasState.selectedVertex != -1) { dispatch(moveVertex(newCoords)) }
            break;
    }
}
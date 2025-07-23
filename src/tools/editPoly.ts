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
    updateHoveringHandle,
    setHandle,
} from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";
import { PolygonObject } from "@/interfaces";
import Polygon from "@/annotations/polygon";

export function editPolyTool(
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
                            canvasState.annotations[canvasState.selectedAnnotation].object.type == 'polygon') {
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
                const polySettings = settings['polygon']
                const selectedAnnotationIndex = canvasState.selectedAnnotation
                const Obb = canvasState.annotations[selectedAnnotationIndex].object
                const classID = Obb.class_id
                if (polySettings[classID + 1]) {
                    const updatedObb = { ...Obb, class_id: classID + 1 }
                    dispatch(updateAnnotation({ updatedAnnotation: updatedObb, Index: selectedAnnotationIndex }))
                    dispatch(setSelectedClassID(classID + 1))
                } else {
                    const updatedObb = { ...Obb, class_id: 0 }
                    dispatch(updateAnnotation({ updatedAnnotation: updatedObb, Index: selectedAnnotationIndex }))
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
                    dispatch(setHandle(false))
                }
            }
            break;

        case 'mousemove':
            const newCoords = getNormalizedCoords(event);
            if (canvasState.isEditing && canvasState.previousMousePosition) {
                const dx = newCoords.x - canvasState.previousMousePosition.x
                const dy = newCoords.y - canvasState.previousMousePosition.y
                const poly = canvasState.annotations[canvasState.selectedAnnotation].object as PolygonObject 
                const newPoly = Polygon.move(poly, dx, dy)
                dispatch(updateAnnotation({ updatedAnnotation: newPoly, Index: canvasState.selectedAnnotation }))
                dispatch(setPreviousMousePosition(newCoords))
            }
            dispatch(updateHoveringAnnotation(newCoords))
            dispatch(updateHoveringVertex(newCoords))
            dispatch(updateHoveringHandle(newCoords))
            if (canvasState.selectedVertex != -1) { dispatch(moveVertex(newCoords)) }
            break;
    }
}
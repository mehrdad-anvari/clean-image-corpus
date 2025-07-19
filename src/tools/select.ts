import { getAbsoluteCoords, getNormalizedCoords } from "@/lib/utils";
import { Dispatch, Action } from 'redux';
import {
    CanvasState, resetPreviousMousePosition, selectAnnotationFromHover, setIsEditing, setOffsets, setPreviousMousePosition, setSelectedClassID, setSelectedTool,
    updateHoveringAnnotation, updateHoveringVertex
} from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";

const typeMap = {
    'bbox' : 'rectClasses',
    'keypoint' : 'pointClasses',
    'line': 'lineClasses',
    'obb' : 'obbClasses',
    'polygon' : 'polygonClasses'
}

export function selectTool(
    event: React.MouseEvent<HTMLCanvasElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
) {
    switch (event.type) {
        case 'mousedown':
            if (event.button == 0) {
                if (canvasState.hoveringAnnotation != -1) {
                    const newClassID = canvasState.annotations[canvasState.hoveringAnnotation].object.class_id
                    switch (canvasState.annotations[canvasState.hoveringAnnotation].object.type) {
                        case 'bbox':
                            dispatch(setSelectedTool('EDIT_RECT'));
                            dispatch(setSelectedClassID(newClassID))
                            dispatch(setIsEditing(true))
                            break;
                        case 'keypoint':
                            dispatch(setSelectedTool('EDIT_POINT'))
                            dispatch(setSelectedClassID(newClassID))
                            dispatch(setIsEditing(true))
                            break;
                        case 'obb':
                            dispatch(setSelectedTool('EDIT_OBB'))
                            dispatch(setSelectedClassID(newClassID))
                            dispatch(setIsEditing(true))
                            break;
                    }
                    dispatch(selectAnnotationFromHover());
                } else {
                    const p = getAbsoluteCoords(event)
                    dispatch(setPreviousMousePosition(p))
                }

            } else if (event.button == 2) {
                const selectedClassID = canvasState.selectedClassID;
                const lastIndex = Math.max(...Object.keys(canvasState.annotations).map(Number))
                const lastAnnotationType = canvasState.annotations[lastIndex].object.type
                const selectedTypeSettings = settings[typeMap[lastAnnotationType] as 'bbox' | 'keypoint' | 'polygon' | 'obb' | 'line']
                if (selectedTypeSettings[selectedClassID + 1]) {
                    dispatch(setSelectedClassID(selectedClassID+1))
                } else {
                    dispatch(setSelectedClassID(0))
                }
            }
            break;

        case 'mouseup':
            if (canvasState.previousMousePosition) {
                dispatch(resetPreviousMousePosition())
            }
            break;

        case 'mousemove':
            const newCoords = getNormalizedCoords(event);
            const p = canvasState.previousMousePosition
            if (p) {
                const p2 = getAbsoluteCoords(event);
                const newOffset = {...canvasState.offsets}
                newOffset.x = newOffset.x + (p2.x - p.x) 
                newOffset.y = newOffset.y + (p2.y - p.y) 
                dispatch(setOffsets(newOffset))
                dispatch(setPreviousMousePosition(p2))
            }
            dispatch(updateHoveringAnnotation(newCoords))
            dispatch(updateHoveringVertex(newCoords))
            break;
    }
}

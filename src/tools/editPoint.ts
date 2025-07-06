import { getNormalizedCoords } from "@/lib/utils";
import {
    saveAnnotationsHistory, moveSelectedPoint,
    updateHoveringAnnotation, resetSelectedVertex,
    selectAnnotationFromHover, resetSelectedAnnotation,
    setSelectedTool,
    setIsEditing
} from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";

export function editPointTool(
    event: React.MouseEvent<HTMLCanvasElement>,
    canvasState: CanvasState,
    dispatch: Dispatch<Action>,
) {
    switch (event.type) {
        case 'mousedown':
            if (canvasState.hoveringAnnotation != -1) {
                switch (canvasState.annotations[canvasState.hoveringAnnotation].object.type) {
                    case 'bbox':
                        dispatch(setSelectedTool('EDIT_RECT'));
                        dispatch(setIsEditing(true))
                        break;
                    case 'keypoint':
                        dispatch(setSelectedTool('EDIT_POINT'))
                        dispatch(setIsEditing(true))
                        break;
                }
                dispatch(selectAnnotationFromHover())
            } else {
                dispatch(setSelectedTool('SELECT'))
                dispatch(setIsEditing(false))
                dispatch(resetSelectedAnnotation())
                dispatch(resetSelectedVertex())
            }
            break;

        case 'mouseup':
            if (canvasState.selectedAnnotation != -1) {
                dispatch(saveAnnotationsHistory())
                dispatch(setIsEditing(false))
            }
            break;

        case 'mousemove':
            const newCoords = getNormalizedCoords(event);
            dispatch(updateHoveringAnnotation(newCoords))
            if (canvasState.isEditing) { dispatch(moveSelectedPoint(newCoords)) }
            break;
    }
}
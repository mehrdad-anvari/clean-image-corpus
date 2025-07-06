import { getNormalizedCoords } from "@/lib/utils";
import {
    saveAnnotationsHistory, updateHoveringVertex,
    updateHoveringAnnotation, moveVertex, resetSelectedVertex, selectVertexFromHover,
    selectAnnotationFromHover, resetSelectedAnnotation, setSelectedTool
} from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";

export function editRectTool(
    event: React.MouseEvent<HTMLCanvasElement>,
    canvasState: CanvasState,
    dispatch: Dispatch<Action>,
) {
    switch (event.type) {
        case 'mousedown':
            if (canvasState.hoveringVertex != -1) {
                dispatch(selectVertexFromHover())
            } else {
                dispatch(resetSelectedVertex())
                if (canvasState.hoveringAnnotation != -1) {
                    switch (canvasState.annotations[canvasState.hoveringAnnotation].object.type) {
                        case 'bbox':
                            dispatch(setSelectedTool('EDIT_RECT'));
                            break;
                        case 'keypoint':
                            dispatch(setSelectedTool('EDIT_POINT'))
                            break;
                    }
                    dispatch(selectAnnotationFromHover())
                } else {
                    dispatch(setSelectedTool('SELECT'))
                    dispatch(resetSelectedAnnotation())
                    dispatch(resetSelectedVertex())
                }
            }
            break;

        case 'mouseup':
            if (canvasState.selectedVertex != -1) {
                dispatch(saveAnnotationsHistory())
                dispatch(resetSelectedVertex())
            }
            break;

        case 'mousemove':
            const newCoords = getNormalizedCoords(event);
            dispatch(updateHoveringAnnotation(newCoords))
            dispatch(updateHoveringVertex(newCoords))
            if (canvasState.selectedVertex != -1) { dispatch(moveVertex(newCoords)) }
            break;
    }
}
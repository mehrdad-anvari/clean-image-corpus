import { getNormalizedCoords } from "@/lib/utils";
import { Dispatch, Action } from 'redux';
import {
    CanvasState, selectAnnotationFromHover, setSelectedTool,
    updateHoveringAnnotation, updateHoveringVertex
} from "@/features/tools/canvas";


export function selectTool(
    event: React.MouseEvent<HTMLCanvasElement>,
    canvasState: CanvasState,
    dispatch: Dispatch<Action>,
) {
    switch (event.type) {
        case 'mousedown':
            if (canvasState.hoveringAnnotation != -1) {
                dispatch(setSelectedTool('EDIT_RECT'));
                dispatch(selectAnnotationFromHover());
            }
            // else {
            //     const newCoords = getNormalizedCoords(event);
            //     dispatch(setSelectedTool('DRAW_RECT'));
            //     dispatch(startDrawRect({ classID: canvasState.selectedClassID, mousePosition: newCoords }))
            // }
            break;

        case 'mouseup':
            break;

        case 'mousemove':
            const newCoords = getNormalizedCoords(event);
            dispatch(updateHoveringAnnotation(newCoords))
            dispatch(updateHoveringVertex(newCoords))
            break;
    }
}

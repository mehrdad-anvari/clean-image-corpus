import { getNormalizedCoords } from "@/lib/utils";
import { startDrawRect, updateDrawRect, saveAnnotationsHistory, setSelectedTool } from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";

export function drawRectTool(
    event: React.MouseEvent<HTMLCanvasElement>,
    canvasState: CanvasState,
    dispatch: Dispatch<Action>,
) {
    switch (event.type) {
        case 'mousedown':
            const startPoint = getNormalizedCoords(event);
            dispatch(startDrawRect({ classID: canvasState.selectedClassID, mousePosition: startPoint }))
            break;

        case 'mouseup':
            dispatch(saveAnnotationsHistory())
            dispatch(setSelectedTool('SELECT'))
            break;
            
        case 'mousemove':
            const newCoords = getNormalizedCoords(event);
            // dispatch(updateMousePosition(newCoords))
            dispatch(updateDrawRect(newCoords))
            break;
    }
}
import { getNormalizedCoords } from "@/lib/utils";
import { startDrawRect, updateDrawRect, saveAnnotationsHistory, setIsDrawing } from "@/features/tools/canvas";
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
            dispatch(setIsDrawing(true))
            break;

        case 'mouseup':
            dispatch(saveAnnotationsHistory())
            dispatch(setIsDrawing(false))
            break;

        case 'mousemove':
            if (canvasState.isDrawing) {
                const newCoords = getNormalizedCoords(event);
                dispatch(updateDrawRect(newCoords))
            }
            break;
    }
}
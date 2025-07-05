import { getNormalizedCoords } from "@/lib/utils";
import { saveAnnotationsHistory, drawPoint } from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";

export function drawPointTool(
    event: React.MouseEvent<HTMLCanvasElement>,
    canvasState: CanvasState,
    dispatch: Dispatch<Action>,
) {
    switch (event.type) {
        case 'mousedown':
            const startPoint = getNormalizedCoords(event);
            dispatch(drawPoint({ classID: canvasState.selectedClassID, mousePosition: startPoint }))
            dispatch(saveAnnotationsHistory())
            break;
        case 'mouseup':
            break;

        case 'mousemove':
            break;
    }
}
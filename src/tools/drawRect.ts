import { getNormalizedCoords } from "@/lib/utils";
import { startDrawRect, updateDrawRect, saveAnnotationsHistory, setIsDrawing, setSelectedClassID } from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";

export function drawRectTool(
    event: React.MouseEvent<HTMLCanvasElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
) {
    switch (event.type) {
        case 'mousedown':
            if (event.button == 0) {
                const startPoint = getNormalizedCoords(event);
                dispatch(startDrawRect({ classID: canvasState.selectedClassID, mousePosition: startPoint }))
                dispatch(setIsDrawing(true))
            } else if (event.button == 2) {
                const rectSettings = settings['bbox']
                const classID = canvasState.selectedClassID
                if (rectSettings[classID + 1]) {
                    dispatch(setSelectedClassID(classID + 1))
                } else {
                    dispatch(setSelectedClassID(0))
                }
            }
            break;

        case 'mouseup':
            if (event.button == 0) {
                dispatch(saveAnnotationsHistory())
                dispatch(setIsDrawing(false))
            }
            break;

        case 'mousemove':
            if (canvasState.isDrawing) {
                const newCoords = getNormalizedCoords(event);
                dispatch(updateDrawRect(newCoords))
            }
            break;
    }
}
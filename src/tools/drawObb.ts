import { getNormalizedCoords } from "@/lib/utils";
import { saveAnnotationsHistory, setIsDrawing, setSelectedClassID, startDrawObb, updateDrawObb } from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";

export function drawObbTool(
    event: React.MouseEvent<HTMLDivElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
    canvas: HTMLCanvasElement
) {
    switch (event.type) {
        case 'mousedown':
            if (event.button == 0) {
                const startPoint = getNormalizedCoords(event, canvas);
                dispatch(startDrawObb({ classID: canvasState.selectedClassID, mousePosition: startPoint }))
                dispatch(setIsDrawing(true))
            } else if (event.button == 2) {
                const rectSettings = settings['obb']
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
                const newCoords = getNormalizedCoords(event, canvas);
                dispatch(updateDrawObb(newCoords))
            }
            break;
    }
}
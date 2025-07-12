import { getNormalizedCoords } from "@/lib/utils";
import { saveAnnotationsHistory, drawPoint, setSelectedClassID } from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";

export function drawPointTool(
    event: React.MouseEvent<HTMLCanvasElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
) {
    switch (event.type) {
        case 'mousedown':
            if (event.button == 0) {
                const startPoint = getNormalizedCoords(event);
                dispatch(drawPoint({ classID: canvasState.selectedClassID, mousePosition: startPoint }))
                dispatch(saveAnnotationsHistory())
            } else if (event.button == 2) {
                const keypointSettings = settings['keypoint']
                const classID = canvasState.selectedClassID
                if (keypointSettings[classID + 1]) {
                    dispatch(setSelectedClassID(classID + 1))
                } else {
                    dispatch(setSelectedClassID(0))
                }
                dispatch(saveAnnotationsHistory())
            }
            break;
        case 'mouseup':
            break;

        case 'mousemove':
            break;
    }
}
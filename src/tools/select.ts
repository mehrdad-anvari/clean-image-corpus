import { getAbsoluteCoords, getNormalizedCoords } from "@/lib/utils";
import { Dispatch, Action } from 'redux';
import {
    CanvasState, resetPreviousMousePosition, selectAnnotationFromHover, setOffsets, setPreviousMousePosition, setSelectedClassID,
    updateHoveringAnnotation, updateHoveringVertex
} from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";
import { switchTools } from "./utils";

export function selectTool(
    event: React.MouseEvent<HTMLDivElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
    canvas: HTMLCanvasElement
) {
    switch (event.type) {
        case 'mousedown':
            if (event.button == 0) {
                if (canvasState.hoveringAnnotation != -1) {
                    const annotationObj = canvasState.annotations[canvasState.hoveringAnnotation].object
                    switchTools(annotationObj.type, annotationObj.class_id, dispatch)
                    dispatch(selectAnnotationFromHover());
                } else {
                    const p = getAbsoluteCoords(event)
                    dispatch(setPreviousMousePosition(p))
                }

            } else if (event.button == 2) {
                const selectedClassID = canvasState.selectedClassID;
                const lastIndex = Math.max(...Object.keys(canvasState.annotations).map(Number))
                const lastAnnotationType = canvasState.annotations[lastIndex].object.type
                const selectedTypeSettings = settings[lastAnnotationType]
                if (selectedTypeSettings[selectedClassID + 1]) {
                    dispatch(setSelectedClassID(selectedClassID + 1))
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
            const newCoords = getNormalizedCoords(event, canvas);
            const p = canvasState.previousMousePosition
            if (p) {
                const p2 = getAbsoluteCoords(event);
                const newOffset = { ...canvasState.offsets }
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

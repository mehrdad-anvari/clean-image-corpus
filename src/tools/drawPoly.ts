import { getNormalizedCoords } from "@/lib/utils";
import { saveAnnotationsHistory, setIsDrawing, setSelectedClassID, startDrawPoly, updateAnnotation, updateDrawPoly, updateDrawPolyVertex, updateHoveringVertex } from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";
import Polygon from "@/annotations/polygon";
import { PolygonObject } from "@/interfaces";

export function drawPolyTool(
    event: React.MouseEvent<HTMLDivElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
    canvas: HTMLCanvasElement
) {
    switch (event.type) {
        case 'mousedown':
            if (event.button == 0) {
                const selectedAnnotation = canvasState.annotations[canvasState.selectedAnnotation]?.object
                const newCoords = getNormalizedCoords(event, canvas);
                const isNearStart: boolean = (
                    (canvasState.isDrawing && selectedAnnotation.type == 'polygon') ?
                        Polygon.isNearVertex(selectedAnnotation, newCoords.x, newCoords.y, 0) : false
                );
                if (canvasState.isDrawing && isNearStart) {
                    if (selectedAnnotation.type == 'polygon') {
                        const newShell = [...selectedAnnotation.shell].slice(0, -1)
                        const newPoly: PolygonObject = { ...selectedAnnotation, shell: newShell }
                        dispatch(updateAnnotation({ updatedAnnotation: newPoly, Index: canvasState.selectedAnnotation }))
                        dispatch(saveAnnotationsHistory())
                        dispatch(setIsDrawing(false))
                    }

                } else if (canvasState.isDrawing) {
                    const newCoords = getNormalizedCoords(event, canvas);
                    dispatch(updateDrawPoly(newCoords))
                } else {
                    const startPoint = getNormalizedCoords(event, canvas);
                    dispatch(startDrawPoly({ classID: canvasState.selectedClassID, mousePosition: startPoint }))
                    dispatch(setIsDrawing(true))
                }

            } else if (event.button == 2) {
                const rectSettings = settings['polygon']
                const classID = canvasState.selectedClassID
                if (rectSettings[classID + 1]) {
                    dispatch(setSelectedClassID(classID + 1))
                } else {
                    dispatch(setSelectedClassID(0))
                }
            }
            break;

        case 'mouseup':

            break;

        case 'mousemove':
            const newCoords = getNormalizedCoords(event, canvas);
            const selectedAnnotation = canvasState.annotations[canvasState.selectedAnnotation]?.object
            const isNearStart: boolean = (
                (canvasState.isDrawing && selectedAnnotation && selectedAnnotation.type == 'polygon') ?
                    Polygon.isNearVertex(selectedAnnotation, newCoords.x, newCoords.y, 0) : false
            );
            if (canvasState.isDrawing && canvasState.hoveringVertex != -1) {
                if (isNearStart && selectedAnnotation.type == 'polygon' && selectedAnnotation.shell.length > 3)
                    dispatch(updateDrawPolyVertex(selectedAnnotation.shell[0]))
                else
                    dispatch(updateDrawPolyVertex(newCoords))
            }


            dispatch(updateHoveringVertex(newCoords))
            break;
    }
}
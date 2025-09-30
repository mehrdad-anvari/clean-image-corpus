import { Dispatch, Action } from 'redux';
import { CanvasState, zoomIn, zoomOut } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";

export function wheelHandle(
    event: React.WheelEvent<HTMLDivElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
    canvas: HTMLCanvasElement
) {
    if (event.deltaY > 0) {
        dispatch(zoomIn())
    } else if (event.deltaY < 0) {
        dispatch(zoomOut())
    }
}
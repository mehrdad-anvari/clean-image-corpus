import { goBackwardHistory, goForwardHistory } from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";

export function keyboardHandle(
    event: React.KeyboardEvent<HTMLDivElement>,
    canvasState: CanvasState,
    settings: AnnotationSettingsState,
    dispatch: Dispatch<Action>,
    canvas: HTMLCanvasElement
) {
    switch (event.type) {
        case 'keydown':
            if (event.ctrlKey && "key" in event && event.key === 'z') {
                dispatch(goBackwardHistory())
            }
            if (event.ctrlKey && "key" in event && event.key === 'y') {
                dispatch(goForwardHistory())
            }
            break;

        case 'keyup':
            break;
    }
}
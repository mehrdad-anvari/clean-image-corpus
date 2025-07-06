import { selectTool } from "@/tools/select";
import { editRectTool } from "@/tools/editRect";
import { drawRectTool } from "@/tools/drawRect";
import { keyboardHandle } from "@/tools/keyboard";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { drawPointTool } from "@/tools/drawPoint";
import { editPointTool } from "@/tools/editPoint";

function isMouseEvent(e: React.MouseEvent<HTMLCanvasElement> | React.KeyboardEvent<HTMLCanvasElement>): e is React.MouseEvent<HTMLCanvasElement> {
    return e.type === 'mousemove' || e.type === 'mousedown' || e.type === 'mouseup';
}

function isKeyboardEvent(e: React.MouseEvent<HTMLCanvasElement> | React.KeyboardEvent<HTMLCanvasElement>): e is React.KeyboardEvent<HTMLCanvasElement> {
    return e.type === 'keydown' || e.type === 'keyup';
}

export function TaskManager(e: React.MouseEvent<HTMLCanvasElement> | React.KeyboardEvent<HTMLCanvasElement>, canvasState: CanvasState, dispatch: Dispatch<Action>) {
    if (isKeyboardEvent(e)) {
        keyboardHandle(e, canvasState, dispatch)
        return
    }
    if (isMouseEvent(e)) {
        switch (canvasState.selectedTool) {
            case 'SELECT':
                selectTool(e, canvasState, dispatch);
                break;

            case 'EDIT_RECT':
                editRectTool(e, canvasState, dispatch);
                break;

            case 'DRAW_RECT':
                drawRectTool(e, canvasState, dispatch);
                break;

            case 'DRAW_POINT':
                drawPointTool(e, canvasState, dispatch);
                break;

            case 'EDIT_POINT':
                editPointTool(e, canvasState, dispatch);
                break;
        }
    }
}
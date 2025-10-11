import { selectTool } from "@/tools/select";
import { editRectTool } from "@/tools/editRect";
import { drawRectTool } from "@/tools/drawRect";
import { keyboardHandle } from "@/tools/keyboard";
import { Dispatch, Action } from 'redux';
import { CanvasState } from "@/features/tools/canvas";
import { drawPointTool } from "@/tools/drawPoint";
import { editPointTool } from "@/tools/editPoint";
import { AnnotationSettingsState } from "@/features/tools/settings";
import { wheelHandle } from "@/tools/wheel";
import { drawObbTool } from "@/tools/drawObb";
import { editObbTool } from "@/tools/editObb";
import { drawPolyTool } from "@/tools/drawPoly";
import { editPolyTool } from "@/tools/editPoly";
import { editPoseTool } from "@/tools/editPose";
import { drawPoseTool } from "@/tools/drawPose";

function isMouseEvent(e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement> | React.WheelEvent<HTMLDivElement>): e is React.MouseEvent<HTMLDivElement> {
    return e.type === 'mousemove' || e.type === 'mousedown' || e.type === 'mouseup';
}

function isKeyboardEvent(e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement> | React.WheelEvent<HTMLDivElement>): e is React.KeyboardEvent<HTMLDivElement> {
    return e.type === 'keydown' || e.type === 'keyup';
}

function isWheelEvent(e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement> | React.WheelEvent<HTMLDivElement>): e is React.WheelEvent<HTMLDivElement> {
    return e.type === 'wheel';
}

export function TaskManager(e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement> | React.WheelEvent<HTMLDivElement>, canvasState: CanvasState, settings: AnnotationSettingsState, dispatch: Dispatch<Action>, canvas: HTMLCanvasElement) {
    if (isWheelEvent(e)) {
        wheelHandle(e, dispatch)
    }
    if (isKeyboardEvent(e)) {
        keyboardHandle(e, dispatch)
        return
    }
    if (isMouseEvent(e)) {
        switch (canvasState.selectedTool) {
            case 'SELECT':
                selectTool(e, canvasState, settings, dispatch, canvas);
                break;

            case 'DRAW_RECT':
                drawRectTool(e, canvasState, settings, dispatch, canvas);
                break;

            case 'DRAW_POINT':
                drawPointTool(e, canvasState, settings, dispatch, canvas);
                break;

            case 'DRAW_POLY':
                drawPolyTool(e, canvasState, settings, dispatch, canvas);
                break;

            case 'DRAW_OBB':
                drawObbTool(e, canvasState, settings, dispatch, canvas);
                break;

            case 'DRAW_POSE':
                drawPoseTool(e, canvasState, settings, dispatch, canvas);
                break;

            case 'EDIT_RECT':
                editRectTool(e, canvasState, settings, dispatch, canvas);
                break;

            case 'EDIT_POINT':
                editPointTool(e, canvasState, settings, dispatch, canvas);
                break;

            case 'EDIT_OBB':
                editObbTool(e, canvasState, settings, dispatch, canvas)
                break;

            case 'EDIT_POLY':
                editPolyTool(e, canvasState, settings, dispatch, canvas);
                break;

            case 'EDIT_POSE':
                editPoseTool(e, canvasState, settings, dispatch, canvas);
                break;
        }
    }
}
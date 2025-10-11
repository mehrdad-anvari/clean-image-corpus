import { Dispatch, Action } from 'redux';
import { zoomIn, zoomOut } from "@/features/tools/canvas";

export function wheelHandle(
    event: React.WheelEvent<HTMLDivElement>,
    dispatch: Dispatch<Action>,
) {
    if (event.deltaY > 0) {
        dispatch(zoomIn())
    } else if (event.deltaY < 0) {
        dispatch(zoomOut())
    }
}
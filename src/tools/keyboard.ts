import { goBackwardHistory, goForwardHistory } from "@/features/tools/canvas";
import { Dispatch, Action } from 'redux';

export function keyboardHandle(
    event: React.KeyboardEvent<HTMLDivElement>,
    dispatch: Dispatch<Action>,
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
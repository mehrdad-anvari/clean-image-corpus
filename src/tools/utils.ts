import { setSelectedClassID, setSelectedTool } from '@/features/tools/canvas';
import { Dispatch, Action } from 'redux';

export function switchTools(annotationType:string, newClassID: number, dispatch: Dispatch<Action>,) {
    switch (annotationType) {
        case 'bbox':
            dispatch(setSelectedTool('EDIT_RECT'));
            dispatch(setSelectedClassID(newClassID))
            break;
        case 'keypoint':
            dispatch(setSelectedTool('EDIT_POINT'))
            dispatch(setSelectedClassID(newClassID))
            break;
        case 'obb':
            dispatch(setSelectedTool('EDIT_OBB'))
            dispatch(setSelectedClassID(newClassID))
            break;
        case 'polygon':
            dispatch(setSelectedTool('EDIT_POLY'))
            dispatch(setSelectedClassID(newClassID))
            break;
        case 'pose':
            dispatch(setSelectedTool('EDIT_POSE'))
            dispatch(setSelectedClassID(newClassID))
            break;
    }
}
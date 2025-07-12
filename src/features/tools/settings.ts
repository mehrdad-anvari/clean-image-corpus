import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type classAttributes = { name: string, color: [number, number, number] }
export interface AnnotationSettingsState {
    bbox: { [key: number]: classAttributes },
    keypoint: { [key: number]: classAttributes },
    polygon: { [key: number]: classAttributes },
    line: { [key: number]: classAttributes },
    obb: { [key: number]: classAttributes },
    rectMinEdgeSize: number,
}

const initialState: AnnotationSettingsState = {
    bbox: {
        [0]: { name: 'default', color: [255, 255, 255] }
    },
    keypoint: {
        [0]: { name: 'default', color: [255, 255, 255] }
    },
    polygon: {
        [0]: { name: 'default', color: [255, 255, 255] }
    },
    line: {
        [0]: { name: 'default', color: [255, 255, 255] }
    },
    obb: {
        [0]: { name: 'default', color: [255, 255, 255] }
    },
    rectMinEdgeSize: 0.02
}

export const annotationSettingsSlice = createSlice({
    name: 'annotationSettings',
    initialState,
    reducers: {
        addRectClass: (state, action: PayloadAction<{ id: number, attrs: classAttributes }>) => {
            state.bbox[action.payload.id] = action.payload.attrs;
        },
        addPointClass: (state, action: PayloadAction<{ id: number, attrs: classAttributes }>) => {
            state.keypoint[action.payload.id] = action.payload.attrs;
        },
        addPolygonClass: (state, action: PayloadAction<{ id: number, attrs: classAttributes }>) => {
            state.polygon[action.payload.id] = action.payload.attrs;
        },
        addLineClass: (state, action: PayloadAction<{ id: number, attrs: classAttributes }>) => {
            state.line[action.payload.id] = action.payload.attrs;
        },
        addObbClass: (state, action: PayloadAction<{ id: number, attrs: classAttributes }>) => {
            state.obb[action.payload.id] = action.payload.attrs;
        },
        deleteRectClass: (state, action: PayloadAction<number>) => {
            delete state.bbox[action.payload];
        },
        deletePointClass: (state, action: PayloadAction<number>) => {
            delete state.keypoint[action.payload];
        },
        deletePolygonClass: (state, action: PayloadAction<number>) => {
            delete state.polygon[action.payload];
        },
        deleteLineClass: (state, action: PayloadAction<number>) => {
            delete state.line[action.payload];
        },
        deleteObbClass: (state, action: PayloadAction<number>) => {
            delete state.obb[action.payload];
        },
        setSettings: (state, action: PayloadAction<AnnotationSettingsState>) => {
            return { ...state, ...action.payload }
        }
    }
})

export const { addRectClass, deleteRectClass, addPolygonClass, deletePolygonClass,
    addPointClass, deletePointClass, addLineClass, deleteLineClass,
    addObbClass, deleteObbClass, setSettings } = annotationSettingsSlice.actions

export default annotationSettingsSlice.reducer
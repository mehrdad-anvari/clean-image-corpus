import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type classAttributes = { name: string, color: [number, number, number] }
export interface AnnotationSettingsState {
    rectClasses: { [key: number]: classAttributes },
    pointClasses: { [key: number]: classAttributes },
    polygonClasses: { [key: number]: classAttributes },
    lineClasses: { [key: number]: classAttributes },
    obbClasses: { [key: number]: classAttributes },
    rectMinEdgeSize: number,
}

const initialState: AnnotationSettingsState = {
    rectClasses: {
        [0]: { name: 'default', color: [255, 255, 255] }
    },
    pointClasses: {
        [0]: { name: 'default', color: [255, 255, 255] }
    },
    polygonClasses: {
        [0]: { name: 'default', color: [255, 255, 255] }
    },
    lineClasses: {
        [0]: { name: 'default', color: [255, 255, 255] }
    },
    obbClasses: {
        [0]: { name: 'default', color: [255, 255, 255] }
    },
    rectMinEdgeSize: 0.02
}

export const annotationSettingsSlice = createSlice({
    name: 'annotationSettings',
    initialState,
    reducers: {
        addRectClass: (state, action: PayloadAction<{ id: number, attrs: classAttributes }>) => {
            state.rectClasses[action.payload.id] = action.payload.attrs;
        },
        addPointClass: (state, action: PayloadAction<{ id: number, attrs: classAttributes }>) => {
            state.pointClasses[action.payload.id] = action.payload.attrs;
        },
        addPolygonClass: (state, action: PayloadAction<{ id: number, attrs: classAttributes }>) => {
            state.polygonClasses[action.payload.id] = action.payload.attrs;
        },
        addLineClass: (state, action: PayloadAction<{ id: number, attrs: classAttributes }>) => {
            state.lineClasses[action.payload.id] = action.payload.attrs;
        },
        addObbClass: (state, action: PayloadAction<{ id: number, attrs: classAttributes }>) => {
            state.obbClasses[action.payload.id] = action.payload.attrs;
        },
        deleteRectClass: (state, action: PayloadAction<number>) => {
            delete state.rectClasses[action.payload];
        },
        deletePointClass: (state, action: PayloadAction<number>) => {
            delete state.pointClasses[action.payload];
        },
        deletePolygonClass: (state, action: PayloadAction<number>) => {
            delete state.polygonClasses[action.payload];
        },
        deleteLineClass: (state, action: PayloadAction<number>) => {
            delete state.lineClasses[action.payload];
        },
        deleteObbClass: (state, action: PayloadAction<number>) => {
            delete state.obbClasses[action.payload];
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
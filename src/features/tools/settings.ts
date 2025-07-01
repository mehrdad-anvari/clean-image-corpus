import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type classAttributes = { name: string, color: [number, number, number] }
export interface AnnotationSettingsState {
    rectClasses: { [key: number]: classAttributes },
    rectMinEdgeSize: number,
}

const initialState: AnnotationSettingsState = {
    rectClasses: {
        [0]: { name: 'default', color: [255, 255, 255] }
    },
    rectMinEdgeSize: 0.02
}

export const annotationSettingsSlice = createSlice({
    name: 'annotationSettings',
    initialState,
    reducers: {
        addRectClass: (state, action: PayloadAction<{ id: number, attrs: classAttributes }>) => {
            state.rectClasses[action.payload.id] = action.payload.attrs; // Use object syntax
        },
        deleteRectClass: (state, action: PayloadAction<number>) => {
            delete state.rectClasses[action.payload]; // Use delete operator
        },
        setSettings: (state, action: PayloadAction<AnnotationSettingsState>) => {
            return { ...state, ...action.payload }
        }
    }
})

export const { addRectClass, deleteRectClass, setSettings } = annotationSettingsSlice.actions

export default annotationSettingsSlice.reducer
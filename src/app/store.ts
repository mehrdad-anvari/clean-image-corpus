
import { configureStore } from "@reduxjs/toolkit";
import canvasReducer from "@/features/tools/canvas";
import annotationSettingsReducer from "@/features/tools/settings";

export const store = configureStore({
    reducer: {
        canvas: canvasReducer ,
        settings: annotationSettingsReducer
    }
})


export type AppStore = typeof store
export type RootState =  ReturnType<AppStore['getState']>

export type AppDispatch = AppStore['dispatch']

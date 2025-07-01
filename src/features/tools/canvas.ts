import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import Rectangle from "@/annotations/rectangle";
import { Point, RectangleObject } from "@/interfaces";

interface AnnotationsSnapshot { [key: number]: { object: RectangleObject } };

export interface CanvasState {
    selectedAnnotation: number,
    selectedVertex: number,
    hoveringAnnotation: number,
    hoveringVertex: number,
    annotations: { [key: number]: { object: RectangleObject } },
    annotationsHistory: { [key: number]: { annotations: AnnotationsSnapshot, length: number } },
    historyIndex: number,
    selectedTool: string,
    width: number,
    height: number,
    selectedClassID: number,
    lastIndex: number,
    historyLastIndex: number,
    zoom: number,
}

const initialState: CanvasState = {
    selectedAnnotation: -1,
    selectedVertex: -1,
    hoveringAnnotation: -1,
    hoveringVertex: -1,
    annotations: {},
    annotationsHistory: { 0: { annotations: {}, length: 0 } },
    historyIndex: 0,
    selectedTool: 'SELECT',
    width: 640,
    height: 640,
    selectedClassID: 0,
    lastIndex: 0,
    historyLastIndex: 0,
    zoom: 800,
}

export const canvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        loadAnnotations: (state, action: PayloadAction<RectangleObject[]>) => {
            state.lastIndex = action.payload.length
            const newAnnotations: AnnotationsSnapshot = {}
            action.payload.forEach((annotation, index) => {
                newAnnotations[index] = { object: annotation }
            });
            state.annotations = newAnnotations
            state.annotationsHistory = { 0: { annotations: newAnnotations, length: action.payload.length } }
        },
        startDrawRect: (state, action: PayloadAction<{ classID: number, mousePosition: Point }>) => {
            const classID = action.payload.classID
            const p = action.payload.mousePosition
            const newRect = {
                class_id: classID,
                x1: p.x,
                y1: p.y,
                x2: p.x,
                y2: p.y,
            }
            state.annotations[state.lastIndex] = { object: newRect }
            state.lastIndex += 1
        },
        resetHistory: (state) => {
            state.annotationsHistory = { 0: { annotations: {}, length: 0 } }
            state.historyIndex = 0
        },
        saveAnnotationsHistory: (state) => {
            state.annotationsHistory[state.historyIndex + 1] = { annotations: state.annotations, length: state.lastIndex }
            state.historyLastIndex = state.historyIndex + 1
            state.historyIndex += 1
            console.log('saving state')
        },
        goForwardHistory: (state) => {
            if (state.historyIndex < state.historyLastIndex) {
                state.historyIndex += 1
                state.annotations = state.annotationsHistory[state.historyIndex].annotations
                state.lastIndex = state.annotationsHistory[state.historyIndex].length
            }
        },
        goBackwardHistory: (state) => {
            if (state.historyIndex > 0) {
                state.historyIndex -= 1
                state.annotations = state.annotationsHistory[state.historyIndex].annotations
                state.lastIndex = state.annotationsHistory[state.historyIndex].length
            }
        },
        updateDrawRect: (state, action: PayloadAction<Point>) => {
            const bbox = state.annotations[state.lastIndex - 1].object
            const p = action.payload
            state.annotations[state.lastIndex - 1].object = {
                class_id: bbox.class_id,
                x1: bbox.x1,
                y1: bbox.y1,
                x2: p.x,
                y2: p.y,
            }
        },
        updateRect: (state, action: PayloadAction<{updatedRect: RectangleObject, Index: number}>) => {
            state.annotations[action.payload.Index].object = action.payload.updatedRect
        },
        updateHoveringAnnotation: (state, action: PayloadAction<Point>) => {
            state.hoveringAnnotation = -1;
            const p = action.payload
            for (const [index, annotation] of Object.entries(state.annotations)) {
                if (Rectangle.containPoint(annotation['object'], p.x, p.y)) { state.hoveringAnnotation = Number(index); break }
            }
        },
        updateHoveringVertex: (state, action: PayloadAction<Point>) => {
            const p = action.payload;
            if (state.selectedAnnotation > -1) {
                const nearestVertex = Rectangle.findNearestVertex(state.annotations[state.selectedAnnotation]['object'], p.x, p.y);
                if (nearestVertex != null) { state.hoveringVertex = nearestVertex }
            }
        },
        selectAnnotationFromHover: (state) => {
            state.selectedAnnotation = state.hoveringAnnotation
        },
        selectVertexFromHover: (state) => {
            state.selectedVertex = state.hoveringVertex
        },
        resetSelectedAnnotation: (state) => {
            state.selectedAnnotation = -1
        },
        setSelectedAnnotation: (state, action: PayloadAction<number>) => {
            state.selectedAnnotation = action.payload
        },
        resetSelectedVertex: (state) => {
            state.selectedVertex = -1
        },
        moveVertex: (state, action: PayloadAction<Point>) => {
            const p = action.payload
            if (state.selectedAnnotation > -1 && state.selectedVertex > -1) {
                const newRect = Rectangle.moveVertex(state.annotations[state.selectedAnnotation]['object'], p.x, p.y, state.selectedVertex)
                if (newRect != undefined) {
                    state.annotations[state.selectedAnnotation]['object'] = newRect
                }
            }
        },
        setSelectedTool: (state, action: PayloadAction<string>) => {
            state.selectedTool = action.payload
        },
        setCanvasSize: (state, action: PayloadAction<{ width: number, height: number }>) => {
            state.width = action.payload.width
            state.height = action.payload.height
        },
        setSelectedClassID: (state, action: PayloadAction<number>) => {
            state.selectedClassID = action.payload
        },
        removeAnnotation: (state, action: PayloadAction<number>) => {
            delete state.annotations[action.payload]
        },
        resetCanvasState: () => initialState
    }
})

export const { startDrawRect, updateDrawRect, updateHoveringAnnotation,
    updateHoveringVertex, goBackwardHistory, goForwardHistory, selectAnnotationFromHover,
    selectVertexFromHover, setSelectedTool, moveVertex, resetCanvasState, resetSelectedAnnotation,
    resetSelectedVertex, saveAnnotationsHistory, setCanvasSize, setSelectedClassID, loadAnnotations,
    resetHistory, setSelectedAnnotation, removeAnnotation, updateRect } = canvasSlice.actions

export default canvasSlice.reducer
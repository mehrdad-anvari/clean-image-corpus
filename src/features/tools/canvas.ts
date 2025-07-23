import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import Rectangle from "@/annotations/rectangle";
import Keypoint from "@/annotations/point";
import { AnnotationObject, OrientedRectangleObject, Point, PointObject, PolygonObject, RectangleObject, Vertex } from "@/interfaces";
import OrientedRectangle from "@/annotations/orientedRectangle";
import Polygon from "@/annotations/polygon";

interface AnnotationsSnapshot { [key: number]: { object: AnnotationObject } };

export interface CanvasState {
    selectedAnnotation: number,
    selectedVertex: number,
    hoveringAnnotation: number,
    hoveringVertex: number,
    annotations: { [key: number]: { object: AnnotationObject } },
    annotationsHistory: { [key: number]: { annotations: AnnotationsSnapshot, length: number } },
    historyIndex: number,
    selectedTool: string,
    width: number,
    height: number,
    selectedClassID: number,
    lastIndex: number,
    historyLastIndex: number,
    zoom: number,
    offsets: { x: number, y: number },
    isDrawing: boolean,
    isEditing: boolean,
    isHandleSelected: boolean,
    isHoveringHandle: boolean,
    previousMousePosition: { x: number, y: number } | null,
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
    offsets: { x: 0, y: 0 },
    isDrawing: false,
    isEditing: false,
    isHandleSelected: false,
    isHoveringHandle: false,
    previousMousePosition: null,
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
            const newRect: RectangleObject = {
                type: 'bbox',
                class_id: classID,
                x1: p.x,
                y1: p.y,
                x2: p.x,
                y2: p.y,
            }
            state.annotations[state.lastIndex] = { object: newRect }
            state.lastIndex += 1
        },
        startDrawObb: (state, action: PayloadAction<{ classID: number, mousePosition: Point }>) => {
            const classID = action.payload.classID
            const p = action.payload.mousePosition
            const newRect: OrientedRectangleObject = {
                type: 'obb',
                class_id: classID,
                xc: p.x,
                yc: p.y,
                w: 0,
                h: 0,
                alpha: 0,
            }
            state.annotations[state.lastIndex] = { object: newRect }
            state.lastIndex += 1
        },
        startDrawPoly: (state, action: PayloadAction<{ classID: number, mousePosition: Point }>) => {
            const classID = action.payload.classID
            const p = action.payload.mousePosition
            const newPoly: PolygonObject = {
                type: 'polygon',
                class_id: classID,
                shell: [{ x: p.x, y: p.y } as Vertex, { x: p.x, y: p.y } as Vertex]
            }
            state.annotations[state.lastIndex] = { object: newPoly }
            state.selectedAnnotation = state.lastIndex
            state.lastIndex += 1
        },
        drawPoint: (state, action: PayloadAction<{ classID: number, mousePosition: Point }>) => {
            const classID = action.payload.classID
            const p = action.payload.mousePosition
            const newPoint: PointObject = {
                type: 'keypoint',
                class_id: classID,
                x: p.x,
                y: p.y,
            }
            state.annotations[state.lastIndex] = { object: newPoint }
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
            if (bbox.type != 'bbox') return
            const p = action.payload
            state.annotations[state.lastIndex - 1].object = {
                type: 'bbox',
                class_id: bbox.class_id,
                x1: bbox.x1,
                y1: bbox.y1,
                x2: p.x,
                y2: p.y,
            }
        },
        updateDrawObb: (state, action: PayloadAction<Point>) => {
            const obb = state.annotations[state.lastIndex - 1].object
            if (obb.type != 'obb') return
            const p = action.payload
            const xs = p.x > obb.xc ? obb.xc - obb.w / 2 : obb.xc + obb.w / 2
            const ys = p.y > obb.yc ? obb.yc - obb.h / 2 : obb.yc + obb.h / 2
            const newXc = (p.x + xs) / 2
            const newYc = (p.y + ys) / 2
            const newW = Math.abs(xs - p.x)
            const newH = Math.abs(ys - p.y)
            state.annotations[state.lastIndex - 1].object = {
                type: 'obb',
                class_id: obb.class_id,
                xc: newXc,
                yc: newYc,
                w: newW,
                h: newH,
                alpha: 0
            }
        },
        updateDrawPoly: (state, action: PayloadAction<Point>) => {
            const poly = state.annotations[state.lastIndex - 1].object
            if (poly.type != 'polygon') return
            const p = action.payload
            state.annotations[state.lastIndex - 1].object = Polygon.addVertex(poly, p.x, p.y)
        },
        updateDrawPolyVertex: (state, action: PayloadAction<Point>) => {
            const poly = state.annotations[state.lastIndex - 1].object
            if (poly.type != 'polygon') return
            const p = action.payload
            state.annotations[state.lastIndex - 1].object = Polygon.moveVertex(poly, p.x, p.y)
        },
        updateAnnotation: (state, action: PayloadAction<{ updatedAnnotation: AnnotationObject, Index: number }>) => {
            state.annotations[action.payload.Index].object = action.payload.updatedAnnotation
        },
        updateHoveringAnnotation: (state, action: PayloadAction<Point>) => {
            state.hoveringAnnotation = -1;
            const p = action.payload
            for (const [index, annotation] of Object.entries(state.annotations)) {
                switch (annotation['object'].type) {
                    case 'polygon':
                        if (Polygon.containPoint(annotation['object'], p.x, p.y)) {
                            state.hoveringAnnotation = Number(index)
                        }
                        break
                    case 'obb':
                        if (OrientedRectangle.containPoint(annotation['object'], p.x, p.y)) {
                            state.hoveringAnnotation = Number(index)
                        }
                        break
                    case 'bbox':
                        if (Rectangle.containPoint(annotation['object'], p.x, p.y)) {
                            state.hoveringAnnotation = Number(index);
                        }
                        break;
                    case 'line':
                        break
                    case 'keypoint':
                        if (Keypoint.isNear(annotation['object'], p.x, p.y)) {
                            state.hoveringAnnotation = Number(index);
                        }
                        break
                }
                if (state.hoveringAnnotation != -1) break
            }
        },
        updateHoveringVertex: (state, action: PayloadAction<Point>) => {
            const p = action.payload;
            if (state.selectedAnnotation > -1) {
                const selectedAnnotationObj = state.annotations[state.selectedAnnotation]['object']
                let nearestVertex = null;
                switch (selectedAnnotationObj.type) {
                    case 'polygon':
                        nearestVertex = Polygon.findNearestVertex(selectedAnnotationObj, p.x, p.y)
                        break
                    case 'obb':
                        nearestVertex = OrientedRectangle.findNearestVertex(selectedAnnotationObj, p.x, p.y)
                        break
                    case 'bbox':
                        nearestVertex = Rectangle.findNearestVertex(selectedAnnotationObj, p.x, p.y);
                        break;
                    case 'line':
                        break
                    case 'keypoint':
                        break
                }
                if (nearestVertex != null) { state.hoveringVertex = nearestVertex }
                else { state.hoveringVertex = -1 }
            }
        },
        updateHoveringHandle: (state, action: PayloadAction<Point>) => {
            const p = action.payload;
            if (state.selectedAnnotation > -1) {
                const selectedAnnotationObj = state.annotations[state.selectedAnnotation]['object']
                switch (selectedAnnotationObj.type) {
                    case 'polygon':
                        break
                    case 'obb':
                        state.isHoveringHandle = OrientedRectangle.isHoveringHandle(selectedAnnotationObj, p.x, p.y)
                        break
                }
            }
        },
        setHandle: (state, action: PayloadAction<boolean>) => {
            state.isHandleSelected = action.payload
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
                const selectedAnnotationObj = state.annotations[state.selectedAnnotation]['object']
                switch (selectedAnnotationObj.type) {
                    case 'polygon':
                        const newPoly = Polygon.moveVertex(selectedAnnotationObj, p.x, p.y, state.selectedVertex)
                        state.annotations[state.selectedAnnotation]['object'] = newPoly
                        break
                    case 'obb':
                        const newObb = OrientedRectangle.moveVertex(selectedAnnotationObj, p.x, p.y, state.selectedVertex as 0 | 1 | 2 | 3)
                        state.annotations[state.selectedAnnotation]['object'] = newObb
                        break
                    case 'bbox':
                        const newRect = Rectangle.moveVertex(selectedAnnotationObj, p.x, p.y, state.selectedVertex)
                        if (newRect != undefined) {
                            state.annotations[state.selectedAnnotation]['object'] = newRect
                        }
                        break;
                    case 'line':
                        break
                    case 'keypoint':
                        break
                }

            }
        },
        moveSelectedPoint: (state, action: PayloadAction<Point>) => {
            const p = action.payload;
            const selectedAnnotationObj = state.annotations[state.selectedAnnotation]['object']
            if (selectedAnnotationObj.type == 'keypoint') {
                const newPoint = Keypoint.move(selectedAnnotationObj, p.x, p.y);
                state.annotations[state.selectedAnnotation]['object'] = newPoint
            }
        },
        setPreviousMousePosition: (state, action: PayloadAction<Point>) => {
            const p = action.payload;
            state.previousMousePosition = { x: p.x, y: p.y }
        },
        resetPreviousMousePosition: (state) => {
            state.previousMousePosition = null
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
        setIsDrawing: (state, action: PayloadAction<boolean>) => {
            state.isDrawing = action.payload
        },
        setIsEditing: (state, action: PayloadAction<boolean>) => {
            state.isEditing = action.payload
        },
        zoomIn: (state) => {
            state.zoom = state.zoom + 50
        },
        zoomOut: (state) => {
            state.zoom = Math.max(state.zoom - 50, 400)
        },
        setOffsets: (state, action: PayloadAction<Point>) => {
            state.offsets = action.payload
        },
        resetHoveringVertex: (state) => {
            state.hoveringVertex = -1
        },
        resetCanvasState: () => initialState
    }
})

export const { startDrawRect, updateDrawRect, updateHoveringAnnotation,
    updateHoveringVertex, goBackwardHistory, goForwardHistory, selectAnnotationFromHover,
    selectVertexFromHover, setSelectedTool, moveVertex, resetCanvasState, resetSelectedAnnotation,
    resetSelectedVertex, saveAnnotationsHistory, setCanvasSize, setSelectedClassID, loadAnnotations,
    resetHistory, setSelectedAnnotation, removeAnnotation, updateAnnotation, setIsDrawing, setIsEditing,
    drawPoint, moveSelectedPoint, setPreviousMousePosition, resetPreviousMousePosition,
    zoomIn, zoomOut, setOffsets, startDrawObb, updateDrawObb, updateHoveringHandle, setHandle,
    startDrawPoly, updateDrawPoly, updateDrawPolyVertex, resetHoveringVertex } = canvasSlice.actions

export default canvasSlice.reducer
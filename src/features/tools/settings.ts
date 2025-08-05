import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type classAttributes = { name: string, color: [number, number, number] }
export interface AnnotationSettingsState {
    pose: {
        [key: number]: {
            name: string, color: [number, number, number],
            keypoints: { [key: number]: classAttributes },
            skeleton: [number, number][]
        }
    },
    bbox: { [key: number]: classAttributes },
    keypoint: { [key: number]: classAttributes },
    polygon: { [key: number]: classAttributes },
    line: { [key: number]: classAttributes },
    obb: { [key: number]: classAttributes },
    rectMinEdgeSize: number,
}

const initialState: AnnotationSettingsState = {
    pose: {
        [0]: { name: 'default', color: [255, 255, 255], keypoints: {}, skeleton: [] }
    },
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
        addPoseClass: (state, action: PayloadAction<{
            id: number, pose: {
                name: string, color: [number, number, number],
                keypoints: { [key: number]: classAttributes },
                skeleton: [number, number][]
            }
        }>) => {
            state.pose[action.payload.id] = action.payload.pose
        },
        addKeypointToPose: (state, action: PayloadAction<{ poseId: number, keypointId: number, keypoint: classAttributes }>) => {
            state.pose[action.payload.poseId].keypoints[action.payload.keypointId] = action.payload.keypoint
        },
        addEdgeToPose: (state, action: PayloadAction<{ poseId: number, from: number, to: number }>) => {
            state.pose[action.payload.poseId].skeleton.push([action.payload.from, action.payload.to])
        },
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
        deletePoseClass: (state, action: PayloadAction<number>) => {
            delete state.pose[action.payload];
        },
        deletePoseKeypointClass: (state, action: PayloadAction<{ poseId: number, keypointId: number }>) => {
            delete state.pose[action.payload.poseId].keypoints[action.payload.keypointId]
        },
        deletePoseEdge: (state, action: PayloadAction<{ poseId: number, edgeIndex: number }>) => {
            if (state.pose[action.payload.poseId].skeleton[action.payload.edgeIndex])
                state.pose[action.payload.poseId].skeleton.splice(action.payload.edgeIndex, 1)
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
    addPointClass, deletePointClass, addLineClass, addKeypointToPose, addPoseClass,
    deleteLineClass, addObbClass, deleteObbClass, deletePoseClass, deletePoseKeypointClass,
    setSettings, addEdgeToPose, deletePoseEdge } = annotationSettingsSlice.actions

export default annotationSettingsSlice.reducer
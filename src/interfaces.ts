import React from "react";
import Rectangle from "./annotations/rectangle";

export interface CanvasContextState {
  selectedTool: string;
  hoveringAnnotationIndex: number | null;
  selectedAnnotationIndex: number | null;
  hoveringVertexIndex: number | null;
  selectedVertexIndex: number | null;
  startPoint: { x: number; y: number } | null;
  currentPoint: { x: number; y: number } | null;
  height: number;
  width: number;
}
export type Point = { x: number, y: number }

export interface Vertex {
  x: number;
  y: number;
}

export interface PointObject {
  type: 'keypoint',
  class_id: number,
  x: number,
  y: number
}

export interface LineObject {
  type: 'line',
  class_id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}

export interface RectangleObject {
  type: 'bbox',
  class_id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}

export interface OrientedRectangleObject {
  type: 'obb',
  class_id: number,
  xc: number,
  yc: number,
  w: number,
  h: number,
  alpha: number,
  imgW: number,
  imgH: number
}

export interface PolygonObject {
  type: 'polygon',
  class_id: number,
  shell: Vertex[],
}

export type posePoint = {
  class_id: number,
  x: number,
  y: number,
  v: boolean
}

export interface PoseObject {
  type: 'pose'
  class_id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  keypoints: posePoint[]
}

export type AnnotationObject = PointObject | LineObject | RectangleObject | OrientedRectangleObject | PolygonObject | PoseObject;

export type SetCanvasContext = React.Dispatch<React.SetStateAction<CanvasContextState>>

export interface SettingsState {
  showGrid: boolean;
  gridSize: number;
  showLabels: boolean;
  showVertices: boolean;
  showAnnotations: boolean;
  showImage: boolean;
  classIdColorMap: Map<string, [number, number, number]>;
  minimumRectSize: number;
  zoom: number;

}

export type SetSettingsState = React.Dispatch<React.SetStateAction<SettingsState>>

export interface StateHistory {
  annotationHistory: Annotations[];
  currentIndex: number;
}

export type SetStateHistory = React.Dispatch<React.SetStateAction<StateHistory>>

export interface CommandType {
  type: string;
  payload: string | number | null | object | { x: number, y: number };
}

export type Annotations = Array<Rectangle | null>
export type SetAnnotations = React.Dispatch<React.SetStateAction<Annotations>>

export interface ImageRecord {
  name: string;
  width: number;
  height: number;
  format: string;
  createdAt: number,
  modifiedAt: number;
  perceptualHash: string;
  similarityOrder: number
}

export type indexedImage = [number, string, ImageRecord] | [null, null, null]

declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
}

export { }; 
import Keypoint from "@/annotations/point";
import Rectangle from "@/annotations/rectangle";
import { CanvasState } from "@/features/tools/canvas";
import { AnnotationSettingsState } from "@/features/tools/settings";

export function renderCanvas(canvas: HTMLCanvasElement, imageSrc: string, canvasState: CanvasState, settings: AnnotationSettingsState) {
  const image = new Image();
  image.src = imageSrc;
  canvas.width = canvasState.width;
  canvas.height = canvasState.height;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  let highlighted_vertex = null;

  const annotations = canvasState.annotations
  const entries = Object.entries(annotations);
  // const lastIndex = canvasState.lastIndex
  for (const [index, annotation] of entries) {
    const i = Number(index)
    const annotationObj = annotation.object
    let color = null
    if (annotationObj) {
      if (i === canvasState.selectedAnnotation) {
        highlighted_vertex = canvasState.hoveringVertex
      } else {
        highlighted_vertex = null
      }
      switch (annotationObj.type) {
        case 'bbox':
          color = settings.rectClasses[annotation.object.class_id].color
          if (canvasState.selectedTool == 'DRAW_RECT' || canvasState.selectedTool == 'SELECT') {
            Rectangle.draw(annotationObj, canvas, i === canvasState.selectedAnnotation, null, settings.rectClasses[annotation.object.class_id].color);
          } else {
            Rectangle.draw(annotationObj, canvas, (i === canvasState.hoveringAnnotation) || (i === canvasState.selectedAnnotation), highlighted_vertex, color);
          }
          break;
        case 'keypoint':
          color = settings.pointClasses[annotation.object.class_id].color
          if (canvasState.selectedTool == 'DRAW_POINT' || canvasState.selectedTool == 'SELECT') {
            Keypoint.draw(annotationObj, canvas, i === canvasState.selectedAnnotation, color);
          } else {
            Keypoint.draw(annotationObj, canvas, (i === canvasState.hoveringAnnotation) || (i === canvasState.selectedAnnotation), color);
          }
          break;
      }

    }
  }
};
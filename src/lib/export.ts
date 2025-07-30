import OrientedRectangle from "@/annotations/orientedRectangle";
import { AnnotationObject, Vertex } from "@/interfaces";

function replaceExtensionWithTXT(fileName: string) {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return `${fileName}.txt`;
    }
    return `${fileName.substring(0, lastDotIndex)}.txt`;
}

export async function saveAnnotationsYOLO(rootDirHandle: FileSystemDirectoryHandle) {
    const EXPORT_DIR_NAME = "yolo";
    const exportBaseHandle = await rootDirHandle.getDirectoryHandle(EXPORT_DIR_NAME, { create: true })
    const annotationDirHandle = await rootDirHandle.getDirectoryHandle('annotations')
    if (!annotationDirHandle || !exportBaseHandle) return

    for await (const [name] of annotationDirHandle.entries()) {
        const fileHandle = await annotationDirHandle.getFileHandle(name);
        const file = await fileHandle.getFile();
        const textContent = await file.text();
        const content = JSON.parse(textContent)
        const annotations: Array<AnnotationObject> = content.annotations

        // Create maps for each annotation type
        const outputMap: Record<string, string[]> = {
            bbox: [],
            obb: [],
            polygon: [],
            keypoint: [],
            line: []
        };
        annotations.forEach((value) => {
            const class_id = value.class_id

            if (value.type == 'bbox') {
                const x_center = (value.x1 + value.x2) * 0.5;
                const y_center = (value.y1 + value.y2) * 0.5;
                const width = Math.abs(value.x2 - value.x1);
                const height = Math.abs(value.y2 - value.y1);
                outputMap.bbox.push(`${value.class_id} ${x_center} ${y_center} ${width} ${height}`);
            }
            if (value.type === "obb") {
                const vertices: Vertex[] = OrientedRectangle.getVertices(value)
                const flat = vertices.map(v => [v.x, v.y]).flat();
                console.log('obb',flat)
                outputMap.obb.push(`${class_id} ${flat.join(" ")}`);
            }
            if (value.type === "polygon") {
                const flat = value.shell.map(v => [v.x, v.y]).flat();
                console.log('polygon',flat)
                outputMap.polygon.push(`${class_id} ${flat.join(" ")}`);
            }

        })

        for (const annType of Object.keys(outputMap)) {
            if (outputMap[annType].length === 0) continue;
            const typeDir = await exportBaseHandle.getDirectoryHandle(annType, { create: true });
            const typeFile = await typeDir.getFileHandle(replaceExtensionWithTXT(name), { create: true });
            const writable = await typeFile.createWritable();
            await writable.write(outputMap[annType].join("\n") + "\n");
            await writable.close();
        }
    }
}
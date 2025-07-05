import { AnnotationObject } from "@/interfaces";

function replaceLastExtensionWithTXT(fileName: string) {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return `${fileName}.txt`;
    }
    return `${fileName.substring(0, lastDotIndex)}.txt`;
}

export async function saveAnnotationsYOLO(rootDirHandle: FileSystemDirectoryHandle) {
    const EXPORT_DIR_NAME = "yolo";
    const exportDirHandle = await rootDirHandle.getDirectoryHandle(EXPORT_DIR_NAME, { create: true })
    const annotationDirHandle = await rootDirHandle.getDirectoryHandle('annotations')
    if (annotationDirHandle && exportDirHandle) {
        for await (const [name] of annotationDirHandle.entries()) {
            const fileHandle = await annotationDirHandle.getFileHandle(name);
            const file = await fileHandle.getFile();
            const textContent = await file.text();
            const content = JSON.parse(textContent)
            const annotations: Array<AnnotationObject> = content.annotations
            const newFileHandle = await exportDirHandle.getFileHandle(replaceLastExtensionWithTXT(name), { create: true })
            const writable = await newFileHandle.createWritable();

            const textArray: string[] = [];
            annotations.forEach((value) => {
                if (value.type == 'bbox') {
                    const x_center = (value.x1 + value.x2) * 0.5;
                    const y_center = (value.y1 + value.y2) * 0.5;
                    const width = Math.abs(value.x2 - value.x1);
                    const height = Math.abs(value.y2 - value.y1);
                    textArray.push(`${value.class_id} ${x_center} ${y_center} ${width} ${height}`);
                }
            })

            await writable.write(textArray.join('\n') + '\n');
            await writable.close();
        }
    }
}
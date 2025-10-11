import OrientedRectangle from "@/annotations/orientedRectangle";
import { AnnotationObject, Vertex, ImageRecord } from "@/interfaces";
import { getAllRecords } from "@/lib/database";

type SettingsLike = any;

function buildCategoryMaps(settings: SettingsLike | null) {
    // Returns: categories array for COCO, and maps for (type, localId) -> globalId and -> yoloIndex
    const categories: any[] = [];
    const globalMap: Record<string, Map<number, number>> = {};
    const yoloIndexMap: Record<string, Map<number, number>> = {};
    const namesList: string[] = [];

    if (!settings) return { categories, globalMap, yoloIndexMap, namesList };

    let nextGlobalId = 1;
    let nextYoloIndex = 0;

    const typesOrder = ['bbox', 'keypoint', 'polygon', 'line', 'obb', 'pose'];
    for (const t of typesOrder) {
        const mapObj = settings[t];
        if (!mapObj) continue;
        const keys = Object.keys(mapObj).map(k => Number(k)).sort((a, b) => a - b);
        globalMap[t] = new Map<number, number>();
        yoloIndexMap[t] = new Map<number, number>();
        for (const k of keys) {
            const name = mapObj[k]?.name ?? String(k);
            categories.push({ id: nextGlobalId, name, supercategory: t });
            globalMap[t].set(k, nextGlobalId);
            nextGlobalId += 1;

            namesList.push(name);
            yoloIndexMap[t].set(k, nextYoloIndex);
            nextYoloIndex += 1;
        }
    }

    return { categories, globalMap, yoloIndexMap, namesList };
}

function replaceExtensionWithTXT(fileName: string) {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return `${fileName}.txt`;
    }
    return `${fileName.substring(0, lastDotIndex)}.txt`;
}

export async function saveAnnotationsYOLO(
    rootDirHandle: FileSystemDirectoryHandle,
    settings: any | null,
    progressCallback?: (completed: number, total: number, currentFile?: string) => void
) {
    const EXPORT_DIR_NAME = "yolo";
    const exportBaseHandle = await rootDirHandle.getDirectoryHandle(EXPORT_DIR_NAME, { create: true })
    const annotationDirHandle = await rootDirHandle.getDirectoryHandle('annotations')
    if (!annotationDirHandle || !exportBaseHandle) return

    const names: string[] = [];
    for await (const [name] of annotationDirHandle.entries()) {
        names.push(name);
    }

    const total = names.length;
    let completed = 0;

    const { categories: yCategories, globalMap, yoloIndexMap, namesList } = buildCategoryMaps(settings);

    for (const name of names) {
        try {
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
                    const yid = yoloIndexMap?.bbox?.get(value.class_id) ?? value.class_id;
                    outputMap.bbox.push(`${yid} ${x_center} ${y_center} ${width} ${height}`);
                }
                if (value.type === "obb") {
                    const vertices: Vertex[] = OrientedRectangle.getVertices(value)
                    const flat = vertices.map(v => [v.x, v.y]).flat();
                    const yid = yoloIndexMap?.obb?.get(value.class_id) ?? value.class_id;
                    outputMap.obb.push(`${yid} ${flat.join(" ")}`);
                }
                if (value.type === "polygon") {
                    const flat = value.shell.map(v => [v.x, v.y]).flat();
                    const yid = yoloIndexMap?.polygon?.get(value.class_id) ?? value.class_id;
                    outputMap.polygon.push(`${yid} ${flat.join(" ")}`);
                }
                if (value.type === 'keypoint') {
                    // single keypoint: class_id x y
                    const yid = yoloIndexMap?.keypoint?.get(value.class_id) ?? value.class_id;
                    outputMap.keypoint.push(`${yid} ${value.x} ${value.y}`);
                }
                if (value.type === 'pose') {
                    // pose: class_id x1 y1 x2 y2 kp_class kp_x kp_y kp_v ...
                    const pose = value as any;
                    const pid = yoloIndexMap?.pose?.get(pose.class_id) ?? pose.class_id;
                    const flatKps = (pose.keypoints || []).map((kp: any) => {
                        const kcls = yoloIndexMap?.keypoint?.get(kp.class_id) ?? kp.class_id;
                        return `${kcls} ${kp.x} ${kp.y} ${kp.v ? 1 : 0}`;
                    }).join(' ');
                    outputMap['pose'] = outputMap['pose'] || [];
                    outputMap['pose'].push(`${pid} ${pose.x1} ${pose.y1} ${pose.x2} ${pose.y2} ${flatKps}`);
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
        } catch (err) {
            console.error('Error exporting', name, err);
        }

        completed += 1;
        if (progressCallback) progressCallback(completed, total, name);
    }

    // write data.yaml containing class names from settings (if available)
    try {
        const yoloDir = await rootDirHandle.getDirectoryHandle('yolo', { create: true });
        const yamlFile = await yoloDir.getFileHandle('data.yaml', { create: true });
        const writableYaml = await yamlFile.createWritable();
        const yamlObj = { nc: namesList.length, names: namesList };
        await writableYaml.write(JSON.stringify(yamlObj, null, 2));
        await writableYaml.close();
    } catch (err) {
        console.error('Error writing yolo/data.yaml', err);
    }
}

export async function saveAnnotationsCOCO(
    rootDirHandle: FileSystemDirectoryHandle,
    db: IDBDatabase | null,
    settings: any | null,
    progressCallback?: (completed: number, total: number, currentFile?: string) => void
) {
    const EXPORT_DIR_NAME = "coco";
    const exportBaseHandle = await rootDirHandle.getDirectoryHandle(EXPORT_DIR_NAME, { create: true })
    const annotationDirHandle = await rootDirHandle.getDirectoryHandle('annotations')
    if (!exportBaseHandle || !annotationDirHandle) return

    // Load image records from indexedDB if available
    let imageRecords: ImageRecord[] = [];
    if (db) {
        try {
            const recs = await getAllRecords<ImageRecord>(db, 'images');
            imageRecords = recs || [];
        } catch (err) {
            console.error('Failed to read image records from DB', err);
        }
    }

    // If we couldn't get records from DB, fall back to reading annotation files to discover images
    if (imageRecords.length === 0) {
        // Try to collect images from annotation filenames (strip .json)
        for await (const [name] of annotationDirHandle.entries()) {
            // annotation file names are like image.json -> recover image name by replacing .json with original extension unknown
            // We'll just add the annotation filename as id and leave dimensions unknown
            imageRecords.push({ name: name, width: 0, height: 0, format: '', createdAt: 0, modifiedAt: 0, perceptualHash: '' } as ImageRecord)
        }
    }

    const total = imageRecords.length;
    let completed = 0;

    const images: any[] = [];
    const annotations: any[] = [];
    let annId = 1;
    const imageIdMap = new Map<string, number>();
    let nextImageId = 1;

    function replaceExtensionWithJson(fileName: string) {
        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex === -1) return `${fileName}.json`;
        return `${fileName.substring(0, lastDotIndex)}.json`;
    }

    const { categories: cocoCategories, globalMap, yoloIndexMap: _unused, namesList: _n } = buildCategoryMaps(settings);

    for (const rec of imageRecords) {
        const imageName = rec.name;
        const imgId = nextImageId++;
        imageIdMap.set(imageName, imgId);
        images.push({
            id: imgId,
            file_name: imageName,
            width: rec.width ?? 0,
            height: rec.height ?? 0,
            format: rec.format ?? '',
            createdAt: rec.createdAt ?? 0,
            modifiedAt: rec.modifiedAt ?? 0,
            perceptualHash: rec.perceptualHash ?? '',
            similarityOrder: (rec as any).similarityOrder ?? -1,
        });

        // Prepare scaling helpers (normalized -> pixels)
        const imgW = rec.width ?? 0;
        const imgH = rec.height ?? 0;
        const toPixelX = (nx: number) => (isFinite(nx) && imgW > 0 ? nx * imgW : 0);
        const toPixelY = (ny: number) => (isFinite(ny) && imgH > 0 ? ny * imgH : 0);

        // Try to read corresponding annotation file (image -> image.json)
        const annFileName = replaceExtensionWithJson(imageName);
        try {
            const fileHandle = await annotationDirHandle.getFileHandle(annFileName);
            const file = await fileHandle.getFile();
            const textContent = await file.text();
            const content = JSON.parse(textContent)
            const items: Array<AnnotationObject> = content.annotations || [];

            for (const it of items) {
                if (it.type === 'bbox') {
                    const nx = Math.min(it.x1, it.x2);
                    const ny = Math.min(it.y1, it.y2);
                    const nw = Math.abs(it.x2 - it.x1);
                    const nh = Math.abs(it.y2 - it.y1);
                    const bx = toPixelX(nx);
                    const by = toPixelY(ny);
                    const bw = nw * imgW;
                    const bh = nh * imgH;
                    const gid = globalMap?.bbox?.get(it.class_id) ?? it.class_id;
                    annotations.push({ id: annId++, image_id: imageIdMap.get(imageName), category_id: gid, bbox: [bx, by, bw, bh], area: bw * bh, iscrowd: 0 });
                }
                if (it.type === 'polygon') {
                    const flat = it.shell.map((v: Vertex) => [toPixelX(v.x), toPixelY(v.y)]).flat();
                    const gid = globalMap?.polygon?.get(it.class_id) ?? it.class_id;
                    annotations.push({ id: annId++, image_id: imageIdMap.get(imageName), category_id: gid, segmentation: [flat], area: 0, iscrowd: 0 });
                }
                if (it.type === 'obb') {
                    const vertices: Vertex[] = OrientedRectangle.getVertices(it)
                    const flat = vertices.map(v => [toPixelX(v.x), toPixelY(v.y)]).flat();
                    const gid = globalMap?.obb?.get(it.class_id) ?? it.class_id;
                    annotations.push({ id: annId++, image_id: imageIdMap.get(imageName), category_id: gid, segmentation: [flat], area: 0, iscrowd: 0 });
                }
                if (it.type === 'keypoint') {
                    // single keypoint annotation (assume visible)
                    const kx = (it as any).x;
                    const ky = (it as any).y;
                    const kxpx = toPixelX(kx);
                    const kypx = toPixelY(ky);
                    const gid = globalMap?.keypoint?.get(it.class_id) ?? it.class_id;
                    annotations.push({ id: annId++, image_id: imageIdMap.get(imageName), category_id: gid, keypoints: [kxpx, kypx, 2], num_keypoints: 1, area: 0, iscrowd: 0, bbox: [kxpx, kypx, 0, 0] });
                }
                if (it.type === 'pose') {
                    const pose = it as any;
                    const flat = (pose.keypoints || []).map((kp: any) => [toPixelX(kp.x), toPixelY(kp.y), kp.v ? 2 : 0]).flat();
                    const numK = (pose.keypoints || []).reduce((s: number, kp: any) => s + (kp.v ? 1 : 0), 0);
                    const bx = toPixelX(pose.x1);
                    const by = toPixelY(pose.y1);
                    const bw = Math.abs(pose.x2 - pose.x1) * imgW;
                    const bh = Math.abs(pose.y2 - pose.y1) * imgH;
                    const bbox = [bx, by, bw, bh];
                    const gid = globalMap?.pose?.get(pose.class_id) ?? pose.class_id;
                    annotations.push({ id: annId++, image_id: imageIdMap.get(imageName), category_id: gid, keypoints: flat, num_keypoints: numK, bbox, area: bbox[2] * bbox[3], iscrowd: 0 });
                }
            }

        } catch (err) {
            // No annotation file for this image — that's fine, continue
        }

        // Optionally write a per-image JSON with current progress (or skip); we'll write a consolidated file at the end
        completed += 1;
        if (progressCallback) progressCallback(completed, total, imageName);
    }

    // Write consolidated COCO-like file
    try {
        const outFile = await exportBaseHandle.getFileHandle('annotations.json', { create: true });
        const writable = await outFile.createWritable();
        const coco = { images, annotations, cocoCategories };
        await writable.write(JSON.stringify(coco, null, 2));
        await writable.close();
    } catch (err) {
        console.error('Error writing consolidated COCO file', err);
    }

}
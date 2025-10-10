import { PoseObject, Vertex } from "@/interfaces";

type VertexIndex = 0 | 1 | 2 | 3;

class Pose {

    static move(pose: PoseObject, dx: number, dy: number): PoseObject {
        // For each rectangle vertex and each keypoint compute allowable dx/dy ranges
        // vertex: dx in [-vx, 1 - vx], dy in [-vy, 1 - vy]
        const verts = this.getVertices(pose);
        const dxLowers = verts.map(v => -v.x);
        const dxUppers = verts.map(v => 1 - v.x);
        const dyLowers = verts.map(v => -v.y);
        const dyUppers = verts.map(v => 1 - v.y);

        // include keypoints in the intersection
        pose.keypoints.forEach(kp => {
            dxLowers.push(-kp.x);
            dxUppers.push(1 - kp.x);
            dyLowers.push(-kp.y);
            dyUppers.push(1 - kp.y);
        });

        const minDx = dxLowers.length ? Math.max(...dxLowers) : -Infinity;
        const maxDx = dxUppers.length ? Math.min(...dxUppers) : Infinity;
        const minDy = dyLowers.length ? Math.max(...dyLowers) : -Infinity;
        const maxDy = dyUppers.length ? Math.min(...dyUppers) : Infinity;

        const clampInRange = (v: number, lo: number, hi: number) => {
            if (lo > hi) return 0; // no allowable movement on this axis
            return Math.min(hi, Math.max(lo, v));
        }

        const dx2 = clampInRange(dx, minDx, maxDx);
        const dy2 = clampInRange(dy, minDy, maxDy);

        const newKeypoints = pose.keypoints.map((value) => ({ ...value, x: value.x + dx2, y: value.y + dy2 }));
        return { ...pose, x1: pose.x1 + dx2, x2: pose.x2 + dx2, y1: pose.y1 + dy2, y2: pose.y2 + dy2, keypoints: newKeypoints };
    }

    static moveVertex(pose: PoseObject, x: number, y: number, vertex: number | null): PoseObject {
        if (vertex == null) { return pose; }
        // Ensure new vertex is in bounds
        const clamp = (v: number) => Math.min(1, Math.max(0, v));
        const cx = clamp(x);
        const cy = clamp(y);
        const newRect = { ...pose };
        switch (vertex) {
            case 0:
                newRect.x1 = cx;
                newRect.y1 = cy;
                break;
            case 1:
                newRect.x2 = cx;
                newRect.y1 = cy;
                break;
            case 2:
                newRect.x2 = cx;
                newRect.y2 = cy;
                break;
            case 3:
                newRect.x1 = cx;
                newRect.y2 = cy;
                break;
        }
        // Check all rectangle vertices are in bounds
        const verts = Pose.getVertices(newRect);
        if (!verts.every(v => v.x >= 0 && v.x <= 1 && v.y >= 0 && v.y <= 1)) return pose;
        return newRect;
    }

    static draw(pose: PoseObject, canvas: HTMLCanvasElement, highlight: boolean = false, vertexIndex: number | null = null, keypointIndex: number | null = null, skeleton: [number, number][], color: number[] = [255, 0, 0]) {
        const width = canvas.width;
        const height = canvas.height;
        const ctx = canvas.getContext("2d");
        if (ctx == null) { return }
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
        ctx.lineWidth = 1;

        // Draw Bounding Box Vertices
        ctx.beginPath()
        const vertices: Vertex[] = this.getVertices(pose).map((vertex) => { return { x: vertex.x * width, y: vertex.y * height } })
        vertices.forEach((vertex) => ctx.rect(vertex.x - 2, vertex.y - 2, 4, 4))
        ctx.fill()
        if (vertexIndex != null && vertices[vertexIndex]) {
            ctx.rect(vertices[vertexIndex].x - 5, vertices[vertexIndex].y - 5, 10, 10);
            ctx.stroke()
        }
        ctx.closePath()

        // Draw Bounding Box Edges
        const x1 = pose.x1 * width;
        const x2 = pose.x2 * width;
        const y1 = pose.y1 * height;
        const y2 = pose.y2 * height;
        const w2 = x2 - x1;
        const h2 = y2 - y1;
        ctx.beginPath()
        ctx.rect(x1, y1, w2, h2);
        if (highlight) {
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`;
            ctx.fill();
        }
        ctx.stroke();
        ctx.closePath()

        // Draw Keypoints
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1.0)`;
        pose.keypoints.forEach((keypoint) => {
            const x = keypoint.x * width; const y = keypoint.y * height;
            ctx.rect(x - 2, y - 2, 4, 4);
        })
        ctx.stroke()
        ctx.fill()
        if (keypointIndex != null) {
            const highlightedVertex = pose.keypoints[keypointIndex]
            if (highlightedVertex) {
                ctx.rect(highlightedVertex.x * width - 5, highlightedVertex.y * height - 5, 10, 10);
            }
            ctx.stroke()
        }
        ctx.closePath()

        // Draw Skeleton
        skeleton.forEach((edge) => {
            if (pose.keypoints[edge[0]] && pose.keypoints[edge[1]]) {
                ctx.beginPath();
                const x1 = pose.keypoints[edge[0]].x * width; const y1 = pose.keypoints[edge[0]].y * height;
                const x2 = pose.keypoints[edge[1]].x * width; const y2 = pose.keypoints[edge[1]].y * height;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke()
                ctx.closePath()
            }
        })
    }

    static getVertex(pose: PoseObject, index: VertexIndex): Vertex {
        switch (index) {
            case 0:
                return { x: pose.x1, y: pose.y1 }
            case 1:
                return { x: pose.x2, y: pose.y1 }
            case 2:
                return { x: pose.x2, y: pose.y2 }
            case 3:
                return { x: pose.x1, y: pose.y2 }
        }
    }

    static getVertices(pose: PoseObject): Vertex[] {
        return [0, 1, 2, 3].map((idx) => this.getVertex(pose, idx as VertexIndex));
    }

    static addKeypoint(pose: PoseObject, x: number, y: number, v: boolean = false, classId: number = 0): PoseObject {
        const newKeypoints = pose.keypoints
        newKeypoints.push({ class_id: classId, x: x, y: y, v: v })
        return { ...pose, keypoints: newKeypoints }
    }

    static moveKeypoint(pose: PoseObject, xt: number, yt: number, keypointIndex: number): PoseObject {
        // Ensure new keypoint is in bounds
        const clamp = (v: number) => Math.min(1, Math.max(0, v));
        const cx = clamp(xt);
        const cy = clamp(yt);
        const newKeypoints = [...pose.keypoints];
        if (newKeypoints[keypointIndex]) {
            const { class_id, v } = newKeypoints[keypointIndex];
            newKeypoints[keypointIndex] = { class_id: class_id, x: cx, y: cy, v: v };
            return { ...pose, keypoints: newKeypoints };
        }
        return pose;
    }

    static findNearestVertex(pose: PoseObject, x: number, y: number, threshold = 0.02): number | null {
        let nearestVertexIndex: number | null = null;
        let minDist = Infinity;
        const vertices = this.getVertices(pose)
        vertices.forEach((vertex, index) => {
            const dist = Math.hypot(vertex.x - x, vertex.y - y);
            if (dist < threshold && dist < minDist) {
                minDist = dist;
                nearestVertexIndex = index;
            }
        });
        return nearestVertexIndex
    }

    static isNearVertex(pose: PoseObject, x: number, y: number, index: number, threshold = 0.02): boolean {
        const vertices = this.getVertices(pose)
        if (!vertices[index]) return false

        const dist = Math.hypot(vertices[index].x - x, vertices[index].y - y);
        if (dist < threshold) {
            return true
        }
        return false
    }

    static findNearestKeypoint(pose: PoseObject, x: number, y: number, threshold = 0.02): number | null {
        let nearestKeypointIndex: number | null = null;
        let minDist = Infinity;
        const keypoints = pose.keypoints
        keypoints.forEach((vertex, index) => {
            const dist = Math.hypot(vertex.x - x, vertex.y - y);
            if (dist < threshold && dist < minDist) {
                minDist = dist;
                nearestKeypointIndex = index;
            }
        });
        return nearestKeypointIndex
    }

    static isNearKeypoint(pose: PoseObject, x: number, y: number, index: number, threshold = 0.02): boolean {
        if (!pose.keypoints[index]) return false

        const dist = Math.hypot(pose.keypoints[index].x - x, pose.keypoints[index].y - y);
        if (dist < threshold) {
            return true
        }
        return false
    }

    static containPoint(pose: PoseObject, x: number, y: number): boolean {
        const x_min = Math.min(pose.x1, pose.x2)
        const x_max = Math.max(pose.x1, pose.x2)
        const y_min = Math.min(pose.y1, pose.y2)
        const y_max = Math.max(pose.y1, pose.y2)
        if ((x_min < x && x < x_max) && (y_min < y && y < y_max)) {
            return true
        } else {
            return false
        }
    }


    static longestDimSize(pose: PoseObject): number {
        const heigt = Math.abs(pose.y2 - pose.y1)
        const width = Math.abs(pose.x2 - pose.x1)
        return Math.max(heigt, width)
    }
}


export default Pose;
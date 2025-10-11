import { Vertex, RectangleObject } from "@/interfaces";


class Rectangle {

    static move(rect: RectangleObject, dx: number, dy: number): RectangleObject {
        const newRect = { ...rect };

        // Determine allowable dx range so both x1+dx and x2+dx stay in [0,1]
        const minDx = Math.max(-rect.x1, -rect.x2); // lower bound
        const maxDx = Math.min(1 - rect.x1, 1 - rect.x2); // upper bound
        // Choose dx' as the closest value to requested dx inside [minDx, maxDx]
        const dx2 = Math.min(maxDx, Math.max(minDx, dx));

        // Same for dy
        const minDy = Math.max(-rect.y1, -rect.y2);
        const maxDy = Math.min(1 - rect.y1, 1 - rect.y2);
        const dy2 = Math.min(maxDy, Math.max(minDy, dy));

        newRect.x1 = rect.x1 + dx2;
        newRect.x2 = rect.x2 + dx2;
        newRect.y1 = rect.y1 + dy2;
        newRect.y2 = rect.y2 + dy2;
        return newRect;
    }

    static moveVertex(rect: RectangleObject, x: number, y: number, vertex: number | null): RectangleObject | undefined {
        if (vertex == null) { return }
        const clamp = (v: number) => Math.min(1, Math.max(0, v));
        const cx = clamp(x);
        const cy = clamp(y);
        const newRect = { ...rect };
        switch (vertex) {
            case 1:
                newRect.x1 = cx;
                newRect.y1 = cy;
                break;
            case 2:
                newRect.x2 = cx;
                newRect.y1 = cy;
                break;
            case 3:
                newRect.x2 = cx;
                newRect.y2 = cy;
                break;
            case 4:
                newRect.x1 = cx;
                newRect.y2 = cy;
                break;
        }
        return newRect;
    }

    static findNearestVertex(rect: RectangleObject, x: number, y: number, threshold = 0.02): number | null {
        const verticies: Map<number, Vertex> = new Map([
            [1, { x: rect.x1, y: rect.y1 }],
            [2, { x: rect.x2, y: rect.y1 }],
            [3, { x: rect.x2, y: rect.y2 }],
            [4, { x: rect.x1, y: rect.y2 }]
        ]);

        let nearestVertexIndex: number | null = null;
        let minDist = Infinity;

        verticies.forEach((vertex, index) => {
            const dist = Math.hypot(vertex.x - x, vertex.y - y);
            if (dist < threshold && dist < minDist) {
                minDist = dist;
                nearestVertexIndex = index;
            }
        });

        return nearestVertexIndex;
    }

    static draw(rect: RectangleObject, canvas: HTMLCanvasElement, highlight: boolean = false, vertex_index: number | null = null, color: number[] = [255, 0, 0]) {
        const width = canvas.width;
        const height = canvas.height;
        const ctx = canvas.getContext("2d");
        if (ctx == null) { return }
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
        const x1 = rect.x1 * width;
        const x2 = rect.x2 * width;
        const y1 = rect.y1 * height;
        const y2 = rect.y2 * height;
        const w2 = x2 - x1;
        const h2 = y2 - y1;

        // Draw Vertices
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.9)`;
        ctx.rect(x1 - 2, y1 - 2, 4, 4);
        ctx.rect(x1 - 2, y2 - 2, 4, 4);
        ctx.rect(x2 - 2, y1 - 2, 4, 4);
        ctx.rect(x2 - 2, y2 - 2, 4, 4);
        ctx.fill();
        if (vertex_index) {
            const vertex_position = this.giveVertex(rect, vertex_index);
            if (vertex_position) {
                ctx.rect(vertex_position.x * width - 5, vertex_position.y * height - 5, 10, 10);

            }
            ctx.stroke()
        }
        ctx.closePath()

        // Draw Bounding Box
        ctx.beginPath()
        ctx.rect(x1, y1, w2, h2);
        if (highlight) {
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`;
            ctx.fill();
        }
        ctx.stroke();
        ctx.closePath()
    }

    static containPoint(rect: RectangleObject, x: number, y: number) {
        const x_min = Math.min(rect.x1, rect.x2)
        const x_max = Math.max(rect.x1, rect.x2)
        const y_min = Math.min(rect.y1, rect.y2)
        const y_max = Math.max(rect.y1, rect.y2)
        if ((x_min < x && x < x_max) && (y_min < y && y < y_max)) {
            return true
        } else {
            return false
        }
    }

    static giveVertex(rect: RectangleObject, index: number | null) {
        switch (index) {
            case 1:
                return { x: rect.x1, y: rect.y1 };
            case 2:
                return { x: rect.x2, y: rect.y1 };
            case 3:
                return { x: rect.x2, y: rect.y2 };
            case 4:
                return { x: rect.x1, y: rect.y2 };
            default:
                return null
        }
    }

    static longestDimSize(rect: RectangleObject) {
        const heigt = Math.abs(rect.y2 - rect.y1)
        const width = Math.abs(rect.x2 - rect.x1)
        return Math.max(heigt, width)
    }
}

export default Rectangle
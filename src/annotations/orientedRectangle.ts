import { Vertex, OrientedRectangleObject } from "@/interfaces";

function checkValidMove(x: number, y: number, dx: number, dy: number) {
    return x + dx >= 0 && x + dx <= 1 && y + dy >= 0 && y + dy <= 1;
}

type VertexIndex = 0 | 1 | 2 | 3;

class OrientedRectangle {

    static move(obb: OrientedRectangleObject, dx: number, dy: number): OrientedRectangleObject {
        let validMove = true;
        const vertices = this.getVertices(obb)
        vertices.forEach(
            (vertex) => {
                if (!checkValidMove(vertex.x, vertex.y, dx, dy))
                    validMove = false
            }
        )

        if (validMove) {
            const newObb = { ...obb };
            newObb.xc = newObb.xc + dx;
            newObb.yc = newObb.yc + dy;
            return newObb
        }
        return obb
    }

    static moveVertex(obb: OrientedRectangleObject, x: number, y: number, vertexIndex: VertexIndex): OrientedRectangleObject {
        // Clamp input coordinates to [0,1]
        const targetX = Math.min(1, Math.max(0, x));
        const targetY = Math.min(1, Math.max(0, y));

        const vertices = this.getVertices(obb);
        const vertex = vertices[vertexIndex];

        const dx = targetX - vertex.x;
        const dy = targetY - vertex.y;

        const applyMovement = (fx: number, fy: number) => {
            const { du, dv } = this.decomposeVector(fx, fy, obb.alpha, obb.imgW, obb.imgH);
            const direction = this.vertexDirection(vertexIndex); // returns { su: ±1, sv: ±1 }
            const w = Math.abs(obb.w + du * direction.su);
            const h = Math.abs(obb.h + dv * direction.sv);
            const xc = obb.xc + fx/2;
            const yc = obb.yc + fy/2;
            return { ...obb, xc, yc, w, h } as OrientedRectangleObject;
        };

        // Try full movement first
        const fullObb = applyMovement(dx, dy);
        const fullVerts = this.getVertices(fullObb);
        const fullOk = fullVerts.every(v => v.x >= 0 && v.x <= 1 && v.y >= 0 && v.y <= 1);
        if (fullOk) return fullObb;

        // Binary search for largest fraction in [0,1] that keeps OBB in bounds
        let low = 0, high = 1;
        const ITER = 15;
        for (let i = 0; i < ITER; i++) {
            const mid = (low + high) / 2;
            const testObb = applyMovement(dx * mid, dy * mid);
            const verts = this.getVertices(testObb);
            const ok = verts.every(v => v.x >= 0 && v.x <= 1 && v.y >= 0 && v.y <= 1);
            if (ok) low = mid; else high = mid;
        }

        if (low <= 1e-6) return obb; // no allowed movement
        return applyMovement(dx * low, dy * low);
    }

    static findNearestVertex(obb: OrientedRectangleObject, x: number, y: number, threshold = 0.02): number | null {
        const verticies = this.getVertices(obb)
        let nearestVertexIndex: number | null = null;
        let minDist = Infinity;
        verticies.forEach((vertex, index) => {
            const dist = Math.hypot(vertex.x - x, vertex.y - y);
            if (dist < threshold && dist < minDist) {
                minDist = dist;
                nearestVertexIndex = index;
            }
        });
        return nearestVertexIndex
    }

    private static vertexDirection(vertexIndex: number): { su: number; sv: number } {
        switch (vertexIndex) {
            case 0: return { su: -1, sv: -1 }; // top-left
            case 1: return { su: +1, sv: -1 }; // top-right
            case 2: return { su: +1, sv: +1 }; // bottom-right
            case 3: return { su: -1, sv: +1 }; // bottom-left
            default: return { su: 0, sv: 0 };  // center or invalid
        }
    }

    private static decomposeVector(dx: number, dy: number, alpha: number, canvasWidth: number, canvasHeight: number) {
        const ux = Math.cos(alpha);
        const uy = Math.sin(alpha);
        const vx = -uy;
        const vy = ux;

        const du = (dx * canvasWidth * ux + dy * canvasHeight * uy) / canvasWidth;
        const dv = (dx * canvasWidth * vx + dy * canvasHeight * vy) / canvasHeight;

        return { du, dv };
    }

    static rotate(obb: OrientedRectangleObject, delatAlpha: number): OrientedRectangleObject {
        // Try full rotation first
        const fullObb = { ...obb, alpha: obb.alpha + delatAlpha };
        const fullVerts = this.getVertices(fullObb);
        const fullInBounds = fullVerts.every(v => v.x >= 0 && v.x <= 1 && v.y >= 0 && v.y <= 1);
        if (fullInBounds) return fullObb;

        // If full rotation would go out of bounds, binary-search the maximum allowed fraction
        // of delatAlpha in [0, 1] that keeps all vertices inside.
        let low = 0; let high = 1;
        const ITER = 10;
        for (let i = 0; i < ITER; i++) {
            const mid = (low + high) / 2;
            const testObb = { ...obb, alpha: obb.alpha + delatAlpha * mid };
            const verts = this.getVertices(testObb);
            const ok = verts.every(v => v.x >= 0 && v.x <= 1 && v.y >= 0 && v.y <= 1);
            if (ok) low = mid; else high = mid;
        }

        // If no positive fraction is possible, keep original
        if (low <= 1e-6) return obb;
        return { ...obb, alpha: obb.alpha + delatAlpha * low };
    }

    static isHoveringHandle(obb: OrientedRectangleObject, x: number, y: number, threshold = 0.02, canvasWidth: number, canvasHeight: number) {
        const handlePoint = this.getHandle(obb, canvasWidth, canvasHeight)
        const dist = Math.hypot(handlePoint.x - x, handlePoint.y - y);
        if (dist < threshold) return true
        return false
    }

    static draw(obb: OrientedRectangleObject, canvas: HTMLCanvasElement, highlight: boolean = false, vertex_index: number | null = null, highlightHandle: boolean = false, color: number[] = [255, 0, 0]) {
        const width = canvas.width;
        const height = canvas.height;
        const ctx = canvas.getContext("2d");
        if (ctx == null) { return }
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;

        const vertices = this.getVertices(obb);
        const x0 = vertices[0].x * width, y0 = vertices[0].y * height;
        const x1 = vertices[1].x * width, y1 = vertices[1].y * height;
        const x2 = vertices[2].x * width, y2 = vertices[2].y * height;
        const x3 = vertices[3].x * width, y3 = vertices[3].y * height;

        ctx.lineWidth = 1;
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.9)`;
        // Draw Vertices
        ctx.beginPath();
        ctx.rect(x0 - 2, y0 - 2, 4, 4);
        ctx.rect(x1 - 2, y1 - 2, 4, 4);
        ctx.rect(x2 - 2, y2 - 2, 4, 4);
        ctx.rect(x3 - 2, y3 - 2, 4, 4);
        ctx.fill();
        if (vertex_index != null) {
            const vertex_position = this.getVertex(obb, vertex_index as VertexIndex);
            if (vertex_position) {
                ctx.rect(vertex_position.x * width - 5, vertex_position.y * height - 5, 10, 10);

            }
            ctx.stroke();
        }
        ctx.closePath()
        // Draw Handle
        ctx.beginPath()
        const handlePoint = this.getHandle(obb, width, height)
        ctx.arc(handlePoint.x * width, handlePoint.y * height, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath()
        if (highlightHandle) {
            ctx.lineWidth = 1;
            ctx.arc(handlePoint.x * width, handlePoint.y * height, 6, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.setLineDash([3, 6])
        ctx.moveTo(obb.xc * width, obb.yc * height)
        ctx.lineTo(handlePoint.x * width, handlePoint.y * height)
        ctx.stroke()
        ctx.closePath()
        // Draw Oriented Bounding Box
        ctx.beginPath();
        ctx.setLineDash([])
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.closePath()
        if (highlight) {
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`;
            ctx.fill();
        } 
        ctx.stroke();
    }

    static containPoint(obb: OrientedRectangleObject, x: number, y: number): boolean {
        const xc = obb.xc;
        const yc = obb.yc;
        const alpha = obb.alpha;

        const xt = x - xc;
        const yt = y - yc;

        // Project onto OBB's axes
        const cos = Math.cos(alpha);
        const sin = Math.sin(alpha);

        const dw = xt * cos + yt * sin;
        const dh = -xt * sin + yt * cos;

        return (
            Math.abs(dw) <= obb.w / 2 &&
            Math.abs(dh) <= obb.h / 2
        );
    }

    static getHandle(
        obb: OrientedRectangleObject,
        canvasWidth: number,
        canvasHeight: number
    ): Vertex {
        // Convert normalized params to pixel space
        const xc_px = obb.xc * canvasWidth;
        const yc_px = obb.yc * canvasHeight;
        const w_px = obb.w * canvasWidth;
        const cos = Math.cos(obb.alpha);
        const sin = Math.sin(obb.alpha);
        const L = w_px / 3;
        const x_px = xc_px + L * cos;
        const y_px = yc_px + L * sin;
        // Normalize back to [0, 1]
        return { x: x_px / canvasWidth, y: y_px / canvasHeight };
    }

    static getVertex(
        obb: OrientedRectangleObject,
        index: VertexIndex
    ): Vertex {
        // Convert normalized params to pixel space
        const xc_px = obb.xc * obb.imgW;
        const yc_px = obb.yc * obb.imgH;
        const w_px = obb.w * obb.imgW;
        const h_px = obb.h * obb.imgH;
        const cos = Math.cos(obb.alpha);
        const sin = Math.sin(obb.alpha);
        const dw = w_px * 0.5;
        const dh = h_px * 0.5;
        let x_px, y_px;
        switch (index) {
            case 0:
                x_px = xc_px - dw * cos + dh * sin;
                y_px = yc_px - dw * sin - dh * cos;
                break;
            case 1:
                x_px = xc_px + dw * cos + dh * sin;
                y_px = yc_px + dw * sin - dh * cos;
                break;
            case 2:
                x_px = xc_px + dw * cos - dh * sin;
                y_px = yc_px + dw * sin + dh * cos;
                break;
            case 3:
                x_px = xc_px - dw * cos - dh * sin;
                y_px = yc_px - dw * sin + dh * cos;
                break;
        }
        // Normalize back to [0, 1]
        return { x: x_px / obb.imgW, y: y_px / obb.imgH };
    }

    static getVertices(
        obb: OrientedRectangleObject
    ): Vertex[] {
        return [0, 1, 2, 3].map(index => this.getVertex(obb, index as VertexIndex));
    }

    static longestDimSize(obb: OrientedRectangleObject): number {
        return Math.max(obb.h, obb.w)
    }
}

export default OrientedRectangle
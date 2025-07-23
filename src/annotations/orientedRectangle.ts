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
        const vertices = this.getVertices(obb)
        const vertex = vertices[vertexIndex]

        const dx = x - vertex.x;
        const dy = y - vertex.y;

        const { du, dv } = this.decomposeVector(dx, dy, obb.alpha)

        const direction = this.vertexDirection(vertexIndex); // returns { su: ±1, sv: ±1 }

        const w = Math.abs(obb.w + du * direction.su);
        const h = Math.abs(obb.h + dv * direction.sv);

        const xc = obb.xc + dx / 2;
        const yc = obb.yc + dy / 2;

        const newObb = {
            ...obb,
            xc: xc,
            yc: yc,
            w: w,
            h: h,
        };

        return newObb;
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

    private static decomposeVector(dx: number, dy: number, alpha: number) {
        const ux = Math.cos(alpha);
        const uy = Math.sin(alpha);
        const vx = -uy;
        const vy = ux;

        const du = dx * ux + dy * uy;
        const dv = dx * vx + dy * vy;

        return { du, dv };
    }

    static rotate(obb: OrientedRectangleObject, deltaAngle: number): OrientedRectangleObject {
        return {
            ...obb,
            alpha: obb.alpha + deltaAngle,
        };
    }

    static isHoveringHandle(obb: OrientedRectangleObject, x: number, y: number, threshold = 0.02) {
        const handlePoint = this.getHandle(obb)
        const dist = Math.hypot(handlePoint.x - x, handlePoint.y - y);
        if (dist < threshold) return true
        return false
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

    static draw(obb: OrientedRectangleObject, canvas: HTMLCanvasElement, highlight: boolean = false, vertex_index: number | null = null, highlightHandle: boolean = false, color: number[] = [255, 0, 0]) {
        const width = canvas.width;
        const height = canvas.height;
        const ctx = canvas.getContext("2d");
        if (ctx == null) { return }
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;

        const vertices = this.getVertices(obb)
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
        const handlePoint = this.getHandle(obb)
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

    static getHandle(obb: OrientedRectangleObject): Vertex {
        const cos = Math.cos(obb.alpha)
        const sin = Math.sin(obb.alpha)
        const xc = obb.xc
        const yc = obb.yc
        const L = obb.w / 3

        return { x: xc + L * cos, y: yc + L * sin }
    }

    static getVertex(obb: OrientedRectangleObject, index: VertexIndex): Vertex {
        const cos = Math.cos(obb.alpha)
        const sin = Math.sin(obb.alpha)
        const xc = obb.xc
        const yc = obb.yc
        const dw = obb.w * 0.5;
        const dh = obb.h * 0.5;
        switch (index) {
            case 0:
                return { x: xc - dw * cos + dh * sin, y: yc - dw * sin - dh * cos }
            case 1:
                return { x: xc + dw * cos + dh * sin, y: yc + dw * sin - dh * cos }
            case 2:
                return { x: xc + dw * cos - dh * sin, y: yc + dw * sin + dh * cos }
            case 3:
                return { x: xc - dw * cos - dh * sin, y: yc - dw * sin + dh * cos }
        }
    }

    static getVertices(obb: OrientedRectangleObject): Vertex[] {
        return [0, 1, 2, 3].map(index => this.getVertex(obb, index as VertexIndex));
    }

    static longestDimSize(obb: OrientedRectangleObject): number {
        return Math.max(obb.h, obb.w)
    }
}

export default OrientedRectangle
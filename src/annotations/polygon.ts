import { PolygonObject, Vertex } from "@/interfaces";


class Polygon {

    static move(poly: PolygonObject, dx: number, dy: number): PolygonObject {
        const newShell = poly.shell.map((value) => { return { x: value.x + dx, y: value.y + dy } as Vertex })
        return { ...poly, shell: newShell }
    }

    static draw(poly: PolygonObject, canvas: HTMLCanvasElement, highlight: boolean = false, vertexIndex: number | null = null, color: number[] = [255, 0, 0]) {
        const width = canvas.width;
        const height = canvas.height;
        const ctx = canvas.getContext("2d");
        if (ctx == null) { return }
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.9)`;
        ctx.lineWidth = 1;

        // Draw Vertices
        ctx.beginPath();
        poly.shell.forEach((vertex) => {
            const x = vertex.x * width; const y = vertex.y * height;
            ctx.rect(x - 2, y - 2, 4, 4);
        })
        ctx.fill();
        if (vertexIndex != null) {
            const highlightedVertex = poly.shell[vertexIndex]
            if (highlightedVertex) {
                ctx.rect(highlightedVertex.x * width - 5, highlightedVertex.y * height - 5, 10, 10);

            }
        }
        ctx.closePath()

        // Draw Edges
        ctx.beginPath();
        poly.shell.forEach((vertex, index) => {
            const x = vertex.x * width; const y = vertex.y * height;
            if (index)
                ctx.lineTo(x, y);
            else
                ctx.moveTo(x, y)
        })
        ctx.closePath()
        if (highlight) {
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`;
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.stroke();
        }
    }

    static addVertex(poly: PolygonObject, x: number, y: number, index: number): PolygonObject {
        const newShell = [...poly.shell.slice(0, index), { x, y } as Vertex, ...poly.shell.slice(index)]
        return { ...poly, shell: newShell }
    }

    static moveVertex(poly: PolygonObject, x: number, y: number, vertexIndex: number): PolygonObject {
        const newShell = [...poly.shell]
        if (newShell[vertexIndex])
            newShell[vertexIndex] = { x, y }
        return { ...poly, shell: newShell }
    }

    static findNearestVertex(poly: PolygonObject, x: number, y: number, threshold = 0.02): number | null {
        let nearestVertexIndex: number | null = null;
        let minDist = Infinity;
        poly.shell.forEach((vertex, index) => {
            const dist = Math.hypot(vertex.x - x, vertex.y - y);
            if (dist < threshold && dist < minDist) {
                minDist = dist;
                nearestVertexIndex = index;
            }
        });
        return nearestVertexIndex
    }

    static containPoint(poly: PolygonObject, x: number, y: number): boolean {
        const vertices = poly.shell;
        const numVertices = vertices.length;
        let inside = false;

        for (let i = 0; i < numVertices; i++) {
            const { x: x1, y: y1 } = vertices[i];
            const { x: x2, y: y2 } = vertices[(i + 1) % numVertices];

            if ((y1 > y) !== (y2 > y)) {
                if (x1 > x && x2 > x) {
                    inside = !inside;
                } else if (x1 < x && x2 < x) {
                    continue;
                } else {
                    const xIntersect = (x2 - x1) * (y - y1) / (y2 - y1 + 1e-12) + x1;
                    if (Math.abs(x - xIntersect) < 1e-12) {
                        return true; // On edge or vertex
                    }
                    if (x < xIntersect) {
                        inside = !inside;
                    }
                }
            }
        }

        return inside;
    }

    static boundingBox(poly: PolygonObject): { minX: number, minY: number, maxX: number, maxY: number } {
        let minX = +Infinity, minY = +Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        poly.shell.forEach((vertex) => {
            if (vertex.x > maxX) maxX = vertex.x;
            if (vertex.x < minX) minX = vertex.x;
            if (vertex.y > maxY) maxY = vertex.y;
            if (vertex.y < minY) minY = vertex.y;
        });

        return { minX, minY, maxX, maxY };
    }

    static longestDimSize(poly: PolygonObject): number {
        const { minX, maxX, minY, maxY } = this.boundingBox(poly);
        return Math.max(maxX - minX, maxY - minY);
    }
}


export default Polygon;
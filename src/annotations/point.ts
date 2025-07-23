import { PointObject } from "@/interfaces";

class Keypoint {
    static move(point: PointObject, x: number, y: number): PointObject {
        return { ...point, x, y };
    }

    static isNear(point: PointObject, x: number, y: number, threshold: number = 0.02): boolean {
        const dist = Math.hypot(point.x - x, point.y - y);
        return dist < threshold;
    }

    static draw(
        point: PointObject,
        canvas: HTMLCanvasElement,
        highlight: boolean = false,
        color: number[] = [255, 0, 0]
    ) {
        const width = canvas.width;
        const height = canvas.height;
        const x = point.x * width;
        const y = point.y * height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.9)`;
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath()

        if (highlight) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`;
            ctx.lineWidth = 2;
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath()
        }
    }
}

export default Keypoint;

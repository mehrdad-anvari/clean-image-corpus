export function getNormalizedCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = e.currentTarget.width
    const height = e.currentTarget.height
    const x = (e.clientX - rect.left) / width;
    const y = (e.clientY - rect.top) / height;
    return { x, y };
};

export function getCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    return { x, y };
};

export function getAbsoluteCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const x = e.clientX;
    const y = e.clientY;
    return { x, y };
};
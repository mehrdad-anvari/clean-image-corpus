export async function computeAverageHash(image: HTMLImageElement): Promise<string> {
  const size = 8; // aHash uses 8x8
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size).data;

  const gray: number[] = [];
  for (let i = 0; i < size * size; i++) {
    const r = imageData[i * 4];
    const g = imageData[i * 4 + 1];
    const b = imageData[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const avg = gray.reduce((sum, val) => sum + val, 0) / gray.length;

  const hash = gray.map(v => (v >= avg ? '1' : '0')).join('');
  return hash;
}


export async function computePerceptualHash(image: HTMLImageElement): Promise<string> {
  const size = 32;
  const smallerSize = 8;

  // 1. Draw the image to canvas and get grayscale pixels
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size).data;

  const gray: number[][] = [];
  for (let y = 0; y < size; y++) {
    gray[y] = [];
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      // grayscale average
      gray[y][x] = 0.299 * r + 0.587 * g + 0.114 * b;
    }
  }

  // 2. Compute 2D DCT
  const dct = dct2D(gray);

  // 3. Extract top-left 8x8 block, ignoring [0][0]
  const values: number[] = [];
  for (let y = 0; y < smallerSize; y++) {
    for (let x = 0; x < smallerSize; x++) {
      if (x !== 0 || y !== 0) values.push(dct[y][x]);
    }
  }

  // 4. Compute median
  const median = values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)];

  // 5. Convert to binary hash string
  const hash = values.map(v => (v > median ? '1' : '0')).join('');
  return hash;
}

// Perform 1D DCT on a vector
export function dct1D(vector: number[], stopIndex: number): number[] {
  const N = vector.length;
  const result: number[] = new Array(stopIndex);
  const PI = Math.PI;

  for (let u = 0; u < stopIndex; u++) {
    let sum = 0;
    for (let x = 0; x < N; x++) {
      sum += vector[x] * Math.cos(((2 * x + 1) * u * PI) / (2 * N));
    }
    const alpha = u === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N);
    result[u] = alpha * sum;
  }

  return result;
}

// Transpose a 2D matrix
export function transpose(matrix: number[][]): number[][] {
  if (matrix.length === 0 || matrix[0].length === 0) return [];

  return matrix[0].map((_, colIndex) =>
    matrix.map(row => row[colIndex])
  );
}

// Perform 2D DCT using two passes of 1D DCT
export function dct2D(matrix: number[][]): number[][] {
  const N = matrix.length;
  const cutoff = 8;

  // Validate matrix
  if (N === 0 || matrix[0].length === 0) {
    throw new Error("Input matrix must be non-empty.");
  }

  // Apply 1D DCT to each row, produce N x cutoff matrix
  const dctRows: number[][] = matrix.map(row => dct1D(row, cutoff));

  // Transpose to apply DCT on columns (now 8 x N)
  const transposed: number[][] = transpose(dctRows);

  // Apply 1D DCT to each column, produce 8 x 8 matrix
  const dctCols: number[][] = transposed.map(col => dct1D(col, cutoff));

  // Transpose back to get final 8 x 8 DCT matrix
  return transpose(dctCols);
}

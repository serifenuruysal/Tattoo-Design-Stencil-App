export interface StencilSettings {
  threshold: number;
  contrast: number;
  lineThickness: number;
  invert: boolean;
  mode: 'solid-stencil' | 'black-white' | 'line-sketch';
}

export interface ProcessingResult {
  solidStencil?: string;
  blackWhite?: string;
  lineSketch?: string;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async processImage(imageFile: File, settings: StencilSettings): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Set canvas size to match image
          this.canvas.width = img.width;
          this.canvas.height = img.height;

          const result: ProcessingResult = {};

          if (settings.mode === 'solid-stencil') {
            result.solidStencil = this.createSolidStencil(img, settings);
          } else if (settings.mode === 'black-white') {
            result.blackWhite = this.createBlackWhiteDesign(img, settings);
            result.lineSketch = this.createLineSketch(img, settings);
          } else if (settings.mode === 'line-sketch') {
            result.lineSketch = this.createLineSketch(img, settings);
          }

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }

  private createSolidStencil(img: HTMLImageElement, settings: StencilSettings): string {
    // Draw original image
    this.ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Apply stencil processing
    this.applyStencilEffect(data, settings);

    // Put processed data back
    this.ctx.putImageData(imageData, 0, 0);

    // Apply additional effects
    if (settings.lineThickness > 1) {
      this.applyLineThickness(settings.lineThickness);
    }

    return this.canvas.toDataURL('image/png');
  }

  private createBlackWhiteDesign(img: HTMLImageElement, settings: StencilSettings): string {
    // Draw original image
    this.ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Convert to high-quality black and white with shading
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale using luminance formula
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      
      // Apply contrast enhancement
      const contrasted = ((gray / 255 - 0.5) * settings.contrast + 0.5) * 255;
      const finalGray = Math.max(0, Math.min(255, contrasted));

      // Apply inversion if needed
      const finalValue = settings.invert ? 255 - finalGray : finalGray;

      // Set RGB values
      data[i] = finalValue;     // Red
      data[i + 1] = finalValue; // Green
      data[i + 2] = finalValue; // Blue
      // Alpha remains unchanged
    }

    // Put processed data back
    this.ctx.putImageData(imageData, 0, 0);

    return this.canvas.toDataURL('image/png');
  }

  private createLineSketch(img: HTMLImageElement, settings: StencilSettings): string {
    // Draw original image
    this.ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;
    const width = img.width;
    const height = img.height;

    // Convert to grayscale first
    const grayData = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      grayData[i] = grayData[i + 1] = grayData[i + 2] = gray;
      grayData[i + 3] = data[i + 3];
    }

    // Apply Sobel edge detection
    const edgeData = this.applySobelEdgeDetection(grayData, width, height);

    // Apply threshold to create clean lines
    for (let i = 0; i < edgeData.length; i += 4) {
      const edgeStrength = edgeData[i];
      const lineValue = edgeStrength > settings.threshold ? 0 : 255; // Black lines on white
      
      // Apply inversion if needed
      const finalValue = settings.invert ? 255 - lineValue : lineValue;

      edgeData[i] = finalValue;
      edgeData[i + 1] = finalValue;
      edgeData[i + 2] = finalValue;
    }

    // Put edge data back
    this.ctx.putImageData(new ImageData(edgeData, width, height), 0, 0);

    // Apply line thickness if needed
    if (settings.lineThickness > 1) {
      this.applyLineThickness(settings.lineThickness);
    }

    return this.canvas.toDataURL('image/png');
  }

  private applySobelEdgeDetection(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(data.length);
    
    // Sobel kernels
    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0;
        let gy = 0;

        // Apply Sobel kernels
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
            const pixelValue = data[pixelIndex]; // Grayscale value
            
            gx += pixelValue * sobelX[ky + 1][kx + 1];
            gy += pixelValue * sobelY[ky + 1][kx + 1];
          }
        }

        // Calculate gradient magnitude
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const normalizedMagnitude = Math.min(255, magnitude);

        const pixelIndex = (y * width + x) * 4;
        result[pixelIndex] = normalizedMagnitude;
        result[pixelIndex + 1] = normalizedMagnitude;
        result[pixelIndex + 2] = normalizedMagnitude;
        result[pixelIndex + 3] = data[pixelIndex + 3]; // Preserve alpha
      }
    }

    return result;
  }

  private applyStencilEffect(data: Uint8ClampedArray, settings: StencilSettings) {
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      
      // Apply contrast
      const contrasted = ((gray / 255 - 0.5) * settings.contrast + 0.5) * 255;
      
      // Apply threshold for stencil effect
      const stencilValue = contrasted > settings.threshold ? 255 : 0;
      
      // Apply inversion if needed
      const finalValue = settings.invert ? 255 - stencilValue : stencilValue;

      // Set RGB values
      data[i] = finalValue;     // Red
      data[i + 1] = finalValue; // Green
      data[i + 2] = finalValue; // Blue
      // Alpha remains unchanged
    }
  }

  private applyLineThickness(thickness: number) {
    if (thickness <= 1) return;

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Create a copy for processing
    const originalData = new Uint8ClampedArray(data);

    // Apply dilation effect for line thickness
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        if (originalData[index] === 0) { // If pixel is black (line)
          // Dilate around this pixel
          for (let dy = -thickness + 1; dy < thickness; dy++) {
            for (let dx = -thickness + 1; dx < thickness; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIndex = (ny * width + nx) * 4;
                data[nIndex] = 0;     // Red
                data[nIndex + 1] = 0; // Green
                data[nIndex + 2] = 0; // Blue
              }
            }
          }
        }
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  downloadImage(dataUrl: string, filename: string = 'stencil.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }
}
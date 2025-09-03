import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Download, RotateCcw } from 'lucide-react';
import { ProcessingResult } from './image-processor';

interface ImagePreviewProps {
  originalImage?: File;
  processingResult?: ProcessingResult;
  isProcessing: boolean;
  onDownload: (type: 'solid' | 'blackWhite' | 'lineSketch') => void;
  onReset: () => void;
  mode: string;
}

export function ImagePreview({ 
  originalImage, 
  processingResult, 
  isProcessing, 
  onDownload,
  onReset,
  mode
}: ImagePreviewProps) {
  const [originalImageUrl, setOriginalImageUrl] = React.useState<string>();

  React.useEffect(() => {
    if (originalImage) {
      const url = URL.createObjectURL(originalImage);
      setOriginalImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [originalImage]);

  if (!originalImage) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto size-16 bg-muted rounded-lg flex items-center justify-center mb-4">
          <RotateCcw className="size-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-2">No image selected</h3>
        <p className="text-sm text-muted-foreground">
          Upload an image to see the preview and stencil conversion
        </p>
      </Card>
    );
  }

  const renderPreviewGrid = () => {
    if (mode === 'black-white') {
      // Show 3 images: Original, Black & White, Line Sketch
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Original Image */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Original Design</h4>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {originalImageUrl && (
                <img
                  src={originalImageUrl}
                  alt="Original design"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </Card>

          {/* Black & White */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Black & White</h4>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {isProcessing ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-1"></div>
                  <p className="text-xs text-muted-foreground">Processing...</p>
                </div>
              ) : processingResult?.blackWhite ? (
                <img
                  src={processingResult.blackWhite}
                  alt="Black and white design"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <RotateCcw className="size-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Processing...</p>
                </div>
              )}
            </div>
            {processingResult?.blackWhite && !isProcessing && (
              <Button 
                size="sm" 
                className="w-full mt-3"
                onClick={() => onDownload('blackWhite')}
              >
                <Download className="size-3 mr-1" />
                Download
              </Button>
            )}
          </Card>

          {/* Line Sketch */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Line Sketch</h4>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {isProcessing ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-1"></div>
                  <p className="text-xs text-muted-foreground">Processing...</p>
                </div>
              ) : processingResult?.lineSketch ? (
                <img
                  src={processingResult.lineSketch}
                  alt="Line sketch stencil"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <RotateCcw className="size-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Processing...</p>
                </div>
              )}
            </div>
            {processingResult?.lineSketch && !isProcessing && (
              <Button 
                size="sm" 
                className="w-full mt-3"
                onClick={() => onDownload('lineSketch')}
              >
                <Download className="size-3 mr-1" />
                Download
              </Button>
            )}
          </Card>
        </div>
      );
    } else {
      // Show 2 images: Original and processed result
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Image */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Original Design</h4>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {originalImageUrl && (
                <img
                  src={originalImageUrl}
                  alt="Original design"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </Card>

          {/* Processed Result */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">
              {mode === 'solid-stencil' ? 'Solid Stencil' : 'Line Sketch'}
            </h4>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {isProcessing ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Processing...</p>
                </div>
              ) : (processingResult?.solidStencil || processingResult?.lineSketch) ? (
                <img
                  src={processingResult.solidStencil || processingResult.lineSketch}
                  alt="Processed stencil"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <RotateCcw className="size-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Adjust settings to generate stencil
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }
  };

  const hasResults = processingResult && (
    processingResult.solidStencil || 
    processingResult.blackWhite || 
    processingResult.lineSketch
  );

  return (
    <div className="space-y-6">
      {/* Preview Images */}
      {renderPreviewGrid()}

      {/* Action Buttons */}
      {hasResults && !isProcessing && mode !== 'black-white' && (
        <div className="flex gap-3 justify-center">
          <Button onClick={onReset} variant="outline">
            <RotateCcw className="size-4 mr-2" />
            Reset
          </Button>
          <Button onClick={() => {
            if (processingResult?.solidStencil) onDownload('solid');
            else if (processingResult?.lineSketch) onDownload('lineSketch');
          }}>
            <Download className="size-4 mr-2" />
            Download Stencil
          </Button>
        </div>
      )}

      {/* Reset button for black-white mode */}
      {mode === 'black-white' && hasResults && !isProcessing && (
        <div className="flex justify-center">
          <Button onClick={onReset} variant="outline">
            <RotateCcw className="size-4 mr-2" />
            Reset Settings
          </Button>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { StencilSettings } from './components/StencilSettings';
import { ImagePreview } from './components/ImagePreview';
import { ImageProcessor, StencilSettings as StencilSettingsType, ProcessingResult } from './components/image-processor';
import { Palette, Sparkles } from 'lucide-react';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<File>();
  const [processingResult, setProcessingResult] = useState<ProcessingResult>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<StencilSettingsType>({
    threshold: 128,
    contrast: 1.5,
    lineThickness: 2,
    invert: false,
    mode: 'solid-stencil'
  });

  const imageProcessor = React.useMemo(() => new ImageProcessor(), []);

  const processImage = useCallback(async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      const result = await imageProcessor.processImage(selectedImage, settings);
      setProcessingResult(result);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedImage, settings, imageProcessor]);

  // Auto-process when settings change
  useEffect(() => {
    if (selectedImage) {
      const timer = setTimeout(processImage, 300); // Debounce
      return () => clearTimeout(timer);
    }
  }, [selectedImage, settings, processImage]);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setProcessingResult(undefined);
  };

  const handleClearImage = () => {
    setSelectedImage(undefined);
    setProcessingResult(undefined);
  };

  const handleDownload = (type: 'solid' | 'blackWhite' | 'lineSketch') => {
    if (!processingResult || !selectedImage) return;

    let dataUrl: string | undefined;
    let suffix: string;

    switch (type) {
      case 'solid':
        dataUrl = processingResult.solidStencil;
        suffix = '_solid_stencil';
        break;
      case 'blackWhite':
        dataUrl = processingResult.blackWhite;
        suffix = '_black_white';
        break;
      case 'lineSketch':
        dataUrl = processingResult.lineSketch;
        suffix = '_line_sketch';
        break;
    }

    if (dataUrl) {
      const filename = `${selectedImage.name.split('.')[0]}${suffix}.png`;
      imageProcessor.downloadImage(dataUrl, filename);
    }
  };

  const handleReset = () => {
    setSettings({
      threshold: 128,
      contrast: 1.5,
      lineThickness: 2,
      invert: false,
      mode: settings.mode // Keep the current mode
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
              <Palette className="size-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Tattoo Stencil Generator</h1>
              <p className="text-muted-foreground">Transform your designs into perfect stencils</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Upload & Settings */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="size-5 text-primary" />
                <h2 className="text-xl font-semibold">Upload Design</h2>
              </div>
              <ImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onClearImage={handleClearImage}
              />
            </div>

            {/* Settings Section */}
            {selectedImage && (
              <div>
                <StencilSettings
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              </div>
            )}
          </div>

          {/* Right Columns - Preview */}
          <div className="xl:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="size-5 text-primary" />
              <h2 className="text-xl font-semibold">Preview</h2>
            </div>
            <ImagePreview
              originalImage={selectedImage}
              processingResult={processingResult}
              isProcessing={isProcessing}
              onDownload={handleDownload}
              onReset={handleReset}
              mode={settings.mode}
            />
          </div>
        </div>

        {/* Instructions */}
        {!selectedImage && (
          <div className="mt-12 text-center max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">How to Use</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-8">
              <div className="space-y-2">
                <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <p className="font-medium">Upload Your Design</p>
                <p className="text-muted-foreground">Drag and drop or click to select your tattoo design image</p>
              </div>
              <div className="space-y-2">
                <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <p className="font-medium">Choose Processing Mode</p>
                <p className="text-muted-foreground">Select between solid stencil, line sketch, or black & white conversion</p>
              </div>
              <div className="space-y-2">
                <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <p className="font-medium">Download Results</p>
                <p className="text-muted-foreground">Get your ready-to-use stencils in high-quality PNG format</p>
              </div>
            </div>

            {/* Processing Mode Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-medium mb-2">Solid Stencil</h4>
                <p className="text-muted-foreground">Classic black and white stencil perfect for bold, simple designs</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-medium mb-2">Line Sketch</h4>
                <p className="text-muted-foreground">Edge-detected outlines ideal for detailed tattoo work and fine lines</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-medium mb-2">Black & White + Line</h4>
                <p className="text-muted-foreground">Get both black & white design and line sketch for maximum flexibility</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
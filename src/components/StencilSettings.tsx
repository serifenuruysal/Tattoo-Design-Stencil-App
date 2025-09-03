import React from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StencilSettings as StencilSettingsType } from './image-processor';

interface StencilSettingsProps {
  settings: StencilSettingsType;
  onSettingsChange: (settings: StencilSettingsType) => void;
}

export function StencilSettings({ settings, onSettingsChange }: StencilSettingsProps) {
  const updateSetting = (key: keyof StencilSettingsType, value: number | boolean | string) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Card className="p-6">
      <h3 className="font-medium mb-4">Processing Settings</h3>
      
      <div className="space-y-6">
        {/* Processing Mode */}
        <div className="space-y-2">
          <Label htmlFor="mode">Processing Mode</Label>
          <Select value={settings.mode} onValueChange={(value) => updateSetting('mode', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select processing mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid-stencil">Solid Stencil</SelectItem>
              <SelectItem value="black-white">Black & White + Line Sketch</SelectItem>
              <SelectItem value="line-sketch">Line Sketch Only</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {settings.mode === 'solid-stencil' && 'Classic solid black stencil for bold designs'}
            {settings.mode === 'black-white' && 'Creates both black & white version and line sketch'}
            {settings.mode === 'line-sketch' && 'Edge-detected outline for detailed tattoo work'}
          </p>
        </div>

        {/* Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="threshold">
              {settings.mode === 'line-sketch' ? 'Edge Sensitivity' : 'Threshold'}
            </Label>
            <span className="text-sm text-muted-foreground">{settings.threshold}</span>
          </div>
          <Slider
            id="threshold"
            min={0}
            max={255}
            step={1}
            value={[settings.threshold]}
            onValueChange={([value]) => updateSetting('threshold', value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {settings.mode === 'line-sketch' 
              ? 'Controls edge detection sensitivity. Lower = more details.'
              : 'Controls which parts become black lines. Lower = more detail.'
            }
          </p>
        </div>

        {/* Contrast */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="contrast">Contrast</Label>
            <span className="text-sm text-muted-foreground">{settings.contrast.toFixed(1)}</span>
          </div>
          <Slider
            id="contrast"
            min={0.5}
            max={3}
            step={0.1}
            value={[settings.contrast]}
            onValueChange={([value]) => updateSetting('contrast', value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Enhances the difference between light and dark areas.
          </p>
        </div>

        {/* Line Thickness - Only show for line-based modes */}
        {(settings.mode === 'solid-stencil' || settings.mode === 'line-sketch' || settings.mode === 'black-white') && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="lineThickness">Line Thickness</Label>
              <span className="text-sm text-muted-foreground">{settings.lineThickness}px</span>
            </div>
            <Slider
              id="lineThickness"
              min={1}
              max={5}
              step={1}
              value={[settings.lineThickness]}
              onValueChange={([value]) => updateSetting('lineThickness', value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Makes the stencil lines thicker for better transfer.
            </p>
          </div>
        )}

        {/* Invert */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="invert">Invert Colors</Label>
            <p className="text-xs text-muted-foreground">
              Swaps black and white areas.
            </p>
          </div>
          <Switch
            id="invert"
            checked={settings.invert}
            onCheckedChange={(checked) => updateSetting('invert', checked)}
          />
        </div>
      </div>
    </Card>
  );
}
import { useRef, useState } from "react";
import { Camera, Upload, Package, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { VintographyAction } from "@/lib/vintography-state";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/contexts/AuthContext";

const QUICK_PRESETS = [
  { label: 'Marketplace Ready', desc: 'Remove BG + Enhance', credits: 2 },
  { label: 'Quick Clean', desc: 'Remove Background', credits: 1 },
  { label: 'Steam & List', desc: 'Steam + Remove BG', credits: 2 },
];

interface StudioEmptyStateProps {
  dispatch: React.Dispatch<VintographyAction>;
}

export function StudioEmptyState({ dispatch }: StudioEmptyStateProps) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  async function handleFile(file: File) {
    if (!user) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'user-uploads', user.id);
      dispatch({ type: 'SET_PHOTO', url });
    } catch {
      toast.error('Upload failed — please try again');
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      {/* Icon + headline */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.08)" }}>
          <Camera size={36} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
            Start with a photo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Upload a photo of your item and our AI will transform it into a professional product shot.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed border-border hover:border-primary rounded-2xl p-8 text-center cursor-pointer transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {uploading ? (
          <Loader2 size={28} className="mx-auto mb-3 text-primary animate-spin" />
        ) : (
          <Upload size={28} className="mx-auto mb-3 text-muted-foreground" />
        )}
        <p className="text-sm font-medium text-foreground">
          {uploading ? 'Uploading…' : 'Drop your photo here'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse · JPG, PNG, WEBP</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {/* Choose from My Items */}
      <button
        onClick={() => navigate('/listings')}
        className="w-full min-h-[44px] rounded-xl border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-surface-sunken transition-colors"
      >
        <Package size={16} className="text-muted-foreground" />
        Choose from My Items
      </button>

      {/* Quick start presets */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Start</p>
        {QUICK_PRESETS.map(preset => (
          <div key={preset.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-medium text-foreground">{preset.label}</p>
              <p className="text-xs text-muted-foreground">{preset.desc}</p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{preset.credits}cr</span>
          </div>
        ))}
      </div>
    </div>
  );
}

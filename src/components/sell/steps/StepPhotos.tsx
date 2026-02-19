import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { processImage } from "@/lib/vintography-api";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/contexts/AuthContext";
import type { SellWizardState, SellWizardAction } from "@/lib/sell-wizard-state";

interface StepPhotosProps {
  state: SellWizardState;
  dispatch: React.Dispatch<SellWizardAction>;
}

export function StepPhotos({ state, dispatch }: StepPhotosProps) {
  const { item, firstItemFree } = state;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [uploadingStudio, setUploadingStudio] = useState(false);

  const photos = item.originalPhotos;
  const currentPhoto = photos[activeIndex];
  const isEnhanced = !!item.enhancedPhotos[activeIndex];
  const isProcessing = processingIndex === activeIndex;

  async function handleQuickRemoveBg() {
    if (!currentPhoto) return;
    setProcessingIndex(activeIndex);
    try {
      const result = await processImage(currentPhoto, 'clean_bg', {});
      dispatch({ type: 'SET_ENHANCED_PHOTO', index: activeIndex, url: result.imageUrl });
      // Auto-advance to next unenhanced photo
      const nextUnenhanced = photos.findIndex(
        (_, i) => i > activeIndex && !item.enhancedPhotos[i]
      );
      if (nextUnenhanced !== -1) setActiveIndex(nextUnenhanced);
    } catch (err) {
      console.error('[StepPhotos] BG removal failed', err);
      toast.error('Background removal failed — please try again');
    } finally {
      setProcessingIndex(null);
    }
  }

  async function handleOpenStudio() {
    if (!currentPhoto) return;
    setUploadingStudio(true);
    try {
      let studioUrl = currentPhoto;
      // Blob URLs die on navigation — upload to storage first
      if (currentPhoto.startsWith('blob:')) {
        const res = await fetch(currentPhoto);
        const blob = await res.blob();
        const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
        studioUrl = await uploadImage(file, 'listing-images', user?.id ?? 'anon');
      }
      navigate(`/vintography?imageUrl=${encodeURIComponent(studioUrl)}&returnToWizard=1&photoIndex=${activeIndex}`);
    } catch {
      // If upload fails, try with original URL anyway
      navigate(`/vintography?imageUrl=${encodeURIComponent(currentPhoto)}&returnToWizard=1&photoIndex=${activeIndex}`);
    } finally {
      setUploadingStudio(false);
    }
  }

  function handleContinue() {
    dispatch({ type: 'NEXT_STEP' });
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No photos found. Go back and add photos first.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Photo counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Photo {activeIndex + 1} of {photos.length}
        </p>
        {isEnhanced && (
          <span className="flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 size={13} />
            Enhanced ✓
          </span>
        )}
      </div>

      {/* Photo preview */}
      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-surface-sunken relative">
        {isEnhanced ? (
          <BeforeAfterSlider
            beforeSrc={currentPhoto}
            afterSrc={item.enhancedPhotos[activeIndex]!}
            autoReveal={true}
            className="w-full h-full"
          />
        ) : (
          <>
            <img
              src={currentPhoto}
              alt={`Photo ${activeIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border shadow-lg">
                  <Loader2 size={15} className="animate-spin text-primary" />
                  <span className="text-sm font-medium">Removing background…</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action buttons */}
      {!isEnhanced ? (
        <div className="space-y-2">
          <button
            onClick={handleQuickRemoveBg}
            disabled={isProcessing}
            className="w-full min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                Quick Remove Background
                {!firstItemFree && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-md bg-primary-foreground/20 text-[10px] font-mono">
                    1 cr
                  </span>
                )}
              </>
            )}
          </button>

          <button
            onClick={handleOpenStudio}
            disabled={uploadingStudio}
            className="w-full min-h-[44px] rounded-xl border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-surface-sunken transition-colors disabled:opacity-60"
          >
            {uploadingStudio ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            {uploadingStudio ? 'Opening Studio…' : 'Open Photo Studio'}
          </button>

          <button
            onClick={() => {
              const next = activeIndex < photos.length - 1 ? activeIndex + 1 : activeIndex;
              setActiveIndex(next);
            }}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Skip this photo
          </button>
        </div>
      ) : (
        <button
          onClick={handleOpenStudio}
          disabled={uploadingStudio}
          className="w-full min-h-[44px] rounded-xl border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-surface-sunken transition-colors disabled:opacity-60"
        >
          {uploadingStudio ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
          {uploadingStudio ? 'Opening Studio…' : 'Edit again in Photo Studio'}
        </button>
      )}

      {/* Thumbnail nav */}
      {photos.length > 1 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {photos.map((url, i) => {
            const enhanced = !!item.enhancedPhotos[i];
            const active = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  active
                    ? "border-primary shadow-[0_0_0_2px_hsla(350,80%,58%,0.2)]"
                    : enhanced
                    ? "border-success/50 ring-2 ring-success/30"
                    : "border-border"
                }`}
              >
                <img src={url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                {enhanced && (
                  <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center">
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Manual continue */}
      <div className="border-t border-border pt-5 mt-2">
        <button
          onClick={handleContinue}
          className="w-full min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_4px_14px_hsla(350,80%,58%,0.3)] hover:-translate-y-0.5"
        >
          I've finished editing — continue →
        </button>
      </div>
    </div>
  );
}

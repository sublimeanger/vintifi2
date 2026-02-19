import { useRef, useState } from "react";
import { Link2, Plus, X, CheckCircle2, Loader2 } from "lucide-react";
import type { SellWizardState, SellWizardAction } from "@/lib/sell-wizard-state";
import { supabase } from "@/integrations/supabase/client";

interface StepAddItemProps {
  state: SellWizardState;
  dispatch: React.Dispatch<SellWizardAction>;
  showValidation: boolean;
}

const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories", "Other"];
const CONDITIONS = [
  "New with tags",
  "New without tags",
  "Very good",
  "Good",
  "Satisfactory",
];




export function StepAddItem({ state, dispatch, showValidation }: StepAddItemProps) {
  const { item, isImporting } = state;
  const [importUrl, setImportUrl] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);

  const fieldClass = "w-full bg-surface-sunken border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const errorClass = "text-xs text-destructive mt-1";

  function fieldError(field: string) {
    if (!showValidation) return null;
    const val = item[field as keyof typeof item];
    if (!val || (typeof val === 'string' && !val.trim())) {
      return <p className={errorClass}>This field is required</p>;
    }
    return null;
  }

  async function handleImport() {
    if (!importUrl.trim()) return;
    dispatch({ type: 'SET_IMPORT_LOADING', loading: true });
    try {
      const { data, error } = await supabase.functions.invoke('scrape-vinted', {
        body: { url: importUrl.trim() },
      });
      if (error || !data) throw new Error(error?.message ?? 'Import failed');
      dispatch({
        type: 'SET_ITEM_DATA',
        payload: {
          title: data.title ?? '',
          brand: data.brand ?? '',
          category: data.category ?? '',
          size: data.size ?? '',
          condition: data.condition ?? '',
          color: data.colour ?? '',
          description: data.description ?? '',
          source_url: importUrl.trim(),
          originalPhotos: Array.isArray(data.photos) ? data.photos : [],
          enhancedPhotos: Array.isArray(data.photos) ? new Array(data.photos.length).fill(null) : [],
        },
      });
      setImportSuccess(true);
      setTimeout(() => {
        photosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    } catch (err) {
      // Fallback: still show success with whatever scraped
      setImportSuccess(false);
    } finally {
      dispatch({ type: 'SET_IMPORT_LOADING', loading: false });
    }
  }

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      dispatch({ type: 'ADD_ORIGINAL_PHOTO', url });
    });
    e.target.value = '';
  }

  const updateItem = (field: string, value: string) => {
    dispatch({ type: 'SET_ITEM_DATA', payload: { [field]: value } });
  };

  return (
    <div className="space-y-6">
      {/* URL Import Card */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Import from Vinted</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://www.vinted.co.uk/items/..."
            value={importUrl}
            onChange={e => setImportUrl(e.target.value)}
            className={`${fieldClass} flex-1`}
            onKeyDown={e => e.key === 'Enter' && handleImport()}
          />
          <button
            onClick={handleImport}
            disabled={isImporting || !importUrl.trim()}
            className="min-h-[44px] px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            {isImporting ? <Loader2 size={14} className="animate-spin" /> : null}
            Import
          </button>
        </div>

        {importSuccess && (
          <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-success/5 border border-success/20">
            <CheckCircle2 size={16} className="text-success flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.originalPhotos.length} photos imported</p>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or add manually</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Manual Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Title *</label>
          <input
            type="text"
            maxLength={100}
            placeholder="e.g. Nike Air Max 90 White UK9"
            value={item.title}
            onChange={e => updateItem('title', e.target.value)}
            className={fieldClass}
          />
          {fieldError('title')}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Brand *</label>
            <input
              type="text"
              placeholder="e.g. Nike"
              value={item.brand}
              onChange={e => updateItem('brand', e.target.value)}
              className={fieldClass}
            />
            {fieldError('brand')}
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Size *</label>
            <input
              type="text"
              placeholder="e.g. M / UK 10"
              value={item.size}
              onChange={e => updateItem('size', e.target.value)}
              className={fieldClass}
            />
            {fieldError('size')}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Category *</label>
            <select
              value={item.category}
              onChange={e => updateItem('category', e.target.value)}
              className={`${fieldClass} appearance-none cursor-pointer`}
            >
              <option value="">Select…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {fieldError('category')}
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Condition *</label>
            <select
              value={item.condition}
              onChange={e => updateItem('condition', e.target.value)}
              className={`${fieldClass} appearance-none cursor-pointer`}
            >
              <option value="">Select…</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {fieldError('condition')}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Colour</label>
          <input
            type="text"
            placeholder="e.g. White/Grey"
            value={item.color}
            onChange={e => updateItem('color', e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Description</label>
          <textarea
            rows={3}
            placeholder="Describe the item, any flaws, etc."
            value={item.description}
            onChange={e => updateItem('description', e.target.value)}
            className={`${fieldClass} resize-none`}
          />
        </div>
      </div>

      {/* Photos */}
      <div ref={photosRef}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium text-foreground">
            Photos * <span className="text-muted-foreground font-normal">{item.originalPhotos.length} / 10</span>
          </label>
        </div>

        {showValidation && item.originalPhotos.length === 0 && (
          <p className="text-xs text-destructive mb-2">Add at least one photo</p>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2">
          {item.originalPhotos.map((url, i) => (
            <div key={i} className="group relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-surface-sunken border border-border">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => dispatch({ type: 'REMOVE_ORIGINAL_PHOTO', index: i })}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/70 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={11} />
              </button>
            </div>
          ))}

          {item.originalPhotos.length < 10 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <Plus size={20} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Add</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileAdd}
        />
      </div>
    </div>
  );
}

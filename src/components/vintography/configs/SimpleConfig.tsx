interface SimpleConfigProps {
  operation: 'clean_bg' | 'enhance';
}

const CONFIG_MAP = {
  clean_bg: {
    title: "Remove Background",
    description: "AI precisely cuts out your garment and places it on a clean transparent or white background — perfect for marketplace listings.",
    tip: "Works best with solid garments photographed against a contrasting background.",
  },
  enhance: {
    title: "Enhance Photo",
    description: "Automatically adjusts brightness, contrast, sharpness, and colour balance to make your photo look professionally shot.",
    tip: "Applied last in the pipeline for best results.",
  },
};

export function SimpleConfig({ operation }: SimpleConfigProps) {
  const config = CONFIG_MAP[operation] ?? CONFIG_MAP.clean_bg;
  return (
    <div className="px-4 py-5 space-y-3">
      <div>
        <h3 className="text-base font-semibold text-foreground">{config.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{config.description}</p>
      </div>
      <p className="text-xs italic text-muted-foreground/70">💡 {config.tip}</p>
    </div>
  );
}

ALTER TABLE public.vintography_jobs DROP CONSTRAINT IF EXISTS vintography_jobs_operation_check;

ALTER TABLE public.vintography_jobs ADD CONSTRAINT vintography_jobs_operation_check
  CHECK (operation IN ('clean_bg', 'lifestyle_bg', 'enhance', 'decrease', 'flatlay', 'mannequin', 'ai_model', 'ghost_mannequin', 'steam'));
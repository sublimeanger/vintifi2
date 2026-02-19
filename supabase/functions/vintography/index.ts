import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Hyper-optimised fashion-photography prompts ──────────────────────
const QUALITY_MANDATE = `OUTPUT REQUIREMENTS: Deliver the highest possible resolution and quality. The result must be indistinguishable from work by a professional fashion photographer using a full-frame camera with a prime lens. Maintain pixel-level sharpness on fabric textures, stitching, and hardware.`;

const NO_TEXT = `ABSOLUTELY ZERO text, watermarks, labels, captions, annotations, logos, signatures, stamps, or any form of written content anywhere in the image. Not even subtle or blurred text. The image must be completely free of any characters or symbols.`;

const GARMENT_PRESERVE = `GARMENT INTEGRITY (NON-NEGOTIABLE): Preserve every single detail of the garment with forensic accuracy — all logos, prints, embroidery, textures, stitching patterns, buttons, zippers, tags, brand markers, fabric weave, and colour must remain perfectly intact, unaltered, and unobscured. Maintain accurate colour reproduction under the new lighting conditions. DO NOT change the garment type — if the input is a crewneck sweatshirt, it must remain a crewneck sweatshirt. DO NOT add a hood, DO NOT change the neckline, DO NOT alter the silhouette. The garment identity must be preserved exactly. ${NO_TEXT}`;

function buildGarmentContext(garmentContext?: string): string {
  if (!garmentContext || garmentContext.trim().length === 0) return "";
  return `\n\nGARMENT IDENTITY (CRITICAL): The garment in this image is: ${garmentContext.trim()}. You MUST reproduce this EXACT type of garment. DO NOT substitute it with a similar but different garment (e.g., DO NOT turn a crewneck into a hoodie, DO NOT turn a t-shirt into a long-sleeve, DO NOT change the neckline style). The garment type, neckline, sleeve length, and overall silhouette must match the description precisely.\n`;
}

const OPERATION_PROMPTS: Record<string, (params: Record<string, string>) => string> = {
  remove_bg: () =>
    `You are a professional product photographer specialising in e-commerce fashion imagery. Remove the background from this clothing/fashion item photo completely and replace it with a clean, pure white background (#FFFFFF).

EDGE QUALITY: Produce crisp, anti-aliased edges around the entire garment silhouette. Pay special attention to:
- Semi-transparent fabrics (chiffon, organza, mesh) — preserve their translucency against white
- Fur, faux fur, and fuzzy textures — maintain individual fibre detail at the boundary, no jagged cutouts
- Lace, crochet, and openwork — preserve every hole and gap in the pattern, showing white through them
- Fine details like loose threads, frayed denim, and delicate trims

SHADOW: Preserve a subtle, natural fabric shadow directly beneath the garment on the white background. The shadow should be soft, diffused, and grounded — as if the item is resting on a white surface under soft studio lighting. No harsh or directional shadows.

LIGHTING: Apply clean, even, professional studio lighting. No colour cast. Neutral white balance (5500K). Even exposure across the entire garment.

${GARMENT_PRESERVE}
${QUALITY_MANDATE}`,

  smart_bg: (p) => {
    const style = p?.bg_style || "studio_white";
    const styles: Record<string, string> = {
      studio_white: "a professional photography studio with a pure white seamless paper sweep backdrop, illuminated with two large softboxes from 45° camera-left and camera-right creating perfectly even, shadowless lighting. The background transitions smoothly from white at the top to barely-off-white at the floor. Professional e-commerce quality — think ASOS or Net-a-Porter",
      studio_grey: "a smooth mid-grey gradient studio backdrop, transitioning from charcoal at the outer edges to lighter grey at the centre. Professional three-point lighting: key light camera-left, fill camera-right, rim light from above-behind creating a subtle halo effect on the garment. Dramatic but refined — editorial fashion quality",
      marble_luxury: "an elegant white Carrara marble surface with delicate grey and gold veining. Soft overhead lighting with a single key light camera-left creating refined directional shadows. The marble veining is visible but secondary to the garment. Luxury fashion e-commerce aesthetic — think Bottega Veneta or The Row campaign",
      linen_flat: "a soft natural Belgian linen fabric surface with gentle organic weave texture and subtle warm-toned creases. Warm side-lighting from camera-left creating soft shadow in the linen fibres. Warm neutral colour temperature (4000K). Organic, tactile, artisan lifestyle feel — think Kinfolk magazine",
      living_room_sofa: "a beautifully styled contemporary living room — a neutral stone-coloured sofa visible in soft focus behind the garment, a healthy monstera plant catching afternoon light, and warm blonde oak wood flooring. Late afternoon golden hour sunlight streaming through unseen windows from camera-right. Aspirational but achievable home lifestyle setting",
      bedroom_mirror: "a stylish bedroom with a full-length standing mirror against a neutral wall. Soft morning light from a large window (camera-left) creates a warm, flattering glow. The bed with crisp white linen is softly visible in the mirror reflection. Aspirational, morning-routine lifestyle feel",
      kitchen_counter: "a beautiful kitchen counter scene — white marble countertop, a French press coffee, a croissant, fresh flowers in a small vase. Soft, bright Sunday morning window light. Clean and aspirational — brunch aesthetic",
      dressing_room: "a stylish personal dressing room with a clothing rail of curated garments visible softly in the background, a full-length mirror, and warm Edison bulb lighting from above. Aspirational 'walk-in wardrobe' energy. Warm, golden-toned ambient light",
      golden_hour_park: "a beautiful park setting captured at golden hour (last 30 minutes before sunset). Lush green foliage in the background rendered as creamy circular bokeh (f/2.0 equivalent). Warm amber-gold rim light from camera-right kissing the garment edges. Long soft shadows. The most flattering light in nature",
      city_street: "a contemporary urban street — blurred city architecture and pedestrian life in the background (f/2.0 bokeh depth of field). Natural overcast daylight (the best street photography light — even, shadow-free). Authentic street-style editorial feel",
      beach_summer: "a bright summer beach setting — soft, sun-bleached golden sand surface. Turquoise and cerulean ocean visible as beautiful soft bokeh in the far background. Bright, direct summer sunlight slightly diffused by thin cloud",
      brick_wall: "an exposed red-brown brick wall backdrop with authentic texture, character, and patina. Warm directional tungsten-style accent lighting from camera-left. Industrial-chic editorial",
      autumn_leaves: "a rich autumnal outdoor setting — scattered golden, amber, and russet fallen oak leaves covering the ground surface. Warm ambient light creating soft, shadow-free, evenly diffused illumination. Cozy seasonal atmosphere",
    };
    return `You are an editorial fashion photographer creating lifestyle product imagery. Take this clothing item and place it naturally into the following scene: ${styles[style] || styles.studio_white}.

DEPTH OF FIELD: The garment must be tack-sharp with the background showing natural photographic bokeh (as if shot at f/2.8 on a 50mm lens). The transition from sharp garment to blurred background should be smooth and natural.

SHADOW & LIGHT: Cast a realistic soft shadow beneath/behind the garment that is consistent with the scene's primary light source direction. The shadow should ground the garment in the scene convincingly. Adjust the garment's white balance and colour temperature to match the scene's ambient light.

COMPOSITION: The garment should be the clear hero of the image, positioned with intentional negative space. Professional editorial composition following the rule of thirds.

${GARMENT_PRESERVE}${buildGarmentContext(p?.garment_context)}
${QUALITY_MANDATE}`;
  },

  model_shot: (p) => {
    const gender = p?.gender || "female";
    const pose = p?.pose || "standing_front";
    const look = p?.model_look || "classic";
    const bg = p?.model_bg || "studio";
    const shotStyle = p?.shot_style || "editorial";
    const fullBody = p?.full_body !== "false";

    const looks: Record<string, string> = {
      classic: "clean-cut, approachable, commercial model look. Natural makeup, healthy glowing skin, friendly but composed expression. Think Cos or Uniqlo campaign",
      editorial: "high-fashion editorial presence. Striking bone structure, confident gaze, minimal but precise makeup. Magazine-cover energy. Think Vogue or i-D",
      streetwear: "urban streetwear aesthetic. Relaxed confident attitude, contemporary casual styling. Subtle edge, authentic personality. Think END. or SSENSE lookbook",
      athletic: "fit, athletic build with visible muscle tone. Sporty, energetic presence. Healthy, active lifestyle feel. Think Nike or Adidas campaign",
      mature: "sophisticated 35-45 year old model. Refined, elegant appearance. Subtle distinguished features. Think Loro Piana or Max Mara",
      youthful: "fresh-faced 18-25 year old. Vibrant, trend-forward energy. Natural beauty with minimal makeup. Think ASOS or Zara campaign",
    };

    const poses: Record<string, string> = {
      standing_front: "standing facing camera directly, weight slightly on one hip for a natural S-curve, arms relaxed at sides with fingers gently curved. Chin slightly lifted",
      standing_angled: "standing at a flattering 3/4 angle to camera, one shoulder slightly forward creating depth. Head turned to engage with camera. One arm slightly bent",
      walking: "captured mid-stride walking naturally toward camera, one foot ahead. Arms in natural walking motion. Dynamic yet controlled movement",
      casual_leaning: "casually leaning against a wall or surface at a slight angle, one foot crossed. Relaxed, approachable body language. One hand in pocket or resting naturally",
      seated: "seated on a high stool, one foot on a rung. Relaxed posture with good spine alignment, looking at camera with warm expression",
      action: "dynamic action pose — a confident turn or step with natural movement energy. Fabric flowing with the motion. Engaging, editorial energy",
    };

    const bgs: Record<string, string> = {
      studio: "clean white studio backdrop (seamless paper sweep) with professional three-point softbox lighting",
      grey_gradient: "smooth mid-grey gradient studio backdrop. Professional fashion photography lighting",
      urban: "urban street setting with blurred architectural elements (f/2.0 bokeh). Natural daylight. Authentic street-style feel",
      park: "outdoor park setting with soft green foliage bokeh. Golden-hour lighting creating warm rim light",
      brick: "exposed red-brown brick wall backdrop with character. Warm tungsten-style accent lighting. Industrial-chic",
      living_room: "beautifully styled living room — neutral stone sofa, monstera plant, afternoon golden light. Aspirational home lifestyle",
      city_street: "contemporary urban street with blurred architecture (f/2.0 bokeh). Overcast natural daylight",
      golden_park: "park at golden hour — lush green foliage as creamy circular bokeh, warm amber rim light",
      beach: "summer beach — soft-focus turquoise ocean bokeh in background, bright summer sunlight",
      dressing_room: "personal dressing room with clothing rail, full-length mirror, warm Edison bulb lighting. Aspirational walk-in wardrobe energy",
    };

    const shotStyleMandates: Record<string, string> = {
      editorial: "SHOT STYLE: Clean, professional editorial photography. Perfect studio or location lighting. Every element intentional and composed. Think a high-end fashion campaign — polished, aspirational, precise.",
      natural_photo: "PHOTOREALISM MANDATE: This image must be completely indistinguishable from a real photograph. Natural light physics. Real environment textures. Authentic depth of field. ABSOLUTELY NO studio compositing artefacts. The model should look like they genuinely exist in this environment.",
      street_style: "STREET STYLE MANDATE: Authentic street photography energy. Candid, slightly imperfect framing that feels real. Natural pose. Urban environment with authentic depth. Overcast or golden-hour natural light — no flash, no studio fill.",
    };

    const fullBodyMandate = fullBody
      ? `\nCOMPOSITION (NON-NEGOTIABLE): The model must be framed head-to-toe. The COMPLETE garment from neckline to bottom hem must be fully visible in the frame. NEVER crop the garment — not at the hem, not at the sleeves, not at the neckline. Leave deliberate negative space below the hem and above the head.\n`
      : "";

    const garmentCtx = p?.garment_context ? `\n\nGARMENT IDENTITY (CRITICAL — READ BEFORE GENERATING): The garment is: ${p.garment_context}. Generate this EXACT garment type. DO NOT substitute with any other garment type. DO NOT add a hood. DO NOT change the neckline.\n` : "";

    return `You are a world-class fashion photographer. Create a photo-realistic image of a ${gender} model wearing this exact garment.
${garmentCtx}
${shotStyleMandates[shotStyle] || shotStyleMandates.editorial}
${fullBodyMandate}
MODEL REQUIREMENTS:
- Body: Natural, healthy proportions appropriate for the garment's size. Realistic body type — not exaggerated or idealised.
- Skin: Photo-realistic skin texture with natural pores, subtle imperfections, and realistic subsurface scattering. ABSOLUTELY NO plastic, waxy, AI-smoothed, or airbrushed skin.
- Hands: Exactly 5 fingers per hand — count them. Natural proportions, relaxed. No extra fingers, no merged fingers, no missing fingers.
- Face: ${looks[look] || looks.classic}. Natural expression — no uncanny valley. Eyes must have realistic catchlights.
- Pose: ${poses[pose] || poses.standing_front}

GARMENT FIT:
- The garment must show realistic fabric physics — natural gravity, proper drape based on fabric weight, visible tension at shoulders and closures, natural wrinkles at elbows and waist. Fabric must react to the pose realistically.
- Sizing looks correct for the model — not too tight, not too loose.

CAMERA SIMULATION:
- Shot on a full-frame camera with a 50mm f/1.8 lens at approximately 6-8 feet distance.
- Background: ${bgs[bg] || bgs.studio}
- Sharp focus on the garment and model's face, with natural depth-of-field falloff into the background.

${GARMENT_PRESERVE}
${QUALITY_MANDATE}`;
  },

  mannequin_shot: (p) => {
    const mannequinType = p?.mannequin_type || "headless";
    const bg = p?.model_bg || "studio";
    const lighting = p?.lighting_style || "soft_studio";

    const types: Record<string, string> = {
      headless: "a professional retail display mannequin — sleek, matte white/light grey, headless (no head or neck whatsoever), with realistic torso, arms, and legs proportioned for an adult. The mannequin should look like a high-end boutique display fixture.",
      ghost: "an invisible/ghost mannequin effect. The garment should appear to float in perfect 3D shape as if worn by an invisible person. Fill the interior of the garment at necklines, sleeve openings, and waistbands with realistic fabric continuation. The result should be indistinguishable from premium e-commerce imagery.",
      dress_form: "a traditional tailor's dress form / seamstress dummy — fabric-covered in natural linen or canvas colour, with visible topstitching and adjustment seams. Mounted on a simple elegant black iron stand. The form should look authentic and artisanal.",
      half_body: "a professional waist-up half-body retail display mannequin — headless (no head or neck), matte white finish, realistic torso and arm proportions to just below the hips. Ideal for displaying tops, jackets, shirts, and knitwear.",
    };

    const lightings: Record<string, string> = {
      soft_studio: "perfectly even wraparound studio lighting with two large softboxes positioned camera-left and camera-right at 45° angles. No harsh shadows anywhere on the garment. Clean, bright, professional e-commerce product lighting. White balance 5500K.",
      dramatic: "a single strong key light from 45° camera-left creating defined, dramatic shadows that give the garment real dimension, depth, and texture. A weak fill light at 1/4 the key power from camera-right prevents pure black shadows.",
      natural: "warm, soft window-simulated natural light from camera-left. The light has the quality of afternoon sun filtered through a sheer linen curtain — directional but beautifully diffused. Warm colour temperature (4000K).",
    };

    const bgs: Record<string, string> = {
      studio: "a professional photography studio with a pure white seamless paper sweep backdrop",
      grey_gradient: "a smooth mid-grey gradient studio backdrop, transitioning from darker grey at the edges to lighter grey at centre",
      living_room: "a beautifully styled contemporary living room — neutral stone-coloured sofa softly visible in the background, a healthy plant catching ambient light. Aspirational lifestyle setting",
      dressing_room: "a stylish personal dressing room with a clothing rail of curated garments softly visible in the background, warm Edison bulb lighting from above",
      brick: "an exposed red-brown brick wall backdrop with authentic texture and character. Warm tungsten-style accent lighting",
      flat_marble: "an elegant white Carrara marble surface with delicate grey veining, shot from a slightly elevated angle. Soft overhead lighting. Luxury fashion aesthetic",
    };

    const compositionMandates: Record<string, string> = {
      headless: `HEADLESS MANNEQUIN COMPOSITION (NON-NEGOTIABLE):
- The mannequin MUST be completely headless — the torso begins at the shoulder line with a clean, flat horizontal cut. Absolutely NO head, NO neck stub, NO partial skull.
- Frame the shot so the FULL mannequin from the shoulder cut-line down to the base/feet is fully visible — nothing cropped.
- The mannequin must face the camera squarely — front-on, zero rotation.
- Centre the mannequin in the frame with equal breathing room on left and right sides.`,
      ghost: `GHOST MANNEQUIN — TWO-STAGE PROCESS:
STAGE 1: Mentally extract and isolate the garment from the original photo context, removing any background, person, hanger, or support.
STAGE 2: Render the isolated garment floating in perfect 3D shape as if worn by a person who has been made COMPLETELY INVISIBLE.

GHOST MANNEQUIN TECHNICAL REQUIREMENTS (each point is mandatory):
- The garment MUST hold its full 3D shape and volume exactly as it would when worn on a real body.
- NECKLINE: Fill the neck opening with a realistic view of the garment's interior — inner collar, any visible label, and clean fabric continuation.
- SLEEVE OPENINGS: Fill each sleeve opening with a short realistic view of the sleeve interior fabric.
- ABSOLUTELY NO visible support structures, NO hanger wire, NO mannequin form, NO stand, NO clips.
- The garment must appear completely self-supporting and three-dimensional.
- Cast a soft, diffused shadow directly beneath the garment to ground it.`,
      dress_form: `DRESS FORM COMPOSITION:
- The full dress form from shoulder to base stand must be visible — nothing cropped.
- The form faces the camera squarely, centred in frame.
- The stand and base must be visible below the form.`,
      half_body: `HALF-BODY MANNEQUIN COMPOSITION:
- Frame waist-up: show the mannequin from just below the hips to the shoulder cut-line (headless).
- The full garment from neckline to hem must be visible — nothing cropped.
- The mannequin faces camera squarely, centred in frame.`,
    };

    return `You are a professional e-commerce product photographer. Display this clothing/fashion garment on ${types[mannequinType]}.

STEP 1 — GARMENT EXTRACTION: First, mentally isolate the garment from the original photo context. Identify every detail: colour, texture, brand marks, buttons, zippers, seams, silhouette.

STEP 2 — MANNEQUIN PLACEMENT: Place the extracted garment onto the mannequin form. The garment must fit the mannequin naturally with realistic fabric physics.

${compositionMandates[mannequinType] || ""}

GARMENT DISPLAY (NON-NEGOTIABLE):
- The garment must be positioned perfectly centred on the mannequin with completely natural fabric drape and realistic weight
- Show the COMPLETE garment from neckline to bottom hem — NEVER crop the garment at any edge
- Fabric must show natural gravity, proper drape based on fabric weight and construction, and realistic wrinkle physics
- All buttons, zippers, and closures should be in their natural wearing position
- The garment must fill the mannequin form convincingly — not baggy or ill-fitting

LIGHTING: ${lightings[lighting] || lightings.soft_studio}

BACKGROUND: ${bgs[bg] || bgs.studio}

SHADOW: Cast a realistic, soft shadow beneath the mannequin/garment that grounds it convincingly in the scene. The shadow direction must be consistent with the lighting setup.

${GARMENT_PRESERVE}
${QUALITY_MANDATE}`;
  },

  ghost_mannequin: () =>
    `Apply a professional ghost mannequin / invisible mannequin effect to this clothing photo. Remove any visible mannequin, hanger, or dress form so the garment appears to float naturally in a 3D shape as if worn by an invisible person.

CRITICAL DETAILS:
- Maintain the garment's natural shape, volume, and 3D structure throughout
- Fill in any gaps where the mannequin was visible (neckline, sleeve openings, waistband) with realistic fabric continuation showing the garment's interior or clean white background
- Inner collar labels and interior fabric should be visible where naturally expected
- Clean, pure white background (#FFFFFF) with a subtle grounding shadow beneath
- The result should match the quality standard of ASOS or Net-a-Porter product imagery

${GARMENT_PRESERVE}
${QUALITY_MANDATE}`,

  flatlay_style: (p) => {
    const style = p?.flatlay_style || "minimal_white";
    const styles: Record<string, string> = {
      minimal_white: "Clean minimal flat-lay styling. Neatly arrange the garment with intentional, clean folds showing the garment's best features. Pure white background (#FFFFFF). Subtle natural drop shadow beneath. No props — let the garment speak. Shot from directly overhead with even, perfectly diffused softbox lighting. Professional e-commerce quality.",
      styled_accessories: "Styled editorial flat-lay with carefully curated complementary accessories — add tasteful items like designer sunglasses, a leather watch strap, quality leather wallet, or a structured belt arranged with intentional spacing following the golden ratio. Maintain generous breathing room around the garment. Soft natural shadows. Light neutral linen or white background. Magazine-quality styling.",
      seasonal_props: "Seasonal themed flat-lay with contextual natural elements. For spring/summer: fresh flowers, green eucalyptus sprigs, and dried citrus slices. Autumn: scattered golden oak leaves, acorns, and warm-toned dried botanicals. The garment remains the clear hero — seasonal elements frame it with restraint. Warm, inviting overhead composition with soft diffused lighting.",
      denim_denim: "Flat-lay on a rich indigo denim fabric background — the texture of the denim surface creates a complementary backdrop that contrasts beautifully with the garment. Shot from directly overhead with even lighting that shows both the garment detail and the textured denim surface beneath.",
      wood_grain: "Flat-lay on a warm honey-toned oak wood surface photographed directly from above. The wood grain creates natural texture and warmth in the composition. Even, diffused overhead lighting with soft shadows showing the garment's three-dimensional structure.",
    };
    return `Create a professional overhead flat-lay product photo. ${styles[style] || styles.minimal_white}

Straighten and neaten the garment layout so it looks professionally styled — no accidental creases or messy folds. Every fold should be intentional. Even, diffused overhead lighting with no harsh shadows. Professional product photography for e-commerce and social media.

${GARMENT_PRESERVE}
${QUALITY_MANDATE}`;
  },

  decrease: (p) => {
    const intensity = p?.intensity || "standard";

    const intensities: Record<string, string> = {
      light: "Remove only the most prominent creases — deep fold lines, sharp compression creases from storage, and crumpling wrinkles. Preserve gentle natural drape folds that occur when fabric hangs — these show fabric character. The result should look like the garment was gently hand-pressed.",
      standard: "Remove all storage creases, fold lines, compression wrinkles, and crumpling. Preserve only the structural fabric drape that occurs naturally from gravity. The result should look like the garment was professionally steamed for 60 seconds.",
      deep: "Remove every wrinkle, crease, fold line, and texture distortion caused by storage, folding, handling, or poor presentation. The fabric surface should appear immaculate — as if the garment is brand new, freshly pressed. Preserve fabric texture (weave, knit pattern, cord ridges) but eliminate all deformation of that texture.",
    };

    return `You are a professional fashion retoucher specialising in fabric smoothing for e-commerce photography. Your task is to remove creases, wrinkles, and fold lines from this garment photo.

INTENSITY: ${intensities[intensity] || intensities.standard}

WHAT TO REMOVE — CREASES (eliminate these):
- Sharp fold lines from being stored folded in a drawer or shipped in packaging
- Compression wrinkles from being packed tightly
- Crumpling wrinkles across the body of the fabric
- Horizontal banding wrinkles across chest/sleeves from hanging or folding
- Packing creases — the very defined lines from cardboard fold points
- Any fabric deformation caused by poor storage, handling, or transit

WHAT TO KEEP — NATURAL FABRIC BEHAVIOUR (preserve these):
- The garment's overall silhouette and shape — do NOT change how the garment looks
- Natural gravitational drape — the gentle curves of fabric as it hangs or is laid flat
- Fabric texture: weave patterns, knit structure, corduroy ridges, denim twill lines — these are texture, not creases
- Intentional design elements: pleats, gathers, ruched seams, smocking, or fabric tucks that are part of the garment's design
- The accurate colour and shading of the fabric — do NOT bleach or overexpose
- Any deliberate faded or distressed areas (important for denim/vintage)

RETOUCHING TECHNIQUE:
- Work methodically across the fabric surface — chest first, then sleeves, then body
- Smooth fabric by "filling in" the crease valleys to match the surrounding fabric height and texture
- Maintain consistent fabric texture across previously creased areas
- Preserve natural lighting falloff across the garment — do NOT flatten the lighting or create an artificial airbrushed look

BACKGROUND: Leave the background completely unchanged — only edit the garment itself
GARMENT IDENTITY: The garment type, colour, brand marks, logos, prints, fit, and silhouette must remain 100% identical to the original. Only the fabric surface texture (crease removal) changes.

${GARMENT_PRESERVE}
${QUALITY_MANDATE}`;
  },

  enhance: () =>
    `You are a professional retoucher enhancing this clothing/fashion product photo for premium e-commerce. Apply the following corrections while keeping the original background and composition exactly the same:

LIGHTING & EXPOSURE:
- Correct white balance to neutral (5500K daylight standard) — remove any colour casts
- Even out exposure — recover detail in shadows and highlights without clipping
- Add clean, professional-quality fill lighting to eliminate any unflattering shadows on the garment

SHARPNESS & DETAIL:
- Apply intelligent sharpening to enhance fabric texture, stitching detail, and garment structure
- Micro-contrast enhancement to make fabric textures pop — you should be able to see the weave
- Reduce noise and graininess while preserving fine detail (smart noise reduction, not blur)

COLOUR:
- Boost colour vibrancy and saturation subtly while keeping colours accurate and true-to-life
- Ensure consistent colour temperature across the entire image
- Colours should look rich and appealing but never oversaturated or artificial

The final result should look like it was shot by a professional photographer with a proper lighting setup, even if the original was taken on a phone.

${GARMENT_PRESERVE}
${QUALITY_MANDATE}`,
};

// Model map: operation → AI model
// Operation name mapping: new spec names → prompt keys
const OPERATION_MAP: Record<string, string> = {
  clean_bg: "remove_bg",
  lifestyle_bg: "smart_bg",
  flatlay: "flatlay_style",
  mannequin: "mannequin_shot",
  ghost_mannequin: "ghost_mannequin",
  ai_model: "model_shot",
  enhance: "enhance",
  decrease: "decrease",
};

const MODEL_MAP: Record<string, string> = {
  remove_bg: "google/gemini-2.5-flash-image",
  smart_bg: "google/gemini-2.5-flash-image",
  model_shot: "google/gemini-3-pro-image-preview",
  mannequin_shot: "google/gemini-2.5-flash-image",
  ghost_mannequin: "google/gemini-2.5-flash-image",
  flatlay_style: "google/gemini-2.5-flash-image",
  enhance: "google/gemini-2.5-flash-image",
  decrease: "google/gemini-2.5-flash-image",
};

// Credits cost per operation
const CREDIT_COST: Record<string, number> = {
  ai_model: 4,
};

// Tier-gated operations (using new spec names)
const TIER_OPERATIONS: Record<string, string[]> = {
  free: ["clean_bg", "enhance", "decrease"],
  pro: ["clean_bg", "enhance", "decrease", "lifestyle_bg", "flatlay", "ai_model", "mannequin"],
  business: ["clean_bg", "enhance", "decrease", "lifestyle_bg", "ai_model", "mannequin", "ghost_mannequin", "flatlay"],
  scale: ["clean_bg", "enhance", "decrease", "lifestyle_bg", "ai_model", "mannequin", "ghost_mannequin", "flatlay"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ success: false, error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    // Accept both old field names (imageUrl) and new (image_url)
    const imageUrl: string = body.imageUrl || body.image_url;
    const operation: string = body.operation;
    const params: Record<string, string> = body.params || body.parameters || {};
    const garmentContext: string = body.garment_context || params.garment_context || "";
    const sellWizard: boolean = body.sell_wizard || body.sellWizard || false;
    const pipelineId: string | undefined = body.pipeline_id;
    const pipelineStep: number | undefined = body.pipeline_step;

    if (!imageUrl || !operation) {
      return new Response(JSON.stringify({ success: false, error: "imageUrl and operation are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map new spec operation names to prompt keys
    const promptKey = OPERATION_MAP[operation] || operation;
    if (!OPERATION_PROMPTS[promptKey]) {
      return new Response(JSON.stringify({ success: false, error: `Invalid operation: ${operation}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user profile for tier + credits
    const { data: profile } = await adminClient
      .from("profiles")
      .select("subscription_tier, credits_balance, first_item_pass_used")
      .eq("id", user.id)
      .single();

    const tier = profile?.subscription_tier || "free";
    const allowedOps = TIER_OPERATIONS[tier] || TIER_OPERATIONS.free;

    if (!allowedOps.includes(operation)) {
      return new Response(
        JSON.stringify({ success: false, error: `${operation} requires a higher subscription plan. You're on ${tier}.` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creditsToDeduct = CREDIT_COST[operation] ?? 1;

    // First-item-free pass check (not applicable to ai_model — too expensive)
    let useFirstItemPass = false;
    if (sellWizard && operation !== "ai_model" && profile?.first_item_pass_used === false) {
      useFirstItemPass = true;
      console.log(`[first-item-pass] User ${user.id} — skipping credit deduction for ${operation}`);
    }

    // Deduct credits (atomic via RPC)
    if (!useFirstItemPass) {
      const { data: deductResult } = await adminClient.rpc("deduct_credits", {
        p_user_id: user.id,
        p_amount: creditsToDeduct,
        p_operation: operation,
        p_description: `Vintography: ${operation}`,
      });

      if (!deductResult?.success) {
        const msg = operation === "ai_model"
          ? `AI Model shots cost 4 credits. ${deductResult?.error || "Insufficient credits"}`
          : deductResult?.error || "Insufficient credits";
        return new Response(
          JSON.stringify({ success: false, error: msg }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create job row
    const { data: job, error: jobError } = await adminClient
      .from("vintography_jobs")
      .insert({
        user_id: user.id,
        original_image_url: imageUrl,
        operation,
        params: params as any,
        status: "processing",
        credits_cost: useFirstItemPass ? 0 : creditsToDeduct,
        first_item_free: useFirstItemPass,
        pipeline_id: pipelineId ?? null,
        pipeline_step: pipelineStep ?? null,
      })
      .select("id")
      .single();

    if (jobError) {
      console.error("Job creation error:", jobError);
      return new Response(JSON.stringify({ success: false, error: "Failed to create job" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const model = MODEL_MAP[promptKey];
    const enrichedParams = { ...params, garment_context: garmentContext };
    const prompt = OPERATION_PROMPTS[promptKey](enrichedParams);

    console.log(`[vintography] ${operation} (${promptKey}) → model ${model} for user ${user.id}`);

    const startTime = Date.now();
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      await adminClient
        .from("vintography_jobs")
        .update({ status: "failed", error_message: `AI error: ${aiResponse.status}` })
        .eq("id", job.id);

      const httpStatus = aiResponse.status === 429 ? 429 : aiResponse.status === 402 ? 402 : 500;
      const msg =
        httpStatus === 429
          ? "Rate limit exceeded — please try again shortly."
          : httpStatus === 402
          ? "AI processing credits exhausted. Please add funds to your workspace."
          : "AI processing failed. Please try again.";

      return new Response(JSON.stringify({ success: false, error: msg }), {
        status: httpStatus,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const imageResult: string | undefined = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageResult) {
      await adminClient
        .from("vintography_jobs")
        .update({ status: "failed", error_message: "No image returned by AI" })
        .eq("id", job.id);

      return new Response(JSON.stringify({ success: false, error: "AI did not return an image. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upload result to vintography-results bucket
    const base64Data = imageResult.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const filePath = `${user.id}/${job.id}.png`;

    const { error: uploadError } = await adminClient.storage
      .from("vintography-results")
      .upload(filePath, binaryData, { contentType: "image/png", upsert: true });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      await adminClient
        .from("vintography_jobs")
        .update({ status: "failed", error_message: "Storage upload failed" })
        .eq("id", job.id);

      return new Response(JSON.stringify({ success: false, error: "Failed to save processed image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: publicUrlData } = adminClient.storage
      .from("vintography-results")
      .getPublicUrl(filePath);

    const processingTimeMs = Date.now() - startTime;

    // Update job to completed
    await adminClient
      .from("vintography_jobs")
      .update({
        status: "completed",
        result_image_url: publicUrlData.publicUrl,
        processing_time_ms: processingTimeMs,
      })
      .eq("id", job.id);

    // Mark first-item-free pass as used
    if (useFirstItemPass) {
      await adminClient
        .from("profiles")
        .update({ first_item_pass_used: true })
        .eq("id", user.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        resultUrl: publicUrlData.publicUrl,
        jobId: job.id,
        creditsUsed: useFirstItemPass ? 0 : creditsToDeduct,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[vintography] Unhandled error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

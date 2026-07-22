"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Shuffle,
  Sparkles,
  Eye,
  Layers,
  Boxes,
  Ratio,
  FileText,
  Braces,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const RANDOM_SUBJECTS = [
  "coffee cup",
  "desk lamp",
  "sports car",
  "vintage camera",
  "wireless headphones",
  "potted succulent",
  "running shoe",
  "alarm clock",
  "gaming controller",
  "espresso machine",
  "backpack",
  "smart speaker",
  "sunglasses",
  "electric guitar",
  "wristwatch",
  "hot air balloon",
  "treasure chest",
  "rubber duck",
  "paper airplane",
  "ice cream cone",
  "vinyl record player",
  "mechanical keyboard",
  "toolbox",
  "birthday cake",
  "rocket ship",
  "slice of toast",
  "jar of jam",
  "avocado",
  "fried egg",
  "teapot",
];

type Option<T extends string> = {
  value: T;
  label: string;
  hint: string;
};

const PERSPECTIVES = [
  {
    value: "front",
    label: "Front View",
    hint: "Straight-on, symmetrical",
    prompt: "Straight-on front view",
    token: "Front view, straight-on",
  },
  {
    value: "three-quarter",
    label: "Slight 3/4 Angle",
    hint: "Classic hero angle",
    prompt: "Slight 3/4 angle perspective",
    token: "Slight 3/4 angle",
  },
  {
    value: "top-down",
    label: "Top Down",
    hint: "Flat-lay from above",
    prompt: "Top-down bird's-eye view",
    token: "Top-down",
  },
] as const;

const MATERIALS = [
  {
    value: "gloss",
    label: "High-Gloss / Metallic",
    hint: "Reflective & premium",
    prompt: "high-gloss polished metallic",
    token: "High-gloss metallic",
  },
  {
    value: "matte",
    label: "Matte Plastic / Soft-Touch",
    hint: "Muted, tactile plastic",
    prompt: "matte soft-touch plastic",
    token: "Matte soft-touch plastic",
  },
  {
    value: "glass",
    label: "Glass / Translucent",
    hint: "Frosted & light-catching",
    prompt: "translucent frosted glass",
    token: "Translucent glass",
  },
  {
    value: "natural",
    label: "Natural / Tactile",
    hint: "Wood, fabric, organic",
    prompt: "natural tactile (wood and fabric)",
    token: "Natural tactile (wood/fabric)",
  },
] as const;

const COMPLEXITIES = [
  {
    value: "single",
    label: "1 Dominant Object",
    hint: "Pure, single hero",
    prompt:
      "A single dominant hero object as the sole focus, clean and uncluttered",
    token: "1 dominant object",
  },
  {
    value: "accent-1",
    label: "Object + 1 Accent",
    hint: "Hero + supporting detail",
    prompt:
      "The dominant hero object accompanied by one small complementary accent element",
    token: "Object + 1 accent",
  },
  {
    value: "accent-2",
    label: "Object + 2 Accents",
    hint: "Hero + richer scene",
    prompt:
      "The dominant hero object accompanied by two small complementary accent elements arranged in a balanced cluster",
    token: "Object + 2 accents",
  },
] as const;

const ASPECT_RATIOS = [
  {
    value: "1:1",
    label: "Square · 1:1",
    hint: "Classic app icon",
    canvas: "1:1 square canvas",
  },
  {
    value: "4:3",
    label: "Landscape · 4:3",
    hint: "Standard wide",
    canvas: "4:3 landscape canvas",
  },
  {
    value: "16:9",
    label: "Wide · 16:9",
    hint: "Cinematic banner",
    canvas: "16:9 widescreen canvas",
  },
  {
    value: "3:4",
    label: "Portrait · 3:4",
    hint: "Tall standard",
    canvas: "3:4 portrait canvas",
  },
  {
    value: "9:16",
    label: "Tall · 9:16",
    hint: "Mobile / story",
    canvas: "9:16 vertical canvas",
  },
] as const;

type PerspectiveValue = (typeof PERSPECTIVES)[number]["value"];
type MaterialValue = (typeof MATERIALS)[number]["value"];
type ComplexityValue = (typeof COMPLEXITIES)[number]["value"];
type AspectRatioValue = (typeof ASPECT_RATIOS)[number]["value"];
type Format = "text" | "json";

/* ------------------------------------------------------------------ */
/* Playful accent palette (full classes so Tailwind keeps them)        */
/* ------------------------------------------------------------------ */

type Accent = {
  emoji: string;
  chip: string; // section badge background
  selectedBg: string; // selected option card background
};

const ACCENTS = {
  butter: { emoji: "🍞", chip: "bg-amber-400", selectedBg: "bg-amber-200" },
  sky: { emoji: "👀", chip: "bg-sky-400", selectedBg: "bg-sky-200" },
  jam: { emoji: "✨", chip: "bg-rose-400", selectedBg: "bg-rose-200" },
  bean: { emoji: "🫘", chip: "bg-emerald-400", selectedBg: "bg-emerald-200" },
  grape: { emoji: "📐", chip: "bg-violet-400", selectedBg: "bg-violet-200" },
} satisfies Record<string, Accent>;

/* ------------------------------------------------------------------ */
/* Prompt generation                                                   */
/* ------------------------------------------------------------------ */

function buildTextPrompt(
  subject: string,
  perspective: (typeof PERSPECTIVES)[number],
  material: (typeof MATERIALS)[number],
  complexity: (typeof COMPLEXITIES)[number],
  aspectRatio: (typeof ASPECT_RATIOS)[number]
) {
  const subj = subject.trim() || "a single object";
  return `3D skeuomorphic icon of ${subj}, modern Airbnb Lava interface design style. ${perspective.prompt}, featuring ${material.prompt} materials, rich specular reflections, crisp specular highlights, soft studio lighting, and a soft subtle contact drop shadow directly underneath. ${complexity.prompt}. High-resolution Octane 3D render, ultra-detailed textures, centered composition, isolated on a pure flat white background (#FFFFFF) --ar ${aspectRatio.value} --no dark background, text, borders, complex scenery`;
}

function buildJsonPrompt(
  subject: string,
  perspective: (typeof PERSPECTIVES)[number],
  material: (typeof MATERIALS)[number],
  complexity: (typeof COMPLEXITIES)[number],
  aspectRatio: (typeof ASPECT_RATIOS)[number]
) {
  const obj = {
    subject: subject.trim() || "a single object",
    aesthetic: "Airbnb Lava Modern Skeuomorphism",
    perspective: perspective.token,
    materials: material.token,
    complexity: complexity.token,
    lighting: "Studio key light, specular highlights, soft ambient fill",
    shadow: "Subtle contact drop shadow directly below",
    render: "High-resolution Octane 3D render, ultra-detailed textures",
    aspect_ratio: aspectRatio.value,
    composition: `${aspectRatio.canvas}, centered, isolated`,
    background: "#FFFFFF flat white",
    negative: ["dark background", "text", "borders", "complex scenery"],
  };
  return JSON.stringify(obj, null, 2);
}

/* ------------------------------------------------------------------ */
/* UI primitives                                                       */
/* ------------------------------------------------------------------ */

function OptionCard<T extends string>({
  option,
  selected,
  onSelect,
  accent,
}: {
  option: Option<T> & { label: string; hint: string };
  selected: boolean;
  onSelect: () => void;
  accent: Accent;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={[
        "group relative w-full rounded-2xl border-2 border-black p-4 text-left",
        "transition-all duration-150 ease-out",
        selected
          ? `${accent.selectedBg} shadow-chunky -translate-y-0.5 -rotate-1`
          : "bg-white shadow-[3px_3px_0_0_rgba(0,0,0,0.85)] hover:-translate-y-0.5 hover:rotate-1 hover:shadow-chunky",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-black">
            {option.label}
          </p>
          <p className="mt-0.5 text-xs font-medium text-black/60">
            {option.hint}
          </p>
        </div>
        <span
          className={[
            "mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 border-black transition-all",
            selected
              ? "scale-100 bg-black text-white"
              : "scale-90 bg-white text-transparent group-hover:scale-100",
          ].join(" ")}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
        </span>
      </div>
    </button>
  );
}

function SectionCard({
  accent,
  title,
  subtitle,
  children,
}: {
  accent: Accent;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border-2 border-black bg-white/90 p-5 shadow-chunky-lg backdrop-blur">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`flex h-11 w-11 flex-none items-center justify-center rounded-2xl border-2 border-black text-xl shadow-[2px_2px_0_0_rgba(0,0,0,0.85)] ${accent.chip}`}
        >
          {accent.emoji}
        </span>
        <div>
          <h2 className="text-base font-bold text-black">{title}</h2>
          <p className="text-xs font-medium text-black/60">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [subject, setSubject] = useState("coffee cup");
  const [perspective, setPerspective] = useState<PerspectiveValue>("front");
  const [material, setMaterial] = useState<MaterialValue>("gloss");
  const [complexity, setComplexity] = useState<ComplexityValue>("single");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>("1:1");
  const [format, setFormat] = useState<Format>("text");
  const [copied, setCopied] = useState(false);
  const [spin, setSpin] = useState(false);

  const selectedPerspective = PERSPECTIVES.find((p) => p.value === perspective)!;
  const selectedMaterial = MATERIALS.find((m) => m.value === material)!;
  const selectedComplexity = COMPLEXITIES.find((c) => c.value === complexity)!;
  const selectedAspectRatio = ASPECT_RATIOS.find((a) => a.value === aspectRatio)!;

  const output = useMemo(() => {
    return format === "text"
      ? buildTextPrompt(
          subject,
          selectedPerspective,
          selectedMaterial,
          selectedComplexity,
          selectedAspectRatio
        )
      : buildJsonPrompt(
          subject,
          selectedPerspective,
          selectedMaterial,
          selectedComplexity,
          selectedAspectRatio
        );
  }, [
    subject,
    format,
    selectedPerspective,
    selectedMaterial,
    selectedComplexity,
    selectedAspectRatio,
  ]);

  function randomize() {
    let next = subject;
    while (next === subject && RANDOM_SUBJECTS.length > 1) {
      next = RANDOM_SUBJECTS[Math.floor(Math.random() * RANDOM_SUBJECTS.length)];
    }
    setSubject(next);
    setSpin(true);
    setTimeout(() => setSpin(false), 500);
  }

  async function copyPrompt() {
    const text = output;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for insecure contexts / denied permissions
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.setAttribute("readonly", "");
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Last-resort fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        window.prompt("Copy the prompt below:", text);
      }
    }
  }

  return (
    <main className="relative flex h-screen flex-col overflow-hidden">
      {/* Scrollable content: header + centered controls */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* Header */}
          <header className="mb-8 text-center">
        <div className="mb-5 inline-flex rotate-[-2deg] items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1.5 text-xs font-bold text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.85)]">
          <Sparkles className="h-4 w-4 text-rose-500" />
          fresh AI prompts, served warm
        </div>

        <div className="inline-flex rotate-[-1deg] items-center rounded-[2rem] border-[3px] border-black bg-white px-5 py-3 shadow-chunky-lg sm:px-7 sm:py-4">
          <h1 className="flex flex-wrap items-center justify-center gap-2 text-5xl font-bold tracking-tight text-black sm:text-6xl">
            <span className="animate-float inline-block drop-shadow-[2px_2px_0_rgba(0,0,0,0.85)]">
              🫘
            </span>
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent drop-shadow-[2px_2px_0_rgba(0,0,0,0.9)]">
              beans
            </span>
            <span className="text-black/40 drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)]">
              &amp;
            </span>
            <span className="bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[2px_2px_0_rgba(0,0,0,0.9)]">
              toast
            </span>
            <span className="animate-float inline-block drop-shadow-[2px_2px_0_rgba(0,0,0,0.85)] [animation-delay:1.5s]">
              🍞
            </span>
          </h1>
        </div>

        <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-black/70 sm:text-base">
          A playful little kitchen for cooking up AI image prompts — 3D
          skeuomorphic icons in Airbnb&apos;s tasty{" "}
          <span className="font-bold text-orange-600">Lava</span> design style.
          Pick a subject, dial in the flavour, and copy a ready-to-serve prompt!
        </p>
      </header>

          {/* Controls (centered single column) */}
          <section className="space-y-6 pb-8">
            {/* Subject */}
          <SectionCard
            accent={ACCENTS.butter}
            title="Subject"
            subtitle="What should the icon show?"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. coffee cup, desk lamp, sports car"
                className="w-full rounded-2xl border-2 border-black bg-amber-50 px-4 py-3 text-sm font-semibold text-black shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.08)] outline-none transition-all placeholder:font-medium placeholder:text-black/40 focus:-translate-y-0.5 focus:bg-white focus:shadow-chunky"
              />
              <button
                type="button"
                onClick={randomize}
                className="inline-flex flex-none items-center justify-center gap-2 rounded-2xl border-2 border-black bg-amber-400 px-5 py-3 text-sm font-bold text-black shadow-chunky transition-all hover:-translate-y-0.5 hover:rotate-1 hover:bg-amber-300 active:translate-y-0 active:shadow-[2px_2px_0_0_rgba(0,0,0,0.85)]"
              >
                <Shuffle
                  className={`h-4 w-4 ${spin ? "animate-wiggle" : ""}`}
                />
                Surprise me!
              </button>
            </div>
          </SectionCard>

          {/* Perspective */}
          <SectionCard
            accent={ACCENTS.sky}
            title="Perspective"
            subtitle="Camera angle for the icon"
          >
            <div
              role="radiogroup"
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {PERSPECTIVES.map((o) => (
                <OptionCard
                  key={o.value}
                  option={o}
                  selected={perspective === o.value}
                  onSelect={() => setPerspective(o.value)}
                  accent={ACCENTS.sky}
                />
              ))}
            </div>
          </SectionCard>

          {/* Material */}
          <SectionCard
            accent={ACCENTS.jam}
            title="Primary Material Finish"
            subtitle="Surface texture & shine"
          >
            <div
              role="radiogroup"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {MATERIALS.map((o) => (
                <OptionCard
                  key={o.value}
                  option={o}
                  selected={material === o.value}
                  onSelect={() => setMaterial(o.value)}
                  accent={ACCENTS.jam}
                />
              ))}
            </div>
          </SectionCard>

          {/* Complexity */}
          <SectionCard
            accent={ACCENTS.bean}
            title="Element Complexity"
            subtitle="How busy the plate is"
          >
            <div
              role="radiogroup"
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {COMPLEXITIES.map((o) => (
                <OptionCard
                  key={o.value}
                  option={o}
                  selected={complexity === o.value}
                  onSelect={() => setComplexity(o.value)}
                  accent={ACCENTS.bean}
                />
              ))}
            </div>
          </SectionCard>

          {/* Aspect ratio */}
          <SectionCard
            accent={ACCENTS.grape}
            title="Aspect Ratio"
            subtitle="Canvas shape for the render"
          >
            <div
              role="radiogroup"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {ASPECT_RATIOS.map((o) => (
                <OptionCard
                  key={o.value}
                  option={o}
                  selected={aspectRatio === o.value}
                  onSelect={() => setAspectRatio(o.value)}
                  accent={ACCENTS.grape}
                />
              ))}
            </div>
          </SectionCard>
          </section>

          {/* Footer (inside scroll area) */}
          <footer className="pb-6 text-center text-xs font-semibold text-black/50">
            made with 🫘 &amp; 🍞 · cooking up Airbnb “Lava” skeuomorphic icons
          </footer>
        </div>
      </div>

      {/* Sticky bottom "Copy Prompt" bar */}
      <div className="shrink-0 border-t-2 border-black bg-gradient-to-b from-white to-amber-50 shadow-[0_-8px_28px_rgba(0,0,0,0.12)]">
        {/* little grip handle */}
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-black/15" />

        <div className="mx-auto w-full max-w-4xl px-4 pb-4 pt-3 sm:px-6">
          {/* Info row: label + live selection chips + count + format toggle */}
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-black">
              <span className="text-base">🧾</span> Your Prompt
            </span>

            {/* Live selection chips (desktop) */}
            <div className="hidden items-center gap-1.5 md:flex">
              {[
                selectedPerspective.token,
                selectedMaterial.token,
                `${selectedAspectRatio.value}`,
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-black/25 bg-white px-2.5 py-0.5 text-[10px] font-bold text-black/70"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <span className="hidden text-[11px] font-semibold tabular-nums text-black/40 sm:inline">
                {output.length} chars
              </span>

              {/* Format toggle */}
              <div className="inline-flex rounded-xl border-2 border-black bg-white p-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.85)]">
                <button
                  type="button"
                  onClick={() => setFormat("text")}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all",
                    format === "text"
                      ? "bg-black text-white"
                      : "text-black/50 hover:text-black",
                  ].join(" ")}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("json")}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all",
                    format === "json"
                      ? "bg-black text-white"
                      : "text-black/50 hover:text-black",
                  ].join(" ")}
                >
                  <Braces className="h-3.5 w-3.5" />
                  JSON
                </button>
              </div>
            </div>
          </div>

          {/* Preview + copy */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="relative flex-1">
              <pre
                key={format + output}
                className="animate-pop-in max-h-[96px] overflow-auto rounded-2xl border-2 border-black bg-[#fffaf0] p-3.5 font-mono text-[11px] leading-relaxed text-[#3a2a1a] shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.06)] sm:max-h-[112px]"
              >
                <code
                  className={
                    format === "json" ? "whitespace-pre" : "whitespace-pre-wrap"
                  }
                >
                  {output}
                </code>
              </pre>
              {/* fade hint at the bottom of the scroll box */}
              <div className="pointer-events-none absolute inset-x-0.5 bottom-0.5 h-5 rounded-b-2xl bg-gradient-to-t from-[#fffaf0] to-transparent" />
            </div>

            <button
              type="button"
              onClick={copyPrompt}
              className={[
                "group inline-flex w-full flex-none items-center justify-center gap-2 rounded-2xl border-2 border-black px-5 py-4 text-sm font-extrabold text-black shadow-chunky transition-all duration-150 sm:w-56",
                "hover:-translate-y-0.5 hover:shadow-chunky-lg active:translate-y-0 active:shadow-[2px_2px_0_0_rgba(0,0,0,0.85)]",
                copied ? "bg-emerald-300" : "bg-rose-400 hover:bg-rose-300",
              ].join(" ")}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 animate-wiggle" strokeWidth={3.5} />
                  Copied! Yum 😋
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 transition-transform group-hover:-rotate-6" />
                  Copy Prompt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

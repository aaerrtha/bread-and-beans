"use client";

import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  Check,
  Copy,
  Shuffle,
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

const springSoft = { type: "spring" as const, stiffness: 420, damping: 32 };
const springSnappy = { type: "spring" as const, stiffness: 520, damping: 34 };

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
  index,
}: {
  option: Option<T> & { label: string; hint: string };
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springSoft, delay: reduceMotion ? 0 : 0.04 * index }}
      whileHover={reduceMotion || selected ? undefined : { y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      className="group relative w-full overflow-hidden rounded-[14px] p-3.5 text-left"
    >
      {/* Idle surface */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[14px] bg-[var(--color-surface)]"
        animate={{
          opacity: selected ? 0 : 1,
          boxShadow: selected
            ? "0 0 0 transparent"
            : "0 1px 2px oklch(0.173 0 0 / 0.04), 0 4px 16px oklch(0.173 0 0 / 0.04)",
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Selected fill + glow — fades in place, no slide */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[14px] bg-[var(--color-fg)]"
        initial={false}
        animate={{
          opacity: selected ? 1 : 0,
          scale: selected ? 1 : 0.96,
          boxShadow: selected
            ? "0 0 20px 2px oklch(0.173 0 0 / 0.18), 0 0 40px 4px oklch(0.173 0 0 / 0.08), 0 8px 20px oklch(0.173 0 0 / 0.1)"
            : "0 0 0 transparent",
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <motion.p
            animate={{ color: selected ? "#ffffff" : "oklch(0.173 0 0)" }}
            transition={{ duration: 0.2 }}
            className="truncate text-[13px] font-medium tracking-[-0.01em]"
          >
            {option.label}
          </motion.p>
          <motion.p
            animate={{
              color: selected ? "rgba(255,255,255,0.6)" : "oklch(0.45 0.01 80)",
            }}
            transition={{ duration: 0.2 }}
            className="mt-0.5 text-[11px] leading-snug"
          >
            {option.hint}
          </motion.p>
        </div>

        <motion.span
          animate={{
            backgroundColor: selected ? "#ffffff" : "oklch(0.975 0.005 80)",
            color: selected ? "oklch(0.173 0 0)" : "transparent",
            scale: selected ? 1 : 0.9,
          }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center overflow-hidden rounded-full"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {selected ? (
              <motion.span
                key="check"
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, scale: 0.4, filter: "blur(3px)" }
                }
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, scale: 0.4, filter: "blur(3px)" }
                }
                transition={{ duration: 0.16 }}
                className="flex"
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.span>
      </div>
    </motion.button>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  index,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ ...springSoft, delay: reduceMotion ? 0 : 0.06 + index * 0.05 }}
      className="surface rounded-[20px] p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <motion.span
          whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: -4 }}
          transition={springSoft}
          className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-[var(--color-surface-2)] text-[var(--color-fg)]"
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </motion.span>
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[var(--color-fg)]">
            {title}
          </h2>
          <p className="text-[12px] text-[var(--color-muted)]">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [subject, setSubject] = useState("coffee cup");
  const [perspective, setPerspective] = useState<PerspectiveValue>("front");
  const [material, setMaterial] = useState<MaterialValue>("gloss");
  const [complexity, setComplexity] = useState<ComplexityValue>("single");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>("1:1");
  const [format, setFormat] = useState<Format>("text");
  const [copied, setCopied] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  const selectedPerspective = PERSPECTIVES.find((p) => p.value === perspective)!;
  const selectedMaterial = MATERIALS.find((m) => m.value === material)!;
  const selectedComplexity = COMPLEXITIES.find((c) => c.value === complexity)!;
  const selectedAspectRatio = ASPECT_RATIOS.find((a) => a.value === aspectRatio)!;

  const chips = [
    selectedPerspective.token,
    selectedMaterial.token,
    selectedAspectRatio.value,
  ];

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
    setShuffleKey((k) => k + 1);
  }

  async function copyPrompt() {
    const text = output;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
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
      setTimeout(() => setCopied(false), 1600);
    } catch {
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
        setTimeout(() => setCopied(false), 1600);
      } catch {
        window.prompt("Copy the prompt below:", text);
      }
    }
  }

  return (
    <main className="relative flex h-screen flex-col overflow-hidden">
      <div className="quiet-scroll flex-1 overflow-y-auto px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="mx-auto w-full max-w-2xl">
          {/* Header — staggered enter */}
          <header className="mb-10">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springSoft, delay: 0 }}
              className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]"
            >
              Airbnb Lava · Prompt Generator
            </motion.p>
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ ...springSoft, delay: 0.04 }}
              className="font-serif text-[42px] leading-[1.05] tracking-[-0.03em] text-[var(--color-fg)] sm:text-[52px]"
            >
              bread<span className="text-[var(--color-muted)]">&amp;</span>beans
            </motion.h1>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springSoft, delay: 0.08 }}
              className="mt-3 max-w-md text-[14px] leading-relaxed text-[var(--color-muted)] sm:text-[15px]"
            >
              Craft precise AI image prompts for 3D skeuomorphic icons. Dial in
              perspective, material, and composition — then copy a ready-to-use
              prompt.
            </motion.p>
          </header>

          <div className="space-y-3.5 pb-8">
            <Section
              icon={Shuffle}
              title="Subject"
              subtitle="What should the icon depict?"
              index={0}
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. coffee cup, desk lamp, sports car"
                    className="surface-inset w-full rounded-[12px] px-3.5 py-2.5 text-[13px] text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)]/60"
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={randomize}
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  className="inline-flex flex-none items-center justify-center gap-2 rounded-[12px] bg-[var(--color-fg)] px-4 py-2.5 text-[13px] font-medium text-white"
                >
                  <motion.span
                    key={shuffleKey}
                    initial={reduceMotion ? false : { rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="flex"
                  >
                    <Shuffle className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </motion.span>
                  Randomize
                </motion.button>
              </div>
            </Section>

            <Section
              icon={Eye}
              title="Perspective"
              subtitle="Camera angle for the icon"
              index={1}
            >
              <div
                role="radiogroup"
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                {PERSPECTIVES.map((o, i) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={perspective === o.value}
                    onSelect={() => setPerspective(o.value)}
                    index={i}
                  />
                ))}
              </div>
            </Section>

            <Section
              icon={Layers}
              title="Primary Material Finish"
              subtitle="Surface texture and reflectivity"
              index={2}
            >
              <div
                role="radiogroup"
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {MATERIALS.map((o, i) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={material === o.value}
                    onSelect={() => setMaterial(o.value)}
                    index={i}
                  />
                ))}
              </div>
            </Section>

            <Section
              icon={Boxes}
              title="Element Complexity"
              subtitle="How busy the composition is"
              index={3}
            >
              <div
                role="radiogroup"
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                {COMPLEXITIES.map((o, i) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={complexity === o.value}
                    onSelect={() => setComplexity(o.value)}
                    index={i}
                  />
                ))}
              </div>
            </Section>

            <Section
              icon={Ratio}
              title="Aspect Ratio"
              subtitle="Canvas shape for the render"
              index={4}
            >
              <div
                role="radiogroup"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {ASPECT_RATIOS.map((o, i) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={aspectRatio === o.value}
                    onSelect={() => setAspectRatio(o.value)}
                    index={i}
                  />
                ))}
              </div>
            </Section>
          </div>

          <footer className="pb-6 text-center text-[11px] text-[var(--color-muted)]">
            bread&amp;beans · Airbnb Lava skeuomorphic prompts
          </footer>
        </div>
      </div>

      {/* Sticky bottom prompt bar */}
      <motion.div
        initial={reduceMotion ? false : { y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...springSoft, delay: 0.2 }}
        className="shrink-0 bg-[var(--color-surface)]/90 shadow-[0_-8px_32px_oklch(0.173_0_0_/_0.06)] backdrop-blur-xl"
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium tracking-[-0.01em] text-[var(--color-fg)]">
              Prompt
            </span>

            <div className="hidden items-center gap-1.5 md:flex">
              <AnimatePresence mode="popLayout" initial={false}>
                {chips.map((chip) => (
                  <motion.span
                    key={chip}
                    layout
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, scale: 0.85, filter: "blur(4px)" }
                    }
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, scale: 0.85, filter: "blur(4px)" }
                    }
                    transition={{ duration: 0.2 }}
                    className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] font-medium tabular-nums text-[var(--color-muted)]"
                  >
                    {chip}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <motion.span
                key={output.length}
                initial={reduceMotion ? false : { opacity: 0.4, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden text-[11px] tabular-nums text-[var(--color-muted)] sm:inline"
              >
                {output.length.toLocaleString()} chars
              </motion.span>

              {/* Sliding format toggle */}
              <div className="relative inline-flex rounded-[10px] bg-[var(--color-surface-2)] p-0.5">
                {(["text", "json"] as Format[]).map((f) => {
                  const active = format === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={[
                        "relative inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                        active
                          ? "text-[var(--color-fg)]"
                          : "text-[var(--color-muted)] hover:text-[var(--color-fg)]",
                      ].join(" ")}
                    >
                      {active && (
                        <motion.span
                          layoutId="format-pill"
                          className="absolute inset-0 rounded-[8px] bg-[var(--color-surface)] shadow-[0_1px_2px_oklch(0.173_0_0_/_0.06)]"
                          transition={springSnappy}
                        />
                      )}
                      <span className="relative z-10 inline-flex items-center gap-1.5">
                        {f === "text" ? (
                          <FileText className="h-3 w-3" strokeWidth={1.75} />
                        ) : (
                          <Braces className="h-3 w-3" strokeWidth={1.75} />
                        )}
                        {f === "text" ? "Text" : "JSON"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
            <div className="relative min-w-0 flex-1 overflow-hidden rounded-[14px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.pre
                  key={format + output}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 4, filter: "blur(4px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, y: -4, filter: "blur(4px)" }
                  }
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="quiet-scroll max-h-[88px] overflow-auto rounded-[14px] bg-[var(--color-fg)] p-3.5 font-mono text-[11px] leading-relaxed text-white/85 sm:max-h-[104px]"
                >
                  <code
                    className={
                      format === "json"
                        ? "whitespace-pre"
                        : "whitespace-pre-wrap"
                    }
                  >
                    {output}
                  </code>
                </motion.pre>
              </AnimatePresence>
            </div>

            <motion.button
              type="button"
              onClick={copyPrompt}
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              animate={{
                backgroundColor: copied
                  ? "oklch(0.55 0.15 150)"
                  : "oklch(0.173 0 0)",
              }}
              transition={{ duration: 0.25 }}
              className="inline-flex w-full flex-none items-center justify-center gap-2 overflow-hidden rounded-[14px] px-5 py-3 text-[13px] font-medium text-white sm:w-44"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={copied ? "check" : "copy"}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, scale: 0.25, filter: "blur(4px)" }
                  }
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, scale: 0.25, filter: "blur(4px)" }
                  }
                  transition={{ duration: 0.18 }}
                  className="inline-flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Copy Prompt
                    </>
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  Single source of truth for the Antablin family hub.
//  Edit copy, stats, skills, links, and per-field accents here — every
//  component and the JSON-LD structured data read from this file.
// ─────────────────────────────────────────────────────────────────────────

export interface Stat {
  /** Number → animated count-up; string → shown as-is. */
  value: number | string;
  prefix?: string;
  suffix?: string;
  label: string;
  sub: string;
  /** decimals to render for numeric values (default 0) */
  decimals?: number;
}

export interface SocialLink {
  label: string;
  href: string;
  /** key into the icon set in Member/Footer components */
  icon: "github" | "linkedin" | "email";
}

export interface Member {
  id: string;
  /** Full name (used for SEO / structured data) */
  name: string;
  /** Short display name on the card */
  shortName: string;
  initial: string;
  role: string;
  /** one-line field summary under the name */
  tag: string;
  /** affiliation / locale line */
  affiliation: string;
  url: string;
  /** Optional headshot in /public/assets/img/people — falls back to monogram. */
  photo?: string;
  blurb: string;
  stats: Stat[];
  skills: string[];
  socials: SocialLink[];
  /** per-field accent (hex) */
  accent: string;
  accentSoft: string;
  /** label that names this person's discipline, lowercase mono caption */
  field: string;
  /** for structured data */
  jobTitle: string;
  knowsAbout: string[];
  /** monogram avatar motif — drawn in Monogram.astro */
  motif: "neural" | "structure" | "ocean";
}

export const family = {
  name: "The Antablin Family",
  brand: "ANTABLIN",
  domain: "www.antablin.com",
  url: "https://www.antablin.com",
  email: "eantablin@protonmail.com",
  tagline: "Three fields. One family.",
  description:
    "A family putting their work online — AI that runs in production, structures built to last, and science that starts at the bench.",
};

export const members: Member[] = [
  {
    id: "emanuel",
    name: "Emanuel Antablin",
    shortName: "Emanuel",
    initial: "E",
    role: "AI Engineer",
    tag: "Agentic AI · RAG · LLM systems",
    affiliation: "Walmart Global Tech",
    url: "https://emanuel.antablin.com",
    blurb:
      "Designs and ships agentic AI, RAG, and LLM systems running in production at Walmart Global Tech — the kind of AI that cuts incident response from hours to minutes and saves millions, not the kind that lives in a slide deck.",
    stats: [
      { value: 28, suffix: " min", label: "Incident MTTR", sub: "down from ~4 hrs" },
      { value: 1, prefix: "$", suffix: "M+", label: "Saved / year", sub: "through automation" },
      { value: 40, suffix: "%", label: "Throughput lift", sub: "team velocity" },
    ],
    skills: ["Agentic AI", "RAG", "LLMs", "Python", "FastAPI", "MCP", "Kubernetes", "AppSec"],
    socials: [
      { label: "GitHub", href: "https://github.com/eantablin", icon: "github" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/eantablin", icon: "linkedin" },
    ],
    accent: "#46e0ff",
    accentSoft: "#9cefff",
    field: "Artificial Intelligence",
    jobTitle: "AI Engineer",
    knowsAbout: [
      "Artificial Intelligence Engineering",
      "Agentic AI",
      "Large Language Models",
      "Retrieval-Augmented Generation",
      "Machine Learning",
      "Python",
    ],
    motif: "neural",
  },
  {
    id: "richard",
    name: "Richard Antablin",
    shortName: "Richard",
    initial: "R",
    role: "Structural & Project Engineer",
    tag: "EIT · Architectural Engineering",
    affiliation: "Swinerton · California",
    url: "https://richard.antablin.com",
    blurb:
      "Bridges the precision of structural engineering with the pace of the jobsite. An FE-certified Architectural Engineer out of Cal Poly San Luis Obispo, he drives commercial construction from preconstruction through closeout as a Project Engineer at Swinerton.",
    stats: [
      { value: 4, suffix: "+", label: "Years SEAOC", sub: "member since 2019" },
      { value: 12, label: "Tools & software", sub: "P6 · Revit · RISA-3D" },
      { value: "EIT", label: "FE certified", sub: "B.S. Architectural Eng." },
    ],
    skills: [
      "Structural Analysis",
      "Steel & Concrete",
      "Seismic Design",
      "Revit",
      "Primavera P6",
      "BIM 360",
      "Estimating",
    ],
    socials: [{ label: "LinkedIn", href: "https://linkedin.com/in/rantablin", icon: "linkedin" }],
    accent: "#f2a14b",
    accentSoft: "#ffc987",
    field: "Structural Engineering",
    jobTitle: "Structural & Project Engineer",
    knowsAbout: [
      "Structural Engineering",
      "Architectural Engineering",
      "Construction Management",
      "Seismic Design",
      "Steel Design",
      "Reinforced Concrete Design",
    ],
    motif: "structure",
  },
  {
    id: "alexandra",
    name: "Alexandra Blair Antablin",
    shortName: "Alexandra",
    initial: "A",
    role: "Biochemist & Lab Scientist",
    tag: "Life sciences · marine biology",
    affiliation: "Laboratory Science",
    url: "https://alex.antablin.com",
    blurb:
      "A biochemist and laboratory scientist — years spent purifying proteins, culturing cells, and chasing clean data. She brings that analytical, detail-obsessed mindset to the bench, the ocean she loves, and, increasingly, to code.",
    stats: [
      { value: "Bench", label: "Biochemistry", sub: "proteins · cell culture" },
      { value: "Sea", label: "Marine science", sub: "a lifelong fascination" },
      { value: "Code", label: "…and growing", sub: "learning by building" },
    ],
    skills: [
      "Protein Purification",
      "Cell Culture",
      "Data Analysis",
      "Lab Science",
      "Marine Biology",
      "Python (learning)",
    ],
    socials: [{ label: "GitHub", href: "https://github.com/stackwonderflow", icon: "github" }],
    accent: "#8f9bff",
    accentSoft: "#bcc4ff",
    field: "Biochemistry",
    jobTitle: "Biochemist",
    knowsAbout: [
      "Biochemistry",
      "Laboratory Science",
      "Protein Purification",
      "Cell Culture",
      "Marine Biology",
      "Data Analysis",
    ],
    motif: "ocean",
  },
];

/** Family-level stats for the intro section. */
export const familyStats: Stat[] = [
  { value: 3, label: "Portfolios", sub: "one per maker" },
  { value: 3, label: "Disciplines", sub: "AI · structures · science" },
  { value: 1, label: "Family", sub: "one name, one standard" },
];

/** Primary nav (anchors within the page). */
export const nav = [
  { id: "family", label: "The Family" },
  { id: "people", label: "The Makers" },
  { id: "contact", label: "Contact" },
];

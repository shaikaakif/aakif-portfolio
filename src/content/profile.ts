import type {
  Achievement,
  Capability,
  FocusDomain,
  TeamRole,
  TimelineEntry,
} from "./types";

const contactSubject = "Let's build something meaningful together";

export const profile = {
  name: "Shaik Aakif",
  shortName: "Aakif",
  role: "AI builder & product developer",
  locationLabel: "Independent builder",
  email: "aakifshaik512@gmail.com",
  emailHref: `mailto:aakifshaik512@gmail.com?subject=${encodeURIComponent(contactSubject)}`,
  gmailCompose:
    "https://mail.google.com/mail/?view=cm&fs=1&to=aakifshaik512@gmail.com",
  website: "https://shaikaakif.com",
  github: "https://github.com/shaikaakif",
  linkedin: "https://www.linkedin.com/in/shaikaakif512/",
  instagram: "https://www.instagram.com/_shaik_aakif/",
  availability: "Open to ambitious product work",
  headline: {
    before: "Engineering useful products that",
    accent: "solve real problems.",
  },
  subtitle:
    "I don't just write code. I build calm, high-leverage software by combining founder-level vision with an AI-augmented engineering team.",
  intro:
    "I build intelligent products at the intersection of artificial intelligence, software, and real-world problems. Focused on creating calm, high-leverage software that eliminates human friction.",
  elevatorPitch:
    "I bridge the gap between high-level product strategy, beautiful design, and robust full-stack engineering. By combining founder-level vision with an AI-augmented engineering team, I take ideas from concept to production-grade applications with speed and precision.",
  bio: [
    "I am a student developer, AI builder, and product-focused entrepreneur. I don't look at software as just code to compile — I see it as an engine to remove real friction from human lives.",
    "My journey started with first-principles curiosity: deconstructing how digital products work, taking apart web architectures, and understanding user behavior. Today, I build at the intersection of generative AI, computer vision, full-stack systems, and product design.",
    "Instead of waiting to graduate or asking for permission, I actively build, experiment, and launch products — from multi-modal study platforms like LearnLens AI to hardware IoT systems like Dr.Bin.",
  ],
  quote:
    "Software is not about how many lines of code you write; it is about how effectively you eliminate friction from a user's life.",
  education: {
    degree: "Bachelor of Engineering in Computer Science",
    specialization: "Focus on Systems Design & Artificial Intelligence",
  },
  metrics: [
    { value: "11", label: "products built" },
    { value: "10", label: "live deployments" },
    { value: "2026", label: "Pravinya champion" },
  ],
  rolePills: [
    "Full-stack developer",
    "Entrepreneur",
    "Student builder",
    "Generative AI & ML",
  ],
} as const;

export const focusDomains: FocusDomain[] = [
  {
    index: "01",
    title: "AI & generative AI",
    badge: "LLMs & agents",
    description:
      "Engineering multi-agent workflows, prompt chains, RAG architectures, and custom LLM integrations using OpenAI, Claude, and Gemini APIs.",
  },
  {
    index: "02",
    title: "Machine learning",
    badge: "Data & modeling",
    description:
      "Building predictive pipelines, pattern recognition models, and benchmarking competitive data science workflows.",
  },
  {
    index: "03",
    title: "Computer vision",
    badge: "Edge & video",
    description:
      "Integrating edge vision models with OpenCV and IoT hardware for smart classification, fill-level detection, and gesture interfaces.",
  },
  {
    index: "04",
    title: "Full-stack development",
    badge: "Next.js & React",
    description:
      "Crafting responsive, high-performance web platforms using Next.js App Router, TypeScript, Tailwind CSS, Node.js, and Supabase.",
  },
  {
    index: "05",
    title: "Mobile & developer tools",
    badge: "PWAs & CLI",
    description:
      "Building local-first writing engines, lightweight embeddable scripts, terminal CLI tools, and edge PWAs with offline storage.",
  },
  {
    index: "06",
    title: "Product & startups",
    badge: "Strategy & MVPs",
    description:
      "Deconstructing user friction, structuring PRDs, defining UX hierarchy, and shipping early-stage products from zero to one.",
  },
];

export const capabilities: Capability[] = [
  {
    domain: "Product & UX",
    skills: [
      "UX architecture",
      "Wireframing",
      "Micro-interactions",
      "Product strategy",
      "Information architecture",
    ],
  },
  {
    domain: "Frontend",
    skills: [
      "React",
      "Next.js App Router",
      "Tailwind CSS",
      "Design tokens",
      "Motion systems",
      "Three.js",
    ],
  },
  {
    domain: "Backend & cloud",
    skills: [
      "Node.js",
      "Python",
      "REST APIs",
      "PostgreSQL",
      "Supabase",
      "Vercel serverless",
    ],
  },
  {
    domain: "AI orchestration",
    skills: [
      "Prompt engineering",
      "Multi-agent systems",
      "OpenAI API",
      "Anthropic API",
      "Google Gemini API",
      "RAG workflows",
    ],
  },
];

export const stackGroups = [
  {
    label: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "Java", "C++"],
  },
  {
    label: "Frontend",
    items: ["Next.js", "React", "Tailwind CSS", "WebGL / R3F", "CSS tokens"],
  },
  {
    label: "Backend",
    items: ["Node.js", "FastAPI", "REST", "GraphQL", "PostgreSQL", "Supabase"],
  },
  {
    label: "AI & vision",
    items: [
      "OpenAI",
      "Claude",
      "Gemini",
      "ElevenLabs",
      "OpenCV",
      "RAG",
    ],
  },
  {
    label: "Workflow",
    items: ["Git", "Vercel", "Docker", "Linux", "IndexedDB", "MQTT"],
  },
];

export const principles = [
  {
    index: "01",
    title: "Problem first, technology second",
    description:
      "Technology choices must always serve the product strategy. Identify user friction before picking frameworks.",
  },
  {
    index: "02",
    title: "The CEO + AI team paradigm",
    description:
      "Act as product architect, orchestrating specialized AI agents at founder speed without surrendering judgment.",
  },
  {
    index: "03",
    title: "Calm and purposeful software",
    description:
      "Interfaces should respect human attention. Zero noise, zero dark patterns, and a clear next action.",
  },
  {
    index: "04",
    title: "First-principles engineering",
    description:
      "Never build something just because that is how it has always been done. Question assumptions and rebuild from core truths.",
  },
];

export const timeline: TimelineEntry[] = [
  {
    year: "2026",
    title: "AI team orchestration & founder execution",
    role: "CEO & product architect",
    description:
      "Pioneered the AI-orchestrated engineering model. Architected and launched multi-agent web applications, enterprise B2B quotation systems, and EdTech platforms.",
  },
  {
    year: "2025",
    title: "Full-stack mastery & product development",
    role: "Full-stack builder",
    description:
      "Engineered Next.js App Router applications, custom CSS design systems, and real-time backend integrations with Supabase and Node.js.",
  },
  {
    year: "2024",
    title: "IoT systems & edge computer vision",
    role: "Hardware & software lead",
    description:
      "Designed the Dr.Bin smart waste management system, integrating Raspberry Pi telemetry, MQTT protocols, and edge OpenCV computer vision models.",
  },
  {
    year: "2023",
    title: "First principles & systems ideation",
    role: "Product researcher",
    description:
      "Deconstructed digital applications, studied core computer science fundamentals, and built initial web tools focused on eliminating user friction.",
  },
];

export const achievements: Achievement[] = [
  {
    title: "Pravinya Innovation & Entrepreneurship Championship",
    category: "Winner — Innovation & startup pitch",
    year: "2026",
    description:
      "Awarded first place for product architecture, technical execution, and business model viability for AI-powered software products.",
  },
  {
    title: "Things I Wish I Knew Earlier",
    category: "Published author",
    description:
      "Authored a foundational book on technical mindset, first-principles learning, software engineering, and continuous growth.",
  },
  {
    title: "Kaggle competition achievement",
    category: "Competitive machine learning",
    description:
      "Recognized for machine learning model optimization, feature engineering, and predictive benchmarking in competitive data science challenges.",
  },
];

export const teamRoles: TeamRole[] = [
  {
    role: "CEO & product architect",
    agent: "Shaik Aakif",
    badge: "Human founder",
    description:
      "Owns product vision, user experience standards, system architecture, and final product quality.",
  },
  {
    role: "Strategic thinking",
    agent: "ChatGPT",
    badge: "AI partner",
    description:
      "Assists with product framing, PRD generation, marketing positioning, and UX narrative design.",
  },
  {
    role: "Logic & algorithmic engineering",
    agent: "Claude",
    badge: "AI partner",
    description:
      "Handles state machine verification, complex refactoring, algorithmic optimization, and type safety.",
  },
  {
    role: "Deep domain research",
    agent: "Gemini",
    badge: "AI partner",
    description:
      "Synthesizes technical benchmarks, performs literature review, and evaluates market trends.",
  },
  {
    role: "Full-stack execution",
    agent: "Antigravity",
    badge: "AI engineer",
    description:
      "Executes codebase construction, filesystem management, build optimization, and CI/CD pipelines.",
  },
];

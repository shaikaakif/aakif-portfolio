import type { Experiment, Project } from "./types";

export const projects: Project[] = [
  {
    slug: "learnlens-ai",
    index: "01",
    title: "LearnLens AI",
    category: "AI & ML",
    status: "Live",
    tagline:
      "Multi-modal learning engine turning study materials into active recall flashcards.",
    description:
      "An intelligent EdTech platform that ingests video lectures, PDFs, and textbook chapters to generate automated flashcards, adaptive quizzes, and concept maps.",
    problem:
      "Students waste hundreds of hours manually summarizing lectures and creating flashcards, leading to passive reading and poor exam retention.",
    solution:
      "LearnLens AI parses multi-modal inputs, extracts high-yield concepts using large language models, and automatically constructs spaced-repetition study loops.",
    stack: ["Next.js 14", "Python", "FastAPI", "OpenAI API", "Supabase", "Tailwind CSS"],
    liveUrl: "https://learnlens-v2.vercel.app",
    githubUrl: "https://github.com/shaikaakif/learnlens-ai",
    metric: "94% retention increase",
    tone: "clay",
    artwork: "orbit",
    code: "LL",
    image: "/images/learnlens.png",
  },
  {
    slug: "feedy",
    index: "02",
    title: "Feedy",
    category: "Tools & apps",
    status: "Live",
    tagline:
      "Embeddable, zero-dependency customer feedback and sentiment widget.",
    description:
      "A privacy-first customer feedback collection widget for modern web products, featuring real-time AI sentiment tagging and categorized admin dashboards.",
    problem:
      "Traditional feedback tools are heavy, intrude on UX, and require complex setup processes for product developers.",
    solution:
      "Built a 4KB embeddable script that loads asynchronously and streams user feedback directly into an AI-classified roadmap dashboard.",
    stack: ["Vanilla JS", "Next.js App Router", "PostgreSQL", "Tailwind CSS"],
    liveUrl: "https://feedy-app.vercel.app",
    githubUrl: "https://github.com/shaikaakif/feedy",
    metric: "4KB bundle size",
    tone: "cobalt",
    artwork: "grid",
    code: "FD",
    image: "/images/feedy.png",
  },
  {
    slug: "dr-bin",
    index: "03",
    title: "Dr.Bin",
    category: "IoT & hardware",
    status: "Live",
    tagline:
      "AI-driven smart waste management and recycling computer vision system.",
    description:
      "An IoT smart waste bin equipped with optical sensors and computer vision models to automatically classify recyclables and optimize municipal route dispatch.",
    problem:
      "Municipalities waste fuel collecting empty bins while overflowing bins cause sanitation hazards in high-density urban areas.",
    solution:
      "Designed an integrated hardware-software solution featuring fill-level telemetry and edge AI vision for automated waste sorting.",
    stack: ["Python", "OpenCV", "Raspberry Pi", "React Dashboard", "MQTT"],
    liveUrl: "https://dr-bin.vercel.app",
    githubUrl: "https://github.com/shaikaakif/dr-bin-iot",
    metric: "40% route efficiency",
    tone: "sage",
    artwork: "aperture",
    code: "DB",
  },
  {
    slug: "menux",
    index: "04",
    title: "MenuX",
    category: "SaaS & enterprise",
    status: "Live",
    tagline:
      "Real-time QR menu engine with dynamic stock and multi-language support.",
    description:
      "A fast mobile QR menu system empowering restaurant managers to update item availability, prices, and daily specials in real time.",
    problem:
      "Paper menus are costly to reprint, hard to sanitize, and fail to reflect sold-out items during peak service hours.",
    solution:
      "Architected an edge-cached PWA that loads menu items in under 300ms on mobile devices with instant stock sync.",
    stack: ["Next.js", "Supabase", "Tailwind CSS", "Vercel"],
    liveUrl: "https://menux-com.vercel.app/",
    githubUrl: "https://github.com/shaikaakif/menux-qr",
    metric: "Under 300ms mobile load",
    tone: "amber",
    artwork: "fold",
    code: "MX",
  },
  {
    slug: "likho-ai",
    index: "05",
    title: "Likho AI",
    category: "Tools & apps",
    status: "Live",
    tagline:
      "Distraction-free, AI-assisted markdown studio for technical writers.",
    description:
      "A minimal writing environment engineered for deep focus, featuring AI text refinement, instant GFM syntax highlighting, local-first offline storage, and clean export options.",
    problem:
      "Heavy text editors clutter the screen with toolbars, breaking writer flow during ideation and technical drafting.",
    solution:
      "Created an ultra-minimal local-first canvas with AI text generation that auto-saves to IndexedDB and renders typography with zero distraction.",
    stack: ["React", "TypeScript", "OpenAI API", "IndexedDB", "Tailwind CSS"],
    liveUrl: "https://likho-ai.vercel.app",
    githubUrl: "https://github.com/shaikaakif/likho-editor",
    metric: "Local-first AI canvas",
    tone: "ink",
    artwork: "stack",
    code: "LK",
  },
  {
    slug: "tutorly-ai",
    index: "06",
    title: "Tutorly AI",
    category: "AI & ML",
    status: "Live",
    tagline:
      "AI peer study partner matching and group learning platform.",
    description:
      "A university peer tutoring platform that pairs students based on course modules, skill gaps, and schedule compatibility using AI reasoning.",
    problem:
      "Students struggle to find qualified peer tutors or study groups for niche engineering and math courses outside regular hours.",
    solution:
      "Algorithmic matching engine connecting students into active micro-study pods with built-in whiteboard collaboration tools.",
    stack: ["Next.js", "Node.js", "Socket.io", "PostgreSQL", "Tailwind CSS"],
    liveUrl: "https://tutorly-app.vercel.app/",
    githubUrl: "https://github.com/shaikaakif/tutorly",
    metric: "Real-time AI match",
    tone: "rose",
    artwork: "pulse",
    code: "TU",
  },
  {
    slug: "speecher",
    index: "07",
    title: "Speecher",
    category: "AI & ML",
    status: "Live",
    tagline:
      "AI neural text-to-speech studio turning scripts into natural voiceovers.",
    description:
      "A studio web app that transforms written content into hyper-realistic voice tracks with customizable cadence, emotion, and emphasis.",
    problem:
      "Recording and editing professional audio voiceovers for video scripts requires expensive equipment and studio time.",
    solution:
      "Leveraged deep neural speech synthesis to provide a browser-based audio studio with instant rendering and timeline export.",
    stack: ["React", "ElevenLabs API", "Web Audio API", "Tailwind CSS"],
    liveUrl: "https://speecher-ai.vercel.app/",
    githubUrl: "https://github.com/shaikaakif/speecher-ai",
    metric: "Under 1s voice render",
    tone: "cobalt",
    artwork: "wave",
    code: "SP",
  },
  {
    slug: "adly-ai",
    index: "08",
    title: "Adly AI",
    category: "AI & ML",
    status: "Live",
    tagline:
      "Autonomous AI marketing campaign and copy generation studio.",
    description:
      "An AI-powered platform that analyzes brand guidelines and target demographics to instantly generate ad copy, visual hooks, and campaign strategies.",
    problem:
      "Founders and growth marketers spend days writing variations of ad copy and testing campaign creatives across channels.",
    solution:
      "Engineered a specialized multi-prompt marketing engine producing platform-compliant ad variants tailored for Meta, Google, and LinkedIn.",
    stack: ["Next.js 14", "TypeScript", "Claude API", "OpenAI API", "Tailwind CSS"],
    liveUrl: "https://adly-ai.vercel.app",
    githubUrl: "https://github.com/shaikaakif/adly-ai",
    metric: "10x ad output",
    tone: "clay",
    artwork: "grid",
    code: "AD",
  },
  {
    slug: "brainhack-ai",
    index: "09",
    title: "BrainHack AI",
    category: "AI & ML",
    status: "Live",
    tagline:
      "Curated library of high-leverage AI prompt frameworks and mental models.",
    description:
      "A curated repository of structured AI prompt chains and mental frameworks engineered to unlock maximum reasoning capabilities from LLMs.",
    problem:
      "Most professionals use AI chatbots with primitive prompts, missing out on the reasoning capabilities those systems can offer.",
    solution:
      "Built a structured index of reusable prompt chains categorized by engineering, product strategy, design, and marketing.",
    stack: ["Next.js App Router", "MDX", "Custom Search", "Tailwind CSS"],
    liveUrl: "https://brainhackai.vercel.app",
    githubUrl: "https://github.com/shaikaakif/brainhack-ai",
    metric: "100+ prompt chains",
    tone: "plum",
    artwork: "stack",
    code: "BH",
  },
  {
    slug: "maakamenu",
    index: "10",
    title: "MaaKaMenu",
    category: "SaaS & enterprise",
    status: "Live",
    tagline:
      "Digital home food menu and meal subscription ordering platform.",
    description:
      "A simple, heartwarming digital menu system connecting home chefs with local subscribers for weekly meal planning and daily order management.",
    problem:
      "Home chefs struggle to manage dynamic daily menus and take bulk orders over unstructured chat apps.",
    solution:
      "Designed an accessible digital menu interface allowing chefs to update daily specials and receive organized orders directly on WhatsApp.",
    stack: ["Next.js", "React", "Tailwind CSS", "WhatsApp Integration"],
    liveUrl: "https://maakamenu.vercel.app",
    githubUrl: "https://github.com/shaikaakif/maakamenu",
    metric: "Direct WhatsApp sync",
    tone: "sage",
    artwork: "fold",
    code: "MK",
  },
  {
    slug: "standard-pumps-quotation",
    index: "11",
    title: "Standard Pumps Quotation System",
    category: "SaaS & enterprise",
    status: "Case study",
    tagline:
      "Enterprise B2B pricing calculation and quotation engine for commercial pumps.",
    description:
      "An automated industrial quotation software engineered for rapid B2B sales teams, calculating dynamic head pressure, material costs, and margin tiers in seconds.",
    problem:
      "Manual pricing for custom industrial pumps took 3–5 hours per client lead, causing lost deals and human error in pricing margin calculations.",
    solution:
      "Engineered a parametric calculation engine with rule-based validation that outputs customer-ready PDF quotes instantly upon entering pump parameters.",
    stack: ["React", "TypeScript", "Node.js", "Tailwind CSS", "PDF Engine"],
    githubUrl: "https://github.com/shaikaakif/standard-pumps-quote",
    metric: "10x quote speed",
    tone: "amber",
    artwork: "orbit",
    code: "SQ",
  },
  {
    slug: "mysafe",
    index: "12",
    title: "MySafe",
    category: "Security & utilities",
    status: "Live",
    tagline: "Your data. Your control.",
    description:
      "A password manager for securely storing, organizing, and managing passwords, notes, and sensitive information — all in one place.",
    problem:
      "People reuse weak passwords and store credentials in unsafe places, putting personal and professional data at risk.",
    solution:
      "End-to-end encrypted vault with cross-device sync, secure notes, identity cards, and a clean interface for managing sensitive information.",
    stack: ["React", "TypeScript", "Encryption", "Secure storage"],
    githubUrl: "https://github.com/shaikaakif",
    metric: "Secure vault",
    tone: "clay",
    artwork: "orbit",
    code: "MS",
    image: "/images/mysafe.png",
  },
  {
    slug: "printu",
    index: "13",
    title: "PrintU",
    category: "Utilities",
    status: "Live",
    tagline: "Simple printing, your way.",
    description:
      "A straightforward printing utility that makes it easy to send documents to any connected printer with minimal setup.",
    problem:
      "Printing from web and mobile devices often requires complex driver installations and confusing workflows.",
    solution:
      "A minimal print client that connects to local and network printers with a clean, predictable interface.",
    stack: ["Web printing", "Client utilities"],
    metric: "Print client",
    tone: "amber",
    artwork: "fold",
    code: "PU",
    image: "/images/printu.png",
  },
];

export const experiments: Experiment[] = [
  {
    title: "GEX Air Controller",
    category: "Computer vision",
    tagline:
      "Gesture and vision-assisted controller system enabling touchless interface interaction.",
    stack: ["Python", "OpenCV", "MediaPipe", "NumPy"],
  },
  {
    title: "Study Challenge CLI",
    category: "Developer tools",
    tagline:
      "Terminal CLI tool for developers to track daily study streaks and active recall sessions.",
    stack: ["Python", "Typer", "Rich", "SQLite"],
  },
  {
    title: "NovaPlay",
    category: "Full-stack media",
    tagline:
      "Interactive media and entertainment engine built with real-time state synchronization.",
    stack: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
  },
  {
    title: "Sio Sukoon",
    category: "Community & wellness",
    tagline:
      "Digital wellness and youth empowerment platform offering curated guides, event registration, and anonymous inquiry forms.",
    stack: ["HTML5", "CSS3", "JavaScript", "Static site generation"],
    note: "Production",
  },
  {
    title: "YtEazy",
    category: "Creator tools & analytics",
    tagline:
      "Creator tool analyzing YouTube video metrics, extracting transcripts, and generating AI summaries.",
    stack: ["Python", "Flask", "React", "YouTube Data API"],
    note: "Active tool",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

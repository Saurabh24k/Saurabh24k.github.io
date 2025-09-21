const { useState, useEffect, useMemo, useRef, useContext, createContext, Fragment } = React;

const ThemeContext = createContext({ theme: "dark", toggle: () => {} });

const ThemeProvider = ({ children }) => {
  const prefersDark = () => window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("saurabh-theme");
    if (stored === "light" || stored === "dark") return stored;
    return prefersDark() ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    document.body?.setAttribute("data-theme", theme);
    localStorage.setItem("saurabh-theme", theme);
  }, [theme]);

  useEffect(() => {
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      setTheme(event.matches ? "dark" : "light");
    };
    matcher.addEventListener("change", handleChange);
    return () => matcher.removeEventListener("change", handleChange);
  }, []);

  const toggle = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const value = useMemo(() => ({ theme, toggle }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const useTheme = () => useContext(ThemeContext);

const AnimatedThemeToggle = () => {
  const { theme, toggle } = useTheme();
  return (
    <button
      className={`theme-toggle theme-toggle--${theme}`}
      onClick={toggle}
      aria-label="Toggle color mode"
      type="button"
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__beam" />
      </span>
      <span className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img">
          <path d="M12 4a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm0 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8-5a1 1 0 0 1 1 1 1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h2zM6 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm13.07-6.07a1 1 0 0 1 0 1.41l-1.41 1.42a1 1 0 1 1-1.42-1.42l1.42-1.41a1 1 0 0 1 1.41 0zM7.76 16.24a1 1 0 0 1 0 1.41l-1.42 1.41a1 1 0 0 1-1.41-1.41l1.41-1.42a1 1 0 0 1 1.42 0zM17 17a1 1 0 0 1 1.71.71V19a1 1 0 1 1-2 0v-1.29A1 1 0 0 1 17 17zM7 5a1 1 0 0 1 .29.71V7a1 1 0 0 1-2 0V5.71A1 1 0 0 1 6 5h1z" />
        </svg>
      </span>
      <span className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img">
          <path d="M20.742 14.045A8.001 8.001 0 0 1 10.21 3.513a8 8 0 1 0 10.532 10.532z" />
        </svg>
      </span>
    </button>
  );
};

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);
    const listener = (event) => setPrefersReducedMotion(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return prefersReducedMotion;
};

const BlurFade = ({ as: Component = "div", delay = 0, children, className = "", ...props }) => {
  const ref = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      ref.current?.classList.add("is-visible");
      return;
    }

    const element = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <Component ref={ref} className={`blur-fade ${className}`} style={{ transitionDelay: `${delay}ms` }} {...props}>
      {children}
    </Component>
  );
};

const TextAnimate = ({ words }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2600);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <span className="text-animate" aria-live="polite">
      {words.map((word, idx) => (
        <span key={word} className={`text-animate__word ${idx === index ? "is-active" : ""}`}>
          {word}
        </span>
      ))}
    </span>
  );
};

const InteractiveHoverButton = ({ href, children }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const node = buttonRef.current;
    if (!node) return;

    const handlePointer = (event) => {
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      node.style.setProperty("--pointer-x", `${x}px`);
      node.style.setProperty("--pointer-y", `${y}px`);
    };

    node.addEventListener("pointermove", handlePointer);
    return () => node.removeEventListener("pointermove", handlePointer);
  }, []);

  return (
    <a className="interactive-hover-button" href={href} target="_blank" rel="noreferrer" ref={buttonRef}>
      <span className="interactive-hover-button__glow" aria-hidden="true" />
      <span className="interactive-hover-button__content">{children}</span>
    </a>
  );
};

const MagicCard = ({ title, subtitle, description, tags, link }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handlePointer = (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.setProperty("--pointer-x", `${x}px`);
      card.style.setProperty("--pointer-y", `${y}px`);
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const reset = () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
    };

    card.addEventListener("pointermove", handlePointer);
    card.addEventListener("pointerleave", reset);

    return () => {
      card.removeEventListener("pointermove", handlePointer);
      card.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <a className="magic-card" href={link} target="_blank" rel="noreferrer" ref={cardRef}>
      <div className="magic-card__beam" aria-hidden="true" />
      <div className="magic-card__content">
        <span className="magic-card__eyebrow">{subtitle}</span>
        <h3 className="magic-card__title">{title}</h3>
        <p className="magic-card__description">{description}</p>
        <div className="magic-card__tags">
          {tags.map((tag) => (
            <span key={tag} className="magic-card__tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
};

const Marquee = ({ items, direction = "left" }) => (
  <div className={`marquee marquee--${direction}`} aria-hidden="true">
    <div className="marquee__inner">
      {[...items, ...items].map((item, index) => (
        <span key={`${item}-${index}`} className="marquee__item">
          {item}
        </span>
      ))}
    </div>
  </div>
);

const AnimatedCircularProgress = ({ label, value }) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="circular-progress" role="img" aria-label={`${label} proficiency ${normalizedValue}%`}>
      <svg className="circular-progress__svg" viewBox="0 0 120 120">
        <circle className="circular-progress__track" cx="60" cy="60" r={radius} />
        <circle
          className="circular-progress__indicator"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="circular-progress__value">
        <span>{normalizedValue}</span>
        <small>%</small>
      </div>
      <p className="circular-progress__label">{label}</p>
    </div>
  );
};

const AnimatedBeam = ({ items }) => {
  return (
    <div className="animated-beam">
      <div className="animated-beam__line" aria-hidden="true" />
      {items.map((item, index) => (
        <div key={item.title} className="animated-beam__card">
          <span className="animated-beam__index">0{index + 1}</span>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
          <ul>
            {item.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <span className="animated-beam__meta">{item.meta}</span>
        </div>
      ))}
    </div>
  );
};

const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = Array.from({ length: Math.min(200, Math.floor(canvas.width / 8)) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.5 + 0.15,
      }));
    };

    const render = () => {
      const theme = document.documentElement.getAttribute("data-theme") || "dark";
      const hue = theme === "dark" ? 218 : 228;
      context.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        context.beginPath();
        context.fillStyle = `hsla(${hue}, 78%, 68%, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      });

      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    render();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas className="particle-canvas" ref={canvasRef} aria-hidden="true" />;
};

const PointerGlow = () => {
  const pointerRef = useRef(null);
  const trailRef = useRef(null);
  const rafRef = useRef(null);
  const position = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const target = useRef({ ...position.current });

  useEffect(() => {
    const pointer = pointerRef.current;
    const trail = trailRef.current;

    const handlePointerMove = (event) => {
      target.current = { x: event.clientX, y: event.clientY };
      pointer.classList.add("pointer--visible");
      trail.classList.add("pointer--visible");
    };

    const handleLeave = () => {
      pointer.classList.remove("pointer--visible");
      trail.classList.remove("pointer--visible");
    };

    const update = () => {
      position.current.x += (target.current.x - position.current.x) * 0.14;
      position.current.y += (target.current.y - position.current.y) * 0.14;

      pointer.style.transform = `translate(${target.current.x}px, ${target.current.y}px)`;
      trail.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;

      const root = document.documentElement;
      root.style.setProperty("--pointer-x", `${target.current.x}px`);
      root.style.setProperty("--pointer-y", `${target.current.y}px`);

      rafRef.current = requestAnimationFrame(update);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerleave", handleLeave);
    update();

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handleLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <Fragment>
      <div className="pointer" ref={pointerRef} aria-hidden="true" />
      <div className="pointer pointer--trail" ref={trailRef} aria-hidden="true" />
    </Fragment>
  );
};

const contactLinks = [
  { label: "Email", value: "saurabhrajput24k@gmail.com", href: "mailto:saurabhrajput24k@gmail.com" },
  { label: "Phone", value: "+1 (312) 404-1275", href: "tel:+13124041275" },
  { label: "LinkedIn", value: "linkedin.com/in/saurabhrajput24k", href: "https://www.linkedin.com/in/saurabhrajput24k" },
  { label: "GitHub", value: "github.com/Saurabh24k", href: "https://github.com/Saurabh24k" },
  { label: "Portfolio", value: "saurabh24k.github.io", href: "https://saurabh24k.github.io" },
  { label: "IIT Chicago", value: "srajput2@hawk.iit.edu", href: "mailto:srajput2@hawk.iit.edu" },
];

const experiences = [
  {
    title: "AI Engineer · TechClub Inc.",
    meta: "Feb 2025 - Jul 2025 · Remote",
    summary: "Enterprise GenAI systems that deliver measurable support impact.",
    points: [
      "Built a production RAG assistant with FastAPI, LangChain, ChromaDB, SentenceTransformers; resolution time ↓35%.",
      "Shipped semantic search on SageMaker using FAISS + OpenAI embeddings; escalations ↓30% and relevance ↑42% (Ragas, human eval).",
      "Stood up guardrails (PII redaction, tool-call idempotency) and continuous evals keeping hallucinations <20%.",
      "Productionized on AWS (ECS, SageMaker) with Docker, CI/CD, OpenTelemetry observability.",
    ],
  },
  {
    title: "AI Engineer · Parkiez Mobility",
    meta: "Dec 2020 - Mar 2022 · Pune, India",
    summary: "Computer vision and MLOps for intelligent mobility infrastructure.",
    points: [
      "Boosted parking-spot detection accuracy 25% with TensorFlow/OpenCV YOLO pipeline deployed to AWS edge.",
      "Launched availability prediction on SageMaker reducing driver search time 15% and improving lot utilization.",
      "Optimized data processing infra on AWS (EC2, S3, CloudWatch) and automated Dockerized releases via Jenkins & CodePipeline.",
    ],
  },
];

const projects = [
  {
    title: "Inbound Carrier Sales Agent",
    subtitle: "Voice AI Agent · FastAPI · LangChain",
    description:
      "Multi-turn voice agent verifying FMCSA MC numbers, negotiating loads, and logging real-time insights across policy-compliant flows.",
    link: "https://github.com/Saurabh24k",
    tags: ["LiveKit", "OpenAI", "SQLModel", "Docker"],
  },
  {
    title: "Cache Augmented Generation (CAG-LLM)",
    subtitle: "LLM Infra · Streamlit · Hugging Face",
    description:
      "Latency-aware LLM caching layer with telemetry, response grading, and an immersive interface to benchmark retrieval strategies.",
    link: "https://github.com/Saurabh24k",
    tags: ["Caching", "Prompt Engineering", "Observability"],
  },
  {
    title: "Autonomous AI Screening Agent",
    subtitle: "Agentic Workflow · FastAPI · pgvector",
    description:
      "Modular sub-agents orchestrated to parse resumes, run screenings, score fit, and trigger scheduling with vector logging throughout.",
    link: "https://github.com/Saurabh24k",
    tags: ["LangChain", "PostgreSQL", "Voice"],
  },
];

const skills = [
  { label: "GenAI & RAG", value: 94 },
  { label: "LLM Ops", value: 92 },
  { label: "Computer Vision", value: 88 },
  { label: "MLOps", value: 90 },
  { label: "Cloud & DevOps", value: 86 },
];

const education = [
  {
    school: "Illinois Institute of Technology",
    degree: "M.S. Artificial Intelligence",
    year: "Dec 2024",
  },
  {
    school: "Jayawantrao Sawant College of Engineering",
    degree: "B.E. Computer Engineering",
    year: "Jun 2021",
  },
];

const setLocalPointerVars = (event) => {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  target.style.setProperty("--pointer-x", `${x}px`);
  target.style.setProperty("--pointer-y", `${y}px`);
};

const resetLocalPointerVars = (event) => {
  const target = event.currentTarget;
  target.style.removeProperty("--pointer-x");
  target.style.removeProperty("--pointer-y");
};

const Hero = () => (
  <section className="section hero" id="hero">
    <BlurFade className="hero__content" delay={100} onPointerMove={setLocalPointerVars} onPointerLeave={resetLocalPointerVars}>
      <span className="hero__eyebrow">Saurabh Rajput · AI Engineer</span>
      <h1 className="hero__title">
        Architecting
        <TextAnimate
          words={[" Retrieval-Augmented AI", " Voice-first Agents", " Trustworthy ML Platforms", " Intelligent Mobility"]}
        />
      </h1>
      <p className="hero__subtitle">
        I build resilient AI platforms that close the loop between data, models, and business outcomes—grounded in GenAI,
        MLOps, and intelligent automation across mobility, logistics, and enterprise support.
      </p>
      <div className="hero__actions">
        <InteractiveHoverButton href="mailto:saurabhrajput24k@gmail.com">
          Start a Conversation
        </InteractiveHoverButton>
        <a className="hero__resume" href="assets/pdf/Saurabh_Rajput_(Resume).pdf" target="_blank" rel="noreferrer">
          Download Résumé
        </a>
      </div>
      <div className="hero__contact">
        {contactLinks.slice(0, 3).map((item) => (
          <a key={item.label} href={item.href} className="hero__contact-link">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </a>
        ))}
      </div>
    </BlurFade>
    <BlurFade
      className="hero__card"
      delay={250}
      onPointerMove={setLocalPointerVars}
      onPointerLeave={resetLocalPointerVars}
    >
      <div className="hero__stats">
        <div>
          <span className="hero__stat-value">5+</span>
          <span className="hero__stat-label">Years shipping AI products</span>
        </div>
        <div>
          <span className="hero__stat-value">28%</span>
          <span className="hero__stat-label">CSAT lift via AI assistants</span>
        </div>
        <div>
          <span className="hero__stat-value">30%</span>
          <span className="hero__stat-label">Faster go-lives with reliable MLOps</span>
        </div>
      </div>
      <p className="hero__quote">
        “My craft combines GenAI experimentation with enterprise reliability—pairing Retrieval-Augmented Generation,
        observability, and guardrails to earn user trust.”
      </p>
    </BlurFade>
  </section>
);

const Experience = () => (
  <section className="section" id="experience">
    <BlurFade delay={100}>
      <header className="section__header">
        <span className="section__eyebrow">Experience</span>
        <h2>Driving measurable outcomes across GenAI and computer vision.</h2>
        <p>
          Every engagement blends modern AI stacks with hardened delivery—linking experimentation to telemetry, MLOps, and
          production uptime.
        </p>
      </header>
    </BlurFade>
    <BlurFade delay={200}>
      <AnimatedBeam items={experiences} />
    </BlurFade>
  </section>
);

const Projects = () => (
  <section className="section" id="projects">
    <BlurFade delay={100}>
      <header className="section__header">
        <span className="section__eyebrow">Projects</span>
        <h2>Agentic systems that orchestrate data, models, and automation.</h2>
        <p>
          I enjoy crafting opinionated workflows—voice agents, retrieval loops, and scoring engines—that ship to production with
          observability baked in.
        </p>
      </header>
    </BlurFade>
    <div className="section__grid">
      {projects.map((project, index) => (
        <BlurFade key={project.title} delay={160 * (index + 1)}>
          <MagicCard {...project} />
        </BlurFade>
      ))}
    </div>
  </section>
);

const Skills = () => (
  <section className="section" id="skills">
    <BlurFade delay={100}>
      <header className="section__header">
        <span className="section__eyebrow">Capabilities</span>
        <h2>Full-stack AI delivery across GenAI, MLOps, and applied ML.</h2>
      </header>
    </BlurFade>
    <div className="skills__grid">
      {skills.map((skill, index) => (
        <BlurFade key={skill.label} delay={150 * (index + 1)}>
          <AnimatedCircularProgress {...skill} />
        </BlurFade>
      ))}
    </div>
    <div className="skills__marquee">
      <Marquee
        items={["FastAPI", "LangChain", "LlamaIndex", "TensorFlow", "PyTorch", "FAISS", "ChromaDB", "AWS SageMaker", "Docker", "Terraform", "Kafka", "OpenTelemetry"]}
      />
      <Marquee
        direction="right"
        items={["Redis", "pgvector", "Streamlit", "LiveKit", "CI/CD", "Airflow", "MLflow", "Weights & Biases", "Spark", "Ragas", "Guardrails", "Kubernetes"]}
      />
    </div>
  </section>
);

const EducationContact = () => (
  <section className="section" id="education">
    <div className="education">
      <BlurFade delay={100}>
        <header className="section__header">
          <span className="section__eyebrow">Education</span>
          <h2>Academic foundation in artificial intelligence and computer engineering.</h2>
        </header>
      </BlurFade>
      <div className="education__list">
        {education.map((item, index) => (
          <BlurFade key={item.school} delay={150 * (index + 1)} className="education__item">
            <span className="education__year">{item.year}</span>
            <div>
              <h3>{item.degree}</h3>
              <p>{item.school}</p>
            </div>
          </BlurFade>
        ))}
      </div>
    </div>
    <div className="contact" id="contact">
      <BlurFade delay={100}>
        <header className="section__header">
          <span className="section__eyebrow">Let’s Collaborate</span>
          <h2>Always open to building intelligent experiences that move the needle.</h2>
          <p>Pick your channel—email, voice, or socials—and let’s architect the next AI story together.</p>
        </header>
      </BlurFade>
      <div className="contact__grid">
        {contactLinks.map((item, index) => (
          <BlurFade key={item.label} delay={120 * (index + 1)} className="contact__item">
            <span className="contact__label">{item.label}</span>
            <a href={item.href}>{item.value}</a>
          </BlurFade>
        ))}
      </div>
    </div>
  </section>
);

const Header = () => (
  <header className="header">
    <nav className="nav">
      <a className="nav__brand" href="#hero">
        SR · AI ENGINEER
      </a>
      <div className="nav__links">
        <a className="nav__link" href="#experience">
          Experience
        </a>
        <a className="nav__link" href="#projects">
          Projects
        </a>
        <a className="nav__link" href="#skills">
          Skills
        </a>
        <a className="nav__link" href="#education">
          Education
        </a>
        <a className="nav__link" href="#contact">
          Contact
        </a>
        <AnimatedThemeToggle />
      </div>
    </nav>
  </header>
);

const Footer = () => (
  <footer className="footer">
    <div className="footer__content">
      <p>© {new Date().getFullYear()} Saurabh Rajput. Crafted with React, animations, and a relentless focus on clarity.</p>
      <div className="footer__links">
        <a href="mailto:saurabhrajput24k@gmail.com">Email</a>
        <a href="https://github.com/Saurabh24k" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://www.linkedin.com/in/saurabhrajput24k" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href="assets/pdf/Saurabh_Rajput_(Resume).pdf" target="_blank" rel="noreferrer">
          Résumé
        </a>
      </div>
    </div>
  </footer>
);

const AppShell = () => (
  <ThemeProvider>
    <PointerGlow />
    <ParticlesBackground />
    <div className="app-shell">
      <Header />
      <main className="main">
        <Hero />
        <Experience />
        <Projects />
        <Skills />
        <EducationContact />
      </main>
      <Footer />
    </div>
  </ThemeProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(<AppShell />);

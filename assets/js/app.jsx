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

const AnimatedThemeToggle = () => {
  const { theme, toggle } = useContext(ThemeContext);
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

const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let frameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = Array.from({ length: Math.min(160, Math.floor(canvas.width / 12)) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      }));
    };

    const render = () => {
      const theme = document.documentElement.getAttribute("data-theme") || "dark";
      const hue = theme === "dark" ? 215 : 230;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "transparent";
      context.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        context.beginPath();
        context.fillStyle = `hsla(${hue}, 80%, 70%, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      });

      frameId = requestAnimationFrame(render);
    };

    resize();
    render();

    window.addEventListener("resize", resize);
    animationRef.current = frameId;

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
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
      if (!pointer.classList.contains("pointer--visible")) {
        pointer.classList.add("pointer--visible");
        trail.classList.add("pointer--visible");
      }
    };

    const handleLeave = () => {
      pointer.classList.remove("pointer--visible");
      trail.classList.remove("pointer--visible");
    };

    const update = () => {
      position.current.x += (target.current.x - position.current.x) * 0.12;
      position.current.y += (target.current.y - position.current.y) * 0.12;

      pointer.style.transform = `translate(${target.current.x}px, ${target.current.y}px)`;
      trail.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;

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

const AnimatedText = ({ text }) => {
  const segments = text.split(" ");
  return (
    <span className="animated-text" aria-label={text}>
      {segments.map((segment, index) => (
        <span
          key={`${segment}-${index}`}
          className="animated-text__word"
          style={{ animationDelay: `${index * 0.08}s` }}
        >
          {segment}
        </span>
      ))}
    </span>
  );
};

const BlurFade = ({ children, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
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
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`blur-fade ${className}`}>
      {children}
    </div>
  );
};

const HoverButton = ({ href, children }) => (
  <a href={href} className="interactive-button" target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer" : undefined}>
    <span className="interactive-button__shine" aria-hidden="true" />
    <span className="interactive-button__inner">{children}</span>
  </a>
);

const MagicCard = ({ children, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handlePointerMove = (event) => {
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      node.style.setProperty("--tilt-x", `${rotateX}deg`);
      node.style.setProperty("--tilt-y", `${rotateY}deg`);
      node.style.setProperty("--pointer-x", `${x}px`);
      node.style.setProperty("--pointer-y", `${y}px`);
    };

    const resetTilt = () => {
      node.style.setProperty("--tilt-x", "0deg");
      node.style.setProperty("--tilt-y", "0deg");
    };

    node.addEventListener("pointermove", handlePointerMove);
    node.addEventListener("pointerleave", resetTilt);

    return () => {
      node.removeEventListener("pointermove", handlePointerMove);
      node.removeEventListener("pointerleave", resetTilt);
    };
  }, []);

  return (
    <article ref={ref} className={`magic-card ${className}`}>
      <span className="magic-card__glow" aria-hidden="true" />
      {children}
    </article>
  );
};

const Marquee = ({ items, reverse = false }) => (
  <div className="marquee" aria-hidden="true">
    <div className={`marquee__track ${reverse ? "marquee__track--reverse" : ""}`}>
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="marquee__item">
          {item}
        </span>
      ))}
      {items.map((item, index) => (
        <span key={`${item}-dup-${index}`} className="marquee__item">
          {item}
        </span>
      ))}
    </div>
  </div>
);

const CircularProgress = ({ value, label }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className="circular-progress" role="img" aria-label={`${value} percent ${label}`}>
      <svg viewBox="0 0 120 120">
        <circle className="circular-progress__bg" cx="60" cy="60" r={radius} />
        <circle
          className="circular-progress__indicator"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="circular-progress__content">
        <span className="circular-progress__value">{value}%</span>
        <span className="circular-progress__label">{label}</span>
      </div>
    </div>
  );
};

const AnimatedBeam = () => (
  <div className="animated-beam" aria-hidden="true">
    <span className="animated-beam__line animated-beam__line--one" />
    <span className="animated-beam__line animated-beam__line--two" />
    <span className="animated-beam__line animated-beam__line--three" />
  </div>
);

const NavBar = () => (
  <nav className="nav">
    <a className="nav__brand" href="#home" aria-label="Saurabh Rajput home">
      Sau24k
    </a>
    <div className="nav__links">
      {[
        { href: "#experience", label: "Experience" },
        { href: "#projects", label: "Projects" },
        { href: "#skills", label: "Skills" },
        { href: "#education", label: "Education" },
        { href: "#contact", label: "Contact" },
      ].map((item) => (
        <a key={item.href} className="nav__link" href={item.href}>
          {item.label}
        </a>
      ))}
    </div>
    <AnimatedThemeToggle />
  </nav>
);

const stats = [
  {
    title: "Systems Reliability",
    description: "Predictive maintenance orchestration for healthy fleets.",
    value: 92,
  },
  {
    title: "AI Adoption Velocity",
    description: "Accelerated GTM for mobility AI services across cities.",
    value: 88,
  },
  {
    title: "Experiment Success",
    description: "Research experiments converted to production impact.",
    value: 80,
  },
];

const experiences = [
  {
    role: "AI Engineer",
    company: "Transurban",
    period: "2023 — Present",
    highlights: [
      "Architected anomaly detection for tolling network stability",
      "Led experimentation platform surfacing predictive safety insights",
      "Scaled model lifecycle automation across hybrid cloud"
    ],
  },
  {
    role: "Research Assistant",
    company: "IIT Chicago",
    period: "2021 — 2023",
    highlights: [
      "Published computer vision framework for smart parking",
      "Designed reinforcement agents for adaptive traffic signals",
      "Mentored cross-functional innovation sprints"
    ],
  },
];

const projects = [
  {
    name: "Mobility Guardian",
    description: "Edge AI toolkit that fuses cameras, lidar, and telemetry to prevent roadway hazards in real time.",
    tags: ["Edge AI", "Vision", "Safety"],
    link: "https://github.com/Saurabh24k",
  },
  {
    name: "GlassCity Digital Twin",
    description: "Immersive city simulation bridging generative AI with infrastructure planning dashboards.",
    tags: ["Digital Twin", "Generative AI", "Strategy"],
    link: "https://github.com/Saurabh24k",
  },
  {
    name: "Signal Pulse",
    description: "Autonomous traffic controller optimizing congestion with reinforcement learning agents.",
    tags: ["Reinforcement Learning", "Mobility", "Optimization"],
    link: "https://github.com/Saurabh24k",
  },
];

const skills = [
  {
    title: "AI Platforms",
    items: ["Azure ML", "AWS SageMaker", "Databricks", "Vertex AI"],
  },
  {
    title: "Modeling",
    items: ["Vision Transformers", "Graph Networks", "Generative AI", "Reinforcement Learning"],
  },
  {
    title: "Product Craft",
    items: ["MLOps", "Design Systems", "Experimentation", "Ethical AI"],
  },
];

const education = [
  {
    school: "Illinois Institute of Technology",
    program: "MS — Computer Science",
    period: "2021 — 2023",
    details: "Focused on AI systems, robotics, and human-centered computing.",
  },
  {
    school: "Rajasthan Technical University",
    program: "BTech — Computer Science",
    period: "2017 — 2021",
    details: "Graduated with honors researching mobility intelligence.",
  },
];

const contactLinks = [
  { icon: "uil-linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/saurabh-rajput-24k/" },
  { icon: "uil-github", label: "GitHub", href: "https://github.com/Saurabh24k" },
  { icon: "uil-envelope", label: "Email", href: "mailto:srajput2@hawk.iit.edu" },
];

const Hero = () => (
  <section id="home" className="hero">
    <AnimatedBeam />
    <div className="hero__inner">
      <div className="hero__intro">
        <BlurFade className="hero__eyebrow">
          <span>Artificial Intelligence Engineer</span>
        </BlurFade>
        <BlurFade>
          <h1 className="hero__title">
            <AnimatedText text="Designing responsive intelligence that elevates mobility, safety, and human experiences." />
          </h1>
        </BlurFade>
        <BlurFade>
          <p className="hero__description">
            I’m Saurabh Rajput, architecting human-centered AI ecosystems that bridge research breakthroughs with resilient, delightful products.
          </p>
        </BlurFade>
        <BlurFade className="hero__actions">
          <HoverButton href="#contact">Let’s build together</HoverButton>
          <HoverButton href="assets/pdf/Saurabh Rajput.pdf">Download résumé</HoverButton>
        </BlurFade>
        <BlurFade className="hero__social">
          {contactLinks.map((link) => (
            <a key={link.label} href={link.href} aria-label={link.label} target="_blank" rel="noreferrer">
              <i className={`uil ${link.icon}`} aria-hidden="true" />
            </a>
          ))}
        </BlurFade>
      </div>
      <BlurFade className="hero__visual">
        <MagicCard className="hero-card">
          <img src="assets/img/perfil.png" alt="Portrait of Saurabh Rajput" className="hero-card__portrait" />
          <div className="hero-card__badge">
            <span className="hero-card__pill">
              <i className="uil uil-robot" aria-hidden="true" /> MLOps • Vision • NLP
            </span>
            <span className="hero-card__pill">
              <i className="uil uil-sparkle" aria-hidden="true" /> Responsible AI Advocate
            </span>
          </div>
        </MagicCard>
      </BlurFade>
    </div>
    <div className="hero__marquees">
      <Marquee items={["Autonomous Mobility", "Vision Systems", "Edge AI", "Cloud MLOps", "Product Strategy", "Inclusive Design", "Experimentation", "Responsible AI"]} />
      <Marquee items={["Urban Innovation", "Predictive Maintenance", "Digital Twins", "Human-Centered AI", "Safety Intelligence", "Data Storytelling"]} reverse />
    </div>
  </section>
);

const Spotlight = () => (
  <section className="spotlight" aria-label="Impact metrics">
    <div className="section-heading">
      <BlurFade>
        <h2>Impact in motion</h2>
      </BlurFade>
      <BlurFade>
        <p>Experiment velocity, system reliability, and adoption rates across mission-critical platforms.</p>
      </BlurFade>
    </div>
    <div className="spotlight__grid">
      {stats.map((stat) => (
        <BlurFade key={stat.title}>
          <MagicCard>
            <h3>{stat.title}</h3>
            <p>{stat.description}</p>
            <CircularProgress value={stat.value} label="Performance" />
          </MagicCard>
        </BlurFade>
      ))}
    </div>
  </section>
);

const Experience = () => (
  <section id="experience" className="experience">
    <div className="section-heading">
      <BlurFade>
        <h2>Experience</h2>
      </BlurFade>
      <BlurFade>
        <p>Partnering with mobility operators and research labs to launch adaptive intelligence.</p>
      </BlurFade>
    </div>
    <div className="experience__timeline">
      {experiences.map((exp) => (
        <BlurFade key={exp.role} className="experience__item">
          <MagicCard>
            <header>
              <h3>{exp.role}</h3>
              <div className="experience__meta">
                <span>{exp.company}</span>
                <span>{exp.period}</span>
              </div>
            </header>
            <ul>
              {exp.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </MagicCard>
        </BlurFade>
      ))}
    </div>
  </section>
);

const Projects = () => (
  <section id="projects" className="projects">
    <div className="section-heading">
      <BlurFade>
        <h2>Selected work</h2>
      </BlurFade>
      <BlurFade>
        <p>Magnetizing new possibilities across urban infrastructure, safety, and autonomy.</p>
      </BlurFade>
    </div>
    <div className="projects__grid">
      {projects.map((project) => (
        <BlurFade key={project.name}>
          <MagicCard className="project-card">
            <div className="project-card__header">
              <h3>{project.name}</h3>
              <a href={project.link} target="_blank" rel="noreferrer" className="project-card__link" aria-label={`View ${project.name}`}>
                <i className="uil uil-external-link-alt" aria-hidden="true" />
              </a>
            </div>
            <p>{project.description}</p>
            <div className="project-card__tags">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </MagicCard>
        </BlurFade>
      ))}
    </div>
  </section>
);

const Skills = () => (
  <section id="skills" className="skills">
    <div className="section-heading">
      <BlurFade>
        <h2>Capabilities</h2>
      </BlurFade>
      <BlurFade>
        <p>Full-stack intelligence design from research to reliable operations.</p>
      </BlurFade>
    </div>
    <div className="skills__grid">
      {skills.map((skill) => (
        <BlurFade key={skill.title}>
          <MagicCard>
            <h3>{skill.title}</h3>
            <div className="skills__chips">
              {skill.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </MagicCard>
        </BlurFade>
      ))}
    </div>
  </section>
);

const Education = () => (
  <section id="education" className="education">
    <div className="section-heading">
      <BlurFade>
        <h2>Education</h2>
      </BlurFade>
      <BlurFade>
        <p>Blending rigorous computer science foundations with applied urban tech innovation.</p>
      </BlurFade>
    </div>
    <div className="education__list">
      {education.map((item) => (
        <BlurFade key={item.school} className="education__item">
          <MagicCard>
            <header>
              <h3>{item.school}</h3>
              <span>{item.period}</span>
            </header>
            <p className="education__program">{item.program}</p>
            <p>{item.details}</p>
          </MagicCard>
        </BlurFade>
      ))}
    </div>
  </section>
);

const Contact = () => (
  <section id="contact" className="contact">
    <div className="section-heading">
      <BlurFade>
        <h2>Let’s collaborate</h2>
      </BlurFade>
      <BlurFade>
        <p>Share a challenge. I’ll respond with ideas, prototypes, or experiments ready to explore.</p>
      </BlurFade>
    </div>
    <BlurFade className="contact__grid">
      <MagicCard className="contact__card">
        <form className="contact__form" action="https://formspree.io/f/xrgwbkog" method="POST">
          <label>
            <span>Name</span>
            <input type="text" name="name" required placeholder="How should I greet you?" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" name="email" required placeholder="Where can I reply?" />
          </label>
          <label>
            <span>Project vision</span>
            <textarea name="message" rows="4" required placeholder="Tell me about the future we’ll build." />
          </label>
          <button type="submit" className="contact__submit">
            <span>Send message</span>
            <i className="uil uil-message" aria-hidden="true" />
          </button>
        </form>
      </MagicCard>
      <div className="contact__links">
        {contactLinks.map((link) => (
          <MagicCard key={link.label} className="contact__link">
            <a href={link.href} target="_blank" rel="noreferrer">
              <i className={`uil ${link.icon}`} aria-hidden="true" />
              <span>{link.label}</span>
            </a>
          </MagicCard>
        ))}
      </div>
    </BlurFade>
  </section>
);

const Footer = () => (
  <footer className="footer">
    <p>© {new Date().getFullYear()} Saurabh Rajput. Engineered with curiosity & care.</p>
  </footer>
);

const App = () => (
  <ThemeProvider>
    <ParticlesBackground />
    <PointerGlow />
    <div className="app-shell">
      <header className="header">
        <NavBar />
      </header>
      <main>
        <Hero />
        <Spotlight />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
    </div>
  </ThemeProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

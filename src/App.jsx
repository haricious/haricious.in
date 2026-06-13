import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import navigation from "./content/navigation.json";
import projectsData from "./content/projects.json";
import fieldNotesData from "./content/field-notes.json";
import domainsData from "./content/domains.json";
import radarData from "./content/radar.json";
import personalInfoData from "./content/personal-info.json";
import educationData from "./content/education.json";
import skillGroupsData from "./content/skill-groups.json";
import languageData from "./content/languages.json";
import certificationData from "./content/certifications.json";
import workTimelineData from "./content/work-timeline.json";
import internshipsData from "./content/internships.json";
import repositoriesData from "./content/repositories.json";
import booksData from "./content/books.json";
import siteSettings from "./content/site-settings.json";
import learningLoopData from "./content/learning-loop.json";
import notebookCategoriesData from "./content/notebook-categories.json";
import currentlyData from "./content/currently.json";
import poetryData from "./content/poetry.json";
import aboutSections from "./content/about-sections.json";
import { DecisionTree } from "./features/becoming/components/DecisionTree";
import { HiddenTerminal } from "./features/becoming/components/HiddenTerminal";
import { LiveSignalPath } from "./features/becoming/components/LiveSignalPath";
import { ReadingDepth, makeNoteDepth, makeProjectDepth } from "./features/becoming/components/ReadingDepth";
import { becomingSearchRecords } from "./features/becoming/content";
import {
  ButterflyEffectPage,
  CurrentlyBecomingPage,
  DreamsPage,
  FailuresPage,
  LettersPage,
  WhatChangedMePage,
} from "./features/becoming/pages/BecomingPages";
import { InitialPreloader } from "./components/InitialPreloader";
import "./features/becoming/styles.css";

const navItems = navigation.navItems;
const floatingArchiveLinks = navigation.floatingArchiveLinks;

const projectsStatic = projectsData;
const fieldNotesStatic = fieldNotesData;

// Prefer per-file JSON collections when available; otherwise fall back to single-file data
const _fieldNoteModules = import.meta.glob('./content/field-notes/*.json', { eager: true });
const _fieldNoteEntries = Object.values(_fieldNoteModules).map((m) => m.default ?? m);
const fieldNotes = _fieldNoteEntries.length ? _fieldNoteEntries : fieldNotesStatic;

const _projectModules = import.meta.glob('./content/projects/*.json', { eager: true });
const _projectEntries = Object.values(_projectModules).map((m) => m.default ?? m);
const projects = _projectEntries.length ? _projectEntries : projectsStatic;

const booksStatic = booksData;
const _bookModules = import.meta.glob('./content/books/*.json', { eager: true });
const _bookEntries = Object.values(_bookModules).map((m) => m.default ?? m);
const books = _bookEntries.length ? _bookEntries : booksStatic;

const repositoriesStatic = repositoriesData;
const _repoModules = import.meta.glob('./content/repositories/*.json', { eager: true });
const _repoEntries = Object.values(_repoModules).map((m) => m.default ?? m);
const repositories = _repoEntries.length ? _repoEntries : repositoriesStatic;

const domains = domainsData;

const radarItems = radarData;

const personalInfo = personalInfoData;
const personalContact = Object.fromEntries(personalInfo);

const educationArchive = educationData;

const skillGroups = skillGroupsData;

const languageArchive = languageData;

const certificationArchive = certificationData;

const workTimeline = workTimelineData;

const engineeringInternships = internshipsData;

const learningLoop = learningLoopData;

const notebookCategories = notebookCategoriesData;

const currentlyExploring = currentlyData.currentlyExploring;

const currentlyActive = currentlyData.currentlyActive;

const poetryPieces = poetryData;

const allContent = [
  ...projects.map((item) => ({
    ...item,
    kind: "PROJECT",
    path: `/build-log/${item.slug}`,
    summary: item.outcome,
  })),
  ...fieldNotes.map((item) => ({
    ...item,
    kind: item.type,
    path: `/field-notes/${item.slug}`,
  })),
  ...repositories.map((item) => ({
    ...item,
    kind: "REPOSITORY",
    path: `/repositories/${item.slug}`,
    summary: item.description,
  })),
  ...domains.map((item) => ({
    ...item,
    kind: "LEARNING",
    path: "/learning",
    summary: item.copy,
    date: "[2024.03.15]",
  })),
  ...becomingSearchRecords,
];

const fuse = new Fuse(allContent, {
  includeScore: true,
  threshold: 0.36,
  keys: ["title", "summary", "outcome", "lesson", "tags", "domain", "type"],
});

const interviewKnowledgeRecords = allContent.map((item) => ({
  ...item,
  source: item.kind,
  text: [
    item.title,
    item.summary,
    item.outcome,
    item.lesson,
    item.domain,
    item.type,
    item.tags?.join(" "),
    item.details ? Object.values(item.details).flat().join(" ") : "",
    item.body?.join(" "),
  ].filter(Boolean).join(" "),
}));

function App() {
  const location = useLocation();
  const [preloaderVisible, setPreloaderVisible] = useState(true);

  useEffect(() => {
    if (siteSettings?.seoDefaultTitle) document.title = siteSettings.seoDefaultTitle;
    const desc = siteSettings?.seoDefaultDescription;
    if (desc) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = desc;
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <>
      {preloaderVisible && <InitialPreloader onFinished={() => setPreloaderVisible(false)} />}
      <div
        className="site-experience"
        aria-hidden={preloaderVisible ? "true" : undefined}
        inert={preloaderVisible ? "" : undefined}
      >
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Navbar />
        <HiddenTerminal />
        <LiveSignalPath />
        <main id="main-content" className="app-shell">
          <div className="route-fade" key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/tags/:tag" element={<TagPage />} />
              <Route path="/build-log" element={<BuildLog />} />
              <Route path="/build-log/:slug" element={<ProjectDetail />} />
              <Route path="/field-notes" element={<FieldNotes />} />
              <Route path="/field-notes/:slug" element={<FieldNoteDetail />} />
              <Route path="/poetry" element={<Poetry />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/repositories" element={<Repositories />} />
              <Route path="/repositories/:slug" element={<RepositoryDetail />} />
              <Route path="/books" element={<BookShelf />} />
              <Route path="/books/:slug" element={<BookDetail />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/about" element={<About />} />
              <Route path="/failures" element={<FailuresPage />} />
              <Route path="/currently-becoming" element={<CurrentlyBecomingPage />} />
              <Route path="/dreams" element={<DreamsPage />} />
              <Route path="/butterfly-effect" element={<ButterflyEffectPage />} />
              <Route path="/what-changed-me" element={<WhatChangedMePage />} />
              <Route path="/letters" element={<LettersPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuButtonRef = useRef(null);
  const mobileNavRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const close = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  // focus management & focus trap for mobile panel
  useEffect(() => {
    const site = document.querySelector('.site-experience');
    const mobile = mobileNavRef.current;
    if (open) {
      previouslyFocusedRef.current = document.activeElement;
      site?.setAttribute('aria-hidden', 'true');
      // focus first focusable element inside mobile panel
      requestAnimationFrame(() => {
        const focusable = mobile?.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
        (focusable && focusable[0])?.focus();
      });

      const handleTrap = (e) => {
        if (e.key !== 'Tab') return;
        const focusable = Array.from(mobile.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      mobile?.addEventListener('keydown', handleTrap);
      return () => mobile?.removeEventListener('keydown', handleTrap);
    }
    // on close, restore focus
    site?.removeAttribute('aria-hidden');
    previouslyFocusedRef.current?.focus?.();
    return undefined;
  }, [open]);

  return (
    <header className="site-nav">
      <Link className="logo" to="/" onClick={close}>&gt; haricious.in</Link>
      <form className="nav-search" action="/search" onSubmit={close}>
        <label htmlFor="site-search">Search site</label>
        <input id="site-search" name="q" placeholder="search clock-domain-crossing" />
      </form>
      <div className="nav-history" aria-label="History navigation">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>&lt;</button>
        <button type="button" aria-label="Go forward" onClick={() => navigate(1)}>&gt;</button>
      </div>
      <nav className="desktop-links" aria-label="Primary">
        {navItems.map((item) => <NavLink key={item.path} to={item.path}>{item.label}</NavLink>)}
      </nav>

      {/* Mobile menu button */}
      <button
        ref={menuButtonRef}
        className="menu-button"
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      </header>

      {/* Slide-in mobile panel (moved outside header to avoid clipping) */}
      <div className={`mobile-backdrop ${open ? 'is-open' : ''}`} onClick={close} aria-hidden={!open} />
      <aside ref={mobileNavRef} id="mobile-nav" className={`mobile-overlay ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="mobile-header">
          <strong className="logo">&gt; haricious.in</strong>
          <button className="close-btn" aria-label="Close menu" onClick={close}>✕</button>
        </div>
        <div className="mobile-search">
          <form action="/search" onSubmit={close}>
            <label htmlFor="mobile-search">Search</label>
            <input id="mobile-search" name="q" placeholder="search site" />
          </form>
        </div>
        <nav className="mobile-links" aria-label="Mobile">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={close} className="mobile-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
  );
}

function Home() {
  const headline = "Hari Sankar Saravanan.";
  const [typedHeadline, setTypedHeadline] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTypedHeadline(headline);
      setTypingDone(true);
      return undefined;
    }
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedHeadline(headline.slice(0, index));
      if (index >= headline.length) {
        window.clearInterval(timer);
        setTypingDone(true);
      }
    }, 58);
    return () => window.clearInterval(timer);
  }, []);

  const recent = timelineItems().slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">// ENGINEERING JOURNEY LOG</p>
          <h1 className="type-headline"><span className="typed-line">{typedHeadline}</span></h1>
          <p className={`hero-subhead ${typingDone ? "is-visible" : ""}`}>
            final year ece undergrad | the kind of engineer who wants to create what does not exist yet.
          </p>
          <div className={`hero-actions ${typingDone ? "is-visible" : ""}`}>
            <a className="pcb-button" href="#living-archive-title">[ START WITH MY DETAILS ]</a>
            <a className="pcb-button secondary" href="#portfolio-map-title">[ EXPLORE THE SITE ]</a>
          </div>
          <section className={`hero-current pcb-card ${typingDone ? "is-visible" : ""}`} aria-labelledby="currently-working">
            <h2 id="currently-working">// CURRENTLY WORKING ON</h2>
            <div>
              {currentlyActive.map(([label, copy]) => (
                <article key={label}>
                  <span>{label}</span>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
        <CircuitScope />
      </section>

      <section className="signal-strip">
        &gt; CONTACT: iamhari1812@gmail.com / linkedin.com/in/haricious / dindigul, tamil nadu
      </section>

      <LivingArchive />
      <FloatingArchiveCards />
      <PortfolioFollowupSections />

      <section className="content-band">
        <SchematicDivider />
        <section className="terminal-feed" aria-labelledby="recent-activity">
          <h2 id="recent-activity">// RECENT ACTIVITY</h2>
          {recent.map((item) => (
            <article className="feed-row" key={`${item.kind}-${item.title}`}>
              <LogicTag label={item.kind} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>
              <time>{item.date}</time>
            </article>
          ))}
        </section>
      </section>
    </>
  );
}

function LivingArchive() {
  return (
    <section className="living-archive" aria-labelledby="living-archive-title">
      <div className="archive-header">
        <p className="eyebrow">// ABOUT HARI</p>
        <h2 id="living-archive-title">The person behind the portfolio.</h2>
        <p>
          Start here: personal details, college, skills, work experience, internships, what I am
          learning, how I think, and the journey that shaped the projects documented later.
        </p>
      </div>

      <ArchiveSection kicker="// PERSONAL INFORMATION" >
        <div className="archive-info-grid">
          {personalInfo.map(([label, value]) => (
            <div className="archive-info-row pcb-card" key={label}>
              <span>{label}</span>  
              {label === "EMAIL" ? <a href={`mailto:${value}`}>{value}</a> : label === "LINKEDIN" ? <a href={`https://${value}`}>{value}</a> : <strong>{value}</strong>}
            </div>
          ))}
        </div>
      </ArchiveSection>

      <ArchiveSection kicker="// ABOUT ME" title="i build things">
        <div className="archive-prose pcb-card">
          <p>sometimes in verilog.</p>
          <p>sometimes in prose.</p>
          <p>
            i am an electronics and communication engineering student exploring digital design,
            vlsi, engineering systems, and the art of turning ideas into systems that work.
          </p>
          <p>
            whether it is an rtl module, a software tool, a video, an article, or a psychological
            crime thriller, the process feels surprisingly similar.
          </p>
          <p>start with a blank page. define the architecture. connect the pieces. find the bugs. improve the system. repeat.</p>
          <p>
            i document what i learn as obsessively as i learn it. not because i have all the
            answers, but because the fastest way to understand something is to build it, break it,
            and explain it.
          </p>
          <p>
            right now i am focused on becoming a better engineer one project at a time. no
            shortcuts. no ai-written code. just curiosity, consistency, experimentation, and a
            growing collection of things that did not exist until i built them.
          </p>
          <blockquote>do the usual thing in the most unusual way.</blockquote>
        </div>
      </ArchiveSection>

      <ArchiveSection kicker="// NOW" title="currently learning">
        <div className="now-archive pcb-card">
          <p>
            the current focus is practical: build stronger foundations, keep better notes, and turn
            curiosity into artifacts that can be revisited.
          </p>
          <TagCloud items={currentlyExploring} />
        </div>
      </ArchiveSection>

      <ArchiveSection kicker="// EDUCATION" title="where the foundations are from">
        <div className="archive-card-grid">
          {educationArchive.map((entry) => (
            <article className="archive-card pcb-card" key={entry.place}>
              <span className="mono-chip">{entry.years}</span>
              <h3>{entry.place}</h3>
              <p>{entry.program}</p>
              <MiniList label="// FOCUS AREAS" items={entry.focus} />
              {entry.activities?.length ? <MiniList label="// ACTIVITIES" items={entry.activities} /> : null}
            </article>
          ))}
        </div>
      </ArchiveSection>

      <ArchiveSection kicker="// SKILLS" title="tools, interests, and directions">
        <div className="archive-card-grid">
          {skillGroups.map((group) => (
            <article className="archive-card pcb-card" key={group.title}>
              <h3>{group.title}</h3>
              <TagCloud items={group.items} />
            </article>
          ))}
          <article className="archive-card pcb-card">
            <h3>LANGUAGES</h3>
            {languageArchive.map(([language, level]) => <p className="archive-pair" key={language}><strong>{language}</strong><span>{level}</span></p>)}
          </article>
          <article className="archive-card pcb-card">
            <h3>CERTIFICATIONS</h3>
            <MiniList label="// COMPLETED" items={certificationArchive} />
          </article>
        </div>
      </ArchiveSection>

      <ArchiveSection kicker="// ENGINEERING INTERNSHIPS" title="project internships and upcoming industry work" subtext="this section is separate from the early work timeline. it is where engineering internships, project internships, and future technical experiences will live.">
        <div className="internship-grid">
          {engineeringInternships.map((entry) => (
            <article className="internship-card pcb-card" key={`${entry.place}-${entry.date}`}>
              <div className="card-topline"><span className="mono-chip">{entry.date}</span><StatusTag status={entry.status} /></div>
              <h3>{entry.place}</h3>
              <p>{entry.role}</p>
              <MiniList label="// FOCUS" items={entry.focus} />
              <MiniList label="// TO DOCUMENT" items={entry.notes} />
            </article>
          ))}
          <article className="internship-card pcb-card">
            <div className="card-topline"><span className="mono-chip">future</span><StatusTag status="BUILDING" /></div>
            <h3>Upcoming Engineering Internships</h3>
            <p>This is the dedicated space for future VLSI, RTL, embedded, semiconductor, and engineering project internships.</p>
            <MiniList label="// EACH ENTRY WILL TRACK" items={["role and organization", "problem worked on", "tools and methods", "mistakes and learnings", "final outcome"]} />
          </article>
        </div>
      </ArchiveSection>

      <ArchiveSection kicker="// SURVIVAL OF THE FITTEST" title="before engineering, there was work" subtext="my journey did not begin with engineering projects. it began with jobs that taught responsibility, communication, discipline, operations, documentation, and business processes.">
        <div className="work-archive">
          {workTimeline.map((entry) => (
            <article className="work-card pcb-card" key={`${entry.place}-${entry.date}`}>
              <div className="card-topline"><span className="mono-chip">{entry.date}</span><StatusTag status={entry.place.includes("Gandhigram") ? "BUILDING" : "COMPLETED"} /></div>
              <h3>{entry.place}</h3>
              <p>{entry.role}</p>
              <MiniList label="// RESPONSIBILITIES" items={entry.responsibilities} />
              <MiniList label="// LESSONS LEARNED" items={entry.lessons} />
            </article>
          ))}
        </div>
      </ArchiveSection>

    </section>
  );
}

function FloatingArchiveCards() {
  return (
    <section className="floating-links-section content-band" aria-labelledby="portfolio-map-title">
      <div className="floating-links-header">
        <p className="eyebrow">// PORTFOLIO MAP</p>
        <h2 id="portfolio-map-title">What is inside this site.</h2>
        <p>
          After the personal archive, this is the quick map to projects, notes, poetry, failures,
          learning pages, and the more experimental parts of the portfolio.
        </p>
      </div>
      <div className="floating-entry-grid">
        {floatingArchiveLinks.map((item, index) => (
          <EntryCard {...item} floating index={index} key={item.path} />
        ))}
      </div>
    </section>
  );
}

function PortfolioFollowupSections() {
  return (
    <section className="portfolio-followup living-archive" aria-label="Portfolio follow-up sections">
      <ArchiveSection kicker="// HOW I LEARN" title="learn, build, break, debug, document, teach, repeat">
        <div className="learning-loop">
          {learningLoop.map(([stage, copy]) => (
            <article className="loop-card pcb-card" key={stage}>
              <h3>{stage}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </ArchiveSection>

    </section>
  );
}

function Poetry() {
  return (
    <PageFrame title="POETRY /" subtext="A separate reading room for poems, fragments, and writings from Instagram. Personal, quieter, and still part of the archive.">
      <section className="poetry-intro pcb-card">
        <p>
          I build things in Verilog and I also build sentences when the feeling is harder to wire.
          This page is for the poems and fragments I share on Instagram, collected here so people can
          read them slowly instead of losing them inside the feed.
        </p>
        <a className="pcb-button" href="https://www.instagram.com/hariquills/" target="_blank" rel="noreferrer">[ OPEN INSTAGRAM ]</a>
      </section>
      <div className="poetry-grid">
        {poetryPieces.map((piece) => (
          <article className="poetry-card pcb-card" key={piece.title}>
            <div className="card-topline"><LogicTag label={piece.status} /><time>{piece.date}</time></div>
            <h2>{piece.title}</h2>
            <p>{piece.excerpt}</p>
            {piece.embedUrl ? (
              <iframe className="poem-embed" src={piece.embedUrl} title={`${piece.title} Instagram embed`} loading="lazy" />
            ) : piece.instagramUrl ? (
              <a className="embed-link" href={piece.instagramUrl} target="_blank" rel="noreferrer">View Instagram post</a>
            ) : (
              <p className="embed-note">No external embed available.</p>
            )}
          </article>
        ))}
      </div>
    </PageFrame>
  );
}

function ArchiveSection({ kicker, title, subtext, children }) {
  return (
    <section className="archive-section">
      <div className="archive-section-heading">
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        {subtext && <p>{subtext}</p>}
      </div>
      {children}
    </section>
  );
}

function MiniList({ label, items }) {
  return (
    <div className="mini-list">
      <span className="section-label">{label}</span>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}

function TagCloud({ items }) {
  return <div className="archive-tag-cloud">{items.map((item) => <span key={item}>{item}</span>)}</div>;
}

function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const results = query.trim() ? fuse.search(query).map((result) => result.item) : allContent;

  return (
    <PageFrame title="SEARCH /" subtext="One local index across projects, notes, and learning domains. No backend. No waiting.">
      <form className="search-panel pcb-card" onSubmit={(event) => {
        event.preventDefault();
        setParams({ q: new FormData(event.currentTarget).get("q") });
      }}>
        <label htmlFor="search-page-input">// QUERY</label>
        <input id="search-page-input" name="q" defaultValue={query} placeholder="clock domain crossing, stm32, synthesis..." autoFocus />
        <button className="pcb-button" type="submit">[ RUN SEARCH ]</button>
      </form>
      <ResultList results={results} emptyCopy="No matching signal found." />
    </PageFrame>
  );
}

function TagPage() {
  const { tag } = useParams();
  const results = allContent.filter((item) => item.tags?.includes(tag));

  return (
    <PageFrame title={`TAG / ${tag}`} subtext="Everything that shares this concept, across projects, notes, and learning areas.">
      <ResultList results={results} emptyCopy="No content uses this tag yet." />
    </PageFrame>
  );
}

function BuildLog() {
  const visible = projects;

  return (
    <PageFrame title="BUILD_LOG /" subtext="Every project documented from idea to outcome. Including what broke.">
      <div className="project-grid">
        {visible.map((project) => (
          <Link className="project-card pcb-card" to={`/build-log/${project.slug}`} key={project.slug}>
            <div className="card-topline"><span className="mono-chip">{project.domain}</span><StatusTag status={project.status} /></div>
            <h2>{project.title}</h2>
            <p><strong>Outcome:</strong> {project.outcome}</p>
            <p><strong>Lesson:</strong> {project.lesson}</p>
            <TagRow tags={project.tags} />
            <div className="card-footer"><time>{project.date}</time><span aria-hidden="true">-&gt;</span></div>
          </Link>
        ))}
      </div>
    </PageFrame>
  );
}

function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return <Navigate to="/build-log" replace />;
  const details = project.details || makeProjectDetails(project);
  const relatedNotes = project.relatedNotes
    ? project.relatedNotes.map((slug) => fieldNotes.find((note) => note.slug === slug)).filter(Boolean)
    : relatedByTags(project, fieldNotes);

  return (
    <PageFrame title={project.title} subtext={`${project.domain} // ${project.date}`}>
      <div className="detail-meta"><StatusTag status={project.status} /><TagRow tags={project.tags} inline /></div>
      <ReadingDepth title="KNOWLEDGE COMPRESSION" depths={makeProjectDepth(project, details)} />
      <DetailSection label="// WHAT IT IS">{details.what}</DetailSection>
      <DetailSection label="// WHY I BUILT IT">{details.why}</DetailSection>
      <DetailSection label="// THE PROCESS">{details.process}</DetailSection>
      <DetailSection label="// WHAT BROKE" warning>{details.broke}</DetailSection>
      <DetailSection label="// WHAT I LEARNED">{details.learned}</DetailSection>
      <DetailSection label="// WHAT I'D DO DIFFERENTLY">{details.different}</DetailSection>
      <DecisionTree projectTitle={project.title} />
      <RelatedNotes notes={relatedNotes} />
      <section className="detail-section pcb-card">
        <h2>// RESOURCES THAT HELPED</h2>
        <ul className="resource-list">{details.resources.map((resource) => <li key={resource}>{resource}</li>)}</ul>
      </section>
    </PageFrame>
  );
}

function FieldNotes() {
  const filters = ["ALL", "PROJECT NOTE", "FIELD NOTE", "FAILURE NOTE"];
  const [filter, setFilter] = useState("ALL");
  const visible = useMemo(() => {
    const sorted = [...fieldNotes].sort((a, b) => stampToDate(b.date) - stampToDate(a.date));
    return filter === "ALL"
      ? sorted
      : filter === "PROJECT NOTE"
      ? sorted.filter((entry) => entry.type === "PROJECT NOTE")
      : filter === "FIELD NOTE"
      ? sorted.filter((entry) => entry.type === "FIELD NOTE")
      : sorted.filter((entry) => entry.type === "FAILURE NOTE");
  }, [filter]);

  return (
    <PageFrame title="FIELD_NOTES /" subtext="Observations, lessons, failures, and thoughts from the journey. Unpolished by design.">
      <FilterBar filters={filters} active={filter} onChange={setFilter} />
      <div className="notes-list">
        {visible.map((entry, index) => <NoteRow entry={entry} index={index} key={entry.slug} />)}
      </div>
    </PageFrame>
  );
}

function FieldNoteDetail() {
  const { slug } = useParams();
  const note = fieldNotes.find((entry) => entry.slug === slug);
  if (!note) return <Navigate to="/field-notes" replace />;
  const paragraphs = note.body || [note.summary, "This note is part of the running log: incomplete, honest, and written close to the moment where the lesson became obvious."];

  return (
    <PageFrame title={note.title} subtext={`${note.type} // ${note.date}`}>
      <article className="post-body pcb-card">
        <div className="post-meta"><LogicTag label={note.type} /><time>{note.date}</time></div>
        <TagRow tags={note.tags} />
        {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {note.updates && <PostUpdates updates={note.updates} />}
      </article>
      <ReadingDepth title="KNOWLEDGE COMPRESSION" depths={makeNoteDepth(note, paragraphs)} />
      {note.series && <SeriesNav note={note} />}
      <RelatedProjects note={note} />
    </PageFrame>
  );
}

function relatedContentForRepo(repo) {
  const relatedProjects = repo.relatedProjects
    ? repo.relatedProjects.map((slug) => projects.find((item) => item.slug === slug)).filter(Boolean)
    : relatedByTags(repo, projects);
  const relatedNotes = repo.relatedNotes
    ? repo.relatedNotes.map((slug) => fieldNotes.find((note) => note.slug === slug)).filter(Boolean)
    : relatedByTags(repo, fieldNotes);
  return { relatedProjects, relatedNotes };
}

function Repositories() {
  return (
    <PageFrame title="GITHUB REPOS /" subtext="Source repositories linked to projects, notes, and the site journey.">
      <div className="project-grid">
        {repositories.map((repo) => (
          <Link className="project-card pcb-card" to={`/repositories/${repo.slug}`} key={repo.slug}>
            <div className="card-topline"><span className="mono-chip">{repo.language}</span><StatusTag status="ACTIVE" /></div>
            <h2>{repo.title}</h2>
            <p>{repo.description}</p>
            <TagRow tags={repo.tags} />
            <div className="card-footer"><span>{repo.stars} ★</span><span aria-hidden="true">-&gt;</span></div>
          </Link>
        ))}
      </div>
    </PageFrame>
  );
}

function RepositoryDetail() {
  const { slug } = useParams();
  const repo = repositories.find((item) => item.slug === slug);
  if (!repo) return <Navigate to="/repositories" replace />;
  const { relatedProjects, relatedNotes } = relatedContentForRepo(repo);

  return (
    <PageFrame title={repo.title} subtext={`${repo.language} // ${repo.stars} Stars`}>
      <div className="detail-meta"><StatusTag status="ACTIVE" /><TagRow tags={repo.tags} inline /></div>
      <DetailSection label="// DESCRIPTION">{repo.description}</DetailSection>
      <DetailSection label="// REPOSITORY URL"><a href={repo.url} target="_blank" rel="noreferrer">{repo.url}</a></DetailSection>
      <DetailSection label="// TECHNOLOGIES">{repo.topics?.join(", ")}</DetailSection>
      <DetailSection label="// RELATED PROJECTS">
        {relatedProjects.length ? relatedProjects.map((project) => (
          <Link className="related-link" key={project.slug} to={`/build-log/${project.slug}`}>{project.title}</Link>
        )) : <p>No directly related projects yet.</p>}
      </DetailSection>
      <DetailSection label="// RELATED NOTES">
        {relatedNotes.length ? relatedNotes.map((note) => (
          <Link className="related-link" key={note.slug} to={`/field-notes/${note.slug}`}>{note.title}</Link>
        )) : <p>No directly related notes yet.</p>}
      </DetailSection>
    </PageFrame>
  );
}

function Learning() {
  return (
    <PageFrame title="LEARNING_MAP /" subtext="A map of where I am, not a checklist of what I've passed.">
      <div className="domain-grid">
        {domains.map((domain) => (
          <article className="domain-card pcb-card" key={domain.title}>
            <div className="card-topline"><h2>{domain.title}</h2><StatusTag status={domain.status} /></div>
            <p>{domain.copy}</p>
            <TagRow tags={domain.tags} />
            {domain.learning && <div className="learning-list"><span className="section-label">// CURRENTLY LEARNING</span>{domain.learning.map((item) => <span key={item}>{item}</span>)}</div>}
            {domain.links && <div className="linked-entries"><span className="section-label">// LINKED ENTRIES</span>{domain.links.map((link) => <Link to={link.path} key={link.path}>{link.label}</Link>)}</div>}
          </article>
        ))}
        <article className="domain-card radar-card pcb-card">
          <div className="card-topline"><h2>ON THE RADAR</h2><StatusTag status="LOW" /></div>
          <ul>{radarItems.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </div>
    </PageFrame>
  );
}

function Timeline() {
  return (
    <PageFrame title="TIMELINE /" subtext="A git-log style view of projects, notes, failures, learning shifts, and site updates.">
      <div className="timeline">
        {timelineItems().map((item) => (
          <article className="timeline-item" key={`${item.kind}-${item.title}-${item.date}`}>
            <time>{item.date}</time>
            <div className="timeline-node" aria-hidden="true" />
            <Link className="timeline-card pcb-card" to={item.path || "/timeline"}>
              <LogicTag label={item.kind} />
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
            </Link>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}

function BookShelf() {
  return (
    <PageFrame title="BOOK SHELF /" subtext="A collection of books that shaped how I think.">
      <div className="project-grid">
        {books.map((book) => (
          <Link className="project-card pcb-card" to={`/books/${book.slug}`} key={book.slug}>
            <div className="card-topline"><span className="mono-chip">{book.category}</span><StatusTag status={book.status} /></div>
            <h2>{book.title}</h2>
            <p>{book.summary}</p>
            <p className="book-author">{book.author}</p>
            <TagRow tags={book.tags} />
            <div className="card-footer"><time>{book.dateFinished}</time><span aria-hidden="true">-&gt;</span></div>
          </Link>
        ))}
      </div>
    </PageFrame>
  );
}

function BookDetail() {
  const { slug } = useParams();
  const book = books.find((item) => item.slug === slug);
  if (!book) return <Navigate to="/books" replace />;

  return (
    <PageFrame title={book.title} subtext={`${book.author} // ${book.category}`}>
      <div className="detail-meta"><StatusTag status={book.status} /><TagRow tags={book.tags} inline /></div>
      <section className="detail-section pcb-card">
        <h2>// SUMMARY</h2>
        <p>{book.summary}</p>
      </section>
      <section className="detail-section pcb-card">
        <h2>// VERDICT</h2>
        <p>{book.verdict}</p>
      </section>
      <section className="detail-section pcb-card">
        <h2>// DETAILS</h2>
        <p><strong>Why read:</strong> {book.details.whyRead}</p>
        <p><strong>Expectation:</strong> {book.details.expectation}</p>
        <p><strong>What I found:</strong> {book.details.whatFound}</p>
      </section>
      <section className="detail-section pcb-card">
        <h2>// FAVORITE IDEAS</h2>
        <ul>{book.details.favoriteIdeas.map((idea) => <li key={idea}>{idea}</li>)}</ul>
      </section>
      <section className="detail-section pcb-card">
        <h2>// KEY TAKEAWAYS</h2>
        <ul>{book.details.keyTakeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}</ul>
      </section>
      <section className="detail-section pcb-card">
        <h2>// WHAT CHANGED</h2>
        <p>{book.details.whatChanged}</p>
      </section>
      <section className="detail-section pcb-card">
        <h2>// APPLIED IN</h2>
        <ul>{book.details.appliedIn.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="detail-section pcb-card">
        <h2>// RECOMMENDATION</h2>
        <p>{book.details.recommendation}</p>
      </section>
    </PageFrame>
  );
}

function Resume() {
  return (
    <PageFrame title="RESUME /" subtext="A print-optimized resume generated from the same project and learning data as the site.">
      <div className="resume-actions"><button className="pcb-button" type="button" onClick={() => window.print()}>[ PRINT / SAVE PDF ]</button></div>
      <article className="resume-sheet">
        <header><h2>{personalContact.NAME}</h2><p>Third-year Electronics and Communication Engineering student | Digital design, RTL, FPGA, embedded systems</p><p>{personalContact.LINKEDIN} | {personalContact.EMAIL}</p></header>
        <section><h3>Focus</h3><p>Building toward digital design, RTL development, and chip design through documented projects, failure logs, and hardware-first learning.</p></section>
        <section><h3>Projects</h3>{projects.slice(0, 4).map((project) => <div className="resume-item" key={project.slug}><h4>{project.title}</h4><p>{project.outcome}. {project.lesson}.</p><p>{project.tags.map(formatTag).join(" / ")}</p></div>)}</section>
        <section><h3>Learning Map</h3><p>{domains.map((domain) => domain.title).join(" / ")}</p></section>
        <section><h3>Tools</h3><p>Verilog, VHDL, C, MATLAB, ModelSim, Vivado, Quartus, STM32, Basys3, ARM Cortex-M.</p></section>
      </article>
    </PageFrame>
  );
}

function About() {

  const sections = aboutSections;
  return (
    <PageFrame title="SIGNAL_SOURCE /" subtext="The person behind the log. Still learning. Still wiring things up.">
      <div className="about-stack">
        {sections.map(([label, copy]) => <section className="about-section pcb-card" key={label}><h2>{label}</h2><p>{copy}</p></section>)}
        <section className="about-section pcb-card"><h2>// HOW TO REACH ME</h2><ul className="contact-list"><li>GitHub: <a href="https://github.com/haricious">github.com/haricious</a></li><li>LinkedIn: <a href={`https://${personalContact.LINKEDIN}`}>{personalContact.LINKEDIN}</a></li><li>Email: <a href={`mailto:${personalContact.EMAIL}`}>{personalContact.EMAIL}</a></li></ul></section>
      </div>
    </PageFrame>
  );
}

function ResultList({ results, emptyCopy }) {
  if (!results.length) return <p className="empty-copy">{emptyCopy}</p>;
  return <div className="notes-list">{results.map((item, index) => <Link className="note-row pcb-card" to={item.path} key={`${item.kind}-${item.title}`}><span className="line-number">{String(index + 1).padStart(2, "0")}</span><LogicTag label={item.kind} /><div className="note-main"><h2>{item.title}</h2><p>{item.summary || item.outcome}</p><TagRow tags={item.tags || []} /></div><time>{item.date}</time></Link>)}</div>;
}

function NoteRow({ entry, index }) {
  return <Link className="note-row pcb-card" to={`/field-notes/${entry.slug}`}><span className="line-number">{String(index + 1).padStart(2, "0")}</span><LogicTag label={entry.type} /><div className="note-main"><h2>{entry.title}</h2><p>{entry.summary}</p><TagRow tags={entry.tags} /></div><time>{entry.date}</time></Link>;
}

function RelatedNotes({ notes }) {
  return <section className="detail-section pcb-card"><h2>// FIELD NOTES WRITTEN DURING THIS THREAD</h2>{notes.length ? notes.map((note) => <Link className="related-link" to={`/field-notes/${note.slug}`} key={note.slug}>{note.title} <time>{note.date}</time></Link>) : <p>No related notes yet.</p>}</section>;
}

function RelatedProjects({ note }) {
  const related = relatedByTags(note, projects);
  return <section className="detail-section pcb-card"><h2>// RELATED PROJECTS</h2>{related.map((project) => <Link className="related-link" to={`/build-log/${project.slug}`} key={project.slug}>{project.title} <time>{project.date}</time></Link>)}</section>;
}

function SeriesNav({ note }) {
  const entries = fieldNotes.filter((entry) => entry.series?.name === note.series.name).sort((a, b) => a.series.part - b.series.part);
  const index = entries.findIndex((entry) => entry.slug === note.slug);
  const prev = entries[index - 1];
  const next = entries[index + 1];
  return <nav className="series-nav pcb-card" aria-label="Series navigation"><p className="section-label">Part {note.series.part} of {note.series.total}: {note.series.name}</p><div>{prev ? <Link to={`/field-notes/${prev.slug}`}>Prev: {prev.title}</Link> : <span />}{next ? <Link to={`/field-notes/${next.slug}`}>Next: {next.title}</Link> : <span />}</div></nav>;
}

function PostUpdates({ updates }) {
  return <section className="post-updates"><h2>// POSTSCRIPT</h2>{updates.map((update) => <article key={update.date}><time>{update.date}</time><p>{update.copy}</p></article>)}</section>;
}

function PageFrame({ title, subtext, children }) {
  return <section className="page-frame"><header className="page-header"><p className="eyebrow">// SIGNAL PATH</p><h1>{title}</h1><p>{subtext}</p></header><SchematicDivider />{children}</section>;
}

function EntryCard({ title, copy, count, path, floating = false, index = 0 }) {
  const style = floating ? { "--float-delay": `${(index % 7) * -0.42}s` } : undefined;
  return (
    <Link className={`entry-card pcb-card${floating ? " floating-entry-card" : ""}`} style={style} to={path}>
      <div>
        {count ? <span className="mono-chip">{count}</span> : null}
        <h2>{title}</h2>
        {copy ? <p>{copy}</p> : null}
      </div>
      <span className="entry-arrow" aria-hidden="true">-&gt;</span>
    </Link>
  );
}

function FilterBar({ filters, active, onChange }) {
  return <div className="filter-bar" role="tablist" aria-label="Content filter">{filters.map((filter) => <button className={filter === active ? "active" : ""} key={filter} onClick={() => onChange(filter)} type="button">{filter}</button>)}</div>;
}

function TagRow({ tags, inline = false }) {
  return <div className={`tag-row ${inline ? "tag-row-inline" : ""}`}>{tags.map((tag) => <Link to={`/tags/${tag}`} key={tag}>{formatTag(tag)}</Link>)}</div>;
}

function StatusTag({ status }) {
  const normalized = status === "COMPLETED" ? "HIGH" : status === "ONGOING" ? "ACTIVE" : status;
  return <span className={`status-tag status-${normalized.toLowerCase()}`}>{normalized}</span>;
}

function LogicTag({ label }) {
  const mode = label.includes("FAILURE") ? "low" : label.includes("PROJECT") || label.includes("LONG") ? "high" : "active";
  return <span className={`logic-tag status-${mode}`}>[{label}]</span>;
}

function DetailSection({ label, warning = false, children }) {
  return <section className={`detail-section pcb-card ${warning ? "warning-section" : ""}`}><h2>{label}</h2><p>{children}</p></section>;
}

function SchematicDivider() {
  return <div className="schematic-divider" aria-hidden="true"><span /><svg viewBox="0 0 120 22" role="img"><path d="M2 11h20l6-8 12 16 12-16 12 16 12-16 6 8h36" /></svg><span /></div>;
}

function CircuitScope() {
  return (
    <div className="circuit-scope pcb-card" aria-hidden="true">
      <svg viewBox="0 0 520 420">
        <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <path className="trace trace-a" d="M48 88H164V48H296v76h128" />
        <path className="trace trace-b" d="M52 212h88v-44h82v96h92v-56h146" />
        <path className="trace trace-c" d="M70 330h96v-54h72v54h104v-96h92" />
        <g className="chip"><rect x="198" y="132" width="124" height="116" rx="4" /><path d="M182 150h16M182 176h16M182 202h16M182 228h16M322 150h16M322 176h16M322 202h16M322 228h16" /><text x="222" y="196">RTL</text></g>
        <g className="nodes" filter="url(#glow)"><circle cx="48" cy="88" r="5" /><circle cx="424" cy="124" r="5" /><circle cx="52" cy="212" r="5" /><circle cx="460" cy="208" r="5" /><circle cx="70" cy="330" r="5" /><circle cx="434" cy="234" r="5" /></g>
        <path className="pulse-path" d="M48 88H164V48H296v76h128" />
        <text className="scope-label" x="44" y="390">&gt; CLK_LOCK: ACTIVE</text>
      </svg>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link to="/search">Search</Link>
      {navItems.map((item) => <Link key={item.path} to={item.path}>{item.label}</Link>)}
      <Link to="/failures">Failures</Link>
      <Link to="/what-changed-me">Changed Me</Link>
      <Link to="/about">About</Link>
      <a href="/rss.xml">RSS</a>
      <a href="/admin/pin.html" className="admin-footer-link" style={{opacity:0.7, marginLeft:12}}>Admin</a>
    </footer>
  );
}

function relatedByTags(source, items) {
  return items.filter((item) => item.slug !== source.slug && item.tags?.some((tag) => source.tags?.includes(tag))).slice(0, 3);
}

function timelineItems() {
  return [
    ...projects.map((project) => ({ kind: "PROJECT", title: project.title, date: project.date, summary: project.outcome, path: `/build-log/${project.slug}` })),
    ...fieldNotes.map((note) => ({ kind: note.type, title: note.title, date: note.date, summary: note.summary, path: `/field-notes/${note.slug}` })),
    { kind: "LEARNING", title: "Clock domain crossing becomes a focus area", date: "[2024.03.15]", summary: "CDC moved from a vague phrase to an active learning track.", path: "/learning" },
  ].sort((a, b) => stampToDate(b.date) - stampToDate(a.date));
}

function stampToDate(stamp) {
  const [, yyyy, mm = "01", dd = "01"] = stamp.match(/\[(\d{4})(?:\.(\d{2}))?(?:\.(\d{2}))?\]/) || [];
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

function formatTag(tag) {
  return tag.replaceAll("-", " ");
}

function makeProjectDetails(project) {
  return {
    what: `${project.outcome}. This page records the practical shape of the project, the tools used, and the assumptions that had to be tested outside the first clean simulation.`,
    why: "I built it to make the course topic less abstract. A project becomes real when the design has to survive a board, a compiler, a datasheet, and my own incomplete understanding.",
    process: `The work moved from notes and small experiments into implementation, simulation, and hardware checks. The main tools were ${project.tags.map(formatTag).join(", ")}.`,
    broke: project.lesson,
    learned: "The useful lesson was not only the final result. It was learning where the mental model was too simple and where the hardware forced more precise thinking.",
    different: "I would write down assumptions earlier, keep a tighter debug log, and make the test cases less friendly to the design.",
    resources: ["Course notes", "Tool documentation", "Datasheets and timing reports"],
  };
}

export default App;

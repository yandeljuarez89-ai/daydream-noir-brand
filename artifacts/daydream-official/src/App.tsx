import { type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [introVisible, setIntroVisible] = useState(true);
  const [introLogoComplete, setIntroLogoComplete] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [dropVideoPlaying, setDropVideoPlaying] = useState(false);
  const [dropVideoMuted, setDropVideoMuted] = useState(true);
  const introSequenceStarted = useRef(false);
  const logoCycleTimeout = useRef<number | null>(null);
  const introExitTimeout = useRef<number | null>(null);
  const dropVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (logoCycleTimeout.current !== null) {
        window.clearTimeout(logoCycleTimeout.current);
      }
      if (introExitTimeout.current !== null) {
        window.clearTimeout(introExitTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(motionPreference.matches);
    syncPreference();
    motionPreference.addEventListener('change', syncPreference);
    return () => motionPreference.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    const video = dropVideoRef.current;
    if (!video || prefersReducedMotion) return;

    const startPlayback = () => {
      void video.play().catch(() => {
        video.controls = true;
      });
    };

    if (!('IntersectionObserver' in window)) {
      startPlayback();
      return () => video.pause();
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        startPlayback();
      } else {
        video.pause();
      }
    }, { threshold: 0.2 });
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [prefersReducedMotion]);

  const beginIntroSequence = () => {
    if (introSequenceStarted.current) return;
    introSequenceStarted.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIntroLogoComplete(true);
    } else {
      logoCycleTimeout.current = window.setTimeout(
        () => setIntroLogoComplete(true),
        2280,
      );
    }

    introExitTimeout.current = window.setTimeout(
      () => setIntroVisible(false),
      4050,
    );
  };

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const product = {
    name: 'DAYDREAM 11:11',
    status: 'PRÓXIMAMENTE',
    image: '/daydream-first-drop-main.jpeg',
    video: '/daydream-first-drop.mp4',
    price: null as number | null,
    sizes: [] as string[],
    stock: null as number | null,
    buyAction: null as (() => void) | null,
  };

  const socialLinks = [
    { label: 'INSTAGRAM', href: 'https://www.instagram.com/daydream1.11/' },
    { label: 'TIKTOK', href: 'https://www.tiktok.com/@daydream11.1' },
    { label: 'WHATSAPP', href: null },
  ];

  const toggleDropVideoPlayback = () => {
    const video = dropVideoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {
        video.controls = true;
      });
    } else {
      video.pause();
    }
  };

  const toggleDropVideoMute = () => {
    const video = dropVideoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setDropVideoMuted(video.muted);
  };

  return (
    <div className="site-shell">
      <div className={`intro-screen${introVisible ? '' : ' is-gone'}`} aria-hidden={!introVisible}>
        <div className="intro-haze" />
        <span className="intro-mark">DAYDREAM / 11:11</span>
        <div className="intro-particles">
          {Array.from({ length: 20 }, (_, index) => (
            <i
              className="particle"
              key={index}
              style={{
                left: `${(index * 47 + 13) % 100}%`,
                top: `${(index * 31 + 8) % 100}%`,
                animationDelay: `${(index % 6) * -0.7}s`,
              }}
            />
          ))}
        </div>
        <div className="intro-meteors" aria-hidden="true">
          <i className="meteor meteor--upper-left" />
          <i className="meteor meteor--upper-right" />
          <i className="meteor meteor--lower-left" />
          <i className="meteor meteor--lower-right" />
        </div>
        <div className="intro-logo-wrap">
          <div className="intro-logo-window">
            <img
              className="intro-logo"
              src={introLogoComplete ? '/daydream-logo-still.png' : '/daydream-logo-spin.gif'}
              alt="Logotipo oficial de DAYDREAM 11:11"
              width="1012"
              height="1012"
              onLoad={introLogoComplete ? undefined : beginIntroSequence}
              onError={introLogoComplete ? undefined : () => {
                setIntroLogoComplete(true);
                beginIntroSequence();
              }}
            />
          </div>
          <span className="intro-caption">DREAMING AWAKE</span>
        </div>
      </div>

      <header className="topbar">
        <a className="brand-lockup" href="#inicio" aria-label="DAYDREAM — volver al inicio">
          <span className="brand-name">DAYDREAM</span>
          <span className="brand-sub">11:11 / SOÑANDO DESPIERTO</span>
        </a>
        <nav className="nav-links" aria-label="Navegación principal">
          <a className="nav-link" href="#drop">DROP</a>
          <a className="nav-link" href="#about">ABOUT</a>
          <a className="nav-link" href="#contact">CONTACT</a>
        </nav>
      </header>

      <main>
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="hero-inner">
            <p className="eyebrow">11:11 — SOÑANDO DESPIERTO</p>
            <h1 className="hero-title" id="hero-title"><span className="title-daydream">DAYDREAM</span></h1>
            <p className="hero-copy">Una marca nacida de convertir los sueños en algo real.</p>
            <a className="action-link" href="#drop"><span>VER DROP</span><span className="action-arrow" aria-hidden="true">↗</span></a>
          </div>
          <span className="hero-index">01 — 04 / 11:11</span>
          <span className="hero-scroll">SCROLL TO DREAM</span>
        </section>

        <section className="section drop-section" id="drop" aria-labelledby="drop-heading">
          <div className="section-inner">
            <div className="drop-head reveal">
              <div>
                <p className="section-kicker">01 / PRIMER LANZAMIENTO</p>
                <h2 className="section-heading" id="drop-heading">FIRST DROP</h2>
              </div>
              <span className="drop-edition">Edición inicial · 30 piezas</span>
            </div>
            <article className="product-layout reveal" aria-label={`Producto ${product.name}`}>
              <div className="product-art">
                {prefersReducedMotion ? (
                  <img
                    className="product-image"
                    src={product.image}
                    alt="Vista frontal y trasera de la camiseta DAYDREAM 11:11"
                    width="843"
                    height="1264"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <>
                    <video
                      ref={dropVideoRef}
                      className="product-video"
                      poster={product.image}
                      muted={dropVideoMuted}
                      loop
                      playsInline
                      preload="none"
                      aria-label="Movimiento de la camiseta DAYDREAM 11:11, primer drop"
                      onPlay={() => setDropVideoPlaying(true)}
                      onPause={() => setDropVideoPlaying(false)}
                    >
                      <source src={product.video} type="video/mp4" />
                      <img
                        src={product.image}
                        alt="Vista frontal y trasera de la camiseta DAYDREAM 11:11"
                        width="843"
                        height="1264"
                      />
                    </video>
                    <div className="product-video-controls">
                      <button
                        className="video-control"
                        type="button"
                        onClick={toggleDropVideoPlayback}
                        aria-label={dropVideoPlaying ? 'Pausar movimiento' : 'Reproducir movimiento'}
                        title={dropVideoPlaying ? 'Pausar movimiento' : 'Reproducir movimiento'}
                      >
                        <span aria-hidden="true">{dropVideoPlaying ? 'Ⅱ' : '▶'}</span>
                      </button>
                      <button
                        className="video-control"
                        type="button"
                        onClick={toggleDropVideoMute}
                        aria-label={dropVideoMuted ? 'Activar sonido' : 'Silenciar sonido'}
                        aria-pressed={!dropVideoMuted}
                        title={dropVideoMuted ? 'Activar sonido' : 'Silenciar sonido'}
                      >
                        <span aria-hidden="true">{dropVideoMuted ? '♪×' : '♪'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="product-info">
                <span className="product-tag">DROP 001 / 11:11</span>
                <h3 className="product-title">{product.name}</h3>
                <div className="product-rule" />
                <div className="product-meta"><span>LANZAMIENTO</span><span>{product.status}</span></div>
                <div className="product-rule" />
                <div className="product-meta"><span>EDICIÓN</span><span>01 — 30</span></div>
                <div className="product-rule" />
                <div className="product-meta"><span className="product-state"><i className="state-dot" />ESTADO</span><span>{product.status}</span></div>
                <p className="product-note">Una primera pieza. Una idea hecha realidad.<br />Más detalles muy pronto.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="section about-section" id="about" aria-labelledby="about-heading">
          <div className="section-inner about-grid">
            <div className="about-heading reveal">
              <p className="section-kicker">02 / NUESTRA IDEA</p>
              <h2 className="section-heading" id="about-heading">ABOUT<br />DAYDREAM</h2>
            </div>
            <div className="about-copy reveal">
              <p>DAYDREAM significa soñar despierto.<br />Una idea que nació de imaginar algo y convertirlo en realidad.</p>
              <p>11:11 representa ese momento de pedir un deseo y creer que puede cumplirse.</p>
              <p>DAYDREAM no es solamente una prenda.</p>
              <p>Es una forma de llevar contigo aquello que algún día imaginaste.</p>
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contact" aria-labelledby="contact-heading">
          <div className="section-inner contact-row">
            <div className="reveal">
              <p className="section-kicker">03 / ENCUÉNTRANOS</p>
              <h2 className="section-heading" id="contact-heading">CONTACT</h2>
              <p className="contact-intro">Sigue el sueño. Hablemos pronto.</p>
            </div>
            <nav className="social-links reveal" aria-label="Redes sociales">
              {socialLinks.map((link) => link.href ? (
                <a
                  className="social-link"
                  href={link.href}
                  aria-label={`${link.label} — perfil oficial de DAYDREAM, se abre en una pestaña nueva`}
                  key={link.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Abrir ${link.label}`}
                >
                  <span>{link.label}</span><span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span
                  className="social-link social-link-placeholder"
                  aria-disabled="true"
                  key={link.label}
                  title="Enlace por añadir"
                >
                  <span>{link.label}</span><span aria-hidden="true">↗</span>
                </span>
              ))}
            </nav>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-brand">DAYDREAM</span>
          <span>DAYDREAM © 2026</span>
          <span className="footer-center">11:11</span>
          <a className="nav-link" href="#inicio" aria-label="Volver al inicio">VOLVER ARRIBA ↑</a>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

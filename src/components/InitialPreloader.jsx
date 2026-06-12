import { useEffect, useRef, useState } from "react";

const BOOT_DURATION_MS = 4000;
const EXIT_DURATION_MS = 760;

export function InitialPreloader({ onFinished }) {
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const overlayRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const timer = window.setTimeout(() => setReady(true), BOOT_DURATION_MS);

    updateMotion();
    document.body.classList.add("boot-preloader-lock");
    overlayRef.current?.focus({ preventScroll: true });
    media.addEventListener?.("change", updateMotion);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("boot-preloader-lock");
      media.removeEventListener?.("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (ready) {
      buttonRef.current?.focus({ preventScroll: true });
    }
  }, [ready]);

  const handleEnter = () => {
    if (!ready || exiting) return;
    setExiting(true);
    window.setTimeout(onFinished, reducedMotion ? 120 : EXIT_DURATION_MS);
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Tab") return;
    if (!ready) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    buttonRef.current?.focus({ preventScroll: true });
  };

  return (
    <section
      className={`boot-preloader${ready ? " is-ready" : ""}${exiting ? " is-exiting" : ""}${reducedMotion ? " is-reduced-motion" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="boot-preloader-title"
      aria-describedby="boot-preloader-status"
      tabIndex={-1}
      ref={overlayRef}
      onKeyDown={handleKeyDown}
    >
      <div className="boot-preloader__substrate" aria-hidden="true" />
      <div className="boot-preloader__scan" aria-hidden="true" />

      <svg className="boot-preloader__circuit" viewBox="0 0 1200 760" aria-hidden="true">
        <path className="boot-preloader__trace boot-preloader__trace-soft" d="M70 142H248V96h226v88h202v-50h450" />
        <path className="boot-preloader__trace boot-preloader__trace-soft" d="M96 586h184v-72h186v-86h198v58h436" />
        <path className="boot-preloader__trace boot-preloader__trace-dim" d="M164 310h196v-72h132v156h246v-94h300" />
        <path className="boot-preloader__trace boot-preloader__trace-dim" d="M110 458h266v70h154v-212h136v-86h392" />
        <path className="boot-preloader__trace boot-preloader__trace-pulse boot-preloader__trace-a" d="M70 142H248V96h226v88h202v-50h450" />
        <path className="boot-preloader__trace boot-preloader__trace-pulse boot-preloader__trace-b" d="M96 586h184v-72h186v-86h198v58h436" />
        <path className="boot-preloader__trace boot-preloader__trace-pulse boot-preloader__trace-c" d="M164 310h196v-72h132v156h246v-94h300" />
        <g className="boot-preloader__processor">
          <rect x="485" y="258" width="230" height="188" rx="10" />
          <path d="M457 286h28M457 326h28M457 366h28M457 406h28M715 286h28M715 326h28M715 366h28M715 406h28" />
          <path d="M524 230v28M564 230v28M604 230v28M644 230v28M684 230v28M524 446v28M564 446v28M604 446v28M644 446v28M684 446v28" />
          <text x="600" y="360">VDDxGND</text>
        </g>
        <g className="boot-preloader__nodes">
          <circle cx="248" cy="96" r="5" />
          <circle cx="676" cy="184" r="5" />
          <circle cx="466" cy="428" r="5" />
          <circle cx="664" cy="486" r="5" />
          <circle cx="738" cy="300" r="5" />
          <circle cx="1058" cy="230" r="5" />
        </g>
      </svg>

      <div className="boot-preloader__packets" aria-hidden="true">
        <span className="boot-preloader__packet boot-preloader__packet-a" />
        <span className="boot-preloader__packet boot-preloader__packet-b" />
        <span className="boot-preloader__packet boot-preloader__packet-c" />
        <span className="boot-preloader__node boot-preloader__node-a" />
        <span className="boot-preloader__node boot-preloader__node-b" />
        <span className="boot-preloader__node boot-preloader__node-c" />
      </div>

      <div className="boot-preloader__core">
        <p className="boot-preloader__eyebrow" aria-hidden="true">// VDDxGND BOOT SEQUENCE</p>
        <h1 className="boot-preloader__title" id="boot-preloader-title">வணக்கம்</h1>
        <div className="boot-preloader__field" aria-hidden="true">
          <span className="boot-preloader__ring boot-preloader__ring-outer" />
          <span className="boot-preloader__ring boot-preloader__ring-inner" />
          <span className="boot-preloader__axis boot-preloader__axis-horizontal" />
          <span className="boot-preloader__axis boot-preloader__axis-vertical" />
        </div>
        <p className="boot-preloader__status" id="boot-preloader-status" role="status" aria-live="polite">
          {ready ? "VDD times GND is ready." : "Initializing VDD times GND."}
        </p>
        <button
          className="boot-preloader__button"
          type="button"
          onClick={handleEnter}
          disabled={!ready}
          ref={buttonRef}
          aria-label="Enter VDD times GND"
        >
          Enter VDD×GND
        </button>
      </div>

      <div className="boot-preloader__exit-wave" aria-hidden="true" />
    </section>
  );
}

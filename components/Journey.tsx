import type { JourneyStatus, JourneyStep } from "@/lib/types";

const STATUS_CLASS: Record<JourneyStatus, string | undefined> = {
  past: undefined,
  present: "now",
  upcoming: "next",
};

interface JourneyProps {
  steps: JourneyStep[];
  intro: string | null;
  quote: string | null;
}

/** Second sentence onwards is gold, as in the reference. */
function splitQuote(quote: string): [string, string] {
  const match = quote.match(/^(.+?[.!?])\s+(.+)$/);
  return match ? [match[1], match[2]] : [quote, ""];
}

export default function Journey({ steps, intro, quote }: JourneyProps) {
  if (steps.length === 0 && !quote) return null;
  // Heading year comes from the first step, e.g. "2008 – 09" → 2008.
  const firstYear = steps[0]?.period.match(/\d{4}/)?.[0];
  const [quoteStart, quoteEnd] = quote ? splitQuote(quote) : ["", ""];

  return (
    <section className="sec" id="journey" style={{ background: "var(--char)", borderBlock: "1px solid var(--line)" }}>
      <div className="wrap">
        <div className="sh">
          <div>
            <p className="k mono">Scene 05 · The journey</p>
            <h2>
              {firstYear ? `${firstYear} to` : "The road to"}
              <br />
              next reel
            </h2>
          </div>
          {intro && <p className="lede">{intro}</p>}
        </div>
        {steps.length > 0 && (
          <ol className="tl" id="tl">
            {steps.map((step, i) => (
              <li key={step._id} className={STATUS_CLASS[step.status]}>
                <span className="yr">
                  {step.period}
                  <small>
                    {step.status === "upcoming"
                      ? "Coming soon"
                      : step.status === "present"
                        ? "Present"
                        : `Scene ${String(i + 1).padStart(2, "0")}`}
                  </small>
                </span>
                <div>
                  <h3>{step.title}</h3>
                  {step.organisation && <span className="org">{step.organisation}</span>}
                </div>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        )}
        {quote && (
          <p className="quote">
            {quoteStart} {quoteEnd && <span>{quoteEnd}</span>}
          </p>
        )}
      </div>
    </section>
  );
}

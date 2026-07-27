import { BRAND } from "@/config/brand";

// Landing-page FAQ. Rendered on the server with semantic headings and lists,
// and paired with FAQPage JSON-LD so search engines and LLM/AI crawlers can
// parse the Q&A directly. Answers use a native <details> accordion — the text
// stays in the DOM whether open or closed, so it remains fully crawlable.

type Block =
  | { p: string }
  | { ul: string[] }
  | { p: string; href: string; hrefLabel: string };

type FaqItem = { q: string; a: Block[] };

const FAQ: FaqItem[] = [
  {
    q: "What is Longshot?",
    a: [
      { p: "Longshot is an open-source analytics platform for Polymarket." },
      {
        p: "It helps you track performance, monitor your portfolio, study other public accounts, and discover markets using filters such as odds, category, and resolution date.",
      },
    ],
  },
  {
    q: "How does Longshot work?",
    a: [
      { p: "Create an account and enter your Polymarket username." },
      {
        p: "Longshot uses public Polymarket data to build your performance and portfolio dashboards automatically. You do not need to connect a wallet or import transactions.",
      },
    ],
  },
  {
    q: "Do I need to connect my Polymarket account or wallet?",
    a: [
      { p: "No. Longshot only needs your public Polymarket username." },
      {
        p: "You do not need to connect a wallet, approve transactions, or provide account access.",
      },
    ],
  },
  {
    q: "Does Longshot need my password or private keys?",
    a: [
      {
        p: "No. Longshot never asks for your password, seed phrase, private keys, or transaction permissions.",
      },
    ],
  },
  {
    q: "Is Longshot secure?",
    a: [
      { p: "Longshot only reads public Polymarket data." },
      {
        p: "It cannot access your wallet, move funds, execute trades, or make transactions on your behalf.",
      },
    ],
  },
  {
    q: "Is Longshot open source?",
    a: [
      {
        p: "Yes. Anyone can inspect the code, contribute to the project, or run their own version.",
      },
      {
        p: "View the source code on GitHub:",
        href: BRAND.repoUrl,
        hrefLabel: BRAND.repoUrl.replace(/^https?:\/\//, ""),
      },
    ],
  },
  {
    q: "What can I do with Longshot?",
    a: [
      { p: "Longshot helps you:" },
      {
        ul: [
          "Analyze your Polymarket performance",
          "Track open and closed positions",
          "Monitor cash, capital in play, and portfolio allocation",
          "Review markets resolving soon",
          "Study the public activity of other accounts",
          "Discover markets by category, odds, and resolution date",
        ],
      },
    ],
  },
  {
    q: "Can Longshot show my Polymarket profit and loss?",
    a: [
      { p: "Yes. Longshot shows your profit and loss by:" },
      { ul: ["Market", "Category", "Play type", "Date and time period", "Open or closed position"] },
      {
        p: "This helps you identify which markets and types of plays contribute most to your results.",
      },
    ],
  },
  {
    q: "Can Longshot track open and closed Polymarket positions?",
    a: [
      { p: "Yes. You can view your active and historical positions, including:" },
      {
        ul: [
          "Open positions",
          "Closed positions",
          "Markets resolving soon",
          "Cash available",
          "Capital in play",
          "Potential payouts",
          "Portfolio allocation",
          "Unrealized profit and loss",
        ],
      },
    ],
  },
  {
    q: "Can I use Longshot to study winning strategies from other Polymarket accounts?",
    a: [
      {
        p: "Yes. Longshot lets you analyze the public performance and trading history of other Polymarket accounts.",
      },
      {
        p: "You can review their positions, results, preferred categories, play types, and timing to identify patterns in how they trade.",
      },
    ],
  },
  {
    q: "Can I use Longshot to find Polymarket opportunities?",
    a: [
      { p: "Yes. You can filter markets by criteria such as:" },
      { ul: ["Category", "Current odds", "Resolution date", "Time remaining", "Market status"] },
      {
        p: "Longshot helps you find markets that match your strategy. It does not recommend which trades to make.",
      },
    ],
  },
  {
    q: "Does Longshot place trades for me?",
    a: [
      { p: "No. Longshot is an analytics and market discovery platform." },
      { p: "It does not execute trades, manage funds, or make decisions on your behalf." },
    ],
  },
  {
    q: "Is Longshot affiliated with Polymarket?",
    a: [
      {
        p: "No. Longshot is an independent open-source project and is not operated by or affiliated with Polymarket.",
      },
    ],
  },
  {
    q: "Who is Longshot for?",
    a: [
      { p: "Longshot is for Polymarket users who want to:" },
      {
        ul: [
          "Understand their performance",
          "Identify which strategies work",
          "Track portfolio exposure",
          "Review open and closed positions",
          "Study other traders",
          "Discover relevant markets",
          "Reduce manual analysis",
        ],
      },
    ],
  },
];

// Flatten an answer's blocks into a plain-text string for the JSON-LD payload.
function blocksToText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if ("ul" in b) return b.ul.map((i) => `- ${i}`).join("\n");
      if ("href" in b) return `${b.p} ${b.href}`;
      return b.p;
    })
    .join("\n\n");
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: blocksToText(item.a) },
  })),
};

function Answer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-3 text-[0.95rem] leading-relaxed text-zinc-600 dark:text-zinc-300">
      {blocks.map((b, i) => {
        if ("ul" in b) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 marker:text-zinc-400">
              {b.ul.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if ("href" in b) {
          return (
            <p key={i}>
              {b.p}{" "}
              <a
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-800 underline underline-offset-2 transition hover:text-zinc-950 dark:text-zinc-100 dark:hover:text-white"
              >
                {b.hrefLabel}
              </a>
            </p>
          );
        }
        return <p key={i}>{b.p}</p>;
      })}
    </div>
  );
}

export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="mx-auto w-full max-w-2xl px-1 pb-24 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2
        id="faq-heading"
        className="mb-6 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100"
      >
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {FAQ.map((item) => (
          <details key={item.q} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
              <h3 className="text-[1.0625rem] font-medium text-zinc-900 dark:text-zinc-100">
                {item.q}
              </h3>
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden="true"
              >
                <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div className="pb-5 pr-8">
              <Answer blocks={item.a} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

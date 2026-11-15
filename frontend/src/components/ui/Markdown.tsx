import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  a: ({ node, children, href = "", ...props }) => {
    void node;
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
        {external ? (
          <svg
            className="inline-link-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
            aria-hidden="true"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        ) : (
          <svg
            className="inline-link-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </a>
    );
  },
  h1: ({ node, children, ...props }) => {
    void node;
    return <h2 {...props}>{children}</h2>;
  },
  pre: ({ node, children, ...props }) => {
    void node;
    return <pre {...props} tabIndex={0} role="region" aria-label="Code example">{children}</pre>;
  },
  code: ({ node, children, className, ...props }) => {
    void node;
    // The current articles contain Bash examples. Highlight on the server and
    // leave other languages untouched, without shipping a browser highlighter.
    const bash = className === "language-bash" && typeof children === "string";
    return (
      <code {...props} className={className}>
        {bash ? children.split(/("(?:\\.|[^"\\])*"|'[^']*'|(?:^|\s)#[^\n]*|(?<=\s)--?[\w-]+)/gm).map((part, index) => {
          const token = part.trimStart();
          const kind = /^["']/.test(token) ? "string" : token.startsWith("#") ? "comment" : /^--?[\w]/.test(token) ? "option" : null;
          return kind ? <span key={index} className={`syntax-${kind}`}>{part}</span> : part;
        }) : children}
      </code>
    );
  },
  // ReactMarkdown blanks unsafe protocols, so a missing or empty src means the
  // image was rejected. Render nothing rather than requesting the page itself.
  img: ({ src, alt = "" }) => {
    if (typeof src !== "string" || src.trim() === "") return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    );
  },
  table: ({ node, children, ...props }) => {
    void node;
    return (
      <div className="table-wrap">
        <table {...props}>{children}</table>
      </div>
    );
  },
};

export default function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}

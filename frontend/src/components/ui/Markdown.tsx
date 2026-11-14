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
      </a>
    );
  },
  h1: ({ node, children, ...props }) => {
    void node;
    return <h2 {...props}>{children}</h2>;
  },
  img: ({ src, alt = "" }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === "string" ? src : undefined} alt={alt} loading="lazy" decoding="async" />
  ),
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

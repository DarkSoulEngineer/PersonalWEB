import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/* Styling lives in the `.prose` rules of globals.css. Only behaviour that
   plain CSS cannot express is handled here. */
const components: Components = {
  // The page title is the only h1, so demote headings inside the article.
  h1: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  a: ({ children, href = "", ...props }) => {
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
  img: ({ src, alt = "" }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" />
  ),
  table: ({ children, ...props }) => (
    <div className="table-wrap">
      <table {...props}>{children}</table>
    </div>
  ),
};

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

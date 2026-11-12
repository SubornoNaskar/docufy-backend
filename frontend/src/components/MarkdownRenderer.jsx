import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ExternalLink, Terminal } from 'lucide-react';

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 w-full min-w-0 rounded-xl border border-[#1a253c] bg-[#060a12] shadow-sm overflow-hidden text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a101e] border-b border-[#17223b] select-none text-[11px] text-slate-400">
        <div className="flex items-center gap-2 font-mono text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold uppercase tracking-wider">{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-[#17223b] text-slate-400 hover:text-white transition-colors font-medium text-[11px]"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content with Horizontal Scroll */}
      <pre className="p-4 overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function MarkdownRenderer({ content, isStreaming = false }) {
  if (!content) return null;

  return (
    <div className="markdown-content w-full min-w-0 text-slate-200 text-xs sm:text-sm leading-relaxed [word-break:normal] [overflow-wrap:break-word]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-base sm:text-xl font-bold text-white mt-6 mb-3 pb-2 border-b border-[#1f2d4f] tracking-tight first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-lg font-semibold text-blue-300 mt-5 mb-2.5 pb-1 border-b border-[#172544]/60 tracking-tight first:mt-0 flex items-center gap-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-base font-semibold text-slate-100 mt-4 mb-2 tracking-tight first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-semibold text-slate-200 mt-3 mb-1.5 first:mt-0">
              {children}
            </h4>
          ),

          // Paragraph
          p: ({ children }) => (
            <p className="mb-3.5 last:mb-0 leading-relaxed sm:leading-7 text-slate-200">
              {children}
            </p>
          ),

          // Lists (Unordered & Ordered with nested support)
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-3 space-y-1.5 text-slate-200 text-xs sm:text-sm">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-3 space-y-1.5 text-slate-200 text-xs sm:text-sm">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 marker:text-blue-400 marker:font-semibold">
              {children}
            </li>
          ),

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2.5 my-3.5 bg-blue-950/20 text-slate-300 rounded-r-xl italic leading-relaxed">
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: () => <hr className="my-5 border-[#1f2d4f]" />,

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors inline-flex items-center gap-1 font-medium"
            >
              <span>{children}</span>
              <ExternalLink className="w-3 h-3 inline flex-shrink-0" />
            </a>
          ),

          // Strong & Emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-100">{children}</em>
          ),

          // Tables (Requirement 3 & 5: properly formatted, borders, spacing, scrollable without breaking chat layout)
          table: ({ children }) => (
            <div className="my-4 w-full min-w-0 overflow-x-auto rounded-xl border border-[#1e2a44] bg-[#070b14]/90 shadow-md scrollbar-thin">
              <table className="min-w-full divide-y divide-[#1e2a44] text-xs sm:text-sm text-left border-collapse table-auto">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#0d1527] text-slate-200 border-b border-[#1e2a44]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#17223b]/60">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[#0f172a] transition-colors odd:bg-transparent even:bg-[#090e1a]/40">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-xs font-semibold text-blue-300 tracking-wider uppercase border-b border-[#1e2a44] whitespace-nowrap min-w-[140px]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-xs sm:text-sm text-slate-200 align-top leading-relaxed border-t border-[#17223b]/40 min-w-[140px] break-normal">
              {children}
            </td>
          ),

          // Pre & Code (Requirement 5: syntax/code blocks and inline code)
          pre: ({ children }) => <>{children}</>,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isMultiLine = codeString.includes('\n') || Boolean(match);

            if (isMultiLine) {
              return (
                <CodeBlock
                  language={match ? match[1] : ''}
                  code={codeString}
                />
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 mx-0.5 rounded bg-[#131d33] border border-[#1e2b4a] text-blue-300 font-mono text-[11px] sm:text-xs"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Streaming pulse cursor */}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle rounded-sm" />
      )}
    </div>
  );
}

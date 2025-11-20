"use client";

import "@mdxeditor/editor/style.css";

import {
  codeBlockPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
} from "@mdxeditor/editor";
import { useTheme } from "next-themes";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

/**
 * Renders markdown content in read-only mode
 * Uses MDXEditor for consistent rendering with the editor
 */
export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  const { theme } = useTheme();

  if (!content) {
    return null;
  }

  return (
    <div className={`markdown-renderer ${className}`} data-theme={theme}>
      <MDXEditor
        markdown={content}
        readOnly
        contentEditableClassName="prose max-w-none"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          tablePlugin(),
          imagePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
          diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
          markdownShortcutPlugin(),
        ]}
      />
    </div>
  );
}

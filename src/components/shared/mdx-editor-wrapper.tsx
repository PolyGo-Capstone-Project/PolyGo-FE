"use client";

import "@mdxeditor/editor/style.css";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  CodeToggle,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  HighlightToggle,
  imagePlugin,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  MDXEditorMethods,
  quotePlugin,
  Separator,
  StrikeThroughSupSubToggles,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import { useTheme } from "next-themes";
import { forwardRef } from "react";

type MDXEditorWrapperProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  className?: string;
};

export const MDXEditorWrapper = forwardRef<
  MDXEditorMethods,
  MDXEditorWrapperProps
>(
  (
    {
      value,
      onChange,
      placeholder = "Enter your content here...",
      readOnly = false,
      minHeight = "200px",
      className = "",
    },
    ref
  ) => {
    const { theme } = useTheme();

    return (
      <div
        className={`mdx-editor-wrapper border rounded-md overflow-hidden ${className}`}
        style={
          {
            "--editor-min-height": minHeight,
          } as React.CSSProperties
        }
        data-theme={theme}
      >
        <MDXEditor
          ref={ref}
          markdown={value}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          contentEditableClassName="prose prose-sm max-w-none dark:prose-invert"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            tablePlugin(),
            imagePlugin({
              imageUploadHandler: async () =>
                Promise.resolve("https://picsum.photos/200/300"),
            }),
            codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
            diffSourcePlugin({ viewMode: "rich-text" }),
            markdownShortcutPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <DiffSourceToggleWrapper>
                    <UndoRedo />
                    <Separator />
                    <BoldItalicUnderlineToggles />
                    <CodeToggle />
                    <HighlightToggle />
                    <Separator />
                    <BlockTypeSelect />
                    <Separator />
                    <StrikeThroughSupSubToggles />
                    <Separator />
                    <ListsToggle />
                    <Separator />
                    <CreateLink />
                    <InsertTable />
                    <InsertThematicBreak />
                  </DiffSourceToggleWrapper>
                </>
              ),
            }),
          ]}
        />
      </div>
    );
  }
);

MDXEditorWrapper.displayName = "MDXEditorWrapper";

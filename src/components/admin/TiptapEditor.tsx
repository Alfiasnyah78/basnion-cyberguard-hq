import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
  Bold, Italic, Strikethrough, List, ListOrdered, Quote, Code, Heading1, Heading2,
  Heading3, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Minus,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function TiptapEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "Mulai tulis write-up..." }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[400px] focus:outline-none px-4 py-3 font-mono text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const Btn = ({ on, active, label, children }: { on: () => void; active?: boolean; label: string; children: React.ReactNode }) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={on}
      className={`p-1.5 rounded hover:bg-primary/10 transition ${active ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-md border border-primary/30 bg-input/30 overflow-hidden">
      <div className="flex flex-wrap gap-1 border-b border-primary/20 p-2 bg-background/50">
        <Btn on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="bold"><Bold size={14} /></Btn>
        <Btn on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="italic"><Italic size={14} /></Btn>
        <Btn on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="strike"><Strikethrough size={14} /></Btn>
        <Btn on={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} label="inline code"><Code size={14} /></Btn>
        <span className="w-px bg-primary/20 mx-1" />
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} label="h1"><Heading1 size={14} /></Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="h2"><Heading2 size={14} /></Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="h3"><Heading3 size={14} /></Btn>
        <span className="w-px bg-primary/20 mx-1" />
        <Btn on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="bullet list"><List size={14} /></Btn>
        <Btn on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="ordered list"><ListOrdered size={14} /></Btn>
        <Btn on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="quote"><Quote size={14} /></Btn>
        <Btn on={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} label="code block"><Code size={14} /></Btn>
        <Btn on={() => editor.chain().focus().setHorizontalRule().run()} label="hr"><Minus size={14} /></Btn>
        <span className="w-px bg-primary/20 mx-1" />
        <Btn on={() => {
          const url = window.prompt("URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
          else editor.chain().focus().unsetLink().run();
        }} active={editor.isActive("link")} label="link"><LinkIcon size={14} /></Btn>
        <Btn on={() => {
          const url = window.prompt("Image URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }} label="image"><ImageIcon size={14} /></Btn>
        <span className="w-px bg-primary/20 mx-1" />
        <Btn on={() => editor.chain().focus().undo().run()} label="undo"><Undo size={14} /></Btn>
        <Btn on={() => editor.chain().focus().redo().run()} label="redo"><Redo size={14} /></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

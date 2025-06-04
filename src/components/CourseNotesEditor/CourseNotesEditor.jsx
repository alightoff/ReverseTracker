import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  LevelFormat,
} from "docx";
import { useCourseStore } from "../../store/courseStore";

function parseHtmlToDocx(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const walkNodes = (nodes) => {
    const result = [];

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text.length) {
          result.push(new Paragraph({ children: [new TextRun(text)] }));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        switch (node.tagName.toLowerCase()) {
          case "p":
            result.push(new Paragraph(node.textContent));
            break;
          case "strong":
          case "b":
            result.push(
              new Paragraph({
                children: [new TextRun({ text: node.textContent, bold: true })],
              })
            );
            break;
          case "em":
          case "i":
            result.push(
              new Paragraph({
                children: [new TextRun({ text: node.textContent, italics: true })],
              })
            );
            break;
          case "u":
            result.push(
              new Paragraph({
                children: [new TextRun({ text: node.textContent, underline: {} })],
              })
            );
            break;
          case "ol":
            node.childNodes.forEach((liNode) => {
              if (liNode.tagName && liNode.tagName.toLowerCase() === "li") {
                result.push(
                  new Paragraph({
                    text: liNode.textContent,
                    numbering: {
                      reference: "numbering",
                      level: 0,
                    },
                  })
                );
              }
            });
            break;
          case "ul":
            node.childNodes.forEach((liNode) => {
              if (liNode.tagName && liNode.tagName.toLowerCase() === "li") {
                result.push(
                  new Paragraph({
                    text: liNode.textContent,
                    bullet: {
                      level: 0,
                    },
                  })
                );
              }
            });
            break;
          default:
            result.push(...walkNodes(node.childNodes));
        }
      }
    });

    return result;
  };

  return walkNodes(doc.body.childNodes);
}

function MenuBar({ editor, courseId, chapterIndex, topicIndex }) {
  if (!editor) return null;

  const buttonClass = (active) =>
    `px-3 py-1 rounded cursor-pointer select-none transition ${
      active ? "bg-hackerGreen text-black" : "hover:bg-zinc-700 hover:text-white"
    }`;

  const fontFamilies = [
    "Arial, sans-serif",
    "Georgia, serif",
    "Courier New, monospace",
    "Times New Roman, serif",
    "Verdana, sans-serif",
  ];

  const handleDownloadWord = async () => {
    const html = editor.getHTML();
    const paragraphs = parseHtmlToDocx(html);

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: "numbering",
            levels: [
              {
                level: 0,
                format: LevelFormat.DECIMAL,
                text: "%1.",
                alignment: "start",
              },
            ],
          },
        ],
      },
      sections: [{ children: paragraphs }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `notes-course-${courseId || "unknown"}-c${chapterIndex}-t${topicIndex}.docx`);
  };

  return (
    <div className="mb-3 flex flex-wrap gap-2 border border-zinc-700 rounded bg-zinc-900 p-2 select-none items-center text-white">
      {/* Formatting buttons */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive("bold"))}
        title="Жирный (Ctrl+B)"
        type="button"
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive("italic"))}
        title="Курсив (Ctrl+I)"
        type="button"
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={buttonClass(editor.isActive("underline"))}
        title="Подчёркнутый (Ctrl+U)"
        type="button"
      >
        U
      </button>

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 1 }))}
        title="Заголовок 1"
        type="button"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 2 }))}
        title="Заголовок 2"
        type="button"
      >
        H2
      </button>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive("orderedList"))}
        title="Нумерованный список"
        type="button"
      >
        OL
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive("bulletList"))}
        title="Маркированный список"
        type="button"
      >
        UL
      </button>

      {/* Font Family */}
      <select
        className="ml-2 px-2 py-1 rounded bg-zinc-800 text-white"
        onChange={(e) => {
          const val = e.target.value;
          if (val === "") editor.chain().focus().unsetFontFamily().run();
          else editor.chain().focus().setFontFamily(val).run();
        }}
        value={editor.isActive("fontFamily") ? editor.getAttributes("fontFamily").fontFamily : ""}
      >
        <option value="">Шрифт</option>
        {fontFamilies.map((family) => (
          <option key={family} value={family}>
            {family.split(",")[0]}
          </option>
        ))}
      </select>

      {/* Undo / Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className="hover:bg-zinc-700 px-3 py-1 rounded"
        type="button"
        title="Отменить (Ctrl+Z)"
      >
        Undo
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className="hover:bg-zinc-700 px-3 py-1 rounded"
        type="button"
        title="Повторить (Ctrl+Y)"
      >
        Redo
      </button>

      {/* Download */}
      <button
        onClick={handleDownloadWord}
        className="ml-auto bg-hackerGreen px-3 py-1 rounded text-black"
        title="Скачать заметки в Word"
        type="button"
      >
        Скачать DOCX
      </button>
    </div>
  );
}

export default function CourseNotesEditor({ chapterIndex, topicIndex }) {
  const { activeCourse, topicStates, setTopicNote } = useCourseStore();

  const key = activeCourse
    ? `${activeCourse.id}-c${chapterIndex}-t${topicIndex}`
    : null;

  const noteFromStore = key && topicStates[key]?.note ? topicStates[key].note : "<p></p>";

  const editor = useEditor({
    extensions: [StarterKit, Underline, FontFamily],
    content: noteFromStore,
    onUpdate: ({ editor }) => {
      if (!key) return;
      setTopicNote(chapterIndex, topicIndex, editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && noteFromStore !== editor.getHTML()) {
      editor.commands.setContent(noteFromStore);
    }
  }, [noteFromStore, editor]);

  if (!editor) return <div>Загрузка редактора...</div>;

  return (
    <div className="bg-zinc-900 rounded border border-zinc-700 p-4 max-w-full min-h-[70vh] flex flex-col text-white">
      <MenuBar
        editor={editor}
        courseId={activeCourse?.id}
        chapterIndex={chapterIndex}
        topicIndex={topicIndex}
      />
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-full flex-grow overflow-auto outline-none"
        spellCheck={true}
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}

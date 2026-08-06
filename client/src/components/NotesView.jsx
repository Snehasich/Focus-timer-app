import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { logLogin } from "../services/activityService";
import { 
  NotebookPen, Plus, Trash2, StickyNote, Search, 
  Paperclip, FileText, Download, X, File, Image as ImageIcon,
  ExternalLink, Sparkles, Star, Tag, Clock, Bold, Italic, 
  Heading1, Heading2, List, ListOrdered, Code, Quote, 
  HelpCircle, BookOpen, CheckCircle2, Bookmark, Highlighter, FileCode,
  Underline, Strikethrough, Eraser
} from "lucide-react";

export const NotesView = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // ── Persistent Notes State ──
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("app_notes_normal");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return parsed.map(n => ({
          ...n,
          isFavorite: n.isFavorite ?? false,
          tags: n.tags || [],
          lastEdited: n.lastEdited || n.date || "Just now"
        }));
      } catch (e) { }
    }
    return [
      { 
        id: 1, 
        title: "Quick Notes", 
        content: "<h1>Focus Session Checklist</h1><p>Focus on completing core tasks today. Take 10-minute breaks after 50 minutes of deep work.</p><ul><li><b>Review morning priorities</b></li><li>Complete UI layout enhancements</li><li>Push clean code commit</li></ul>", 
        date: "Today",
        lastEdited: "Today at 10:15 AM",
        isFavorite: true,
        tags: ["Work", "Focus"],
        attachments: [] 
      },
      { 
        id: 2, 
        title: "Weekly Study Goals", 
        content: "<h2>Key Topics</h2><ol><li>Master React 19 state architecture</li><li>Refine sidebar animations</li><li>Review Spring Boot REST endpoints</li></ol>", 
        date: "Yesterday",
        lastEdited: "Yesterday at 4:30 PM",
        isFavorite: false,
        tags: ["Study"],
        attachments: [] 
      }
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState(() => notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [viewingAttachment, setViewingAttachment] = useState(null);

  useEffect(() => {
    logLogin().catch(() => {});
  }, []);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  // ── AI Feature Modals State ──
  const [activeAiModal, setActiveAiModal] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [pdfHighlightInput, setPdfHighlightInput] = useState("");

  useEffect(() => {
    localStorage.setItem("app_notes_normal", JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // Sync contentEditable innerHTML when activeNote changes
  useEffect(() => {
    if (editorRef.current && activeNote) {
      if (editorRef.current.innerHTML !== (activeNote.content || "")) {
        editorRef.current.innerHTML = activeNote.content || "";
      }
    }
  }, [activeNoteId]);

  // ── Note Handlers ──
  const handleAddNote = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const newNote = {
      id: Date.now(),
      title: "Untitled Note",
      content: "<p>Start typing your document here...</p>",
      date: dateStr,
      lastEdited: `${dateStr} at ${timeStr}`,
      isFavorite: false,
      tags: ["General"],
      attachments: [],
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = (field, value) => {
    if (!activeNote) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const lastEditedStr = `${dateStr} at ${timeStr}`;

    setNotes(
      notes.map((n) => 
        n.id === activeNote.id 
          ? { ...n, [field]: value, lastEdited: lastEditedStr } 
          : n
      )
    );
  };

  const handleEditorInput = () => {
    if (!editorRef.current || !activeNote) return;
    const html = editorRef.current.innerHTML;
    handleUpdateNote("content", html);
  };

  const handleToggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
  };

  const handleDeleteNote = (id, e) => {
    e.stopPropagation();
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    if (activeNoteId === id) {
      setActiveNoteId(updated[0]?.id || null);
    }
  };

  // ── Tag Handlers ──
  const handleAddTag = () => {
    if (!newTagInput.trim() || !activeNote) return;
    const cleanTag = newTagInput.trim().replace(/^#/, "");
    const currentTags = activeNote.tags || [];
    if (!currentTags.includes(cleanTag)) {
      handleUpdateNote("tags", [...currentTags, cleanTag]);
    }
    setNewTagInput("");
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    if (!activeNote) return;
    const currentTags = activeNote.tags || [];
    handleUpdateNote(
      "tags",
      currentTags.filter((t) => t !== tagToRemove)
    );
  };

  // ── File Upload & Drag & Drop ──
  const processFiles = (files) => {
    if (!files.length || !activeNote) return;

    files.forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        alert(`File "${file.name}" is larger than 15MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type || getFallbackType(file.name),
          dataUrl: event.target.result,
        };

        setNotes((prevNotes) =>
          prevNotes.map((n) => {
            if (n.id === activeNote.id) {
              const currentAttachments = n.attachments || [];
              return { ...n, attachments: [...currentAttachments, newAttachment] };
            }
            return n;
          })
        );
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    processFiles(files);
  };

  const handleDeleteAttachment = (attId, e) => {
    e.stopPropagation();
    if (!activeNote) return;
    setNotes((prevNotes) =>
      prevNotes.map((n) => {
        if (n.id === activeNote.id) {
          return {
            ...n,
            attachments: (n.attachments || []).filter((att) => att.id !== attId),
          };
        }
        return n;
      })
    );
  };

  // ── WYSIWYG Microsoft Word ExecCommand Formatting ──
  const execCmd = (command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  // ── AI Actions Logic ──
  const handleAiSummarize = () => {
    if (!activeNote?.content) return;
    const summaryBlock = `<hr/><div style="background: rgba(139, 92, 246, 0.1); border-left: 3px solid #8b5cf6; padding: 10px; margin-top: 15px; border-radius: 8px;"><strong>🤖 AI Executive Summary</strong><p>Key highlights and core takeaways generated automatically from document context.</p></div>`;
    if (editorRef.current) {
      editorRef.current.innerHTML += summaryBlock;
      handleEditorInput();
    }
    setShowAiMenu(false);
  };

  const handleSavePdfHighlight = () => {
    if (!pdfHighlightInput.trim() || !activeNote) return;
    const highlightBlock = `<blockquote style="border-left: 3px solid #f59e0b; padding-left: 10px; margin: 10px 0; color: #f59e0b;">📌 <strong>PDF Highlight:</strong> "${pdfHighlightInput.trim()}"</blockquote>`;
    if (editorRef.current) {
      editorRef.current.innerHTML += highlightBlock;
      handleEditorInput();
    }
    setPdfHighlightInput("");
    alert("Highlight saved directly into active note!");
  };

  const getFallbackType = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    if (ext === "pdf") return "application/pdf";
    if (["doc", "docx"].includes(ext)) return "application/msword";
    if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return `image/${ext}`;
    if (["txt", "csv", "md"].includes(ext)) return "text/plain";
    return "application/octet-stream";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const createPdfBlobUrl = (dataUrl) => {
    if (!dataUrl) return "";
    if (dataUrl.startsWith("blob:")) return dataUrl;
    try {
      const parts = dataUrl.split(",");
      const base64Str = parts.length > 1 ? parts[1] : parts[0];
      const binaryStr = atob(base64Str);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("PDF Blob conversion error:", err);
      return dataUrl;
    }
  };

  const getFileBadge = (name, type) => {
    const ext = name.split(".").pop().toLowerCase();
    if (ext === "pdf" || type?.includes("pdf")) {
      return { label: "PDF", color: "#ef4444", bg: isLight ? "#fef2f2" : "#2a1215", icon: FileText };
    }
    if (["doc", "docx"].includes(ext) || type?.includes("word") || type?.includes("document")) {
      return { label: "DOC", color: "#3b82f6", bg: isLight ? "#eff6ff" : "#121d2d", icon: FileText };
    }
    if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext) || type?.startsWith("image/")) {
      return { label: "IMG", color: "#10b981", bg: isLight ? "#ecfdf5" : "#0e291e", icon: ImageIcon };
    }
    return { label: ext.toUpperCase().slice(0, 4) || "FILE", color: "#8b5cf6", bg: isLight ? "#f5f3ff" : "#1e162d", icon: File };
  };

  // Strip HTML tags for plain text search & word count
  const getPlainText = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const allUniqueTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  ).filter(Boolean);

  const filteredNotes = notes.filter((n) => {
    const plainText = getPlainText(n.content);
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plainText.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (tagFilter === "favorites") return n.isFavorite;
    if (tagFilter !== "all") return (n.tags || []).includes(tagFilter);
    return true;
  });

  const plainContent = getPlainText(activeNote?.content);
  const wordCount = plainContent ? plainContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = plainContent.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // ── AI Quiz & Flashcard Data Generation ──
  const quizQuestions = [
    {
      id: 1,
      question: `What is the primary topic of "${activeNote?.title || "your document"}"?`,
      options: [
        activeNote?.title || "Document Overview",
        "General Task Management",
        "System Configuration",
        "Documentation Outline"
      ],
      correct: 0,
    },
    {
      id: 2,
      question: "Which habit maximizes productivity during deep work cycles?",
      options: [
        "Working 4 hours with no breaks",
        "50 mins deep work + 10 mins break",
        "Multitasking across 5 apps",
        "Skipping break periods"
      ],
      correct: 1,
    },
    {
      id: 3,
      question: "How should key attachments and reference files be managed?",
      options: [
        "Stored in paper notes",
        "Attached directly to notes for instant access",
        "Deleted after 1 day",
        "Sent via manual email"
      ],
      correct: 1,
    }
  ];

  const flashcards = [
    {
      front: `Main Subject of "${activeNote?.title || "Document"}"`,
      back: plainContent.slice(0, 120) || "No detailed summary available."
    },
    {
      front: "Key Action Items",
      back: "Review checklist, maintain focused sessions, and keep document attachments organized."
    },
    {
      front: "Optimal Focus Ratio",
      back: "50 Minutes Focus + 10 Minutes Break"
    }
  ];

  return (
    <div className="min-h-screen md:h-screen w-full p-2 sm:p-5 box-border flex flex-col gap-3 pb-24 md:pb-5">
      {/* Editor CSS Styles for Microsoft Word Formatting */}
      <style>{`
        .word-editor h1 { font-size: 1.45rem; font-weight: 800; margin-top: 0.6rem; margin-bottom: 0.3rem; color: ${isLight ? "#1d4ed8" : "#60a5fa"}; }
        .word-editor h2 { font-size: 1.2rem; font-weight: 700; margin-top: 0.5rem; margin-bottom: 0.25rem; color: ${isLight ? "#2563eb" : "#93c5fd"}; }
        .word-editor ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.4rem 0; }
        .word-editor ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.4rem 0; }
        .word-editor blockquote { border-left: 3px solid #3b82f6; padding-left: 0.8rem; margin: 0.5rem 0; font-style: italic; opacity: 0.9; }
        .word-editor b, .word-editor strong { font-weight: 700; color: inherit; }
        .word-editor i, .word-editor em { font-style: italic; }
        .word-editor u { text-decoration: underline; }
        .word-editor strike, .word-editor s { text-decoration: line-through; }
        .word-editor p { margin-bottom: 0.4rem; }
      `}</style>

      <div
        className="flex flex-col md:flex-row flex-1 gap-4 overflow-y-auto md:overflow-hidden rounded-2xl p-3 sm:p-5 min-h-0"
        style={{
          background: isLight ? "#ffffff" : "#111111",
          border: isLight ? "1px solid #e5e7eb" : "1px solid #222222",
          boxShadow: isLight ? "0 8px 24px rgba(15,23,42,0.03)" : "0 10px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* ── Left Column: Note List & Sidebar ── */}
        <div
          className="w-full md:w-[260px] md:flex-shrink-0 flex flex-col gap-2.5 overflow-hidden md:border-r md:border-b-0 md:pr-4 min-h-[220px] max-h-[300px] md:max-h-none"
          style={{
            borderBottom: isLight ? "1px solid #e5e7eb" : "1px solid #222222",
            paddingBottom: 10,
          }}
        >
          {/* Header & Add Button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <NotebookPen size={18} color="#3b82f6" />
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem", color: isLight ? "#111827" : "#f3f4f6" }}>
                My Notes
              </h3>
            </div>

            <button
              onClick={handleAddNote}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                border: "none",
                borderRadius: 10,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
              }}
              title="Create New Note"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Search Bar */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
            style={{
              background: isLight ? "#f8fafc" : "#161616",
              borderColor: isLight ? "#cbd5e1" : "#262626",
              color: isLight ? "#4b5563" : "#9ca3af",
            }}
          >
            <Search size={14} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs"
              style={{ color: isLight ? "#111827" : "#f3f4f6" }}
            />
          </div>

          {/* Filter Pills (All | Favorites | Tags) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] sidebar-nav">
            <button
              onClick={() => setTagFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                tagFilter === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-[#18181c] text-gray-400 hover:bg-[#222228]"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setTagFilter("favorites")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                tagFilter === "favorites"
                  ? "bg-amber-500 text-white shadow-sm"
                  : isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-[#18181c] text-gray-400 hover:bg-[#222228]"
              }`}
            >
              <Star size={10} className="fill-current" />
              Starred
            </button>

            {allUniqueTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  tagFilter === tag
                    ? "bg-blue-600 text-white shadow-sm"
                    : isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-[#18181c] text-gray-400 hover:bg-[#222228]"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Note List Scrollable */}
          <div className="flex-1 overflow-y-auto sidebar-nav flex flex-col gap-2">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center opacity-60 gap-2 mt-4">
                <StickyNote size={28} />
                <p style={{ fontSize: "0.82rem", color: isLight ? "#9ca3af" : "#666" }}>
                  No notes found
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === activeNote?.id;
                const attCount = note.attachments?.length || 0;
                const previewText = getPlainText(note.content);
                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      cursor: "pointer",
                      background: isSelected
                        ? isLight ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.15)"
                        : isLight ? "#f8fafc" : "#161616",
                      border: isSelected
                        ? "1px solid rgba(59,130,246,0.4)"
                        : isLight ? "1px solid #e2e8f0" : "1px solid #222222",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      transition: "all 0.15s ease",
                    }}
                    className="group hover:border-blue-500/30"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: isSelected ? "#3b82f6" : isLight ? "#111827" : "#e5e7eb" }} className="truncate">
                        {note.title || "Untitled Note"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleToggleFavorite(note.id, e)}
                          className="p-0.5 rounded transition-all cursor-pointer opacity-70 hover:opacity-100"
                          style={{ color: note.isFavorite ? "#f59e0b" : isLight ? "#94a3b8" : "#64748b" }}
                          title={note.isFavorite ? "Unstar Note" : "Star Note"}
                        >
                          <Star size={12} className={note.isFavorite ? "fill-amber-400" : ""} />
                        </button>
                        <Trash2
                          size={12}
                          style={{ opacity: 0.5, cursor: "pointer" }}
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="hover:text-red-400 transition-colors"
                        />
                      </div>
                    </div>

                    <span style={{ fontSize: "0.72rem", color: isLight ? "#6b7280" : "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {previewText || "Empty note..."}
                    </span>

                    {/* Footer: Tags & Attachment Indicator */}
                    <div className="flex items-center justify-between mt-1 text-[10px]" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>
                      <div className="flex items-center gap-1 flex-wrap truncate">
                        {(note.tags || []).slice(0, 2).map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">
                            #{t}
                          </span>
                        ))}
                      </div>

                      {attCount > 0 && (
                        <div className="flex items-center gap-1 font-semibold" style={{ color: "#3b82f6" }}>
                          <Paperclip size={10} />
                          <span>{attCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Column: Note Editor & Microsoft Word WYSIWYG Workbench ── */}
        <div 
          className={`flex-1 flex flex-col gap-3 min-h-0 md:pl-2 relative transition-all rounded-xl ${
            isDraggingOver ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-500/5" : ""
          }`} 
          style={{ overflow: "hidden" }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag Overlay Notice */}
          {isDraggingOver && (
            <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-xs z-30 flex flex-col items-center justify-center border-2 border-dashed border-blue-500 rounded-2xl pointer-events-none gap-2">
              <Paperclip size={32} className="text-blue-500 animate-bounce" />
              <p className="font-bold text-sm text-blue-500">Drop files here to attach to this note!</p>
            </div>
          )}

          {activeNote ? (
            <>
              {/* Header Bar (Title + AI Actions + Tags + Import Button) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5" style={{ borderBottom: isLight ? "1px solid #e5e7eb" : "1px solid #222222" }}>
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <button
                    onClick={() => handleToggleFavorite(activeNote.id)}
                    className="p-1 rounded-lg transition-all cursor-pointer"
                    style={{ color: activeNote.isFavorite ? "#f59e0b" : isLight ? "#94a3b8" : "#64748b" }}
                    title={activeNote.isFavorite ? "Starred Note" : "Star Note"}
                  >
                    <Star size={18} className={activeNote.isFavorite ? "fill-amber-400" : ""} />
                  </button>

                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleUpdateNote("title", e.target.value)}
                    placeholder="Note Title..."
                    style={{
                      fontSize: "clamp(1rem, 3vw, 1.3rem)",
                      fontWeight: 700,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: isLight ? "#111827" : "#f3f4f6",
                      flex: 1,
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Impressive Import Files Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] flex-shrink-0 cursor-pointer group"
                    style={{
                      background: isLight ? "#FFFFFE" : "#111010",
                      border: isLight ? "1px solid #cbd5e1" : "1px solid #222228",
                      boxShadow: isLight 
                        ? "0 2px 8px rgba(0,0,0,0.04)" 
                        : "0 2px 8px rgba(0,0,0,0.4)",
                    }}
                    title="Import PDF, Word, Images & Documents"
                  >
                    <img
                      src={isLight ? "/attach-file-light.png" : "/attach-file-dark.png"}
                      alt="Import Files"
                      className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                    <div className="flex flex-col text-left pr-1">
                      <span 
                        className="text-xs font-black tracking-wide uppercase"
                        style={{
                          background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Import Files
                      </span>
                      <span className="text-[10px] font-semibold" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                        PDF, Word, Docs
                      </span>
                    </div>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.csv,.zip,.rar"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {/* Tags Ribbon */}
              <div className="flex items-center gap-2 flex-wrap text-xs pb-1">
                <Tag size={12} className="text-blue-500" />
                {(activeNote.tags || []).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  >
                    #{t}
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-500 cursor-pointer ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {showTagInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Tag name..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      className="px-2 py-0.5 rounded-md text-[11px] border outline-none bg-transparent"
                      style={{
                        borderColor: isLight ? "#cbd5e1" : "#333",
                        color: isLight ? "#111" : "#eee",
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-blue-600 text-white font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="text-[11px] opacity-70 hover:opacity-100 hover:underline cursor-pointer"
                    style={{ color: isLight ? "#4b5563" : "#9ca3af" }}
                  >
                    + Add Tag
                  </button>
                )}
              </div>

              {/* ── Microsoft Word WYSIWYG Formatting Toolbar ── */}
              <div
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs overflow-x-auto sidebar-nav flex-wrap"
                style={{
                  background: isLight ? "#f8fafc" : "#161618",
                  borderColor: isLight ? "#e2e8f0" : "#26262e",
                }}
              >
                <button
                  onClick={() => execCmd("bold")}
                  className="p-1.5 rounded hover:bg-blue-500/10 hover:text-blue-500 transition-all cursor-pointer font-bold"
                  title="Bold (Ctrl+B)"
                  style={{ color: isLight ? "#475569" : "#94a3b8" }}
                >
                  <Bold size={14} />
                </button>

                <button
                  onClick={() => execCmd("italic")}
                  className="p-1.5 rounded hover:bg-blue-500/10 hover:text-blue-500 transition-all cursor-pointer italic"
                  title="Italic (Ctrl+I)"
                  style={{ color: isLight ? "#475569" : "#94a3b8" }}
                >
                  <Italic size={14} />
                </button>

                <button
                  onClick={() => execCmd("underline")}
                  className="p-1.5 rounded hover:bg-blue-500/10 hover:text-blue-500 transition-all cursor-pointer underline"
                  title="Underline (Ctrl+U)"
                  style={{ color: isLight ? "#475569" : "#94a3b8" }}
                >
                  <Underline size={14} />
                </button>

                <button
                  onClick={() => execCmd("strikeThrough")}
                  className="p-1.5 rounded hover:bg-blue-500/10 hover:text-blue-500 transition-all cursor-pointer line-through"
                  title="Strikethrough"
                  style={{ color: isLight ? "#475569" : "#94a3b8" }}
                >
                  <Strikethrough size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-500/20 mx-1" />

                <button
                  onClick={() => execCmd("formatBlock", "<h1>")}
                  className="p-1.5 rounded hover:bg-blue-500/10 hover:text-blue-500 transition-all cursor-pointer font-extrabold"
                  title="Heading 1"
                  style={{ color: isLight ? "#475569" : "#94a3b8" }}
                >
                  <Heading1 size={14} />
                </button>

                <button
                  onClick={() => execCmd("formatBlock", "<h2>")}
                  className="p-1.5 rounded hover:bg-blue-500/10 hover:text-blue-500 transition-all cursor-pointer font-bold"
                  title="Heading 2"
                  style={{ color: isLight ? "#475569" : "#94a3b8" }}
                >
                  <Heading2 size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-500/20 mx-1" />

                <button
                  onClick={() => execCmd("insertUnorderedList")}
                  className="p-1.5 rounded hover:bg-blue-500/10 hover:text-blue-500 transition-all cursor-pointer"
                  title="Bullet List"
                  style={{ color: isLight ? "#475569" : "#94a3b8" }}
                >
                  <List size={14} />
                </button>

                <button
                  onClick={() => execCmd("insertOrderedList")}
                  className="p-1.5 rounded hover:bg-blue-500/10 hover:text-blue-500 transition-all cursor-pointer"
                  title="Numbered List"
                  style={{ color: isLight ? "#475569" : "#94a3b8" }}
                >
                  <ListOrdered size={14} />
                </button>

                <button
                  onClick={() => execCmd("formatBlock", "<blockquote>")}
                  className="p-1.5 rounded hover:bg-blue-500/10 hover:text-blue-500 transition-all cursor-pointer"
                  title="Quote Block"
                  style={{ color: isLight ? "#475569" : "#94a3b8" }}
                >
                  <Quote size={14} />
                </button>

                <button
                  onClick={() => execCmd("hiliteColor", isLight ? "#fef08a" : "#854d0e")}
                  className="p-1.5 rounded hover:bg-amber-500/20 hover:text-amber-400 transition-all cursor-pointer"
                  title="Highlight Selected Text"
                  style={{ color: isLight ? "#475569" : "#94a3b8" }}
                >
                  <Highlighter size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-500/20 mx-1" />

                <button
                  onClick={() => execCmd("removeFormat")}
                  className="p-1.5 rounded hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
                  title="Clear Formatting"
                  style={{ color: isLight ? "#475569" : "#94a3b8" }}
                >
                  <Eraser size={14} />
                </button>
              </div>

              {/* ── Microsoft Word WYSIWYG ContentEditable Editor ── */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onBlur={handleEditorInput}
                className="word-editor w-full flex-1 outline-none text-sm leading-relaxed overflow-y-auto sidebar-nav min-h-[300px] pt-1"
                style={{
                  color: isLight ? "#1e293b" : "#e2e8f0",
                }}
              />

              {/* Word Count & Reading Time Metadata Ribbon */}
              <div
                className="flex items-center justify-between text-[11px] px-2 py-1 border-t"
                style={{
                  borderColor: isLight ? "#f1f5f9" : "#1a1a20",
                  color: isLight ? "#94a3b8" : "#64748b",
                }}
              >
                <div className="flex items-center gap-3">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{charCount} chars</span>
                  <span>•</span>
                  <span>{readingTime} min read</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>Edited {activeNote.lastEdited}</span>
                </div>
              </div>

              {/* Attachments Display Bar */}
              {activeNote.attachments && activeNote.attachments.length > 0 && (
                <div
                  className="flex flex-col gap-2 pt-2.5 mt-auto"
                  style={{ borderTop: isLight ? "1px solid #e5e7eb" : "1px solid #222222" }}
                >
                  <div className="flex items-center justify-between text-xs font-bold" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                    <div className="flex items-center gap-1.5">
                      <Paperclip size={13} className="text-blue-500" />
                      <span>Attachments ({activeNote.attachments.length})</span>
                    </div>
                    <span className="text-[10px] font-normal opacity-70">Click to view/download</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sidebar-nav flex-wrap">
                    {activeNote.attachments.map((att) => {
                      const badge = getFileBadge(att.name, att.type);
                      const BadgeIcon = badge.icon;
                      return (
                        <div
                          key={att.id}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all hov-lift"
                          style={{
                            background: isLight ? "#f8fafc" : "#16161a",
                            border: `1px solid ${isLight ? "#e2e8f0" : "#26262e"}`,
                            maxWidth: 240,
                          }}
                        >
                          {/* File Icon Badge */}
                          <div
                            onClick={() => setViewingAttachment(att)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[10px] cursor-pointer hover:scale-105 transition-all"
                            style={{ background: badge.bg, color: badge.color }}
                            title={`View ${att.name}`}
                          >
                            <BadgeIcon size={14} />
                          </div>

                          {/* File Name & Size */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <button
                              onClick={() => setViewingAttachment(att)}
                              className="font-semibold truncate hover:underline flex items-center gap-1 text-left bg-transparent border-0 p-0 cursor-pointer"
                              style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}
                              title={`Click to view ${att.name}`}
                            >
                              <span className="truncate">{att.name}</span>
                              <ExternalLink size={10} className="flex-shrink-0 opacity-60" />
                            </button>
                            <span className="text-[10px] opacity-60">
                              {badge.label} • {formatFileSize(att.size)}
                            </span>
                          </div>

                          {/* Download & Remove Buttons */}
                          <div className="flex items-center gap-1">
                            <a
                              href={att.dataUrl}
                              download={att.name}
                              className="p-1 hover:bg-black/10 rounded transition-all"
                              style={{ color: isLight ? "#475569" : "#94a3b8" }}
                              title="Download Copy"
                            >
                              <Download size={13} />
                            </a>
                            <button
                              onClick={(e) => handleDeleteAttachment(att.id, e)}
                              className="p-1 hover:bg-red-500/20 hover:text-red-500 rounded transition-all"
                              style={{ color: isLight ? "#94a3b8" : "#64748b" }}
                              title="Remove Attachment"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.4, gap: 10 }}>
              <StickyNote size={36} />
              <span>Select or create a note</span>
            </div>
          )}
        </div>
      </div>

      {/* ── File Preview Modal (With Highlight Saver) ── */}
      {viewingAttachment && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6"
          onClick={() => setViewingAttachment(null)}
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{
              background: isLight ? "#ffffff" : "#141418",
              border: isLight ? "1px solid #cbd5e1" : "1px solid #2a2a34",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: isLight ? "#e2e8f0" : "#26262e" }}>
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <Paperclip size={16} className="text-blue-500 flex-shrink-0" />
                <span className="font-bold text-sm truncate" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                  {viewingAttachment.name}
                </span>
                <span className="text-xs opacity-60 flex-shrink-0">({formatFileSize(viewingAttachment.size)})</span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={createPdfBlobUrl(viewingAttachment.dataUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md"
                  title="Open PDF in Full Window / Tab"
                >
                  <ExternalLink size={13} />
                  <span>Open in New Tab</span>
                </a>
                <a
                  href={viewingAttachment.dataUrl}
                  download={viewingAttachment.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md"
                  title="Download File"
                >
                  <Download size={13} />
                  <span>Save / Download</span>
                </a>
                <button
                  onClick={() => setViewingAttachment(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-500/20 transition-all cursor-pointer"
                  style={{ color: isLight ? "#64748b" : "#94a3b8" }}
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Inline Viewer */}
            <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center min-h-[320px] max-h-[75vh]" style={{ background: isLight ? "#f8fafc" : "#0d0d10" }}>
              {viewingAttachment.type?.startsWith("image/") || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(viewingAttachment.name) ? (
                <img
                  src={viewingAttachment.dataUrl}
                  alt={viewingAttachment.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              ) : viewingAttachment.type === "application/pdf" || /\.pdf$/i.test(viewingAttachment.name) ? (
                <div className="w-full h-full flex flex-col items-center justify-center min-h-[500px] gap-3">
                  <object
                    data={createPdfBlobUrl(viewingAttachment.dataUrl)}
                    type="application/pdf"
                    className="w-full h-[62vh] rounded-lg border-0 bg-white shadow-md"
                  >
                    <embed
                      src={createPdfBlobUrl(viewingAttachment.dataUrl)}
                      type="application/pdf"
                      className="w-full h-[62vh] rounded-lg border-0 bg-white"
                    />
                  </object>

                  {/* Highlight & Save to Note Toolbar */}
                  <div className="w-full flex items-center gap-2 p-2 rounded-xl border bg-black/10" style={{ borderColor: isLight ? "#cbd5e1" : "#26262e" }}>
                    <Highlighter size={16} className="text-amber-400 flex-shrink-0 ml-1" />
                    <input
                      type="text"
                      placeholder="Paste PDF text or type key highlight to save into active note..."
                      value={pdfHighlightInput}
                      onChange={(e) => setPdfHighlightInput(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-xs"
                      style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}
                    />
                    <button
                      onClick={handleSavePdfHighlight}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer shadow-sm"
                    >
                      <Bookmark size={12} />
                      <span>Save Highlight</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <FileText size={48} className="text-blue-500 opacity-80" />
                  <p className="font-semibold text-sm" style={{ color: isLight ? "#334155" : "#cbd5e1" }}>
                    Direct inline preview not supported for this file type.
                  </p>
                  <a
                    href={viewingAttachment.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md"
                  >
                    Open in New Window / Tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── AI Explanation Modal ── */}
      {activeAiModal === "explain" && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setActiveAiModal(null)}>
          <div 
            className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4 shadow-2xl border animate-in fade-in zoom-in-95"
            style={{
              background: isLight ? "#ffffff" : "#141418",
              borderColor: isLight ? "#cbd5e1" : "#2a2a34",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isLight ? "#e2e8f0" : "#26262e" }}>
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-blue-500" />
                <h4 className="font-bold text-base" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                  💡 AI Breakdown & Explanation
                </h4>
              </div>
              <button onClick={() => setActiveAiModal(null)} className="p-1 rounded hover:bg-gray-500/20 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="text-xs space-y-3 leading-relaxed" style={{ color: isLight ? "#334155" : "#cbd5e1" }}>
              <p className="font-semibold text-blue-400">
                Key Concepts from "{activeNote?.title}":
              </p>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <strong>1. Deep Work Cadence:</strong> Structuring sessions into 50-minute focused execution intervals minimizes cognitive context switching.
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <strong>2. Document Integration:</strong> Keeping reference attachments alongside notes ensures zero friction during task execution.
              </div>
            </div>

            <button
              onClick={() => setActiveAiModal(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── AI Quiz Generator Modal ── */}
      {activeAiModal === "quiz" && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setActiveAiModal(null)}>
          <div 
            className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 flex flex-col gap-4 shadow-2xl border animate-in fade-in zoom-in-95"
            style={{
              background: isLight ? "#ffffff" : "#141418",
              borderColor: isLight ? "#cbd5e1" : "#2a2a34",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isLight ? "#e2e8f0" : "#26262e" }}>
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-emerald-500" />
                <h4 className="font-bold text-base" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                  🎯 AI Generated Study Quiz
                </h4>
              </div>
              <button onClick={() => setActiveAiModal(null)} className="p-1 rounded hover:bg-gray-500/20 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {quizQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 rounded-xl border flex flex-col gap-2" style={{ background: isLight ? "#f8fafc" : "#19191e", borderColor: isLight ? "#e2e8f0" : "#282832" }}>
                  <p className="font-bold text-xs" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                    Q{idx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[q.id] === optIdx;
                      const isCorrect = optIdx === q.correct;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                          className={`text-left text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                            quizSubmitted
                              ? isCorrect 
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold" 
                                : isSelected ? "bg-red-500/20 border-red-500 text-red-400" : "opacity-60"
                              : isSelected
                                ? "bg-blue-600 text-white border-blue-600 font-bold"
                                : isLight ? "bg-white hover:bg-slate-100 border-slate-200" : "bg-[#111] hover:bg-[#222] border-[#262626]"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-md"
              >
                Submit Answers & Grade
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  <span>Quiz Completed! Check your answers above.</span>
                </div>
                <button
                  onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI Flashcards Modal ── */}
      {activeAiModal === "flashcards" && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setActiveAiModal(null)}>
          <div 
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4 shadow-2xl border animate-in fade-in zoom-in-95 text-center"
            style={{
              background: isLight ? "#ffffff" : "#141418",
              borderColor: isLight ? "#cbd5e1" : "#2a2a34",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isLight ? "#e2e8f0" : "#26262e" }}>
              <div className="flex items-center gap-2">
                <FileCode size={18} className="text-amber-500" />
                <h4 className="font-bold text-base" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                  🃏 Interactive Flashcards
                </h4>
              </div>
              <button onClick={() => setActiveAiModal(null)} className="p-1 rounded hover:bg-gray-500/20 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Flip Card Container */}
            <div
              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
              className="w-full h-56 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-[1.02] shadow-xl border relative"
              style={{
                background: flashcardFlipped 
                  ? "linear-gradient(135deg, #1e1b4b, #311b92)" 
                  : "linear-gradient(135deg, #1e293b, #0f172a)",
                borderColor: flashcardFlipped ? "#6366f1" : "#3b82f6",
                color: "#ffffff",
              }}
            >
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 absolute top-3 left-4">
                {flashcardFlipped ? "Answer" : "Question"} ({flashcardIndex + 1}/{flashcards.length})
              </span>

              <p className="font-bold text-sm leading-relaxed px-2">
                {flashcardFlipped ? flashcards[flashcardIndex].back : flashcards[flashcardIndex].front}
              </p>

              <span className="text-[10px] opacity-60 absolute bottom-3">
                Click card to flip 🔄
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                  setFlashcardFlipped(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-500/20 hover:bg-gray-500/30 cursor-pointer"
                style={{ color: isLight ? "#111" : "#eee" }}
              >
                Previous
              </button>

              <button
                onClick={() => {
                  setFlashcardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                  setFlashcardFlipped(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Next Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesView;

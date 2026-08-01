import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { 
  NotebookPen, Plus, Trash2, StickyNote, Search, 
  Paperclip, FileText, Download, X, File, Image as ImageIcon,
  ExternalLink
} from "lucide-react";

export const NotesView = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const fileInputRef = useRef(null);

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("app_notes_normal");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { 
        id: 1, 
        title: "Quick Notes", 
        content: "Focus on completing tasks today. Take 10-minute break after 50 minutes of deep work.", 
        date: "Today",
        attachments: [] 
      },
      { 
        id: 2, 
        title: "Weekly Goals", 
        content: "1. Complete project features\n2. Refine sidebar animations\n3. Review API endpoints", 
        date: "Yesterday",
        attachments: [] 
      }
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState(() => notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("app_notes_normal", JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleAddNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Untitled Note",
      content: "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      attachments: [],
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = (field, value) => {
    if (!activeNote) return;
    setNotes(
      notes.map((n) => (n.id === activeNote.id ? { ...n, [field]: value } : n))
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

  // ── Handle File Upload (PDF, Word, Images, etc.) ──
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !activeNote) return;

    files.forEach((file) => {
      // 10MB limit check
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is larger than 10MB limit.`);
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

    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen p-3 sm:p-5 box-border flex flex-col gap-3">
      <div
        className="flex flex-col md:flex-row flex-1 gap-4 overflow-hidden rounded-2xl p-3 sm:p-5"
        style={{
          background: isLight ? "#ffffff" : "#111111",
          border: isLight ? "1px solid #e5e7eb" : "1px solid #222222",
          boxShadow: isLight ? "0 8px 24px rgba(15,23,42,0.03)" : "0 10px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Left Column: Note List */}
        <div
          className="w-full md:w-[240px] md:flex-shrink-0 flex flex-col gap-2 overflow-hidden md:border-r md:border-b-0 md:pr-4"
          style={{
            borderBottom: isLight ? "1px solid #e5e7eb" : "1px solid #222222",
            paddingBottom: 10,
          }}
        >
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
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Search bar */}
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

          <div className="flex-1 overflow-y-auto sidebar-nav flex flex-col gap-2">
            {filteredNotes.length === 0 ? (
              <p style={{ color: isLight ? "#9ca3af" : "#555", fontSize: "0.82rem", textAlign: "center", marginTop: 20 }}>
                No notes found
              </p>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === activeNote?.id;
                const attCount = note.attachments?.length || 0;
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
                        ? "1px solid rgba(59,130,246,0.3)"
                        : isLight ? "1px solid #e2e8f0" : "1px solid #222222",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: isSelected ? "#3b82f6" : isLight ? "#111827" : "#e5e7eb" }}>
                        {note.title || "Untitled Note"}
                      </span>
                      <Trash2
                        size={13}
                        style={{ opacity: 0.5, cursor: "pointer" }}
                        onClick={(e) => handleDeleteNote(note.id, e)}
                      />
                    </div>
                    <span style={{ fontSize: "0.72rem", color: isLight ? "#6b7280" : "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {note.content || "Empty note..."}
                    </span>

                    {/* Attachments Indicator Badge */}
                    {attCount > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold" style={{ color: "#3b82f6" }}>
                        <Paperclip size={10} />
                        <span>{attCount} file{attCount > 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Note Editor */}
        <div className="flex-1 flex flex-col gap-3 min-h-0 md:pl-2" style={{ overflow: "hidden" }}>
          {activeNote ? (
            <>
              {/* Header Title + Attach Button */}
              <div className="flex items-center justify-between gap-3 pb-2" style={{ borderBottom: isLight ? "1px solid #e5e7eb" : "1px solid #222222" }}>
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

                {/* Impressive Import Files Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] flex-shrink-0 cursor-pointer group"
                  style={{
                    background: isLight 
                      ? "linear-gradient(135deg, #ffffff, #f1f5f9)" 
                      : "linear-gradient(135deg, #18181c, #111115)",
                    border: isLight ? "1px solid #cbd5e1" : "1px solid #2e2e38",
                    boxShadow: isLight 
                      ? "0 4px 12px rgba(0,0,0,0.05)" 
                      : "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                  title="Import PDF, Word, Images & Documents"
                >
                  <img
                    src={isLight ? "/attach-file-light.png" : "/attach-file-dark.png"}
                    alt="Import Files"
                    className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
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

              {/* Note Content Textarea */}
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateNote("content", e.target.value)}
                placeholder="Write your note here..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: isLight ? "#374151" : "#d1d5db",
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                  resize: "none",
                }}
                className="sidebar-nav"
              />

              {/* Attachments Display Bar */}
              {activeNote.attachments && activeNote.attachments.length > 0 && (
                <div
                  className="flex flex-col gap-2 pt-3 mt-auto"
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
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[10px]"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            <BadgeIcon size={14} />
                          </div>

                          {/* File Name & Size */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <a
                              href={att.dataUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={att.name}
                              className="font-semibold truncate hover:underline flex items-center gap-1"
                              style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}
                              title={`Download/Open ${att.name}`}
                            >
                              <span className="truncate">{att.name}</span>
                              <ExternalLink size={10} className="flex-shrink-0 opacity-60" />
                            </a>
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
                              title="Download File"
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
    </div>
  );
};

export default NotesView;

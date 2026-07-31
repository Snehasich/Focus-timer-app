import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { NotebookPen, Plus, Trash2, StickyNote, Search } from "lucide-react";

export const NotesView = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("app_notes_normal");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 1, title: "Quick Notes", content: "Focus on completing tasks today. Take 10-minute break after 50 minutes of deep work.", date: "Today" },
      { id: 2, title: "Weekly Goals", content: "1. Complete project features\n2. Refine sidebar animations\n3. Review API endpoints", date: "Yesterday" }
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
                  borderBottom: isLight ? "1px solid #e5e7eb" : "1px solid #222222",
                  paddingBottom: 8,
                  width: "100%",
                }}
              />
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

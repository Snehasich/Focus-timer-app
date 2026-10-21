package com.example.server.service;

import com.example.server.entity.Note;
import com.example.server.repo.NoteRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    private final NoteRepo repository;

    public NoteService(NoteRepo repository) {
        this.repository = repository;
    }

    // 🔐 GET NOTES FOR LOGGED-IN USER (Seeds 1 professional welcome note if brand new user)
    public List<Note> getNotesForUser(String username) {
        if (username == null || username.trim().isEmpty() || "anonymousUser".equalsIgnoreCase(username)) {
            return List.of();
        }

        List<Note> userNotes = repository.findByUsernameIgnoreCaseOrderByIdDesc(username.trim());

        // If new user has 0 notes, auto-create the professional Welcome Note in database
        if (userNotes.isEmpty() && !"Guest".equalsIgnoreCase(username.trim())) {
            Note welcomeNote = createDefaultWelcomeNote(username.trim());
            return List.of(welcomeNote);
        }

        return userNotes;
    }

    // ➕ CREATE NOTE
    public Note createNote(Note note, String username) {
        String owner = (username != null && !username.trim().isEmpty()) ? username.trim() : "Guest";
        note.setUsername(owner);
        if (note.getDate() == null || note.getDate().trim().isEmpty()) {
            note.setDate("Today");
        }
        if (note.getLastEdited() == null || note.getLastEdited().trim().isEmpty()) {
            note.setLastEdited("Just now");
        }
        return repository.save(note);
    }

    // ✏️ UPDATE NOTE (Strict user isolation: only owner can update)
    public Note updateNote(Long id, Note updatedNote, String username) {
        Note note = repository.findById(id).orElse(null);

        if (note == null) {
            updatedNote.setUsername(username.trim());
            return repository.save(updatedNote);
        }

        // 🔐 Security verification: Prevent cross-user modification
        if (!note.getUsername().equalsIgnoreCase(username.trim())) {
            throw new SecurityException("Access denied: You do not own this note.");
        }

        if (updatedNote.getTitle() != null) note.setTitle(updatedNote.getTitle());
        if (updatedNote.getContent() != null) note.setContent(updatedNote.getContent());
        if (updatedNote.getLastEdited() != null) note.setLastEdited(updatedNote.getLastEdited());
        note.setFavorite(updatedNote.isFavorite());
        if (updatedNote.getTags() != null) note.setTags(updatedNote.getTags());
        if (updatedNote.getAttachments() != null) note.setAttachments(updatedNote.getAttachments());

        return repository.save(note);
    }

    // ❌ DELETE NOTE (Strict user isolation: only owner can delete)
    public void deleteNote(Long id, String username) {
        Note note = repository.findById(id).orElse(null);
        if (note != null) {
            if (!note.getUsername().equalsIgnoreCase(username.trim())) {
                throw new SecurityException("Access denied: You cannot delete another user's note.");
            }
            repository.delete(note);
        }
    }

    // ── Helper to seed default professional welcome note ──
    private Note createDefaultWelcomeNote(String username) {
        Note welcomeNote = new Note();
        welcomeNote.setUsername(username);
        welcomeNote.setTitle("Welcome to Notes Section");
        welcomeNote.setContent(
            "<h1>Welcome to Notes Section 📝</h1>" +
            "<p>Welcome to your personal workspace in FocusFlow! This space is designed to help you capture ideas, organize study notes, manage daily tasks, and keep all your project documentation in one place.</p>" +
            "<hr />" +
            "<h3>✨ Key Features &amp; Tips:</h3>" +
            "<ul>" +
            "<li><b>Rich Text Formatting:</b> Use the formatting toolbar above to customize headings, bold, italicize, insert bullet points, and code blocks.</li>" +
            "<li><b>File Attachments:</b> Drag &amp; drop or click <i>Import Files</i> to attach PDFs, documents, images, and presentation slides directly to your notes.</li>" +
            "<li><b>Tags &amp; Favorites:</b> Star critical notes to keep them pinned and add custom tags (like <code>#Work</code>, <code>#Study</code>, <code>#Ideas</code>) for quick filtering.</li>" +
            "<li><b>AI Study Assistant:</b> Open the ✨ AI Study menu to generate instant quizzes, flashcards, and summary highlights from your notes.</li>" +
            "</ul>" +
            "<p>Click the <b>+</b> button anytime to create your next note. Happy learning and focusing! 🚀</p>"
        );
        welcomeNote.setDate("Today");
        welcomeNote.setLastEdited("Just now");
        welcomeNote.setFavorite(true);
        welcomeNote.setTags("[\"Welcome\",\"Guide\"]");
        welcomeNote.setAttachments("[]");
        return repository.save(welcomeNote);
    }
}

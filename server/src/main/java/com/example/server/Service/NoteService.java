package com.example.server.service;

import com.example.server.entity.Note;
import com.example.server.entity.Users;
import com.example.server.repo.NoteRepo;
import com.example.server.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    private final NoteRepo repository;
    private final UserRepository userRepo;

    public NoteService(NoteRepo repository, UserRepository userRepo) {
        this.repository = repository;
        this.userRepo = userRepo;
    }

    // 🔐 GET NOTES FOR LOGGED-IN USER (Isolated via user_id foreign key & email)
    public List<Note> getNotesForUser(String identifier) {
        if (identifier == null || identifier.trim().isEmpty() || "anonymousUser".equalsIgnoreCase(identifier)) {
            return List.of();
        }

        String cleanIdentifier = identifier.trim();
        Users user = userRepo.findByIdentifier(cleanIdentifier);

        List<Note> userNotes;
        if (user != null) {
            userNotes = repository.findAllForUser(user.getId(), cleanIdentifier);
        } else {
            userNotes = repository.findByUsernameIgnoreCaseOrderByIdDesc(cleanIdentifier);
        }

        // If new user has 0 notes, auto-create the professional Welcome Note in database
        if (userNotes.isEmpty() && !"Guest".equalsIgnoreCase(cleanIdentifier)) {
            Note welcomeNote = createDefaultWelcomeNote(user, cleanIdentifier);
            return List.of(welcomeNote);
        }

        return userNotes;
    }

    // ➕ CREATE NOTE WITH FOREIGN KEY LINKAGE
    public Note createNote(Note note, String identifier) {
        String cleanIdentifier = (identifier != null && !identifier.trim().isEmpty()) ? identifier.trim() : "Guest";
        Users user = userRepo.findByIdentifier(cleanIdentifier);

        if (user != null) {
            note.setUser(user);
            note.setUsername(user.getEmail() != null ? user.getEmail() : user.getUsername());
        } else {
            note.setUsername(cleanIdentifier);
        }

        if (note.getDate() == null || note.getDate().trim().isEmpty()) {
            note.setDate("Today");
        }
        if (note.getLastEdited() == null || note.getLastEdited().trim().isEmpty()) {
            note.setLastEdited("Just now");
        }
        return repository.save(note);
    }

    // ✏️ UPDATE NOTE (Strict user isolation: only owner can update)
    public Note updateNote(Long id, Note updatedNote, String identifier) {
        Note note = repository.findById(id).orElse(null);

        if (note == null) {
            return createNote(updatedNote, identifier);
        }

        verifyOwnership(note, identifier);

        if (updatedNote.getTitle() != null) note.setTitle(updatedNote.getTitle());
        if (updatedNote.getContent() != null) note.setContent(updatedNote.getContent());
        if (updatedNote.getLastEdited() != null) note.setLastEdited(updatedNote.getLastEdited());
        note.setFavorite(updatedNote.isFavorite());
        if (updatedNote.getTags() != null) note.setTags(updatedNote.getTags());
        if (updatedNote.getAttachments() != null) note.setAttachments(updatedNote.getAttachments());

        return repository.save(note);
    }

    // ❌ DELETE NOTE (Strict user isolation: only owner can delete)
    public void deleteNote(Long id, String identifier) {
        Note note = repository.findById(id).orElse(null);
        if (note != null) {
            verifyOwnership(note, identifier);
            repository.delete(note);
        }
    }

    private void verifyOwnership(Note note, String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new SecurityException("Unauthorized request.");
        }
        String cleanIdentifier = identifier.trim();
        Users user = userRepo.findByIdentifier(cleanIdentifier);

        boolean ownsByUserId = (user != null && note.getUser() != null && note.getUser().getId() == user.getId());
        boolean ownsByUsername = (note.getUsername() != null && note.getUsername().equalsIgnoreCase(cleanIdentifier));
        boolean ownsByEmail = (user != null && user.getEmail() != null && user.getEmail().equalsIgnoreCase(note.getUsername()));

        if (!ownsByUserId && !ownsByUsername && !ownsByEmail) {
            throw new SecurityException("Access denied: You do not own this note.");
        }
    }

    // ── Helper to seed default professional welcome note ──
    private Note createDefaultWelcomeNote(Users user, String identifier) {
        Note welcomeNote = new Note();
        if (user != null) {
            welcomeNote.setUser(user);
            welcomeNote.setUsername(user.getEmail() != null ? user.getEmail() : user.getUsername());
        } else {
            welcomeNote.setUsername(identifier);
        }
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

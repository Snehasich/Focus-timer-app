package com.example.server.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.server.entity.Note;
import com.example.server.service.NoteService;

import java.util.List;

@RequestMapping("/notes")
@RestController
@CrossOrigin(origins = "*")
public class NoteController {

    private final NoteService service;

    public NoteController(NoteService service) {
        this.service = service;
    }

    private String getUsername(Authentication authentication) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")) {
            return authentication.getName();
        }
        return "Guest";
    }

    // 🔐 GET USER-SPECIFIC NOTES (Strictly isolated by authenticated username)
    @GetMapping
    public ResponseEntity<List<Note>> getNotes(Authentication authentication) {
        String username = getUsername(authentication);
        List<Note> notes = service.getNotesForUser(username);
        return ResponseEntity.ok(notes);
    }

    // ➕ CREATE NOTE (Assigned to logged-in user)
    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody Note note, Authentication authentication) {
        String username = getUsername(authentication);
        Note savedNote = service.createNote(note, username);
        return ResponseEntity.ok(savedNote);
    }

    // ✏️ UPDATE NOTE (Strictly authenticated user's note only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNote(@PathVariable Long id,
                                        @RequestBody Note note,
                                        Authentication authentication) {
        String username = getUsername(authentication);
        try {
            Note updated = service.updateNote(id, note, username);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // ❌ DELETE NOTE (Strictly authenticated user's note only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id,
                                       Authentication authentication) {
        String username = getUsername(authentication);
        try {
            service.deleteNote(id, username);
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}

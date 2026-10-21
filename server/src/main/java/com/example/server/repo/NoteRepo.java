package com.example.server.repo;

import com.example.server.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepo extends JpaRepository<Note, Long> {

    // 🔐 Fetch notes strictly for the given username (case-insensitive)
    List<Note> findByUsernameIgnoreCaseOrderByIdDesc(String username);

    List<Note> findByUsernameIgnoreCase(String username);
}

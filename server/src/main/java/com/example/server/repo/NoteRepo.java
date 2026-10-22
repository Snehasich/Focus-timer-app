package com.example.server.repo;

import com.example.server.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepo extends JpaRepository<Note, Long> {

    // 🔐 Fetch notes strictly for user by user_id
    List<Note> findByUser_IdOrderByIdDesc(int userId);

    // 🔐 Fetch notes strictly for the given username/email (case-insensitive)
    List<Note> findByUsernameIgnoreCaseOrderByIdDesc(String username);

    List<Note> findByUsernameIgnoreCase(String username);

    // 🔐 Fetch all notes for user matching either user_id foreign key OR username/email
    @Query("SELECT n FROM Note n WHERE (n.user.id = :userId) OR (LOWER(TRIM(n.username)) = LOWER(TRIM(:identifier))) ORDER BY n.id DESC")
    List<Note> findAllForUser(@Param("userId") int userId, @Param("identifier") String identifier);
}

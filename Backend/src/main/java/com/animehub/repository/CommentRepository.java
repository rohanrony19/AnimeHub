package com.animehub.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.animehub.entity.Anime;
import com.animehub.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {

	List<Comment> findByAnime(Anime anime);    

}
package com.alzheimer.Post_Service.repositories;

import com.alzheimer.Post_Service.entities.Post;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends CrudRepository<Post, Long> {
}

package com.alzheimer.Post_Service.services;

import com.alzheimer.Post_Service.dto.PostRequest;
import com.alzheimer.Post_Service.dto.PostResponse;
import com.alzheimer.Post_Service.entities.Post;
import com.alzheimer.Post_Service.repositories.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    public PostResponse createPost(PostRequest postRequest) {
        Post post = new Post();
        post.setContent(postRequest.getContent());
        post.setImageUrl(postRequest.getImageUrl());
        
        Post savedPost = postRepository.save(post);
        return toResponse(savedPost);
    }

    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        return toResponse(post);
    }

    public List<PostResponse> getAllPosts() {
        List<Post> posts = (List<Post>) postRepository.findAll();
        return posts.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public PostResponse updatePost(Long id, PostRequest postRequest) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        
        post.setContent(postRequest.getContent());
        post.setImageUrl(postRequest.getImageUrl());
        
        Post updatedPost = postRepository.save(post);
        return toResponse(updatedPost);
    }

    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        postRepository.delete(post);
    }

    private PostResponse toResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setContent(post.getContent());
        response.setImageUrl(post.getImageUrl());
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());
        return response;
    }
}

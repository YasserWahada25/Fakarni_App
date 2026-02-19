package com.alzheimer.group_service.services;

import com.alzheimer.group_service.dto.GroupRequest;
import com.alzheimer.group_service.dto.GroupResponse;
import com.alzheimer.group_service.entities.Group;
import com.alzheimer.group_service.repositories.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    public GroupResponse createGroup(GroupRequest request) {
        Group group = new Group();
        group.setName(request.getName());
        group.setDescription(request.getDescription());

        Group savedGroup = groupRepository.save(group);
        return toResponse(savedGroup);
    }

    public GroupResponse getGroupById(Long id) {
        Optional<Group> groupOptional = groupRepository.findById(id);
        if (groupOptional.isEmpty()) {
            throw new RuntimeException("Group not found with id: " + id);
        }
        return toResponse(groupOptional.get());
    }

    public List<GroupResponse> getAllGroups() {
        Iterable<Group> groups = groupRepository.findAll();
        List<GroupResponse> responses = new java.util.ArrayList<>();

        for (Group group : groups) {
            responses.add(toResponse(group));
        }

        return responses;
    }

    public GroupResponse updateGroup(Long id, GroupRequest request) {
        Optional<Group> groupOptional = groupRepository.findById(id);
        if (groupOptional.isEmpty()) {
            throw new RuntimeException("Group not found with id: " + id);
        }

        Group group = groupOptional.get();
        group.setName(request.getName());
        group.setDescription(request.getDescription());

        Group updatedGroup = groupRepository.save(group);
        return toResponse(updatedGroup);
    }

    public void deleteGroup(Long id) {
        Optional<Group> groupOptional = groupRepository.findById(id);
        if (groupOptional.isEmpty()) {
            throw new RuntimeException("Group not found with id: " + id);
        }
        groupRepository.deleteById(id);
    }

    public GroupResponse toResponse(Group group) {
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCreatedAt(),
                group.getUpdatedAt()
        );
    }
}

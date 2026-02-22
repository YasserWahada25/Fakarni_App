package com.alzheimer.session_service.services;

import com.alzheimer.session_service.dto.StaticTestUserResponse;
import com.alzheimer.session_service.entities.TestUser;
import com.alzheimer.session_service.repositories.TestUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TestUserServiceTest {

    @Mock
    private TestUserRepository testUserRepository;

    @InjectMocks
    private TestUserService testUserService;

    @Test
    void ensureStaticTestUser_createsStaticUserWhenMissing() {
        when(testUserRepository.findById(TestUserService.STATIC_TEST_USER_ID))
                .thenReturn(Optional.empty());
        when(testUserRepository.save(any(TestUser.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        TestUser user = testUserService.ensureStaticTestUser();

        assertNotNull(user);
        assertEquals(TestUserService.STATIC_TEST_USER_ID, user.getId());
        assertEquals(TestUserService.STATIC_TEST_USER_NAME, user.getName());
        assertEquals(TestUserService.STATIC_TEST_USER_EMAIL, user.getEmail());
        assertEquals(TestUserService.STATIC_TEST_USER_ROLE, user.getRole());
        verify(testUserRepository).save(any(TestUser.class));
    }

    @Test
    void getStaticTestUser_returnsMappedResponse() {
        TestUser seededUser = TestUser.builder()
                .id(TestUserService.STATIC_TEST_USER_ID)
                .name(TestUserService.STATIC_TEST_USER_NAME)
                .email(TestUserService.STATIC_TEST_USER_EMAIL)
                .role(TestUserService.STATIC_TEST_USER_ROLE)
                .build();
        when(testUserRepository.findById(TestUserService.STATIC_TEST_USER_ID))
                .thenReturn(Optional.of(seededUser));

        StaticTestUserResponse response = testUserService.getStaticTestUser();

        assertNotNull(response);
        assertEquals(TestUserService.STATIC_TEST_USER_ID, response.getId());
        assertEquals(TestUserService.STATIC_TEST_USER_NAME, response.getName());
        assertEquals(TestUserService.STATIC_TEST_USER_EMAIL, response.getEmail());
        assertEquals(TestUserService.STATIC_TEST_USER_ROLE, response.getRole());
    }
}

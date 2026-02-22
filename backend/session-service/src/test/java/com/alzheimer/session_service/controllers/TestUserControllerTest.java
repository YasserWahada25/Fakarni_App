package com.alzheimer.session_service.controllers;

import com.alzheimer.session_service.dto.StaticTestUserResponse;
import com.alzheimer.session_service.services.TestUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TestUserControllerTest {

    @Mock
    private TestUserService testUserService;

    @InjectMocks
    private TestUserController testUserController;

    @Test
    void getStaticTestUser_returnsServicePayload() {
        StaticTestUserResponse expected = StaticTestUserResponse.builder()
                .id(1L)
                .name("Utilisateur Test")
                .email("test@fakarni.com")
                .role("Utilisateur")
                .build();
        when(testUserService.getStaticTestUser()).thenReturn(expected);

        StaticTestUserResponse response = testUserController.getStaticTestUser();

        assertSame(expected, response);
        assertEquals(1L, response.getId());
        verify(testUserService).getStaticTestUser();
    }
}

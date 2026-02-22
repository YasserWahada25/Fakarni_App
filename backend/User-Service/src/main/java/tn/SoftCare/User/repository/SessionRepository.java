package tn.SoftCare.User.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import tn.SoftCare.User.model.Session;

import java.util.List;
import java.util.Optional;

public interface SessionRepository extends MongoRepository<Session, String> {
    Optional<Session> findByRefreshTokenHash(String refreshTokenHash);
    List<Session> findByUserIdAndRevokedFalse(String userId);
}
package com.example.starter.service;

import com.example.starter.domain.Agency;
import com.example.starter.domain.Review;
import com.example.starter.domain.User;
import com.example.starter.dto.ReviewRequest;
import com.example.starter.exception.ResourceNotFoundException;
import com.example.starter.repository.AgencyRepository;
import com.example.starter.repository.ReviewRepository;
import com.example.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AgencyRepository agencyRepository;
    private final UserRepository userRepository;

    @Transactional
    public Review addReview(ReviewRequest request, String userEmail) {
        User client = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Agency agency = agencyRepository.findById(request.getAgencyId())
                .orElseThrow(() -> new ResourceNotFoundException("Agence introuvable"));

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("La note doit être comprise entre 1 et 5");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .client(client)
                .agency(agency)
                .build();

        return reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public List<Review> getAgencyReviews(Long agencyId) {
        return reviewRepository.findByAgencyId(agencyId);
    }

    @Transactional(readOnly = true)
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }
}
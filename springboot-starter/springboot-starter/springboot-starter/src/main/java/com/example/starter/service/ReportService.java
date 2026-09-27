package com.example.starter.service;

import com.example.starter.domain.Property;
import com.example.starter.domain.Report;
import com.example.starter.domain.User;
import com.example.starter.dto.ReportRequest;
import com.example.starter.exception.ResourceNotFoundException;
import com.example.starter.repository.PropertyRepository;
import com.example.starter.repository.ReportRepository;
import com.example.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @Transactional
    public Report createReport(ReportRequest request, String userEmail) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Annonce introuvable"));

        Report report = Report.builder()
                .reason(request.getReason())
                .description(request.getDescription())
                .reporter(user)
                .property(property)
                .build();

        return reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @Transactional
    public Report updateReportStatus(Long id, String status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement introuvable"));
        report.setStatus(status);
        return reportRepository.save(report);
    }
}
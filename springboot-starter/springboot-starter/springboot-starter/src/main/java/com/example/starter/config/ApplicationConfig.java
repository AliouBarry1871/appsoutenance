package com.example.starter.config;

import com.example.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            if (username == null) {
                throw new UsernameNotFoundException("Email vide");
            }
            String cleaned = username.trim().toLowerCase();
            return userRepository.findByEmailIgnoreCase(cleaned)
                    .or(() -> {
                        if (cleaned.equals("adama@email.com")) {
                            return userRepository.findByEmailIgnoreCase("adama@gmail.com");
                        } else if (cleaned.equals("adama@gmail.com")) {
                            return userRepository.findByEmailIgnoreCase("adama@email.com");
                        }
                        return java.util.Optional.empty();
                    })
                    .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + username));
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
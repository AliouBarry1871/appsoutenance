package com.example.starter.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // 1. Requêtes CORS Pre-flight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Fichiers statiques et images
                        .requestMatchers("/uploads/**").permitAll()

                        // 3. Authentification publique et page d'erreur
                        .requestMatchers("/api/auth/**", "/api/v1/auth/**", "/auth/**", "/error").permitAll()

                        // 4. RÈGLE SPÉCIFIQUE (Doit obligatoirement être avant la règle générale)
                        .requestMatchers(HttpMethod.GET, "/api/properties/my-properties", "/api/v1/properties/my-properties")
                        .hasAnyAuthority("ROLE_AGENCY", "AGENCY", "ROLE_ADMIN", "ADMIN")

                        // 5. RÈGLE GÉNÉRALE : Consultation publique de toutes les autres annonces (GET)
                        .requestMatchers(HttpMethod.GET, "/api/properties/**", "/api/v1/properties/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/agencies/**", "/api/v1/agencies/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/agency/**", "/api/v1/reviews/agency/**").permitAll()

                        // 6. Modifications et créations d'annonces
                        .requestMatchers(HttpMethod.PUT, "/api/properties/**", "/api/v1/properties/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/properties/**", "/api/v1/properties/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/properties/**", "/api/v1/properties/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/properties/**", "/api/v1/properties/**").authenticated()

                        // 7. Webhooks
                        .requestMatchers("/api/payments/webhook", "/api/v1/payments/webhook").permitAll()

                        // 8. Endpoints restreints par rôle
                        .requestMatchers("/api/admin/**", "/api/v1/admin/**").hasAnyAuthority("ROLE_ADMIN", "ADMIN")
                        .requestMatchers("/api/agency/**", "/api/v1/agency/**").hasAnyAuthority("ROLE_AGENCY", "AGENCY")

                        // 9. Tout autre endpoint nécessite un token valide
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");
                            String reason = "expired".equals(request.getAttribute("jwt_exception"))
                                    ? "Votre session a expiré. Veuillez vous reconnecter."
                                    : "Accès non autorisé ou session invalide.";
                            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"" + reason + "\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Accès interdit : vous n'avez pas les autorisations nécessaires.\"}");
                        })
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
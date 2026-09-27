package com.example.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class    StarterApplication {
    /** Point d'entrée unique ; Spring scanne ce package et ses sous-packages. */
    public static void main(String[] args) {
        SpringApplication.run(StarterApplication.class, args);
    }
}

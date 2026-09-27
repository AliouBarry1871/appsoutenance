package com.example.starter.config;

import com.example.starter.domain.*;
import com.example.starter.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AgencyRepository agencyRepository;
    private final PropertyRepository propertyRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Vérification et initialisation des données de démonstration SamaKeur pour la soutenance...");

        // 1. Administrateur
        User admin = userRepository.findByEmail("admin@samakeur.sn").orElseGet(() -> {
            return User.builder()
                    .email("admin@samakeur.sn")
                    .fullName("Mamadou Ndiaye (Admin SamaKeur)")
                    .phone("+221 77 100 20 30")
                    .role(Role.ROLE_ADMIN)
                    .build();
        });
        admin.setEnabled(true);
        admin.setRole(Role.ROLE_ADMIN);
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        userRepository.save(admin);

        // 2. Client Chercheur
        User client = userRepository.findByEmail("chercheur@gmail.com").orElseGet(() -> {
            return User.builder()
                    .email("chercheur@gmail.com")
                    .fullName("Fatou Sow")
                    .phone("+221 77 888 99 00")
                    .role(Role.ROLE_CLIENT)
                    .build();
        });
        client.setEnabled(true);
        client.setRole(Role.ROLE_CLIENT);
        client.setPassword(passwordEncoder.encode("Client@123"));
        client = userRepository.save(client);

        // 3. Agence 1 : Dakar Immo Prestige
        Agency agency1 = agencyRepository.findByEmail("dakarimmo@samakeur.sn").orElseGet(() -> {
            Agency a = new Agency();
            a.setEmail("dakarimmo@samakeur.sn");
            a.setFullName("Ibrahima Fall");
            a.setPhone("+221 77 654 32 10");
            a.setRole(Role.ROLE_AGENCY);
            a.setCompanyName("Dakar Immo Prestige SARL");
            a.setNinea("0078945612");
            a.setRccm("SN-DKR-2023-B-4589");
            a.setAddress("Route des Almadies, Zone 4, Dakar");
            a.setProfilePictureUrl("https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80");
            a.setKycDocumentUrl("https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=800&q=80");
            return a;
        });
        agency1.setEnabled(true);
        agency1.setVerified(true);
        agency1.setRole(Role.ROLE_AGENCY);
        agency1.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        agency1.setPassword(passwordEncoder.encode("Agence@123"));
        agency1 = agencyRepository.save(agency1);

        // 4. Agence 2 : Teranga Immobilier
        Agency agency2 = agencyRepository.findByEmail("teranga@samakeur.sn").orElseGet(() -> {
            Agency a = new Agency();
            a.setEmail("teranga@samakeur.sn");
            a.setFullName("Awa Diop");
            a.setPhone("+221 78 432 19 87");
            a.setRole(Role.ROLE_AGENCY);
            a.setCompanyName("Teranga Immobilier Sénégal");
            a.setNinea("0091234567");
            a.setRccm("SN-DKR-2022-B-9981");
            a.setAddress("Avenue Cheikh Anta Diop, Mermoz, Dakar");
            a.setProfilePictureUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80");
            a.setKycDocumentUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80");
            return a;
        });
        agency2.setEnabled(true);
        agency2.setVerified(true);
        agency2.setRole(Role.ROLE_AGENCY);
        agency2.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        agency2.setPassword(passwordEncoder.encode("Agence@123"));
        agency2 = agencyRepository.save(agency2);

        // 5. Agence 3 (En attente KYC) : Nova Habitat Thiès
        Agency agency3 = agencyRepository.findByEmail("novaimmo@samakeur.sn").orElseGet(() -> {
            Agency a = new Agency();
            a.setEmail("novaimmo@samakeur.sn");
            a.setFullName("Cheikh Tidiane Sy");
            a.setPhone("+221 76 112 33 44");
            a.setRole(Role.ROLE_AGENCY);
            a.setCompanyName("Nova Habitat Thiès");
            a.setNinea("0012398745");
            a.setRccm("SN-THS-2024-B-3211");
            a.setAddress("Quartier Dixième, Thiès");
            a.setProfilePictureUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80");
            a.setKycDocumentUrl("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80");
            return a;
        });
        agency3.setEnabled(true);
        agency3.setRole(Role.ROLE_AGENCY);
        agency3.setVerified(false);
        agency3.setSubscriptionStatus(SubscriptionStatus.PENDING);
        agency3.setPassword(passwordEncoder.encode("Agence@123"));
        agency3 = agencyRepository.save(agency3);

        if (propertyRepository.count() >= 4) {
            log.info("Comptes vérifiés avec succès et annonces déjà existantes.");
            return;
        }

        // 6. Propriétés / Annonces
        List<Property> properties = List.of(
                createProp("Somptueuse Villa F5 avec piscine aux Almadies",
                        "Magnifique villa contemporaine située au cœur des Almadies. Comprenant un grand salon lumineux, une cuisine américaine entièrement équipée, 4 chambres avec salles d'eau privatives, chambre de gardiennage, piscine privée avec terrasse paysagée, et groupe électrogène.",
                        new BigDecimal("1800000"), new BigDecimal("3600000"),
                        PropertyType.VILLA, TransactionType.LOCATION,
                        "Dakar", "Almadies", "Route des Almadies face ambassade",
                        true, true, true, true, 5, 450.0,
                        PropertyStatus.AVAILABLE, agency1,
                        List.of("https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
                                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
                                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80")),

                createProp("Appartement haut standing 3 pièces à Mermoz",
                        "Bel appartement très lumineux au 3ème étage d'un immeuble neuf sécurisé 24h/24 avec ascenseur. 2 chambres avec placards intégrés, 2 salles de bain modernes, grand salon avec balcon filant, place de parking sous-sol attribuée.",
                        new BigDecimal("650000"), new BigDecimal("1300000"),
                        PropertyType.APPARTEMENT, TransactionType.LOCATION,
                        "Dakar", "Mermoz", "Près de l'école Bilingue, Mermoz",
                        true, false, true, true, 3, 125.0,
                        PropertyStatus.AVAILABLE, agency2,
                        List.of("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
                                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80")),

                createProp("Studio meublé moderne à Fann Résidence",
                        "Charmant studio entièrement meublé et climatisé, idéal pour étudiant ou jeune professionnel. Connexion Wi-Fi fibre optique incluse, kitchenette équipée, balcon avec vue dégagée, service de conciergerie.",
                        new BigDecimal("350000"), new BigDecimal("700000"),
                        PropertyType.STUDIO, TransactionType.LOCATION,
                        "Dakar", "Fann Résidence", "Corniche Ouest, Fann",
                        true, true, true, false, 1, 45.0,
                        PropertyStatus.AVAILABLE, agency1,
                        List.of("https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80",
                                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80")),

                createProp("Chambre individuelle avec salle de bain à Ouakam",
                        "Chambre propre et sécurisée avec salle d'eau privative à Ouakam, à 5 minutes du Monument de la Renaissance. Proche des commerces et des transports.",
                        new BigDecimal("120000"), new BigDecimal("240000"),
                        PropertyType.CHAMBRE, TransactionType.LOCATION,
                        "Dakar", "Ouakam", "Cité Avion, Ouakam",
                        false, false, false, false, 1, 22.0,
                        PropertyStatus.AVAILABLE, agency2,
                        List.of("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80")),

                createProp("Somptueuse Villa pieds dans l'eau à Saly Portudal",
                        "Propriété d'exception en vente à Saly avec accès direct à la plage. 5 grandes suites climatisées, immense séjour avec varangue, piscine à débordement donnant sur l'océan, jardin arboré de 1200m², logement pour le personnel.",
                        new BigDecimal("220000000"), null,
                        PropertyType.VILLA, TransactionType.VENTE,
                        "Mbour", "Saly", "Front de mer, Saly Portudal",
                        true, true, true, true, 6, 550.0,
                        PropertyStatus.AVAILABLE, agency1,
                        List.of("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
                                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80")),

                createProp("Terrain viabilisé 300m² Titre Foncier à Diamniadio",
                        "Superbe parcelle de 300 m² prête à bâtir dans la nouvelle ville de Diamniadio, zone ministérielle. Titre foncier individuel net de tout litige, eau et électricité disponibles en bordure.",
                        new BigDecimal("22000000"), null,
                        PropertyType.TERRAIN, TransactionType.VENTE,
                        "Dakar", "Diamniadio", "Pôle Urbain de Diamniadio",
                        false, false, false, false, 1, 300.0,
                        PropertyStatus.AVAILABLE, agency2,
                        List.of("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80")),

                createProp("Immeuble de bureaux au Plateau commercial",
                        "Plateau de bureaux de 400 m² modulable en plein centre des affaires de Dakar. Câblage réseau, climatisation centrale, ascenseur, générateur de secours automatique et 4 places de parking sécurisées.",
                        new BigDecimal("3500000"), new BigDecimal("7000000"),
                        PropertyType.COMMERCIAL, TransactionType.LOCATION,
                        "Dakar", "Plateau", "Avenue Roume, Dakar Plateau",
                        true, false, true, true, 8, 400.0,
                        PropertyStatus.AVAILABLE, agency1,
                        List.of("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80")),

                createProp("Bel Appartement vue mer aux Mamelles",
                        "Très bel appartement F4 rénové avec vue panoramique sur le phare des Mamelles et l'océan. Composé de 3 chambres, cuisine équipée, terrasse privative spacieuse, quartier calme et très prisé.",
                        new BigDecimal("750000"), new BigDecimal("1500000"),
                        PropertyType.APPARTEMENT, TransactionType.LOCATION,
                        "Dakar", "Les Mamelles", "Route du Phare, Les Mamelles",
                        true, true, true, true, 4, 150.0,
                        PropertyStatus.AVAILABLE, agency2,
                        List.of("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
                                "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"))
        );

        propertyRepository.saveAll(properties);

        // 7. Avis Clients
        Review rev1 = Review.builder()
                .rating(5)
                .comment("Excellente agence ! M. Fall nous a accompagnés avec professionnalisme et transparence pour trouver notre villa aux Almadies.")
                .client(client)
                .agency(agency1)
                .build();

        Review rev2 = Review.builder()
                .rating(5)
                .comment("Très bon accueil et grande réactivité sur WhatsApp. Je recommande fortement Teranga Immobilier pour chercher un logement sereinement !")
                .client(client)
                .agency(agency2)
                .build();

        Review rev3 = Review.builder()
                .rating(4)
                .comment("Visite rapide et contrat très clair. Très satisfaite de mon appartement à Mermoz.")
                .client(client)
                .agency(agency1)
                .build();

        reviewRepository.saveAll(List.of(rev1, rev2, rev3));

        // 8. Notifications
        Notification notif1 = Notification.builder()
                .title("Bienvenue sur SamaKeur !")
                .message("Trouvez votre logement idéal au Sénégal ou contactez directement les agences immobilières partenaires.")
                .type("INFO")
                .readStatus(false)
                .user(client)
                .build();

        Notification notif2 = Notification.builder()
                .title("Nouvelle annonce disponible aux Almadies")
                .message("Une nouvelle Villa F5 avec piscine a été publiée par Dakar Immo Prestige SARL.")
                .type("SUCCESS")
                .readStatus(false)
                .user(client)
                .build();

        Notification notifAgency = Notification.builder()
                .title("Abonnement Agence Actif")
                .message("Félicitations, votre abonnement mensuel est actif. Vos annonces bénéficient de la visibilité prioritaire.")
                .type("SUCCESS")
                .readStatus(false)
                .user(agency1)
                .build();

        notificationRepository.saveAll(List.of(notif1, notif2, notifAgency));

        log.info("Données de démonstration SamaKeur initialisées avec succès !");
    }

    private Property createProp(String title, String desc, BigDecimal price, BigDecimal deposit,
                               PropertyType cat, TransactionType trans,
                               String city, String zone, String address,
                               boolean balcony, boolean terrace, boolean clim, boolean parking,
                               int rooms, double area, PropertyStatus status, Agency agency, List<String> urls) {
        Property p = Property.builder()
                .title(title)
                .description(desc)
                .price(price)
                .depositPrice(deposit)
                .category(cat)
                .transactionType(trans)
                .city(city)
                .zone(zone)
                .address(address)
                .hasBalcony(balcony)
                .hasTerrace(terrace)
                .hasAirConditioning(clim)
                .hasParking(parking)
                .rooms(rooms)
                .area(area)
                .status(status)
                .agency(agency)
                .images(new ArrayList<>())
                .build();

        List<PropertyImage> imgs = urls.stream()
                .map(u -> PropertyImage.builder().imageUrl(u).property(p).build())
                .toList();
        p.getImages().addAll(imgs);
        return p;
    }
}

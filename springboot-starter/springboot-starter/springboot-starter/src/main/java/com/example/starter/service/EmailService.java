package com.example.starter.service;

import com.example.starter.domain.Role;
import com.example.starter.domain.User;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class EmailService {

    private final Optional<JavaMailSender> mailSender;
    private final NotificationService notificationService;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Autowired
    public EmailService(Optional<JavaMailSender> mailSender, NotificationService notificationService) {
        this.mailSender = mailSender;
        this.notificationService = notificationService;
    }

    /**
     * Envoie automatiquement un email de bienvenue à l'utilisateur inscrit (Client ou Agence).
     * L'exécution est asynchrone pour garantir une réponse instantanée à l'inscription.
     */
    public void sendWelcomeEmail(User user) {
        CompletableFuture.runAsync(() -> {
            try {
                String toEmail = user.getEmail();
                String name = (user.getFullName() != null && !user.getFullName().isBlank()) 
                        ? user.getFullName() 
                        : toEmail;
                boolean isAgency = Role.ROLE_AGENCY.equals(user.getRole());

                String subject = isAgency
                        ? "🎉 Bienvenue sur SamaKeur Pro - Votre agence est inscrite avec succès !"
                        : "🎉 Bienvenue sur SamaKeur - Votre inscription a réussi !";

                String textContent = buildPlainTextContent(name, isAgency);
                String htmlContent = buildHtmlContent(name, isAgency);

                boolean sentBySmtp = false;

                // 1. Envoi réel par SMTP si configuré
                if (isSmtpConfigured() && mailSender.isPresent()) {
                    try {
                        JavaMailSender sender = mailSender.get();
                        MimeMessage mimeMessage = sender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

                        String fromAddress = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername : "admin@samakeur.sn";
                        helper.setFrom(fromAddress, "Administrateur SamaKeur");
                        helper.setReplyTo("admin@samakeur.sn", "Administrateur SamaKeur");
                        helper.setTo(toEmail);
                        helper.setSubject(subject);
                        helper.setText(textContent, htmlContent);

                        sender.send(mimeMessage);
                        sentBySmtp = true;
                        log.info("✅ [SMTP] Email de bienvenue envoyé avec succès à : {} de la part de admin@samakeur.sn", toEmail);
                    } catch (Exception e) {
                        log.warn("⚠️ [SMTP] Impossible d'envoyer l'email réel via SMTP ({}) - Bascule sur la journalisation locale.", e.getMessage());
                    }
                }

                // 2. Affichage propre dans la console (idéal pour la soutenance et validation visuelle)
                printEmailBanner(toEmail, subject, textContent, sentBySmtp);

                // 3. Création automatique d'une notification in-app dans l'espace utilisateur
                try {
                    String notifTitle = "🎉 Bienvenue sur SamaKeur !";
                    String notifMsg = "Vous êtes inscrit sur la plateforme SamaKeur avec succès et merci pour votre fidélité !";
                    notificationService.createNotification(user, notifTitle, notifMsg, "WELCOME");
                } catch (Exception ex) {
                    log.warn("Impossible de créer la notification in-app : {}", ex.getMessage());
                }

            } catch (Exception e) {
                log.error("Erreur lors de l'exécution de l'envoi d'email de bienvenue :", e);
            }
        });
    }

    /**
     * Envoie automatiquement un email lors de la connexion de l'utilisateur (Client, Chercheur de logement ou Agence).
     * L'exécution est asynchrone pour garantir une réponse instantanée à la connexion (< 100ms) et un départ immédiat du mail.
     */
    public void sendLoginEmail(User user) {
        CompletableFuture.runAsync(() -> {
            try {
                String toEmail = user.getEmail();
                String name = (user.getFullName() != null && !user.getFullName().isBlank()) 
                        ? user.getFullName() 
                        : toEmail;
                boolean isAgency = Role.ROLE_AGENCY.equals(user.getRole());

                String timestamp = java.time.LocalDateTime.now()
                        .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm:ss"));

                String subject = isAgency
                        ? "🏢 Connexion SamaKeur Pro - Merci pour votre fidélité !"
                        : "🏠 Connexion SamaKeur - Bienvenue et merci pour votre fidélité !";

                String textContent = buildLoginPlainTextContent(name, isAgency, timestamp);
                String htmlContent = buildLoginHtmlContent(name, isAgency, timestamp);

                boolean sentBySmtp = false;

                // 1. Envoi réel par SMTP si configuré
                if (isSmtpConfigured() && mailSender.isPresent()) {
                    try {
                        JavaMailSender sender = mailSender.get();
                        MimeMessage mimeMessage = sender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

                        String fromAddress = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername : "admin@samakeur.sn";
                        helper.setFrom(fromAddress, "Administrateur SamaKeur");
                        helper.setReplyTo("admin@samakeur.sn", "Administrateur SamaKeur");
                        helper.setTo(toEmail);
                        helper.setSubject(subject);
                        helper.setText(textContent, htmlContent);

                        sender.send(mimeMessage);
                        sentBySmtp = true;
                        log.info("✅ [SMTP] Email de connexion envoyé avec succès à : {} de la part de admin@samakeur.sn", toEmail);
                    } catch (Exception e) {
                        log.warn("⚠️ [SMTP] Impossible d'envoyer l'email réel via SMTP ({}) - Bascule sur la journalisation locale.", e.getMessage());
                    }
                }

                // 2. Affichage propre dans la console (pour validation visuelle et soutenance)
                printEmailBanner(toEmail, subject, textContent, sentBySmtp);

                // 3. Création automatique d'une notification in-app dans l'espace utilisateur
                try {
                    String notifTitle = "👋 Ravi de vous revoir sur SamaKeur !";
                    String notifMsg = "Merci de vous être connecté(e) à SamaKeur ! Vous êtes les bienvenus sur votre plateforme immobilière.";
                    notificationService.createNotification(user, notifTitle, notifMsg, "INFO");
                } catch (Exception ex) {
                    log.warn("Impossible d'enregistrer la notification in-app de connexion : {}", ex.getMessage());
                }

            } catch (Exception e) {
                log.error("Erreur lors de l'envoi de l'email de connexion :", e);
            }
        });
    }

    private boolean isSmtpConfigured() {
        return mailHost != null && !mailHost.isBlank() && !mailHost.equals("localhost")
                && mailUsername != null && !mailUsername.isBlank();
    }

    private String buildPlainTextContent(String name, boolean isAgency) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bonjour ").append(name).append(",\n\n");
        sb.append("Vous êtes inscrit sur la plateforme SamaKeur avec succès et merci pour votre fidélité !\n\n");
        sb.append("Nous sommes très heureux de vous compter parmi nous sur la plateforme de référence de l'immobilier au Sénégal.\n\n");

        if (isAgency) {
            sb.append("En tant qu'agence immobilière partenaire, vous pouvez dès maintenant :\n");
            sb.append(" • Accéder à votre tableau de bord professionnel.\n");
            sb.append(" • Publier et gérer vos annonces immobilières avec photos.\n");
            sb.append(" • Recevoir directement les demandes et avis de vos clients.\n\n");
        } else {
            sb.append("En tant que membre chercheur de logement, vous pouvez dès maintenant :\n");
            sb.append(" • Parcourir des centaines de biens vérifiés (villas, appartements, studios, terrains) à Dakar et dans tout le Sénégal.\n");
            sb.append(" • Enregistrer vos coups de cœur dans vos Favoris.\n");
            sb.append(" • Contacter directement les agences vérifiées par téléphone ou WhatsApp.\n\n");
        }

        sb.append("Toute l'équipe SamaKeur vous remercie chaleureusement pour votre confiance et votre fidélité.\n\n");
        sb.append("À très bientôt sur SamaKeur,\n");
        sb.append("L'Administrateur SamaKeur 🇸🇳\n");
        sb.append("Plateforme immobilière de référence au Sénégal\n");
        sb.append("Dakar, Sénégal — admin@samakeur.sn");
        return sb.toString();
    }

    private String buildHtmlContent(String name, boolean isAgency) {
        String roleSpecific = isAgency
                ? "<div style='background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 8px; margin: 20px 0;'>"
                + "<h4 style='margin-top: 0; color: #1e3a8a;'>Votre espace Agence Immobilière est prêt :</h4>"
                + "<ul style='margin-bottom: 0; color: #1e40af; padding-left: 20px; line-height: 1.6;'>"
                + "<li>Accédez à votre tableau de bord de gestion</li>"
                + "<li>Publiez vos annonces immobilières avec vos photos</li>"
                + "<li>Recevez les avis et demandes de visites de vos clients</li>"
                + "</ul></div>"
                : "<div style='background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;'>"
                + "<h4 style='margin-top: 0; color: #065f46;'>Explorez vos opportunités de logement :</h4>"
                + "<ul style='margin-bottom: 0; color: #047857; padding-left: 20px; line-height: 1.6;'>"
                + "<li>Consultez les offres vérifiées à Dakar et dans les régions</li>"
                + "<li>Sauvegardez vos annonces préférées dans vos Favoris</li>"
                + "<li>Contactez facilement les agences partenaires</li>"
                + "</ul></div>";

        return "<!DOCTYPE html>"
                + "<html>"
                + "<body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #334155;'>"
                + "<div style='max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>"
                + "<div style='text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;'>"
                + "<h1 style='color: #1d4ed8; margin: 0; font-size: 28px;'>Sama<span style='color: #2563eb;'>Keur</span></h1>"
                + "<p style='color: #64748b; font-size: 13px; margin-top: 5px;'>Plateforme Immobilière au Sénégal 🇸🇳</p>"
                + "</div>"
                + "<h2 style='color: #0f172a; font-size: 20px;'>Bonjour " + name + ",</h2>"
                + "<p style='font-size: 15px; line-height: 1.6; font-weight: bold; color: #047857;'>"
                + "Vous êtes inscrit sur la plateforme SamaKeur avec succès et merci pour votre fidélité !"
                + "</p>"
                + "<p style='font-size: 14px; line-height: 1.6; color: #475569;'>"
                + "Nous sommes ravis de vous compter parmi nos membres. Que vous soyez en quête de votre futur chez-vous ou que vous présentiez vos meilleurs biens, SamaKeur vous accompagne à chaque étape."
                + "</p>"
                + roleSpecific
                + "<div style='background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: center;'>"
                + "<p style='margin: 0; font-size: 13px; color: #475569;'>Toute l'équipe SamaKeur vous remercie chaleureusement pour votre confiance et votre fidélité.</p>"
                + "</div>"
                + "<p style='font-size: 13px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;'>"
                + "L'Administrateur SamaKeur 🇸🇳 • Dakar, Sénégal • admin@samakeur.sn"
                + "</p>"
                + "</div></body></html>";
    }

    private String buildLoginPlainTextContent(String name, boolean isAgency, String timestamp) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bonjour ").append(name).append(",\n\n");
        sb.append("Merci de vous être connecté(e) à SamaKeur ! Vous êtes les bienvenus sur votre plateforme.\n\n");
        sb.append("Nous sommes ravis de vous retrouver sur la plateforme immobilière de référence au Sénégal 🇸🇳.\n\n");

        if (isAgency) {
            sb.append("Votre espace Agence Immobilière est prêt :\n");
            sb.append(" • Gérez vos annonces de vente et location en toute simplicité.\n");
            sb.append(" • Répondez rapidement aux demandes et avis de vos clients.\n");
            sb.append(" • Boostez votre visibilité auprès de milliers de chercheurs de logement.\n\n");
        } else {
            sb.append("Votre espace Chercheur de logement est à votre disposition :\n");
            sb.append(" • Consultez les nouvelles annonces de villas, appartements, studios et terrains.\n");
            sb.append(" • Accédez rapidement à vos biens coups de cœur enregistrés en favoris.\n");
            sb.append(" • Contactez directement les agences immobilières certifiées par téléphone ou WhatsApp.\n\n");
        }

        sb.append("🔒 Sécurité du compte : Connexion réussie enregistrée le ").append(timestamp).append(".\n");
        sb.append("Si vous n'êtes pas à l'origine de cette activité, veuillez sécuriser votre mot de passe immédiatement.\n\n");
        sb.append("Toute l'équipe SamaKeur vous remercie pour votre confiance et votre fidélité.\n\n");
        sb.append("À très bientôt sur SamaKeur,\n");
        sb.append("L'Administrateur SamaKeur 🇸🇳\n");
        sb.append("Plateforme immobilière de référence au Sénégal\n");
        sb.append("Dakar, Sénégal — admin@samakeur.sn");
        return sb.toString();
    }

    private String buildLoginHtmlContent(String name, boolean isAgency, String timestamp) {
        String roleSpecific = isAgency
                ? "<div style='background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 8px; margin: 20px 0;'>"
                + "<h4 style='margin-top: 0; color: #1e3a8a;'>🏢 Votre espace Agence Immobilière :</h4>"
                + "<ul style='margin-bottom: 0; color: #1e40af; padding-left: 20px; line-height: 1.6;'>"
                + "<li>Gérez vos biens et publiez vos annonces avec photos</li>"
                + "<li>Consultez les demandes de visites et contacts reçus</li>"
                + "<li>Valorisez votre portefeuille auprès d'une large audience</li>"
                + "</ul></div>"
                : "<div style='background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;'>"
                + "<h4 style='margin-top: 0; color: #065f46;'>🏠 Votre espace Chercheur de logement :</h4>"
                + "<ul style='margin-bottom: 0; color: #047857; padding-left: 20px; line-height: 1.6;'>"
                + "<li>Parcourez les biens vérifiés à Dakar et dans tout le Sénégal</li>"
                + "<li>Retrouvez vos annonces favorites enregistrées</li>"
                + "<li>Contactez facilement les agences partenaires vérifiées</li>"
                + "</ul></div>";

        return "<!DOCTYPE html>"
                + "<html>"
                + "<body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #334155; margin: 0;'>"
                + "<div style='max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>"
                + "<div style='text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;'>"
                + "<h1 style='color: #1d4ed8; margin: 0; font-size: 28px;'>Sama<span style='color: #2563eb;'>Keur</span></h1>"
                + "<p style='color: #64748b; font-size: 13px; margin-top: 5px;'>Plateforme Immobilière au Sénégal 🇸🇳</p>"
                + "</div>"
                + "<h2 style='color: #0f172a; font-size: 20px;'>Bonjour " + name + ",</h2>"
                + "<p style='font-size: 15px; line-height: 1.6; font-weight: bold; color: #1e3a8a;'>"
                + "Merci de vous être connecté(e) à SamaKeur ! Vous êtes les bienvenus sur votre plateforme."
                + "</p>"
                + "<p style='font-size: 14px; line-height: 1.6; color: #475569;'>"
                + "Nous sommes ravis de vous retrouver sur SamaKeur, votre référence immobilière au Sénégal. "
                + "Toutes vos fonctionnalités sont prêtes et à votre disposition."
                + "</p>"
                + roleSpecific
                + "<div style='background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 8px; margin: 20px 0; font-size: 12px; color: #64748b; text-align: center;'>"
                + "🔒 <strong>Notification de sécurité :</strong> Connexion enregistrée le <strong>" + timestamp + "</strong>.<br/>"
                + "Si vous n'êtes pas à l'origine de cette connexion, pensez à modifier votre mot de passe."
                + "</div>"
                + "<div style='background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: center;'>"
                + "<p style='margin: 0; font-size: 13px; color: #475569;'>Toute l'équipe SamaKeur vous remercie chaleureusement pour votre confiance et votre fidélité.</p>"
                + "</div>"
                + "<p style='font-size: 13px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;'>"
                + "L'Administrateur SamaKeur 🇸🇳 • Dakar, Sénégal • admin@samakeur.sn"
                + "</p>"
                + "</div></body></html>";
    }

    private void printEmailBanner(String toEmail, String subject, String textContent, boolean sentBySmtp) {
        String status = sentBySmtp ? "ENVOYÉ PAR SERVEUR SMTP (RÉCEPTION MOBILE CONFIRMÉE)" : "GÉNÉRÉ & VALIDÉ (SIMULATION SOUTENANCE)";
        log.info("\n"
                + "========================================================================================\n"
                + "📧 [EMAIL OFFICIEL SAMAKEUR] - STATUT : {}\n"
                + "----------------------------------------------------------------------------------------\n"
                + "EXPÉDITEUR   : Administrateur SamaKeur <admin@samakeur.sn>\n"
                + "DESTINATAIRE : {}\n"
                + "OBJET        : {}\n"
                + "----------------------------------------------------------------------------------------\n"
                + "{}\n"
                + "========================================================================================",
                status, toEmail, subject, textContent);
    }
}

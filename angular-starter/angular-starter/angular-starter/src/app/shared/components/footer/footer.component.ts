import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Pied de page global de SamaKeur.
 * Affiche les liens légaux, les contacts et le copyright.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-slate-950 text-slate-400 border-t border-slate-800 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">

          <!-- Marque & Mission -->
          <div class="md:col-span-2 space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl font-black text-white tracking-tight">Sama<span class="text-blue-500">Keur</span></span>
              <span class="text-xs bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">Sénégal 🇸🇳</span>
            </div>
            <p class="text-sm text-slate-400 max-w-md leading-relaxed">
              La plateforme immobilière de référence au Sénégal pour trouver votre futur logement : villas, appartements meublés, terrains et locaux commerciaux certifiés auprès d'agences agréées.
            </p>
            <div class="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Annonces vérifiées</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Contact direct WhatsApp</span>
            </div>
          </div>

          <!-- Navigation Rapide -->
          <div>
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">Navigation</h4>
            <ul class="space-y-2.5 text-sm">
              <li><a routerLink="/accueil" class="hover:text-blue-400 transition-colors">Accueil</a></li>
              <li><a routerLink="/properties" class="hover:text-blue-400 transition-colors">Toutes les annonces</a></li>
              <li><a routerLink="/register" [queryParams]="{ role: 'agency' }" class="hover:text-blue-400 transition-colors">Devenir agence partenaire</a></li>
              <li><a routerLink="/login" class="hover:text-blue-400 transition-colors">Espace connexion</a></li>
              <li><a routerLink="/favorites" class="hover:text-blue-400 transition-colors">Mes favoris enregistrés</a></li>
            </ul>
          </div>

          <!-- Contact & Support -->
          <div>
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">Contact & Support</h4>
            <ul class="space-y-2.5 text-sm">
              <li class="flex items-center gap-2">
                <span>📍</span> <span>Dakar, Sénégal</span>
              </li>
              <li class="flex items-center gap-2">
                <span>📞</span> <a href="tel:+221774532255" class="hover:text-blue-400 transition-colors font-medium">+221 77 453 22 55</a>
              </li>
              <li class="flex items-center gap-2">
                <span>💬</span> <a href="https://wa.me/221774532255" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-400 text-emerald-500 transition-colors font-semibold">Assistance WhatsApp</a>
              </li>
              <li class="flex items-center gap-2">
                <span>✉️</span> <a href="mailto:mamadoualioubarry1871@gmail.com" class="hover:text-blue-400 transition-colors truncate">Contactez notre équipe</a>
              </li>
            </ul>
          </div>

        </div>

        <div class="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {{ currentYear }} SamaKeur Sénégal. Tous droits réservés.</p>
          <div class="flex gap-6">
            <span class="hover:text-slate-300 transition-colors">Conditions Générales</span>
            <span class="hover:text-slate-300 transition-colors">Politique de Confidentialité</span>
            <span class="hover:text-slate-300 transition-colors">Sécurité & Certifications</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
}
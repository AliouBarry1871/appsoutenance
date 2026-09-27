import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col">

      <!-- ========================================================= -->
      <!-- 1. HERO HEADER AVEC LA BELLE MAISON EN ARRIÈRE-PLAN      -->
      <!-- ========================================================= -->
      <header class="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center text-white overflow-hidden">
        
        <!-- Image de fond : Superbe maison contemporaine de luxe -->
        <div class="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1920&q=80" 
            alt="Magnifique villa contemporaine SamaKeur" 
            class="w-full h-full object-cover object-center scale-105 animate-fade-in"
          />
          <!-- Dégradé lumineux et subtil pour révéler pleinement la maison tout en conservant les écritures bien lisibles -->
          <div class="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/35 to-slate-950/80"></div>
        </div>

        <!-- Contenu textuel et slogans au centre du Hero -->
        <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-8">
          
          <!-- Badge d'introduction Sénégal -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/20 text-blue-300 text-xs sm:text-sm font-bold tracking-wide shadow-lg">
            <span>🇸🇳</span>
            <span>SamaKeur — La référence de l'immobilier au Sénégal</span>
          </div>

          <!-- Titre principal majestueux -->
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
            Trouvez la maison idéale <br class="hidden sm:inline"/>
            qui vous ressemble au <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">Sénégal</span>
          </h1>

          <!-- Slogans forts de la plateforme -->
          <p class="text-white text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] font-semibold">
            Une plateforme moderne, transparente et 100% sénégalaise conçue pour aider chaque citoyen à trouver un logement digne, sécurisé et vérifié, sans intermédiaire douteux.
          </p>



          <!-- Badges de réassurance tout en bas de la maison -->
          <div class="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800 text-xs text-slate-200">
              <span class="text-2xl">🛡️</span>
              <div>
                <strong class="block text-white">Annonces vérifiées</strong>
                <span class="text-slate-400 text-[11px]">Zéro fausse publication</span>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800 text-xs text-slate-200">
              <span class="text-2xl">🤝</span>
              <div>
                <strong class="block text-white">Agences certifiées</strong>
                <span class="text-slate-400 text-[11px]">NINEA & RCCM contrôlés</span>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800 text-xs text-slate-200">
              <span class="text-2xl">💬</span>
              <div>
                <strong class="block text-white">Contact direct</strong>
                <span class="text-slate-400 text-[11px]">WhatsApp & téléphone</span>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800 text-xs text-slate-200">
              <span class="text-2xl">🇸🇳</span>
              <div>
                <strong class="block text-white">Pour les citoyens</strong>
                <span class="text-slate-400 text-[11px]">Dakar et tout le Sénégal</span>
              </div>
            </div>
          </div>

        </div>

      </header>


      <!-- ========================================================= -->
      <!-- 2. PRÉSENTATION DE LA PLATEFORME (JUSTE EN BAS DU HERO)   -->
      <!-- ========================================================= -->
      <section class="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
        <div class="max-w-6xl mx-auto space-y-16">
          
          <!-- En-tête de section -->
          <div class="text-center max-w-3xl mx-auto space-y-4">
            <span class="text-xs uppercase tracking-widest font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Notre Mission Citoyenne
            </span>
            <h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Une plateforme conçue pour aider les citoyens à trouver un logement digne
            </h2>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
              SamaKeur est née pour simplifier le quotidien des familles, travailleurs, étudiants et de la diaspora sénégalaise en quête d'un chez-soi en toute sécurité.
            </p>
          </div>

          <!-- Grille des 3 grands piliers de SamaKeur -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <!-- Pilier 1 : Pour les Citoyens -->
            <div class="p-8 rounded-3xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div class="space-y-4">
                <div class="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  🏠
                </div>
                <h3 class="text-xl font-black text-slate-900">Accès Simple et Équitable au Logement</h3>
                <p class="text-slate-600 text-sm leading-relaxed">
                  Fini le temps perdu à arpenter les rues ou à faire face à des intermédiaires informels non identifiés. SamaKeur centralise des centaines d'annonces transparentes avec photos réelles, loyer affiché, montant de la caution et localisation précise.
                </p>
              </div>
              <div class="pt-6 border-t border-slate-200/60 mt-6 flex items-center text-xs font-bold text-blue-600">
                <span>Villas, appartements, studios & terrains</span>
              </div>
            </div>

            <!-- Pilier 2 : Sécurité & Transparence -->
            <div class="p-8 rounded-3xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div class="space-y-4">
                <div class="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  🛡️
                </div>
                <h3 class="text-xl font-black text-slate-900">Zéro Arnaque & Agences Vérifiées</h3>
                <p class="text-slate-600 text-sm leading-relaxed">
                  La sécurité est notre priorité absolue. Chaque agence partenaire doit fournir ses documents d'identification légale (NINEA, RCCM et pièce d'identité du gérant). Seules les annonces authentiques sont publiées sur la plateforme.
                </p>
              </div>
              <div class="pt-6 border-t border-slate-200/60 mt-6 flex items-center text-xs font-bold text-emerald-600">
                <span>Contrôle rigoureux et validation manuelle</span>
              </div>
            </div>

            <!-- Pilier 3 : Contact Direct & Sans Frais Cachés -->
            <div class="p-8 rounded-3xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div class="space-y-4">
                <div class="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <h3 class="text-xl font-black text-slate-900">Mise en Relation Rapide & Directe</h3>
                <p class="text-slate-600 text-sm leading-relaxed">
                  Un logement retient votre attention ? Entrez en contact direct avec l'agence par appel téléphonique ou via WhatsApp en un seul clic. Organisez votre visite sans barrière ni intermédiaire imprévu.
                </p>
              </div>
              <div class="pt-6 border-t border-slate-200/60 mt-6 flex items-center text-xs font-bold text-indigo-600">
                <span>WhatsApp et téléphone direct</span>
              </div>
            </div>

          </div>

          <!-- Bandeau interactif : Comment ça marche pour le citoyen -->
          <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-8">
            <div class="text-center max-w-2xl mx-auto space-y-2">
              <h3 class="text-2xl sm:text-3xl font-extrabold">Comment trouver votre logement en 3 étapes ?</h3>
              <p class="text-blue-200 text-sm">Un parcours fluide pensé pour vous faire gagner un temps précieux.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div class="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-3">
                <div class="text-3xl font-black text-amber-300">01</div>
                <h4 class="font-bold text-base">Recherchez votre bien</h4>
                <p class="text-xs text-blue-100 leading-relaxed">Filtrez par ville (Dakar, Thiès, Saly), par quartier, catégorie et budget adapté.</p>
              </div>

              <div class="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-3">
                <div class="text-3xl font-black text-amber-300">02</div>
                <h4 class="font-bold text-base">Consultez les détails</h4>
                <p class="text-xs text-blue-100 leading-relaxed">Découvrez les photos HD, le prix net, la caution, les commodités et l'agence responsable.</p>
              </div>

              <div class="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-3">
                <div class="text-3xl font-black text-amber-300">03</div>
                <h4 class="font-bold text-base">Contactez & Emménagez</h4>
                <p class="text-xs text-blue-100 leading-relaxed">Appelez ou échangez par WhatsApp, visitez le bien et concluez en toute tranquillité.</p>
              </div>
            </div>

            <div class="text-center pt-2">
              <a routerLink="/properties" 
                 class="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-md hover:scale-105 transition-all cursor-pointer">
                <span>🔍 Accéder à toutes les annonces disponibles</span>
                <span>→</span>
              </a>
            </div>
          </div>

        </div>
      </section>


    </div>
  `
})
export class LandingPageComponent {}

import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server-side rendering routes configuration.
 *
 * Les routes avec paramètres dynamiques (:id) sont rendues côté client.
 * On ne peut pas prérendre des routes avec des segments dynamiques inconnus.
 */
export const serverRoutes: ServerRoute[] = [
  // Routes dynamiques du meeting (vidéo/virtuel)
  { path: 'alzheimer_meeting/meeting/:id', renderMode: RenderMode.Client },

  // Toutes les routes du module Admin → côté client
  { path: 'admin', renderMode: RenderMode.Client },

  // Toutes les autres routes statiques connues → prérendu côté serveur
  { path: '**', renderMode: RenderMode.Prerender }
];

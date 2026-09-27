/**
 * Miroir du contrat ApiError Spring Boot.
 * Une interface décrit une donnée ; elle ne contient aucune logique d'affichage.
 */
export interface ApiError {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  validationErrors: Record<string, string>;
}

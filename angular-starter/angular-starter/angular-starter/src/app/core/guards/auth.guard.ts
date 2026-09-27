import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export class AuthGuard {
    static hasRole(requiredRole: string): CanActivateFn {
        return () => {
            const authService = inject(AuthService);
            const router = inject(Router);

            if (!authService.isLoggedIn()) {
                router.navigate(['/login']);
                return false;
            }

            try {
                const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
                if (user && user.role === requiredRole) {
                    return true;
                }
            } catch {
                // Ignore parse error
            }

            router.navigate(['/login']);
            return false;
        };
    }

    static isAuthenticated(): CanActivateFn {
        return () => {
            const authService = inject(AuthService);
            const router = inject(Router);
            if (authService.isLoggedIn()) {
                return true;
            }
            router.navigate(['/login']);
            return false;
        };
    }
}
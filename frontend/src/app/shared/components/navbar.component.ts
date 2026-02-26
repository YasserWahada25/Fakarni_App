import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterModule, CommonModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css',
})
export class NavbarComponent {
    isMobileMenuOpen = false;
    activeDropdown: string | null = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    get isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    toggleDropdown(menuName: string): void {
        if (window.innerWidth <= 992) {
            this.activeDropdown = this.activeDropdown === menuName ? null : menuName;
        }
    }

    onLogout(): void {
        this.authService.logout();
        this.isMobileMenuOpen = false;
        this.router.navigate(['/auth/signin']);
    }
}

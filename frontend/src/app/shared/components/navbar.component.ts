import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    toggleDropdown(menuName: string) {
        // Only for mobile click toggle
        if (window.innerWidth <= 992) {
            if (this.activeDropdown === menuName) {
                this.activeDropdown = null;
            } else {
                this.activeDropdown = menuName;
            }
        }
    }
}

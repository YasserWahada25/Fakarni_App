import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-educational-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './educational-layout.component.html',
    styleUrl: './educational-layout.component.css'
})
export class EducationalLayoutComponent {
    isSidebarCollapsed = false;

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
}

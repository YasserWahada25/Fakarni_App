import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-medical-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './medical-layout.component.html',
    styleUrl: './medical-layout.component.css'
})
export class MedicalLayoutComponent {
    isSidebarCollapsed = false;

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
}

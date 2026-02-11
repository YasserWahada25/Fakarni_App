import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-alzheimer-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './alzheimer-layout.component.html',
    styleUrl: './alzheimer-layout.component.css'
})
export class AlzheimerLayoutComponent {
    isSidebarCollapsed = false;

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
}

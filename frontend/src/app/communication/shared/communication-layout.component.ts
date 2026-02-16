import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-communication-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './communication-layout.component.html',
    styleUrl: './communication-layout.component.css'
})
export class CommunicationLayoutComponent {
    isSidebarCollapsed = false;

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
}

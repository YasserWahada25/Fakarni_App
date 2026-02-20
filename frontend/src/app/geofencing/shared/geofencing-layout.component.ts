import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-geofencing-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './geofencing-layout.component.html',
    styleUrl: './geofencing-layout.component.css'
})
export class GeofencingLayoutComponent {
    isSidebarCollapsed = false;

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
}

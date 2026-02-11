import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-groups',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './groups.component.html',
    styleUrl: './groups.component.css'
})
export class GroupsComponent {
    groups = [
        { name: 'Nutrition & Diet', members: 120, description: 'Sharing recipes and healthy eating tips.' },
        { name: 'Physical Exercises', members: 85, description: 'Daily workout routines for seniors.' },
        { name: 'Mental Health', members: 200, description: 'Support for anxiety and cognitive health.' }
    ];
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-activities',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './activities.component.html',
    styleUrl: './activities.component.css'
})
export class ActivitiesComponent implements OnInit {
    activities = [
        { title: 'Memory Quiz', type: 'quiz', score: null, icon: 'fa-brain' },
        { title: 'Image Recognition', type: 'game', score: 85, icon: 'fa-image' },
        { title: 'Healthy Diet', type: 'content', score: null, icon: 'fa-book-open' }
    ];

    selectedActivity: any = null;

    constructor() { }

    ngOnInit(): void { }

    startActivity(activity: any) {
        this.selectedActivity = activity;
        // Mock simple interaction
        if (activity.type === 'quiz') {
            alert('Starting Quiz: ' + activity.title);
        } else if (activity.type === 'content') {
            alert('Opening Content: ' + activity.title);
        }
    }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EducationalActivity, ActivityType, ActivityStatus } from '../models/educational-activity.model';

@Injectable({
    providedIn: 'root'
})
export class ActivityService {
    private activities: EducationalActivity[] = [
        {
            id: 1,
            name: 'Quiz sur la Mémoire',
            type: 'quiz',
            description: 'Test de mémoire à court terme avec 10 questions',
            createdDate: new Date('2024-01-15'),
            status: 'active',
            content: {
                questions: [
                    {
                        question: 'Quel est le jour de la semaine aujourd\'hui ?',
                        options: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi'],
                        correctAnswer: 0
                    },
                    {
                        question: 'Combien font 5 + 3 ?',
                        options: ['6', '7', '8', '9'],
                        correctAnswer: 2
                    }
                ]
            }
        },
        {
            id: 2,
            name: 'Jeu Cognitif - Mémoire Visuelle',
            type: 'cognitive_game',
            description: 'Jeu de mémorisation de cartes pour stimuler la mémoire visuelle',
            createdDate: new Date('2024-01-20'),
            status: 'active',
            content: {
                gameConfig: {
                    difficulty: 'medium',
                    timeLimit: 300,
                    instructions: 'Trouvez les paires de cartes identiques en les retournant deux par deux.'
                }
            }
        },
        {
            id: 3,
            name: 'Vidéo Éducative - Exercices de Mémoire',
            type: 'video',
            description: 'Vidéo explicative sur les techniques de mémorisation',
            createdDate: new Date('2024-02-01'),
            status: 'active',
            content: {
                videoUrl: 'https://example.com/videos/memory-exercises.mp4',
                duration: 15
            }
        },
        {
            id: 4,
            name: 'Quiz de Culture Générale',
            type: 'quiz',
            description: 'Questions de culture générale adaptées aux seniors',
            createdDate: new Date('2024-02-05'),
            status: 'active',
            content: {
                questions: [
                    {
                        question: 'Quelle est la capitale de la France ?',
                        options: ['Lyon', 'Marseille', 'Paris', 'Toulouse'],
                        correctAnswer: 2
                    }
                ]
            }
        },
        {
            id: 5,
            name: 'Jeu de Logique - Sudoku Facile',
            type: 'cognitive_game',
            description: 'Sudoku adapté pour les débutants',
            createdDate: new Date('2024-02-10'),
            status: 'inactive',
            content: {
                gameConfig: {
                    difficulty: 'easy',
                    instructions: 'Remplissez la grille avec les chiffres de 1 à 9.'
                }
            }
        }
    ];

    constructor() { }

    getActivities(): Observable<EducationalActivity[]> {
        return of(this.activities);
    }

    getActivityById(id: number): Observable<EducationalActivity | undefined> {
        return of(this.activities.find(a => a.id === id));
    }

    getActivitiesByType(type: ActivityType): Observable<EducationalActivity[]> {
        return of(this.activities.filter(a => a.type === type));
    }

    getActivitiesByStatus(status: ActivityStatus): Observable<EducationalActivity[]> {
        return of(this.activities.filter(a => a.status === status));
    }

    createActivity(activity: Omit<EducationalActivity, 'id'>): Observable<EducationalActivity> {
        const newActivity: EducationalActivity = {
            ...activity,
            id: Math.max(...this.activities.map(a => a.id)) + 1
        };
        this.activities.push(newActivity);
        return of(newActivity);
    }

    updateActivity(id: number, activity: Partial<EducationalActivity>): Observable<EducationalActivity | undefined> {
        const index = this.activities.findIndex(a => a.id === id);
        if (index !== -1) {
            this.activities[index] = { ...this.activities[index], ...activity };
            return of(this.activities[index]);
        }
        return of(undefined);
    }

    deleteActivity(id: number): Observable<boolean> {
        const index = this.activities.findIndex(a => a.id === id);
        if (index !== -1) {
            this.activities.splice(index, 1);
            return of(true);
        }
        return of(false);
    }
}

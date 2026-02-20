import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Prescription {
    id: number;
    medication: string;
    dosage: string;
    frequency: string;
    startDate: string;
    status: 'Active' | 'Discontinued';
}

@Component({
    selector: 'app-follow-up',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './follow-up.component.html',
    styleUrl: './follow-up.component.css'
})
export class FollowUpComponent {
    activeTab = 'prescriptions'; // 'prescriptions' | 'update'

    prescriptions: Prescription[] = [
        { id: 1, medication: 'Donepezil', dosage: '10mg', frequency: 'Once daily (Night)', startDate: '2023-05-10', status: 'Active' },
        { id: 2, medication: 'Memantine', dosage: '5mg', frequency: 'Twice daily', startDate: '2023-11-15', status: 'Active' },
        { id: 3, medication: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', startDate: '2023-01-20', status: 'Active' }
    ];

    newUpdate = {
        date: new Date().toISOString().split('T')[0],
        type: 'Routine Check',
        notes: '',
        vitals: { bp: '', weight: '' }
    };

    toggleStatus(id: number) {
        const p = this.prescriptions.find(p => p.id === id);
        if (p) {
            p.status = p.status === 'Active' ? 'Discontinued' : 'Active';
        }
    }

    submitUpdate() {
        alert('Medical record updated successfully (Mock)');
        // Reset form
        this.newUpdate = {
            date: new Date().toISOString().split('T')[0],
            type: 'Routine Check',
            notes: '',
            vitals: { bp: '', weight: '' }
        };
    }
}

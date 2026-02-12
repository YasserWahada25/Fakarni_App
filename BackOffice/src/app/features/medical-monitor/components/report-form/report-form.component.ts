import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MedicalReport } from '../../../../core/models/medical-report.model';
import { ReportService } from '../../../../core/services/report.service';
import { PatientService } from '../../../../core/services/patient.service';
import { Patient } from '../../../../core/models/patient.model';

@Component({
    selector: 'app-report-form',
    standalone: false,
    templateUrl: './report-form.component.html',
    styleUrls: ['./report-form.component.scss']
})
export class ReportFormComponent implements OnInit {
    reportForm: FormGroup;
    isEditMode: boolean = false;
    patients: Patient[] = [];

    constructor(
        private fb: FormBuilder,
        private reportService: ReportService,
        private patientService: PatientService,
        public dialogRef: MatDialogRef<ReportFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MedicalReport | null
    ) {
        this.isEditMode = !!data;
        this.reportForm = this.fb.group({
            patientId: [data?.patientId || '', Validators.required],
            type: [data?.type || 'Analyse Médicale', Validators.required],
            date: [data?.date || new Date(), Validators.required],
            status: [data?.status || 'En attente', Validators.required],
            content: [data?.content || '', Validators.required],
            doctorName: [data?.doctorName || 'Dr. IA']
        });
    }

    ngOnInit(): void {
        this.patientService.getPatients().subscribe(patients => {
            this.patients = patients;
        });
    }

    onSubmit(): void {
        if (this.reportForm.valid) {
            const formValue = this.reportForm.value;
            const selectedPatient = this.patients.find(p => p.id === formValue.patientId);

            const reportData: MedicalReport = {
                ...this.data,
                ...formValue,
                patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Inconnu'
            };

            if (this.isEditMode && this.data) {
                this.reportService.updateReport(reportData).subscribe(() => {
                    this.dialogRef.close(true);
                });
            } else {
                this.reportService.addReport(reportData).subscribe(() => {
                    this.dialogRef.close(true);
                });
            }
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}

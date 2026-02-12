import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeographicZone } from '../../../../core/models/geographic-zone.model';
import { GeolocationService } from '../../../../core/services/geolocation.service';
import { PatientService } from '../../../../core/services/patient.service';
import { Patient } from '../../../../core/models/patient.model';

@Component({
    selector: 'app-zone-form',
    standalone: false,
    templateUrl: './zone-form.component.html',
    styleUrls: ['./zone-form.component.scss']
})
export class ZoneFormComponent implements OnInit {
    zoneForm: FormGroup;
    patients: Patient[] = [];
    isEditMode: boolean = false;

    zoneTypes = [
        { value: 'authorized', label: 'Zone Autorisée' },
        { value: 'danger', label: 'Zone de Danger' },
        { value: 'forbidden', label: 'Zone Interdite' }
    ];

    constructor(
        private fb: FormBuilder,
        private geolocationService: GeolocationService,
        private patientService: PatientService,
        public dialogRef: MatDialogRef<ZoneFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: GeographicZone
    ) {
        this.isEditMode = !!data;
        this.zoneForm = this.fb.group({
            name: [data?.name || '', Validators.required],
            type: [data?.type || 'authorized', Validators.required],
            patientIds: [data?.patientIds || [], Validators.required],
            latitude: [data?.coordinates.center?.lat || 36.8065, Validators.required],
            longitude: [data?.coordinates.center?.lng || 10.1815, Validators.required],
            radius: [data?.coordinates.radius || 500, [Validators.required, Validators.min(50)]],
            isActive: [data?.isActive ?? true],
            notifyOnExit: [data?.notifyOnExit ?? true]
        });
    }

    ngOnInit(): void {
        this.patientService.getPatients().subscribe(patients => {
            this.patients = patients;
        });
    }

    onSubmit(): void {
        if (this.zoneForm.valid) {
            const formValue = this.zoneForm.value;
            const zoneData: any = {
                name: formValue.name,
                type: formValue.type,
                coordinates: {
                    type: 'circle',
                    center: { lat: formValue.latitude, lng: formValue.longitude },
                    radius: formValue.radius
                },
                patientIds: formValue.patientIds,
                isActive: formValue.isActive,
                notifyOnExit: formValue.notifyOnExit
            };

            if (this.isEditMode) {
                this.geolocationService.updateZone(this.data.id, zoneData).subscribe(() => {
                    this.dialogRef.close(true);
                });
            } else {
                this.geolocationService.createZone(zoneData).subscribe(() => {
                    this.dialogRef.close(true);
                });
            }
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}

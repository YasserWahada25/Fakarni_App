import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Patient } from '../../../../core/models/patient.model';
import { PatientService } from '../../../../core/services/patient.service';

@Component({
    selector: 'app-patient-list',
    standalone: false,
    templateUrl: './patient-list.component.html',
    styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
    patients: Patient[] = [];
    dataSource: MatTableDataSource<Patient>;
    displayedColumns: string[] = ['name', 'role', 'dob', 'lastConsultation', 'actions'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private patientService: PatientService,
        private router: Router
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.loadPatients();
    }

    loadPatients() {
        this.patientService.getPatients().subscribe(data => {
            this.patients = data;
            this.dataSource.data = data;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    viewPatientDetails(patient: Patient) {
        this.router.navigate(['/medical-monitoring/patients', patient.id]);
    }
}

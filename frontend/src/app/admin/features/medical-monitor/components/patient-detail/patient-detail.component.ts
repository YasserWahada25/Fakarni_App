import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from '../../../../core/models/patient.model';
import { MedicalReport } from '../../../../core/models/medical-report.model';
import { PatientService } from '../../../../core/services/patient.service';
import { ReportService } from '../../../../core/services/report.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-patient-detail',
    standalone: false,
    templateUrl: './patient-detail.component.html',
    styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit, AfterViewInit {
    patient: Patient | undefined;
    reports: MedicalReport[] = [];
    @ViewChild('healthChart') healthChart!: ElementRef;
    isBrowser: boolean;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private patientService: PatientService,
        private reportService: ReportService,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.loadPatientData(id);
        }
    }

    ngAfterViewInit() {
    }

    loadPatientData(id: number) {
        this.patientService.getPatientById(id).subscribe(patient => {
            this.patient = patient;
        });

        this.reportService.getReportsByPatientId(id).subscribe(reports => {
            this.reports = reports;
        });
    }

    goBack() {
        this.router.navigate(['/admin/medical-monitoring/patients']);
    }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MedicalReport } from '../../../../core/models/medical-report.model';
import { ReportService } from '../../../../core/services/report.service';
import { ReportFormComponent } from '../report-form/report-form.component';

@Component({
    selector: 'app-report-list',
    standalone: false,
    templateUrl: './report-list.component.html',
    styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {
    reports: MedicalReport[] = [];
    dataSource: MatTableDataSource<MedicalReport>;
    displayedColumns: string[] = ['date', 'patient', 'type', 'status', 'actions'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private reportService: ReportService,
        private dialog: MatDialog
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.loadReports();
    }

    loadReports() {
        this.reportService.getReports().subscribe(data => {
            this.reports = data;
            this.dataSource.data = data;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    openReportDialog(report?: MedicalReport) {
        const dialogRef = this.dialog.open(ReportFormComponent, {
            width: '600px',
            data: report
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadReports();
            }
        });
    }

    deleteReport(report: MedicalReport) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer ce rapport ?`)) {
            this.reportService.deleteReport(report.id).subscribe(() => {
                this.loadReports();
            });
        }
    }
}

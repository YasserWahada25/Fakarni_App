import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { UserFormComponent } from '../user-form/user-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-user-list',
    standalone: false,
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['nom', 'prenom', 'email', 'role', 'actions'];
    dataSource: MatTableDataSource<User>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private userService: UserService,
        private dialog: MatDialog
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    loadUsers() {
        this.userService.getUsers().subscribe(users => {
            this.dataSource.data = users;
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    openUserDialog(user?: User) {
        const dialogRef = this.dialog.open(UserFormComponent, {
            width: '600px',
            data: user
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadUsers();
                // Show success message (can use SnackBar if imported, but simple alert for now or implement snackbar)
                // console.log(user ? 'User updated' : 'User created');
            }
        });
    }

    deleteUser(user: User): void {
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.prenom} ${user.nom} ?`)) {
            this.userService.deleteUser(user.id).subscribe({
                next: () => this.loadUsers(),
                error: (err) => console.error('Delete failed', err)
            });
        }
    }
}

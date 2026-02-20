import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';

@Component({
    selector: 'app-user-form',
    standalone: false,
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
    userForm: FormGroup;
    isEditMode: boolean = false;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        public dialogRef: MatDialogRef<UserFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: User | null
    ) {
        this.isEditMode = !!data;
        this.userForm = this.fb.group({
            firstName: [data?.firstName || '', Validators.required],
            lastName: [data?.lastName || '', Validators.required],
            email: [data?.email || '', [Validators.required, Validators.email]],
            role: [data?.role || 'patient', Validators.required],
            // Password field only required for new users in this example, or optional for edit
            password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
            medicalInfo: [data?.medicalInfo || '']
        });
    }

    onSubmit(): void {
        if (this.userForm.valid) {
            const formValue = this.userForm.value;

            if (this.isEditMode && this.data) {
                const updatedUser: User = { ...this.data, ...formValue };
                this.userService.updateUser(updatedUser).subscribe(() => {
                    this.dialogRef.close(true);
                });
            } else {
                this.userService.addUser(formValue).subscribe(() => {
                    this.dialogRef.close(true);
                });
            }
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}

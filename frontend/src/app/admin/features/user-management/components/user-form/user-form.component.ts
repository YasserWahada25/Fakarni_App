import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { ROLE_OPTIONS, Role } from '../../../../../auth/models/sign-up.model';

@Component({
    selector: 'app-user-form',
    standalone: false,
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
    userForm: FormGroup;
    isEditMode: boolean;
    roleOptions = ROLE_OPTIONS;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        public dialogRef: MatDialogRef<UserFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: User | null
    ) {
        this.isEditMode = !!data;
        this.userForm = this.fb.group({
            nom: [data?.nom ?? '', Validators.required],
            prenom: [data?.prenom ?? '', Validators.required],
            email: [data?.email ?? '', [Validators.required, Validators.email]],
            role: [data?.role ?? Role.PATIENT_PROFILE, Validators.required],
            password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
            numTel: [data?.numTel ?? ''],
            adresse: [data?.adresse ?? ''],
        });
    }

    onSubmit(): void {
        if (!this.userForm.valid) return;

        const v = this.userForm.value;

        if (this.isEditMode && this.data) {
            const body = {
                nom: v.nom,
                prenom: v.prenom,
                email: v.email,
                role: v.role,
                numTel: v.numTel || undefined,
                adresse: v.adresse || undefined,
                ...(v.password ? { password: v.password } : {}),
            };
            this.userService.updateUser(this.data.id, body).subscribe({
                next: () => this.dialogRef.close(true),
                error: (err) => console.error('Update failed', err),
            });
        } else {
            this.userService.addUser({
                nom: v.nom,
                prenom: v.prenom,
                email: v.email,
                password: v.password,
                role: v.role,
                numTel: v.numTel || undefined,
                adresse: v.adresse || undefined,
            }).subscribe({
                next: () => this.dialogRef.close(true),
                error: (err) => console.error('Create failed', err),
            });
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}

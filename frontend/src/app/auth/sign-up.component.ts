import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ROLE_OPTIONS, Role, SignUpRequest } from './models/sign-up.model';

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './sign-up.component.html',
    styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
    signUpForm: FormGroup;
    /** Liste déroulante des rôles (enum backend). */
    roleOptions = ROLE_OPTIONS;

    constructor(
        private fb: FormBuilder,
        private router: Router
    ) {
        this.signUpForm = this.fb.group({
            nom: ['', Validators.required],
            prenom: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: [Role.PATIENT_PROFILE, Validators.required],
            numTel: [''],
            adresse: [''],
        });
    }

    onSubmit(): void {
        if (this.signUpForm.invalid) {
            return;
        }
        const value = this.signUpForm.value as SignUpRequest;
        // Étape 0 : affichage en console. Plus tard : appel API (authService.register(value)).
        console.log('SignUp payload:', value);
        this.router.navigate(['/auth/signin']);
    }
}

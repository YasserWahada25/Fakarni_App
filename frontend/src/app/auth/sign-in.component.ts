import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.css'
})
export class SignInComponent {
    loginForm: FormGroup;
    errorMessage: string | null = null;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid || this.loading) return;
        this.errorMessage = null;
        this.loading = true;
        this.authService.login(this.loginForm.value).subscribe({
            next: () => this.router.navigate(['/home']),
            error: (err) => {
                this.loading = false;
                this.errorMessage = err?.error?.message || 'Invalid email or password.';
            }
        });
    }
}

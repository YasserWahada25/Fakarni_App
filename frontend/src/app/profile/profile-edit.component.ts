import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ROLE_OPTIONS, Role } from '../auth/models/sign-up.model';
import { UserUpdateRequest } from '../auth/models/user.model';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css',
})
export class ProfileEditComponent implements OnInit {

  profileForm: FormGroup;
  roleOptions = ROLE_OPTIONS;

  errorMessage: string | null = null;
  loading = false;
  loadingUser = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: [Role.PATIENT_PROFILE, Validators.required],
      numTel: [''],
      adresse: [''],
    });
  }

  // ✅ ngOnInit AVEC DEBUG
  ngOnInit(): void {

    console.log('ngOnInit called');

    const user = this.authService.getCurrentUser();
    console.log('user from getCurrentUser:', user);

    if (!user) {
      console.log('No user found → redirecting to signin');
      this.router.navigate(['/auth/signin']);
      return;
    }

    console.log('calling getUserById with id:', user.id);

    this.authService.getUserById(user.id).subscribe({
      next: (u) => {
        console.log('getUserById success:', u);

        this.profileForm.patchValue({
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          role: u.role,
          numTel: u.numTel ?? '',
          adresse: u.adresse ?? '',
        });

        this.loadingUser = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('getUserById error:', err);

        this.loadingUser = false;

        if (err?.status === 401 || err?.status === 403) {
          console.log('Unauthorized → redirecting to signin');
          this.router.navigate(['/auth/signin']);
          return;
        }

        this.errorMessage = 'Could not load profile.';
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ onSubmit AVEC DEBUG
  onSubmit(): void {

    console.log('onSubmit called');
    console.log('form valid:', this.profileForm.valid);
    console.log('form value:', this.profileForm.value);
    console.log('form errors:', this.profileForm.errors);

    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control?.invalid) {
        console.log(`Field ${key} is invalid:`, control.errors);
      }
    });

    const user = this.authService.getCurrentUser();
    console.log('current user:', user);

    if (!user || this.profileForm.invalid || this.loading) {
      console.log('blocked - user:', !!user, 'valid:', this.profileForm.valid, 'loading:', this.loading);
      return;
    }

    this.errorMessage = null;
    this.loading = true;

    const value = this.profileForm.value as UserUpdateRequest;

    console.log('calling updateUser with:', value);

    this.authService.updateUser(user.id, value).subscribe({
      next: (res) => {
        console.log('updateUser success:', res);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.log('updateUser error:', err);

        this.loading = false;

        if (err?.status === 401 || err?.status === 403) {
          console.log('Unauthorized on update → redirecting to signin');
          this.router.navigate(['/auth/signin']);
          return;
        }

        this.errorMessage =
          err?.error?.message || 'Update failed. Please try again.';
      }
    });
  }
}
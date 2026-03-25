import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { IonButton, IonHeader, IonContent, IonToolbar, IonTitle, IonInput, IonItem } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth-service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.page.html',
  styleUrls: ['./register-page.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonInput,
    CommonModule,
    ReactiveFormsModule,
    IonItem
],
})

export class RegisterPagePage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  invalidEmailText = 'Not a valid email';
  invalidAliasText = 'Alias is required';
  invalidPasswordText = 'Password should have at least 6 characters';
  invalidPasswordConfirmText = 'Does not match password';

  registerForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    alias: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirm: ['', passwordConfirmMatchPasswordValidator()],
  });

  async onSubmit() {
    const { email, password, alias } = this.registerForm.value;

    if (!email || !password || !alias) return;

    try {
      await this.authService.register(email, password, alias);
      console.log('Registration successful');
    } catch (err) {
      console.error('Register error', err);
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login-page');
  }
  
}

export function passwordConfirmMatchPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const controls = control.parent?.controls as {
      [key: string]: AbstractControl | null;
    };

    const password = controls ? controls['password']?.value : null;
    const passwordConfirm = control?.value;

    return passwordConfirm === password
      ? null
      : { passwordConfirmMissmatch: true };
  };
}
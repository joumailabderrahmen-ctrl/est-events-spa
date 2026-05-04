import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  form: FormGroup;
  submitting = false;
  submitted  = false;

  sujets = ['Événement', 'Réservation', 'Bug', 'Autre'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nom:     ['', [Validators.required, Validators.minLength(2)]],
      email:   ['', [Validators.required, Validators.email]],
      sujet:   ['Événement', Validators.required],
      message: ['', [Validators.required, Validators.minLength(20)]],
      cgu:     [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.submitted  = true;
      this.form.reset({ sujet: 'Événement', cgu: false });
    }, 1500);
  }

  resetForm(): void {
    this.submitted = false;
    this.form.reset({ sujet: 'Événement', cgu: false });
  }

  f(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors) return '';
    if (c.errors['required'])   return 'Ce champ est requis.';
    if (c.errors['minlength'])  return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    if (c.errors['email'])      return 'Email invalide.';
    if (c.errors['requiredTrue']) return 'Vous devez accepter les CGU.';
    return '';
  }
}

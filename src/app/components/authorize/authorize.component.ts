import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-authorize',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './authorize.component.html',
  styleUrl: './authorize.component.css'
})
export class AuthorizeComponent {
  passcode: string = '';
  private correctPasscode: string = '13262201'; 

  constructor(private router: Router, private snackBar: MatSnackBar) {}

  authorize() {
    if (this.passcode === this.correctPasscode) {
      localStorage.setItem('authorized', 'true');
      this.router.navigate(['/voices']);
    } else {
      this.snackBar.open('Incorrect passcode!', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }
}

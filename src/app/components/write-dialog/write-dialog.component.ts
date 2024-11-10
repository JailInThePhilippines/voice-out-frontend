import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-write-dialog',
  standalone: true,
  templateUrl: './write-dialog.component.html',
  styleUrls: ['./write-dialog.component.css'],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgIf,
    MatProgressSpinnerModule,
  ],
})
export class WriteDialogComponent {
  writeForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<WriteDialogComponent>,
    private fb: FormBuilder,
    private dataService: DataService,
    private toastService: ToastService
  ) {
    this.writeForm = this.fb.group({
      thoughtText: [''],
      file: [null],
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    this.writeForm.patchValue({ file });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.writeForm.valid) {
      this.isLoading = true;
      const { thoughtText, file } = this.writeForm.value;

      this.dataService.postVoiceOut(thoughtText, file).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.showSuccess();
          this.dialogRef.close();
        },
        error: () => {
          this.isLoading = false;
          this.toastService.showError();
        },
      });
    }
  }
}

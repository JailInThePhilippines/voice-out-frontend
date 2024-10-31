import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { NgForm } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent {
  showToast = false;
  showErrorToast = false;
  isFadingDown = false;
  isLoading = false;

  constructor(private dataService: DataService) {}
  onSubmit(form: NgForm) {
    if (form.valid) {
      const inquiryData = {
        email: form.value.email,
        subject: form.value.subject,
        feedback: form.value.feedback
      };
      this.isLoading = true;

      this.dataService.postInquiries(inquiryData).subscribe(
        response => {
          //console.log('Inquiry submitted successfully:', response);
          form.reset();
          this.showToast = true;
          this.showErrorToast = false;
          this.isFadingDown = false;
          
          setTimeout(() => {
            this.startFadeDown();
          }, 3000);
          this.isLoading = false;
        },
        error => {
          //console.error('Error submitting inquiry:', error);
          this.isLoading = false;
          this.showErrorToast = true;
          this.showToast = false;
          this.isFadingDown = false;

          setTimeout(() => {
            this.startFadeDownError();
            }, 3000);
        }
      );
    }
  }
  private startFadeDown() {
    this.isFadingDown = true;
    setTimeout(() => {
        this.showToast = false;
    }, 500);
}
  private startFadeDownError() {
    setTimeout(() => {
      this.showErrorToast = false;
    }, 500);
  }
}

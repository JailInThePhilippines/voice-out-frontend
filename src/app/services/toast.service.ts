import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private successToastSubject = new BehaviorSubject<boolean>(false);
  private errorToastSubject = new BehaviorSubject<boolean>(false);

  showSuccessToast$ = this.successToastSubject.asObservable();
  showErrorToast$ = this.errorToastSubject.asObservable();

  showSuccess() {
    this.successToastSubject.next(true);
    setTimeout(() => this.successToastSubject.next(false), 3000);
  }

  showError() {
    this.errorToastSubject.next(true);
    setTimeout(() => this.errorToastSubject.next(false), 3000);
  }
}

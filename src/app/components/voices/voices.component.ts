import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { DataService } from '../../services/data.service';
import { FlowbiteService } from '../../services/flowbite.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ToastService } from '../../services/toast.service';
import { interval, of } from 'rxjs';
import { switchMap, takeWhile, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface Voices {
  voice_out: string;
  file?: string;
  date?: Date;
  _id?: string;
  fileType?: string;
}

@Component({
  selector: 'app-voices',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatProgressSpinner],
  templateUrl: './voices.component.html',
  styleUrls: ['./voices.component.css'],
})
export class VoicesComponent implements OnInit, OnDestroy {
  voices: Voices[] = [];
  private newVoiceOutSub: Subscription | null = null;
  private scrollSub: Subscription | null = null; 
  loading: boolean = true;
  lazyLoading: boolean = false;
  showSuccessToast = false;
  showErrorToast = false;
  currentPage: number = 1;
  pageSize: number = 20;
  totalPages: number = 0;
  reachedEnd: boolean = false;

  constructor(
    private dataService: DataService,
    private flowbiteService: FlowbiteService,
    private dialog: MatDialog,
    private toastService: ToastService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadFlowbite();
    this.getVoices();
    this.toastService.showSuccessToast$.subscribe(
      (show) => (this.showSuccessToast = show)
    );
    this.toastService.showErrorToast$.subscribe(
      (show) => (this.showErrorToast = show)
    );
    this.scrollSub = fromEvent(window, 'scroll')
      .pipe(debounceTime(200))
      .subscribe(() => this.onScroll());

    // Initialize WebSocket connection and listen for new voice outs
    this.dataService.initWebSocket();
    this.newVoiceOutSub = this.dataService.newVoiceOut$.subscribe(
      (newVoice) => {
        // Avoid adding duplicate entries
        if (!this.voices.find((v) => v._id === newVoice._id)) {
          console.log('New voice received via WebSocket:', newVoice);
          this.voices.unshift(newVoice);

          // Start checking if the file is available
          this.waitForFileToBeAvailable(newVoice);
        }
      }
    );
  }

  loadFlowbite(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      //console.log('Flowbite loaded', flowbite);
    });
  }
  

  getVoices(): void {
    if (this.reachedEnd || this.lazyLoading) return;

    this.lazyLoading = true;
    this.dataService.getVoiceOuts(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        const { voice_outs, totalPages } = response;

        this.voices = [
          ...this.voices,
          ...voice_outs.map((voiceout: any) => ({
            ...voiceout,
            fileType: this.getFileType(voiceout.file || ''),
          })),
        ];

        this.totalPages = totalPages;
        this.reachedEnd = this.currentPage >= this.totalPages;
        this.currentPage += 1;

        this.lazyLoading = false;
        this.loading = false;
      },
      error: () => {
        this.lazyLoading = false;
      },
    });
  }

  onScroll(): void {
    if (this.lazyLoading || this.reachedEnd) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 200;
    if (scrollPosition >= threshold) {
      this.getVoices();
    }
  }

  getFileType(url: string): 'image' | 'audio' | 'video' | 'unknown' {
    const ext = url.split('.').pop()?.toLowerCase();
    if (!ext) return 'unknown';
    if (['jpeg', 'jpg', 'png', 'gif'].includes(ext)) return 'image';
    if (['mp3', 'wav', 'm4a'].includes(ext)) return 'audio';
    if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) return 'video';
    return 'unknown';
  }

  private checkFileAvailability(url: string): Observable<boolean> {
    return this.http.head(url, { observe: 'response' }).pipe(
      switchMap((response) => of(response.status === 200)),
      catchError(() => of(false))
    );
  }

  private waitForFileToBeAvailable(voice: Voices): void {
    interval(1000)
      .pipe(
        switchMap(() => this.checkFileAvailability(voice.file || '')),
        takeWhile((isAvailable) => !isAvailable, true)
      )
      .subscribe((isAvailable) => {
        if (isAvailable) {
          voice.fileType = this.getFileType(voice.file || '');
        }
      });
  }

  ngOnDestroy(): void {
    this.newVoiceOutSub?.unsubscribe();
    this.scrollSub?.unsubscribe();
  }
}

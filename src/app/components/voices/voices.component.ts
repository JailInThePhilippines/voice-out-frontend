import { Component, OnInit, OnDestroy } from '@angular/core';
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
  loading: boolean = true;
  showSuccessToast = false;
  showErrorToast = false;

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

    // Initialize WebSocket connection and listen for new voice outs
    this.dataService.initWebSocket();
    this.newVoiceOutSub = this.dataService.newVoiceOut$.subscribe((newVoice) => {
      // Avoid adding duplicate entries
      if (!this.voices.find((v) => v._id === newVoice._id)) {
        console.log('New voice received via WebSocket:', newVoice);
        this.voices.unshift(newVoice);
    
        // Start checking if the file is available
        this.waitForFileToBeAvailable(newVoice);
      }
    });
  }

  loadFlowbite(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      //console.log('Flowbite loaded', flowbite);
    });
  }

  getVoices(): void {
    this.loading = true;
    this.dataService.getVoiceOuts().subscribe({
      next: (voices) => {
        this.voices = voices.map((voiceout) => ({
          ...voiceout,
          fileType: this.getFileType(voiceout.file || ''),
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
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
  }
}

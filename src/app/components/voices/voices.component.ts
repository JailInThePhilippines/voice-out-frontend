import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { DataService } from '../../services/data.service';
import { FlowbiteService } from '../../services/flowbite.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ToastService } from '../../services/toast.service';

interface Voices {
  voice_out: string;
  photo?: string;
  date?: Date;
  _id?: string;
}

@Component({
  selector: 'app-voices',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatProgressSpinner],
  templateUrl: './voices.component.html',
  styleUrls: ['./voices.component.css']
})
export class VoicesComponent implements OnInit, OnDestroy {
  voices: Voices[] = [];
  private newVoiceOutSub: Subscription | null = null;
  loading: boolean = true;
  loadingMore: boolean = false;
  showSuccessToast = false;
  showErrorToast = false;
  page: number = 1;
  limit: number = 10;
  hasMore: boolean = true;

  constructor(private dataService: DataService, private flowbiteService: FlowbiteService, private dialog: MatDialog, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadFlowbite();
    this.getVoices();
    this.toastService.showSuccessToast$.subscribe(show => this.showSuccessToast = show);
    this.toastService.showErrorToast$.subscribe(show => this.showErrorToast = show);
  
    // Initialize WebSocket connection and listen for new voice outs
    this.dataService.initWebSocket();
    this.newVoiceOutSub = this.dataService.newVoiceOut$.subscribe(newVoice => {
      // Avoid adding duplicate entries
      if (!this.voices.find(v => v._id === newVoice._id)) {
        console.log('New voice received via WebSocket:', newVoice);
        this.voices.unshift(newVoice);
      }
    });
  }

  loadFlowbite(): void {
    this.flowbiteService.loadFlowbite(flowbite => {
      //console.log('Flowbite loaded', flowbite);
    });
  }

  getVoices(page: number = 1, limit: number = 10): void {
    this.loading = page === 1;
    this.loadingMore = page > 1;
    this.dataService.getVoiceOuts(page, limit).subscribe({
      next: (voices) => {
        this.voices = [...this.voices, ...voices];
        this.loading = false;
        this.loadingMore = false;
        this.hasMore = voices.length === this.limit;
      },
      error: () => {
        this.loading = false;
        this.loadingMore = false;
        this.hasMore = false;
      }
    });
  }

  loadMore(): void {
    if (!this.hasMore || this.loading) return;
    this.page += 1;
    this.getVoices(this.page, this.limit);
  }

  @HostListener("window:scroll", [])
  onWindowScroll(): void {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 200) {
      this.loadMore();
    }
  }

  ngOnDestroy(): void {
    this.newVoiceOutSub?.unsubscribe();
  }
  
}
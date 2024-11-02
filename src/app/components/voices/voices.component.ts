import { Component, OnInit, OnDestroy } from '@angular/core';
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
  showSuccessToast = false;
  showErrorToast = false;

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

  getVoices(): void {
    this.loading = true;
    this.dataService.getVoiceOuts().subscribe({
      next: (voices) => {
        this.voices = voices;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.newVoiceOutSub?.unsubscribe();
  }
  
}
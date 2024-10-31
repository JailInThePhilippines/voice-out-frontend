import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WriteDialogComponent } from '../write-dialog/write-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(public dialog: MatDialog) {}
  openDialog(): void {
    this.dialog.open(WriteDialogComponent, {
      width: '400px',
      data: {} // Pass data if needed
    });
  }
}

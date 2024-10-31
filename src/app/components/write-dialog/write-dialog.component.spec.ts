import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteDialogComponent } from './write-dialog.component';

describe('WriteDialogComponent', () => {
  let component: WriteDialogComponent;
  let fixture: ComponentFixture<WriteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WriteDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

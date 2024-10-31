import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  emotions: string[] = [ 'Alone' ,'Embarassed', 'Sad', 'Happy', 'Excited'];
  currentEmotionIndex = 0;
  displayedText = '';
  isDeleting = false;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.typeEffect();
    }
  }

  typeEffect() {
    const currentEmotion = this.emotions[this.currentEmotionIndex];
    const fullText = currentEmotion + '?';

    if (this.isDeleting) {
      // Delete characters gradually
      this.displayedText = fullText.substring(0, this.displayedText.length - 1);
    } else {
      // Add characters gradually
      this.displayedText = fullText.substring(0, this.displayedText.length + 1);
    }

    // Adjust speed for typing vs deleting
    let speed = this.isDeleting ? 50 : 100;

    // If the word is fully typed, add a pause before deletion
    if (!this.isDeleting && this.displayedText === fullText) {
      speed = 1500;
      this.isDeleting = true;
    }
    // If the word is fully deleted, move to the next word
    else if (this.isDeleting && this.displayedText === '') {
      this.isDeleting = false;
      this.currentEmotionIndex = (this.currentEmotionIndex + 1) % this.emotions.length;
      speed = 500;
    }

    setTimeout(() => this.typeEffect(), speed);
  }

}

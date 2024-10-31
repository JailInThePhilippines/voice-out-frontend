import { Routes } from '@angular/router';
import { VoicesComponent } from './components/voices/voices.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [
    { path: '', component: VoicesComponent },
    { path: 'voices', component: VoicesComponent },
    { path: 'feedback', component: FeedbackComponent },
    { path: 'about', component: AboutComponent },
    { path: '**', redirectTo: '' }
];

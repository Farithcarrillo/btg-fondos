import { Component, inject } from '@angular/core';
import { AlertService } from '@core/services';

@Component({
  selector: 'app-alert',
  standalone: true,
  templateUrl: './alert.html',
  styleUrl: './alert.scss'
})
export class AlertComponent {
  protected readonly alertService = inject(AlertService);
}
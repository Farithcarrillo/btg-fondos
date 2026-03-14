import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UserStateService } from '@core/services';
import { CopCurrencyPipe } from '@shared/pipes';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CopCurrencyPipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  protected readonly state = inject(UserStateService);
}
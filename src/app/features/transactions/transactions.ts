import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserStateService } from '@core/services';
import { CopCurrencyPipe } from '@shared/pipes';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [DatePipe, CopCurrencyPipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss'
})
export class TransactionsComponent {
  protected readonly state = inject(UserStateService);
}
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserStateService } from '@core/services';
import { CopCurrencyPipe } from '@shared/pipes';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CopCurrencyPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  protected readonly userState = inject(UserStateService);
  readonly mobileOpen = signal(false);

  toggleMobile(): void {
    this.mobileOpen.update(v => !v);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
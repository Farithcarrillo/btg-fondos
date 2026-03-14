import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UserStateService, AlertService } from '@core/services';
import { FundSubscription } from '@core/models';
import { CopCurrencyPipe } from '@shared/pipes';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [RouterModule, DatePipe, CopCurrencyPipe, ConfirmDialogComponent],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.scss'
})
export class SubscriptionsComponent {
  protected readonly state = inject(UserStateService);
  private readonly alertService = inject(AlertService);

  readonly showCancelDialog = signal(false);
  readonly cancelMessage = signal('');
  private fundToCancel: FundSubscription | null = null;

  openCancelDialog(sub: FundSubscription): void {
    this.fundToCancel = sub;
    const amount = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(sub.amount);
    this.cancelMessage.set(`¿Estás seguro que deseas cancelar tu suscripción al fondo ${sub.fundName}? Se te reembolsarán ${amount} a tu saldo disponible.`);
    this.showCancelDialog.set(true);
  }

  confirmCancellation(): void {
    if (!this.fundToCancel) return;
    const result = this.state.cancelSubscription(this.fundToCancel.fundId);
    if (result.success) {
      this.alertService.success(`Suscripción al fondo ${this.fundToCancel.fundName} cancelada. Monto devuelto a tu saldo.`, 'Suscripción cancelada');
    } else {
      this.alertService.error(result.error || 'Error al cancelar.', 'Error');
    }
    this.showCancelDialog.set(false);
    this.fundToCancel = null;
  }
}
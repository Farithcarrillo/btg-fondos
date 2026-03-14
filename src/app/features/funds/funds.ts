import { Component, inject, signal, computed, linkedSignal, resource } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FundService, UserStateService, AlertService, NotificationService } from '@core/services';
import { Fund, FundCategory, NotificationMethod } from '@core/models';
import { CopCurrencyPipe } from '@shared/pipes';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-funds',
  standalone: true,
  imports: [FormsModule, CopCurrencyPipe, LoadingSpinnerComponent],
  templateUrl: './funds.html',
  styleUrl: './funds.scss'
})
export class FundsComponent {
  private readonly fundService = inject(FundService);
  protected readonly userState = inject(UserStateService);
  private readonly alertService = inject(AlertService);
  private readonly notificationService = inject(NotificationService);

  /** resource() — carga async reactiva */
  readonly fundsResource = resource({
    loader: () => this.fundService.loadFunds()
  });

  readonly activeFilter = signal<'ALL' | FundCategory>('ALL');
  readonly showModal = signal(false);
  readonly selectedFund = signal<Fund | null>(null);
  readonly isSubmitting = signal(false);
  readonly formAmount = signal<number | null>(null);
  readonly formNotification = signal<NotificationMethod>('email');
  readonly formDestination = signal('');

  /** linkedSignal — se resetea cuando cambia el fondo */
  readonly formAmountLinked = linkedSignal({
    source: this.selectedFund,
    computation: (fund) => fund?.minimumAmount ?? null
  });

  /** computed — filtrado reactivo */
  readonly filteredFunds = computed(() => {
    const funds = this.fundsResource.value() ?? [];
    const filter = this.activeFilter();
    return filter === 'ALL' ? funds : funds.filter(f => f.category === filter);
  });

  /** Validación reactiva del monto */
  readonly amountError = computed(() => {
    const fund = this.selectedFund();
    const amount = this.formAmount();
    if (!fund || amount === null) return '';
    if (amount < fund.minimumAmount) return `El monto mínimo es ${this.formatCop(fund.minimumAmount)}.`;
    if (amount > this.userState.balance()) return `Saldo insuficiente. Disponible: ${this.formatCop(this.userState.balance())}.`;
    return '';
  });

  /** Validación reactiva del destino */
  readonly destinationError = computed(() => {
    const dest = this.formDestination().trim();
    const method = this.formNotification();
    if (!dest) return '';
    if (method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dest)) return 'Ingresa un correo electrónico válido.';
    }
    if (method === 'sms') {
      const phoneRegex = /^[\d\s\-+()]{7,15}$/;
      if (!phoneRegex.test(dest)) return 'Ingresa un número de celular válido.';
    }
    return '';
  });

  readonly destinationPlaceholder = computed(() =>
    this.formNotification() === 'email' ? 'ejemplo@correo.com' : '300 123 4567'
  );

  readonly destinationLabel = computed(() =>
    this.formNotification() === 'email' ? 'Correo electrónico' : 'Número de celular'
  );

  readonly isFormValid = computed(() => {
    const fund = this.selectedFund();
    const amount = this.formAmount();
    const dest = this.formDestination().trim();
    return fund !== null && amount !== null && amount > 0
      && !this.amountError() && dest.length > 0 && !this.destinationError();
  });

  openModal(fund: Fund): void {
    this.selectedFund.set(fund);
    this.formAmount.set(fund.minimumAmount);
    this.formNotification.set('email');
    this.formDestination.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedFund.set(null);
  }

  onNotificationMethodChange(method: NotificationMethod): void {
    this.formNotification.set(method);
    this.formDestination.set('');
  }

  async submitSubscription(): Promise<void> {
    if (!this.isFormValid()) return;

    const fund = this.selectedFund()!;
    const amount = this.formAmount()!;
    const method = this.formNotification();
    const destination = this.formDestination().trim();

    this.isSubmitting.set(true);

    // Simular latencia de procesamiento de suscripción
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = this.userState.subscribe(fund, amount, method, destination);

    if (result.success) {
      // Obtener el ID de la última transacción creada
      const lastTxn = this.userState.sortedTransactions()[0];

      this.alertService.success(
        `Te has suscrito al fondo ${fund.name} por ${this.formatCop(amount)}.`,
        '¡Suscripción exitosa!'
      );

      // Enviar notificación (email real o SMS simulado)
      await this.notificationService.sendSubscriptionNotification({
        method,
        destination,
        fundName: fund.name,
        amount,
        category: fund.category,
        transactionId: lastTxn?.id ?? 'N/A'
      });

      this.closeModal();
    } else {
      this.alertService.error(result.error || 'Error al suscribirse.', 'Error');
    }

    this.isSubmitting.set(false);
  }

  private formatCop(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  }
}
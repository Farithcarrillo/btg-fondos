import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialogComponent {
  readonly isOpen = input(false);
  readonly title = input('¿Estás seguro?');
  readonly message = input('');
  readonly confirmText = input('Confirmar');
  readonly cancelText = input('Cancelar');
  readonly variant = input<'danger' | 'primary'>('primary');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
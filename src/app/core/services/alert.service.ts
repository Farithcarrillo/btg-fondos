import { Injectable, signal } from '@angular/core';
import { AlertConfig, AlertType } from '@core/models';

/**
 * Servicio global de alertas - Signal-based (Angular 21).
 * Principio SRP: Solo gestiona la cola de alertas.
 */
@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private readonly DEFAULT_DURATION = 5000;

    /** Signal con la cola de alertas activas */
    readonly alerts = signal<AlertConfig[]>([]);

    success(message: string, title?: string): void {
        this.show({ type: 'success', message, title });
    }

    error(message: string, title?: string): void {
        this.show({ type: 'error', message, title, duration: 7000 });
    }

    warning(message: string, title?: string): void {
        this.show({ type: 'warning', message, title });
    }

    info(message: string, title?: string): void {
        this.show({ type: 'info', message, title });
    }

    show(config: Partial<AlertConfig> & { type: AlertType; message: string }): void {
        const alert: AlertConfig = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: config.type,
            message: config.message,
            title: config.title,
            duration: config.duration ?? this.DEFAULT_DURATION,
            dismissible: config.dismissible ?? true
        };

        this.alerts.update(current => [...current, alert]);

        if (alert.duration && alert.duration > 0) {
            setTimeout(() => this.dismiss(alert.id), alert.duration);
        }
    }

    dismiss(id: string): void {
        this.alerts.update(current => current.filter(a => a.id !== id));
    }

    clearAll(): void {
        this.alerts.set([]);
    }
}
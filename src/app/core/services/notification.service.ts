import { Injectable, inject } from '@angular/core';
import { AlertService } from './alert.service';

/**
 * Servicio de notificaciones.
 *
 * - Email: EmailJS (gratis, 200/mes) — requiere configuración
 * - SMS: Textbelt (gratis, 1/día) — funciona sin configurar nada
 *
 * Principio SRP: Solo envía notificaciones.
 * Principio OCP: Extensible con nuevos proveedores sin modificar consumidores.
 */
@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly alertService = inject(AlertService);

    //  EmailJS
    private readonly EMAILJS_PUBLIC_KEY = '4iImfNch0SpIiDmzr';
    private readonly EMAILJS_SERVICE_ID = 'service_ghak5t4';
    private readonly EMAILJS_TEMPLATE_ID = 'template_67ucr3l';

    /** Verifica si EmailJS está configurado */
    private get isEmailConfigured(): boolean {
        return !this.EMAILJS_PUBLIC_KEY.includes('TU_')
            && !this.EMAILJS_SERVICE_ID.includes('TU_')
            && !this.EMAILJS_TEMPLATE_ID.includes('TU_');
    }

    /**
     * Envía notificación de suscripción según el método elegido.
     */
    async sendSubscriptionNotification(params: {
        method: 'email' | 'sms';
        destination: string;
        fundName: string;
        amount: number;
        category: string;
        transactionId: string;
    }): Promise<{ success: boolean; error?: string }> {
        if (params.method === 'email') {
            return this.sendEmail(params);
        }
        return this.sendSms(params);
    }

    // EMAIL (EmailJS)

    private async sendEmail(params: {
        destination: string;
        fundName: string;
        amount: number;
        category: string;
        transactionId: string;
    }): Promise<{ success: boolean; error?: string }> {

        if (!this.isEmailConfigured) {
            this.alertService.info(
                `Simulación: se enviaría email a ${params.destination} con la confirmación del fondo ${params.fundName}.`,
                'Email simulado'
            );
            return { success: true };
        }

        try {
            const emailjs = await this.loadEmailJS();

            const response = await emailjs.send(
                this.EMAILJS_SERVICE_ID,
                this.EMAILJS_TEMPLATE_ID,
                {
                    to_email: params.destination,
                    fund_name: params.fundName,
                    amount: this.formatCurrency(params.amount),
                    category: params.category === 'FPV'
                        ? 'Fondo de Pensiones Voluntarias'
                        : 'Fondo de Inversión Colectiva',
                    date: new Date().toLocaleString('es-CO'),
                    transaction_id: params.transactionId
                },
                this.EMAILJS_PUBLIC_KEY
            );

            if (response.status === 200) {
                this.alertService.success(
                    `Correo de confirmación enviado a ${params.destination}.`,
                    'Email enviado'
                );
                return { success: true };
            }
            throw new Error(`Status ${response.status}`);
        } catch (error) {
            console.error('[NotificationService] Error email:', error);
            this.alertService.warning(
                `No se pudo enviar el email a ${params.destination}. La suscripción fue exitosa.`,
                'Email no enviado'
            );
            return { success: true };
        }
    }

    // SMS (Textbelt — 1 gratis/día)

    private async sendSms(params: {
        destination: string;
        fundName: string;
        amount: number;
    }): Promise<{ success: boolean; error?: string }> {

        const phone = this.formatPhoneNumber(params.destination);
        const message =
            `BTG Pactual: Suscripción al fondo ${params.fundName} ` +
            `por ${this.formatCurrency(params.amount)} exitosa. ` +
            `Gracias por confiar en nosotros.`;

        try {
            const response = await fetch('https://textbelt.com/text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    message,
                    key: 'textbelt' // Key gratuita: 1 SMS por día
                })
            });

            const data = await response.json();

            if (data.success) {
                this.alertService.success(
                    `SMS enviado al ${params.destination}. Cuota restante hoy: ${data.quotaRemaining}.`,
                    'SMS enviado'
                );
                return { success: true };
            }

            // Cuota agotada
            if (data.error?.toLowerCase().includes('quota')) {
                this.alertService.warning(
                    `Se agotó el SMS gratuito del día. La suscripción fue exitosa igualmente.`,
                    'Cuota SMS agotada'
                );
            } else {
                this.alertService.warning(
                    `No se pudo enviar SMS: ${data.error || 'Error desconocido'}. La suscripción fue exitosa.`,
                    'SMS no enviado'
                );
            }

            console.warn('[NotificationService] Textbelt:', data);
            return { success: true };
        } catch (error) {
            console.error('[NotificationService] Error SMS:', error);
            this.alertService.warning(
                `Error de conexión al enviar SMS. La suscripción fue exitosa.`,
                'SMS no enviado'
            );
            return { success: true };
        }
    }

    // ──── Utilidades ────

    /**
     * Formatea número al formato E.164.
     * Si el usuario escribe 3001234567, se convierte a +573001234567 (Colombia).
     */
    private formatPhoneNumber(phone: string): string {
        let cleaned = phone.replace(/[\s\-()]/g, '');

        if (cleaned.startsWith('+')) return cleaned;
        if (cleaned.startsWith('57') && cleaned.length === 12) return `+${cleaned}`;
        if (cleaned.length === 10 && cleaned.startsWith('3')) return `+57${cleaned}`;

        return `+${cleaned}`;
    }

    /** Carga EmailJS dinámicamente */
    private async loadEmailJS(): Promise<any> {
        try {
            const module = await import('@emailjs/browser');
            return module.default || module;
        } catch {
            return new Promise((resolve, reject) => {
                if ((window as any).emailjs) {
                    resolve((window as any).emailjs);
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
                script.onload = () => resolve((window as any).emailjs);
                script.onerror = () => reject(new Error('No se pudo cargar EmailJS'));
                document.head.appendChild(script);
            });
        }
    }

    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', minimumFractionDigits: 0
        }).format(value);
    }
}
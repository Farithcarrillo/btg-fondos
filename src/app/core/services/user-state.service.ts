import { Injectable, signal, computed, effect } from '@angular/core';
import {
    UserState,
    FundSubscription,
    Transaction,
    Fund,
    NotificationMethod
} from '@core/models';

/**
 * Servicio de estado global del usuario - Signal-based con persistencia en localStorage.
 *
 * Principio SRP: Gestiona exclusivamente el estado del usuario.
 * Principio OCP: Extensible sin modificar estado interno.
 *
 * Usa effect() de Angular 21 para persistir automáticamente
 * cada cambio de estado en localStorage.
 */
@Injectable({
    providedIn: 'root'
})
export class UserStateService {
    private readonly INITIAL_BALANCE = 500000;
    private readonly STORAGE_KEY = 'btg_fondos_state';

    // Signals

    readonly balance = signal(this.INITIAL_BALANCE);
    readonly subscriptions = signal<FundSubscription[]>([]);
    readonly transactions = signal<Transaction[]>([]);

    // Computed

    readonly totalInvested = computed(() =>
        this.subscriptions().reduce((sum, s) => sum + s.amount, 0)
    );

    readonly activeCount = computed(() => this.subscriptions().length);

    readonly sortedTransactions = computed(() =>
        [...this.transactions()].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    );

    readonly recentTransactions = computed(() =>
        this.sortedTransactions().slice(0, 5)
    );

    readonly transactionCount = computed(() => this.transactions().length);

    constructor() {
        this.loadFromStorage();

        effect(() => {
            const state: UserState = {
                balance: this.balance(),
                subscriptions: this.subscriptions(),
                transactions: this.transactions()
            };
            this.saveToStorage(state);
        });
    }

    // Persistencia

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return;

            const state: UserState = JSON.parse(stored);

            if (
                typeof state.balance !== 'number' ||
                !Array.isArray(state.subscriptions) ||
                !Array.isArray(state.transactions)
            ) {
                console.warn('Estado almacenado inválido, usando valores iniciales.');
                return;
            }

            const subscriptions = state.subscriptions.map(s => ({
                ...s,
                subscribedAt: new Date(s.subscribedAt)
            }));

            const transactions = state.transactions.map(t => ({
                ...t,
                date: new Date(t.date)
            }));

            this.balance.set(state.balance);
            this.subscriptions.set(subscriptions);
            this.transactions.set(transactions);
        } catch (error) {
            console.warn('Error al cargar estado desde localStorage:', error);
        }
    }

    private saveToStorage(state: UserState): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.warn('Error al guardar estado en localStorage:', error);
        }
    }

    // Métodos de negocio

    isSubscribed(fundId: number): boolean {
        return this.subscriptions().some(s => s.fundId === fundId);
    }

    /**
     * Suscribe al usuario a un fondo.
     * @param fund - Fondo objetivo
     * @param amount - Monto a invertir
     * @param notificationMethod - Email o SMS
     * @param notificationDestination - Dirección de correo o número de celular
     */
    subscribe(
        fund: Fund,
        amount: number,
        notificationMethod: NotificationMethod,
        notificationDestination: string
    ): { success: boolean; error?: string } {

        if (this.isSubscribed(fund.id)) {
            return { success: false, error: `Ya estás suscrito al fondo ${fund.name}.` };
        }

        if (amount < fund.minimumAmount) {
            return {
                success: false,
                error: `El monto mínimo para ${fund.name} es ${this.formatCurrency(fund.minimumAmount)}.`
            };
        }

        if (amount > this.balance()) {
            return {
                success: false,
                error: `No tienes saldo disponible para vincularte al fondo ${fund.name}. Tu saldo actual es ${this.formatCurrency(this.balance())}.`
            };
        }

        const now = new Date();

        const subscription: FundSubscription = {
            fundId: fund.id,
            fundName: fund.name,
            amount,
            category: fund.category,
            subscribedAt: now,
            notificationMethod,
            notificationDestination
        };

        const transaction: Transaction = {
            id: this.generateId(),
            fundId: fund.id,
            fundName: fund.name,
            type: 'subscription',
            amount,
            date: now,
            notificationMethod,
            notificationDestination
        };

        this.balance.update(b => b - amount);
        this.subscriptions.update(subs => [...subs, subscription]);
        this.transactions.update(txns => [...txns, transaction]);

        return { success: true };
    }

    cancelSubscription(fundId: number): { success: boolean; error?: string } {
        const sub = this.subscriptions().find(s => s.fundId === fundId);

        if (!sub) {
            return { success: false, error: 'No se encontró una suscripción activa para este fondo.' };
        }

        const transaction: Transaction = {
            id: this.generateId(),
            fundId: sub.fundId,
            fundName: sub.fundName,
            type: 'cancellation',
            amount: sub.amount,
            date: new Date()
        };

        this.balance.update(b => b + sub.amount);
        this.subscriptions.update(subs => subs.filter(s => s.fundId !== fundId));
        this.transactions.update(txns => [...txns, transaction]);

        return { success: true };
    }

    resetState(): void {
        this.balance.set(this.INITIAL_BALANCE);
        this.subscriptions.set([]);
        this.transactions.set([]);
        localStorage.removeItem(this.STORAGE_KEY);
    }

    private generateId(): string {
        return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}
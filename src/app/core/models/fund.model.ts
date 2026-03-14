/**
 * Modelo que representa un fondo de inversión disponible en BTG Pactual.
 * Principio ISP: Interfaces segregadas por responsabilidad.
 */
export interface Fund {
    id: number;
    name: string;
    minimumAmount: number;
    category: FundCategory;
}

/** Categorías: FPV = Pensiones Voluntarias, FIC = Inversión Colectiva */
export type FundCategory = 'FPV' | 'FIC';

/** Suscripción activa de un usuario a un fondo */
export interface FundSubscription {
    fundId: number;
    fundName: string;
    amount: number;
    category: FundCategory;
    subscribedAt: Date;
    notificationMethod: NotificationMethod;
    notificationDestination: string;
}

/** Métodos de notificación al suscribirse */
export type NotificationMethod = 'email' | 'sms';

export type TransactionType = 'subscription' | 'cancellation';

/** Registro histórico de una transacción */
export interface Transaction {
    id: string;
    fundId: number;
    fundName: string;
    type: TransactionType;
    amount: number;
    date: Date;
    notificationMethod?: NotificationMethod;
    notificationDestination?: string;
}

/** Estado global del usuario */
export interface UserState {
    balance: number;
    subscriptions: FundSubscription[];
    transactions: Transaction[];
}

/** DTO para solicitud de suscripción */
export interface SubscriptionRequest {
    fundId: number;
    amount: number;
    notificationMethod: NotificationMethod;
    notificationDestination: string;
}

/** DTO para solicitud de cancelación */
export interface CancellationRequest {
    fundId: number;
}

/** Configuración de alerta */
export interface AlertConfig {
    id: string;
    type: AlertType;
    message: string;
    title?: string;
    duration?: number;
    dismissible?: boolean;
}

export type AlertType = 'success' | 'error' | 'warning' | 'info';
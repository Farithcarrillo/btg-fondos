import { Routes } from '@angular/router';

/** Rutas con lazy loading para optimizar bundle inicial */
export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
        title: 'Inicio - BTG Fondos'
    },
    {
        path: 'funds',
        loadComponent: () => import('./features/funds/funds').then(m => m.FundsComponent),
        title: 'Fondos Disponibles - BTG Fondos'
    },
    {
        path: 'subscriptions',
        loadComponent: () => import('./features/subscriptions/subscriptions').then(m => m.SubscriptionsComponent),
        title: 'Mis Fondos - BTG Fondos'
    },
    {
        path: 'transactions',
        loadComponent: () => import('./features/transactions/transactions').then(m => m.TransactionsComponent),
        title: 'Historial - BTG Fondos'
    },
    { path: '**', redirectTo: 'dashboard' }
];
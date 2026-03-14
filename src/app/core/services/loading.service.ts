import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Servicio global de estados de carga.
 * Principio SRP: Solo gestiona indicadores de carga.
 * Permite a múltiples componentes mostrar/ocultar indicadores
 * de carga de forma coordinada.
 */
@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    /** Contador de operaciones activas */
    private loadingCount = 0;

    /** Subject para el estado de carga global */
    private readonly loadingSubject = new BehaviorSubject<boolean>(false);

    /** Observable público del estado de carga */
    readonly isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

    /** Map para loading por contexto (componente/feature) */
    private readonly contextLoading = new Map<string, BehaviorSubject<boolean>>();

    /**
     * Inicia un estado de carga global.
     * Soporta múltiples operaciones concurrentes.
     */
    show(): void {
        this.loadingCount++;
        this.loadingSubject.next(true);
    }

    /**
     * Finaliza un estado de carga global.
     * Solo oculta cuando todas las operaciones han terminado.
     */
    hide(): void {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        if (this.loadingCount === 0) {
            this.loadingSubject.next(false);
        }
    }

    /**
     * Obtiene el observable de carga para un contexto específico.
     * @param context - Identificador del contexto (e.g., 'funds-list', 'subscription-form')
     */
    getLoading$(context: string): Observable<boolean> {
        if (!this.contextLoading.has(context)) {
            this.contextLoading.set(context, new BehaviorSubject<boolean>(false));
        }
        return this.contextLoading.get(context)!.asObservable();
    }

    /**
     * Establece el estado de carga para un contexto específico.
     * @param context - Identificador del contexto
     * @param loading - Estado de carga
     */
    setLoading(context: string, loading: boolean): void {
        if (!this.contextLoading.has(context)) {
            this.contextLoading.set(context, new BehaviorSubject<boolean>(false));
        }
        this.contextLoading.get(context)!.next(loading);
    }
}
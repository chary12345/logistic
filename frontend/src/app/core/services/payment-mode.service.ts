import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type PaymentMode = 'PAID' | 'TO PAY' | 'TBB';

@Injectable({ providedIn: 'root' })
export class PaymentModeService {
  private paymentMode$ = new BehaviorSubject<PaymentMode>('TO PAY');

  getPaymentMode(): Observable<PaymentMode> {
    return this.paymentMode$.asObservable();
  }

  setPaymentMode(mode: PaymentMode): void {
    this.paymentMode$.next(mode);
  }

  getCurrentPaymentMode(): PaymentMode {
    return this.paymentMode$.value;
  }
}

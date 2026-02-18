import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedData {
  private dataDashboardSummary = new BehaviorSubject<any>(null); // store the dashboard summary data
  dashboardSummary$ = this.dataDashboardSummary.asObservable(); // observable to subscribe to the dashboard summary data

  private dataDashboardGas = new BehaviorSubject<any>(null); // store the dashboard gas data
  dashboardGas$ = this.dataDashboardGas.asObservable(); // observable to subscribe to the dashboard gas data

  private dataDashboardRevenue = new BehaviorSubject<any>(null); // store the dashboard revenue data
  dashboardRevenue$ = this.dataDashboardRevenue.asObservable();
  setDashboardSummary(data: any) {
    this.dataDashboardSummary.next(data);
  }
  setDashboardGas(data: any) {
    this.dataDashboardGas.next(data);
  }
  setDashboardRevenue(data: any) {
    this.dataDashboardRevenue.next(data);
  }
}

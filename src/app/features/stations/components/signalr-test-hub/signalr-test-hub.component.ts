import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-signalr-test-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './signalr-test-hub.component.html',
  styleUrls: ['./signalr-test-hub.component.css']
})
export class SignalrTestHubComponent {
  childActive = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.childActive = this.router.url.includes('signalr-test/') && 
                        (this.router.url.endsWith('dispenser') || 
                         this.router.url.endsWith('compressor') || 
                         this.router.url.endsWith('kpi'));
    });
  }
  testModules = [
    {
      id: 'dispenser',
      title: 'Dispenser Signal Test',
      description: 'Monitor real-time dispenser telemetry and connection latency.',
      icon: 'bi-fuel-pump',
      route: 'dispenser'
    },
    {
      id: 'compressor',
      title: 'Compressor Signal Test',
      description: 'Test compressor data streams and health diagnostics.',
      icon: 'bi-cpu',
      route: 'compressor'
    },
    {
      id: 'kpi',
      title: 'KPI Signal Test',
      description: 'Validate key performance indicators and data refresh rates.',
      icon: 'bi-graph-up-arrow',
      route: 'kpi'
    }
  ];
}

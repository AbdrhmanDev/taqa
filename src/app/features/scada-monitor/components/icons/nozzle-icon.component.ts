import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'scada-nozzle-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
        <!-- Nozzle Body -->
        <path [attr.fill]="getColor()" d="M20 70 L40 70 L50 30 L45 25 L15 55 L20 70 Z" />
        <rect [attr.fill]="getColor()" x="48" y="20" width="30" height="8" rx="2" transform="rotate(-30 48 20)" />
        
        <!-- Handle -->
        <path stroke="#1e293b" stroke-width="4" fill="none" d="M25 70 Q 20 85, 35 85 L45 85" />
        
        <!-- Tip -->
        <rect x="70" y="5" width="4" height="15" fill="#94a3b8" transform="rotate(60 70 5)" />
        
        <!-- Status Indicator Ring -->
        <circle cx="35" cy="55" r="5" [attr.fill]="status === 'Filling' ? '#22c55e' : 'transparent'" class="animate-ping" />
      </svg>
    </div>
  `
})
export class NozzleIconComponent {
  @Input() status: 'Idle' | 'Filling' | 'Fault' = 'Idle';

  getColor(): string {
    switch (this.status) {
      case 'Filling': return '#22c55e'; // Green
      case 'Fault': return '#ef4444';   // Red
      default: return '#94a3b8';      // Gray
    }
  }
}

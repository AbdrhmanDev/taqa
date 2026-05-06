import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'scada-dispenser-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full flex items-center justify-center p-2">
      <svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto drop-shadow-lg">
        <!-- Main Frame -->
        <rect x="15" y="10" width="70" height="130" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2" />
        
        <!-- Screen Area -->
        <rect x="25" y="25" width="50" height="35" rx="2" fill="#0f172a" />
        <rect x="28" y="28" width="44" height="29" rx="1" fill="#1e293b" />
        
        <!-- LCD Digits (Mock) -->
        <g fill="#2dd4bf" font-family="monospace" font-size="8">
          <text x="32" y="42">00.00</text>
          <text x="32" y="52">LITERS</text>
        </g>

        <!-- Nozzle Holders -->
        <rect x="10" y="70" width="10" height="20" rx="2" fill="#475569" />
        <rect x="80" y="70" width="10" height="20" rx="2" fill="#475569" />
        
        <!-- Hose (SVG Path) -->
        <path d="M15 80 Q 5 110, 15 130" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
        <path d="M85 80 Q 95 110, 85 130" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />

        <!-- Status Light -->
        <circle cx="50" cy="15" r="3" [attr.fill]="status === 'Online' ? '#10b981' : '#f43f5e'" />
      </svg>
    </div>
  `
})
export class DispenserIconComponent {
  @Input() status: string = 'Offline';
}

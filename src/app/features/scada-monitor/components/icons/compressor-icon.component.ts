import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'scada-compressor-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class.shake-animation]="vibration > 70"
      class="w-full h-full flex items-center justify-center p-2"
    >
      <svg
        viewBox="0 0 200 120"
        xmlns="http://www.w3.org/2000/svg"
        class="w-full h-auto drop-shadow-xl"
      >
        <!-- Main Body -->
        <rect x="20" y="40" width="140" height="60" rx="4" fill="#334155" />
        <rect x="25" y="45" width="130" height="50" rx="2" fill="#475569" />

        <!-- Cooling Fins -->
        <g stroke="#1e293b" stroke-width="2">
          <line x1="40" y1="40" x2="40" y2="100" />
          <line x1="55" y1="40" x2="55" y2="100" />
          <line x1="70" y1="40" x2="70" y2="100" />
          <line x1="85" y1="40" x2="85" y2="100" />
          <line x1="100" y1="40" x2="100" y2="100" />
          <line x1="115" y1="40" x2="115" y2="100" />
          <line x1="130" y1="40" x2="130" y2="100" />
        </g>

        <!-- Cylinder Head -->
        <rect x="40" y="25" width="40" height="15" rx="2" fill="#64748b" />
        <rect x="100" y="25" width="40" height="15" rx="2" fill="#64748b" />

        <!-- Pressure Gauges -->
        <circle cx="175" cy="55" r="12" fill="#cbd5e1" stroke="#334155" stroke-width="2" />
        <line x1="175" y1="55" x2="182" y2="48" stroke="#ef4444" stroke-width="2" />
        <!-- Needle 1 -->

        <circle cx="175" cy="85" r="12" fill="#cbd5e1" stroke="#334155" stroke-width="2" />
        <line x1="175" y1="85" x2="168" y2="78" stroke="#ef4444" stroke-width="2" />
        <!-- Needle 2 -->

        <!-- Motor Section -->
        <rect x="140" y="55" width="40" height="35" rx="8" fill="#1e293b" />
        <path d="M140 65 Q 150 55, 160 65" fill="none" stroke="#94a3b8" stroke-width="1" />

        <!-- Status Indicator -->
        <circle
          cx="30"
          cy="50"
          r="3"
          [attr.fill]="status === 'Running' ? '#22c55e' : '#ef4444'"
          class="animate-pulse"
        />
      </svg>
    </div>
  `,
  styles: [
    `
      @keyframes shake {
        0% {
          transform: translate(1px, 1px) rotate(0deg);
        }
        10% {
          transform: translate(-1px, -2px) rotate(-1deg);
        }
        20% {
          transform: translate(-3px, 0px) rotate(1deg);
        }
        30% {
          transform: translate(3px, 2px) rotate(0deg);
        }
        40% {
          transform: translate(1px, -1px) rotate(1deg);
        }
        50% {
          transform: translate(-1px, 2px) rotate(-1deg);
        }
        60% {
          transform: translate(-3px, 1px) rotate(0deg);
        }
        70% {
          transform: translate(3px, 1px) rotate(-1deg);
        }
        80% {
          transform: translate(-1px, -1px) rotate(1deg);
        }
        90% {
          transform: translate(1px, 2px) rotate(0deg);
        }
        100% {
          transform: translate(1px, -2px) rotate(-1deg);
        }
      }
      .shake-animation {
        animation: shake 0.5s infinite;
      }
    `,
  ],
})
export class CompressorIconComponent {
  @Input() vibration: number = 0;
  @Input() status: string = 'Idle';
}

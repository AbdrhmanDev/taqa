import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'scada-dispenser-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="disp-illustration-card">
      <div class="illustration-header">
        <span class="d-name">{{ name | uppercase }}</span>
        <div class="status-indicator" [class.online]="status === 'Online'"></div>
      </div>

      <div class="main-graphic-area">
        <!-- Minimalist Illustrative SVG -->
        <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="disp-svg">
          <rect x="50" y="20" width="60" height="90" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" />
          <rect x="58" y="28" width="44" height="20" rx="3" fill="#1e293b" />
          
          <!-- Hoses -->
          <path d="M50 50 Q 20 70, 30 100" fill="none" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
          <path d="M110 50 Q 140 70, 130 100" fill="none" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
        </svg>

        <!-- Nozzle Data Overlays -->
        <div class="nozzle-box left">
          <div class="n-title">LEFT</div>
          <div class="n-stat">
            <span class="v">{{ left?.volume | number:'1.1-1' }}</span>
            <span class="u">M³</span>
          </div>
          <div class="n-rate">{{ left?.throughput | number:'1.0-0' }} <small>H</small></div>
        </div>

        <div class="nozzle-box right">
          <div class="n-title">RIGHT</div>
          <div class="n-stat">
            <span class="v">{{ right?.volume | number:'1.1-1' }}</span>
            <span class="u">M³</span>
          </div>
          <div class="n-rate">{{ right?.throughput | number:'1.0-0' }} <small>H</small></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .disp-illustration-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.75rem;
      position: relative;
    }
    .illustration-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      .d-name { font-size: 0.65rem; font-weight: 800; color: #94a3b8; }
      .status-indicator {
        width: 6px; height: 6px; border-radius: 50%; background: #cbd5e1;
        &.online { background: #10b981; box-shadow: 0 0 5px #10b981; }
      }
    }
    .main-graphic-area {
      height: 100px;
      position: relative;
      display: flex;
      justify-content: center;
      .disp-svg { height: 100%; width: auto; }
    }
    .nozzle-box {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      &.left { left: 0; align-items: flex-start; }
      &.right { right: 0; align-items: flex-end; }

      .n-title { font-size: 0.5rem; font-weight: 900; color: #64748b; }
      .n-stat {
        display: flex; align-items: baseline; gap: 2px;
        .v { font-size: 0.9rem; font-weight: 900; color: #1e293b; }
        .u { font-size: 0.5rem; color: #94a3b8; }
      }
      .n-rate { font-size: 0.6rem; font-weight: 700; color: #3b82f6; }
    }
  `]
})
export class DispenserIconComponent {
  @Input() name: string = 'Dispenser';
  @Input() status: string = 'Offline';
  @Input() left: any;
  @Input() right: any;
}

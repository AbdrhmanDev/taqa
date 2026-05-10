import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'scada-compressor-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="comp-data-card">
      <div class="card-title">COMPRESSOR STATUS</div>
      
      <div class="stages-grid">
        <div class="stage-item" *ngFor="let stage of (stages || []); let i = index">
          <div class="stage-header">STAGE {{ i + 1 }}</div>
          <div class="stage-values">
            <div class="v-group">
              <span class="label">PRESS</span>
              <span class="val blue">{{ stage.pressure | number:'1.1-1' }}</span>
              <span class="unit">BAR</span>
            </div>
            <div class="v-group">
              <span class="label">TEMP</span>
              <span class="val orange">{{ stage.temperature | number:'1.0-0' }}</span>
              <span class="unit">°C</span>
            </div>
          </div>
        </div>
      </div>

      <div class="comp-footer-data">
        <div class="f-item">
          <span class="fl">OIL PRESSURE</span>
          <span class="fv">{{ oilPressure | number:'1.1-1' }} PSI</span>
        </div>
        <div class="f-item">
          <span class="fl">VIBRATION</span>
          <span class="fv" [class.danger]="vibration > 70">{{ vibration }} MM/S</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comp-data-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      color: #1e293b;
    }
    .card-title {
      font-size: 0.75rem;
      font-weight: 900;
      color: #64748b;
      margin-bottom: 0.75rem;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }
    .stages-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    .stage-item {
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
      padding: 0.6rem;
    }
    .stage-header {
      font-size: 0.6rem;
      font-weight: 800;
      color: #94a3b8;
      margin-bottom: 0.4rem;
    }
    .stage-values {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .v-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      .label { font-size: 0.5rem; font-weight: 700; color: #94a3b8; width: 30px; }
      .val { font-size: 0.875rem; font-weight: 900; }
      .val.blue { color: #3b82f6; }
      .val.orange { color: #f59e0b; }
      .unit { font-size: 0.55rem; color: #94a3b8; }
    }
    .comp-footer-data {
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px dashed #e2e8f0;
      .f-item {
        display: flex;
        flex-direction: column;
        .fl { font-size: 0.55rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
        .fv { font-size: 0.8rem; font-weight: 900; color: #475569; }
        .fv.danger { color: #ef4444; }
      }
    }
  `]
})
export class CompressorIconComponent {
  @Input() vibration: number = 0;
  @Input() oilPressure: number = 0;
  @Input() status: string = 'Idle';
  @Input() stages: any[] = [];
}

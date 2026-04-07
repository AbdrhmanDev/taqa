import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '450px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      styleClass="nice-confirm-dialog"
    >
      <div class="confirm-content">
        <div class="icon-container" [ngClass]="severity">
          <i [class]="icon"></i>
        </div>
        <div class="text-content">
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
        </div>
      </div>
      <ng-template #footer>
        <div class="dialog-actions">
          <button class="btn-cancel" (click)="onCancel()">{{ cancelLabel }}</button>
          <button class="btn-confirm" [ngClass]="severity" (click)="onConfirm()">{{ confirmLabel }}</button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .nice-confirm-dialog {
      .p-dialog-header { display: none; }
      .p-dialog-content { padding: 32px 24px 24px; border-radius: 16px; }
      .p-dialog-footer { border: none; padding: 0 24px 24px; }
    }

    .confirm-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 20px;

      .icon-container {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        
        &.danger { background: #fef2f2; color: #ef4444; }
        &.info { background: #eff6ff; color: #3b82f6; }
        &.success { background: #f0fdf4; color: #22c55e; }
      }

      .text-content {
        h3 { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
        p { font-size: 14px; color: #6b7280; margin: 8px 0 0; line-height: 1.5; }
      }
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      width: 100%;

      button {
        flex: 1;
        padding: 12px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
      }

      .btn-cancel {
        background: white;
        border-color: #e5e7eb;
        color: #374151;
        &:hover { background: #f9fafb; }
      }

      .btn-confirm {
        color: white;
        &.danger { background: #ef4444; &:hover { background: #dc2626; } }
        &.info { background: #3b82f6; &:hover { background: #2563eb; } }
        &.success { background: #22c55e; &:hover { background: #16a34a; } }
      }
    }
  `]
})
export class ConfirmDialog {
  @Input() visible: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() icon: string = 'pi pi-exclamation-triangle';
  @Input() severity: 'danger' | 'info' | 'success' = 'info';
  @Input() confirmLabel: string = 'Confirm';
  @Input() cancelLabel: string = 'Cancel';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() { this.confirm.emit(); this.visible = false; }
  onCancel() { this.cancel.emit(); this.visible = false; }
}

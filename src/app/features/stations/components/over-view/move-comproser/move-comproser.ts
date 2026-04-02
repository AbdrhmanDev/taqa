import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-move-comproser',
  imports: [DialogModule, SelectModule, FormsModule, CommonModule],
  templateUrl: './move-comproser.html',
  styleUrl: './move-comproser.scss',
})
export class MoveComproser {
  @Input() visible = false;
  @Input() compressor: any;
  @Input() currentStationName: string = ''; 
  @Input() assets: any[] = [];

  selectedAsset: any = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onConfirmMove = new EventEmitter<any>();

  close() {
    this.visibleChange.emit(false);
    this.selectedAsset = null;
  }

  moveCompressor() {
    if (this.selectedAsset && this.compressor) {
      this.onConfirmMove.emit({
        compressor: this.compressor,
        targetAsset: this.selectedAsset
      });
      this.visibleChange.emit(false);
      this.selectedAsset = null;
    }
  }
}

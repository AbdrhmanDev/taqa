import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-comproser',
  imports: [CommonModule, DialogModule, SelectModule, FormsModule],
  templateUrl: './add-comproser.html',
  styleUrl: './add-comproser.scss',
})
export class AddComproser {
  @Input() visible = false;
  @Input() availableCompressors: any[] = [];
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onConfirmLink = new EventEmitter<any>();

  selectedCompressor: any = null;

  confirmLink() {
    if (this.selectedCompressor) {
      this.onConfirmLink.emit(this.selectedCompressor);
      this.visibleChange.emit(false);
      this.selectedCompressor = null;
    }
  }

  close() {
    this.visibleChange.emit(false);
    this.selectedCompressor = null;
  }
}

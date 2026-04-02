import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unlink-comproser',
  imports: [SelectModule, DialogModule, FormsModule, CommonModule],
  templateUrl: './unlink-comproser.html',
  styleUrl: './unlink-comproser.scss',
})
export class UnlinkComproser {
  @Input() visible!: boolean;
  @Input() compressor: any;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onConfirmUnlink = new EventEmitter<any>();
  confirmUnlink() {
    this.onConfirmUnlink.emit(this.compressor);
    this.visibleChange.emit(false);
  }
  close() {
    this.visibleChange.emit(false);
  }

  showDialog() {
    this.visible = true;
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-unlink-comproser',
  imports: [SelectModule, DialogModule, FormsModule],
  templateUrl: './unlink-comproser.html',
  styleUrl: './unlink-comproser.scss',
})
export class UnlinkComproser {
  @Input() visible!: boolean;

  @Output() visibleChange = new EventEmitter<boolean>();
  confirmUnlink() {
    // unlink logic here
    this.visibleChange.emit(false);
  }
  close() {
    this.visibleChange.emit(false);
  }

  showDialog() {
    this.visible = true;
  }
}

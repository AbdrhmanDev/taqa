import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-move-comproser',
  imports: [DialogModule, SelectModule, FormsModule],
  templateUrl: './move-comproser.html',
  styleUrl: './move-comproser.scss',
})
export class MoveComproser {
  @Input() visible!: boolean;
  selectedStation: string = '';
  @Output() visibleChange = new EventEmitter<boolean>();
  stations = [
    { label: 'Station A', value: 'station_a' },
    { label: 'Station B', value: 'station_b' },
    { label: 'Station C', value: 'station_c' },
  ];
  close() {
    this.visibleChange.emit(false);
  }

  showDialog() {
    this.visible = true;
  }
  moveCompressor() {
    // logic here
    this.visibleChange.emit(false);
  }
}

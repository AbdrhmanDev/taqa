import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-edit-user',
  imports: [DialogModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.scss',
})
export class EditUser {
  visible: boolean = false;
  @Output() close = new EventEmitter<void>();
  userType = [
    { label: 'Admin', value: 'Admin' },
    { label: 'User', value: 'User' },
  ];
  showDialog() {
    this.visible = true;
  }
  closePopup() {
    this.close.emit();
  }

  save() {
    // save logic
    this.close.emit();
  }
}

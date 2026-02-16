import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-delete',
  imports: [],
  templateUrl: './delete.html',
  styleUrl: './delete.scss',
})
export class Delete implements OnInit {
  showdeletePopup = false;
  constructor() {}
  ngOnInit(): void {}
  @Output() close = new EventEmitter<void>();
  closePopup() {
    this.close.emit();
  }
}

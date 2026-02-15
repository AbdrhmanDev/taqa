import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { User } from '../../services/user';
import { MessageService } from 'primeng/api';
import { Role } from '../../services/role';
@Component({
  selector: 'app-delete-user',
  imports: [ButtonModule],
  templateUrl: './delete-user.html',
  styleUrl: './delete-user.scss',
})
export class DeleteUser implements OnInit {
  @Input() userId!: number;
  @Input() roleName!: string;
  @Output() deletedUser = new EventEmitter<void>();
  @Output() deletedRole = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  showdeletePopup: boolean = false;
  @Input() userData: any;

  constructor(
    private user: User,
    private messageService: MessageService,
    private Role: Role,
  ) {}
  ngOnInit(): void {}
  onDeleteUser() {
    this.user.deleteUser(this.userId).subscribe({
      next: (res) => {
        console.log(res);
        this.showSuccess('Role deleted successfully');
        this.deletedUser.emit();
        this.close.emit();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onDeleteRole() {
    this.Role.deleteRole(this.roleName).subscribe({
      next: (res) => {
        console.log(res);
        this.showSuccess('Role deleted successfully');
        this.deletedRole.emit();
        this.close.emit();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 2000,
    });
  }

  closePopup() {
    this.close.emit();
  }
}

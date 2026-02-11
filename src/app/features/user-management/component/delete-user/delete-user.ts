import { Component, Input, OnInit } from '@angular/core';
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
        this.showSuccess();
      },
      error: (err) => {
        console.log(err);
        this.showError();
      },
    });
  }
  onDeleteRole() {
    debugger;
    this.Role.deleteRole(this.roleName).subscribe({
      next: (res) => {
        console.log(res);
        this.showSuccess();
      },
      error: (err) => {
        console.log(err);
        this.showError();
      },
    });
  }
  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User deleted successfully',
      life: 2000,
    });
  }
  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Failed delete User',
      detail: 'Message Content',
      life: 2000,
    });
  }
}

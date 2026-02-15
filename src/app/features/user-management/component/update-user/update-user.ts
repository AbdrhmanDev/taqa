import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Role } from '../../services/role';
import { User } from '../../services/user';
import { IRoles } from '../../models/iroles';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IUser } from '../../models/iuser';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-update-user',
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './update-user.html',
  styleUrl: './update-user.scss',
})
export class UpdateUser implements OnInit {
  allRoles: IRoles[] | any;
  allUsers: IUser | any;
  userRole!: string;
  showEditPopup = false;
  @Output() close = new EventEmitter<void>();
  @Input() userData: any;

  @Output() updatedUser = new EventEmitter<void>();
  constructor(
    private _Role: Role,
    private _User: User,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.onGetAllRoles();
  }
  editUserForm = new FormGroup({
    userId: new FormControl('', Validators.required),
    roleName: new FormControl('', Validators.required),
  });
  save() {
    const formValue = this.editUserForm.value;
    const payload = {
      userId: formValue.userId,
      role: formValue.roleName,
    };
    this._User.editUserRole(payload).subscribe({
      next: () => {
        this.updatedUser.emit();
        this.close.emit();
        this.showSuccess('User Updated Successfully');
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  ngOnChanges(): void {
    if (this.userData) {
      this.editUserForm.patchValue({
        userId: this.userData.id,
        roleName: this.userData.roleName,
      });
    }
  }
  onGetAllUsers() {
    this._User.getAllUsers().subscribe({
      next: (res) => {
        this.allUsers = res;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onGetAllRoles() {
    this._Role.getAllRoles().subscribe({
      next: (res) => {
        this.allRoles = res;
        if (this.userData) {
          this.editUserForm.patchValue({
            roleName: this.userData.roleName,
          });
        }
        // this.cd.detectChanges();
        console.log(res);
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

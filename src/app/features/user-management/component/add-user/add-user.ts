import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { User } from '../../services/user';
import { Role } from '../../services/role';
import { IRoles } from '../../models/iroles';
@Component({
  selector: 'app-add-user',
  imports: [EditorModule, FileUploadModule, SelectModule, ReactiveFormsModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.scss',
})
export class AddUser implements OnInit {
  allRoles: any;
  constructor(
    private _User: User,
    private messageService: MessageService,
    private _Role: Role,
  ) {}
  ngOnInit(): void {
    this.onGetAllRoles();
  }
  addUserForm = new FormGroup({
    roleName: new FormControl('', Validators.required),
    userName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')]),
    password: new FormControl('', Validators.required),
  });

  onAddUser() {
    this._User.addUser(this.addUserForm.value).subscribe({
      next: (res) => {
        console.log(res);
        this.showSuccess('Add User Successfully');
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
        console.log(res);
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
}

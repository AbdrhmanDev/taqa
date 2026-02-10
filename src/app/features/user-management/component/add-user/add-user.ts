import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { User } from '../../services/user';
@Component({
  selector: 'app-add-user',
  imports: [EditorModule, FileUploadModule, SelectModule, ReactiveFormsModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.scss',
})
export class AddUser implements OnInit {
  userType = [
    { label: 'Admin', value: 'Admin' },
    { label: 'User', value: 'User' },
  ];
  constructor(
    private _User: User,
    private messageService: MessageService,
  ) {}
  ngOnInit(): void {}
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
        this.showSuccess();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Add USer is Success',
      life: 2000,
    });
  }
  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Failed Add User',
      detail: 'Message Content',
      life: 2000,
    });
  }
}

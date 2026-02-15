import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { User } from '../../services/user';
import { Role } from '../../services/role';
import { Area, Claim, IRoles } from '../../models/iroles';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-edit-user',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.scss',
})
export class EditUser implements OnInit {
  visible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  allRoles: IRoles[] | any;
  @Input() roleData: any;
  allClaims: Claim[] = [];

  allZones: Area[] = [];
  constructor(
    private _user: User,
    private Role: Role,
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
  ) {}
  ngOnInit(): void {}
  editRoleForm = new FormGroup({
    roleName: new FormControl('', Validators.required),
    claims: new FormControl([]),
    zones: new FormControl([]),
  });
  ngOnChanges() {
    if (this.roleData) {
      this.onGetAllClaims();
      this.onGetAllZones();
      this.editRoleForm.patchValue({
        roleName: this.roleData.roleName,
        claims: this.roleData.claims.map((c: any) => c.value),
        zones: this.roleData.areas.map((a: any) => a.zoneId),
      });
    }
  }
  save() {
    const formValue = this.editRoleForm.value;
    const payload = {
      roleName: formValue.roleName,
      claims: (formValue.claims ?? []).map((c: any) => ({ type: 'Permission', value: c })),
      zones: formValue.zones,
    };
    this.Role.editRole(payload).subscribe({
      next: (res) => {
        console.log(res);
        this.close.emit();
        this.showSuccess('Edit Role successfully');
        this.updated.emit();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onGetAllClaims() {
    this.Role.getAllClaims().subscribe({
      next: (res: any) => {
        this.allClaims = res.data;
        //wait allClaims reload to patch
        if (this.roleData) {
          this.editRoleForm.patchValue({
            claims: this.roleData.claims.map((c: any) => c.value),
          });
        }
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onGetAllZones() {
    this.Role.getAllZones().subscribe({
      next: (res: any) => {
        this.allZones = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onGetAllRoles() {
    this.Role.getAllRoles().subscribe({
      next: (res) => {
        this.allRoles = res;
        this.cd.detectChanges();
        console.log(res);
      },
    });
  }
  showDialog() {
    this.visible = true;
  }
  closePopup() {
    this.close.emit();
  }

  saveData() {
    this.close.emit();
  }
  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 2000,
    });
  }
  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Failed Update Role',
      detail: 'Message Content',
      life: 2000,
    });
  }
}

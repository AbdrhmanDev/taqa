import { Area, Claim, Roles } from './../../models/iroles';
import { Component, Input, OnInit } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { EditorModule } from 'primeng/editor';
import { IRoles } from '../../models/iroles';
import { MultiSelectModule } from 'primeng/multiselect';
import { Role } from '../../services/role';
import { FormsModule } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-add-role',
  imports: [SelectModule, EditorModule, ReactiveFormsModule, MultiSelectModule, FormsModule],
  templateUrl: './add-role.html',
  styleUrl: './add-role.scss',
})
export class AddRole implements OnInit {
  allClaims: Claim[] = [];
  allAreas: Area[] = [];
  allZones: Area[] = [];
  selectedZones: any;
  selectedClaim: any;
  constructor(
    private _Role: Role,
    private messageService: MessageService,
  ) {}
  ngOnInit(): void {
    this.onGetAllClaims();
    this.onGetAllZones();
    this.onGetAllAreas();
  }
  addRoleForm = new FormGroup({
    roleName: new FormControl('', Validators.required),
    claims: new FormControl([], Validators.required),
    zoneIds: new FormControl([], Validators.required),
    areaIds: new FormControl([], Validators.required),
  });
  onAddRole() {
    const formValue = this.addRoleForm.value;

    const payload = {
      roleName: formValue.roleName,
      claims: (formValue.claims ?? []).map((c: any) => ({
        type: 'Permission',
        value: c.claimName,
      })),
      zoneIds: formValue.zoneIds,
      areaIds: formValue.areaIds,
    };
    console.log(payload);
    this._Role.addRole(payload).subscribe({
      next: (res) => {
        console.log(res);
        this.showSuccess('Add Role Successfully');
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onGetAllAreas() {
    this._Role.getAllAreas().subscribe({
      next: (res: any) => {
        this.allAreas = res;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onGetAllClaims() {
    this._Role.getAllClaims().subscribe({
      next: (res: any) => {
        this.allClaims = res.data;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onGetAllZones() {
    this._Role.getAllZones().subscribe({
      next: (res: any) => {
        this.allZones = res;
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

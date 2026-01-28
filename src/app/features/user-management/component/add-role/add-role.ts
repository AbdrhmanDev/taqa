import { Component } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { EditorModule } from 'primeng/editor';
@Component({
  selector: 'app-add-role',
  imports: [SelectModule, EditorModule],
  templateUrl: './add-role.html',
  styleUrl: './add-role.scss',
})
export class AddRole {}

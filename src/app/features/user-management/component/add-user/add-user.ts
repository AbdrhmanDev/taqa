import { Component } from '@angular/core';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-add-user',
  imports: [EditorModule, FileUploadModule, SelectModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.scss',
})
export class AddUser {}

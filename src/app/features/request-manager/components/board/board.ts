import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-board',
  imports: [SelectModule, FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {

}

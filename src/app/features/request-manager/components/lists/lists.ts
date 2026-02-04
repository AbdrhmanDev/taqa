import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { Board } from "../board/board";
import { History } from "../history/history";
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-lists',
  imports: [TabsModule, CommonModule, Board, History, AutoCompleteModule, FormsModule, SelectModule,TableModule],
  templateUrl: './lists.html',
  styleUrl: './lists.scss',
})
export class Lists {
list = [
    {
      Date: 'Jan 6, 2026',

      description: 'Dispenser',
      station: 'CID_66',
      status: 'Solved',
    },
      {
      Date: 'Jan 8, 2026',

      description: 'Compressor',
      station: 'CID_56',
      status: 'Reassign',
    },
      {
      Date: 'Jan 9, 2026',

      description: 'Dispenser',
      station: 'CID_46',
      status: 'In progress',
    },
  ];
}

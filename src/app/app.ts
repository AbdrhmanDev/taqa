import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { Sidebar } from './shared/sidebar/component/sidebar/sidebar';
import { Navbar } from './shared/navbar/component/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('Taqa');
  ngOnInit(): void {
    initFlowbite();
  }
}

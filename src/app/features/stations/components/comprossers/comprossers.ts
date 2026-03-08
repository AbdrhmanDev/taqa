import { Component, OnInit } from '@angular/core';
import { ComproserDetails } from './comproser-details/comproser-details';
import { Router } from '@angular/router';
@Component({
  selector: 'app-comprossers',
  imports: [ComproserDetails],
  templateUrl: './comprossers.html',
  styleUrl: './comprossers.scss',
})
export class Comprossers implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }
  goToDetails() {
    this.router.navigate(['/dashboard/comproser-details']);
  }
}

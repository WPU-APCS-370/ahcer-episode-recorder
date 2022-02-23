import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  displayedColumns: any;
  episodes = [
    {
    startDate: '12/12/22',
    time: '12:20 PM'
   }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}

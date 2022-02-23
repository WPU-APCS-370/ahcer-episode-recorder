import { Component, OnInit } from '@angular/core';

export interface Episode {
  time: string;
  date: string;
  link: string
}

const ELEMENT_DATA: Episode[] = [
  {time: '18:00', date: '12/18/22', link: `detail` },
  {time: '14:00', date: '12/14/22',link: `detail` },
  {time: '10:00', date: '12/12/22',link: `detail` },
  {time: '08:00', date: '12/11/22',link: `detail` },
  {time: '23:00', date: '12/10/22',link: `detail` }
];
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  displayedColumns: string[] = ['time', 'date'];
  dataSource = ELEMENT_DATA;


  constructor() { }

  ngOnInit(): void {
  }

}

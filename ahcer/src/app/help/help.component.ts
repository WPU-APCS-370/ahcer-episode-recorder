import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  videoWidth: number = 350;
  videoHeight: number = 1600/2560 * this.videoWidth;

  constructor() { }

  ngOnInit(): void {
  }

}

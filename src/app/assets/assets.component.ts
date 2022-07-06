import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styles: [':host{height: 100%;width: 100%;overflow: auto}']
})
export class AssetsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

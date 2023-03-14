import { Component, OnInit } from '@angular/core';
import {StockTakingListProvider} from './stockTakingListProvider';

@Component({
  selector: 'app-stock-taking-list',
  templateUrl: './stock-taking-list.component.html',
  styleUrls: ['./stock-taking-list.component.scss']
})
export class StockTakingListComponent implements OnInit {

  constructor(
    private stockTakingService: StockTakingListProvider
  ) { }

  ngOnInit(): void {
  }

}

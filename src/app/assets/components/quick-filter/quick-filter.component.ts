import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, RoutesRecognized} from '@angular/router';
import {noop, OperatorFunction, Subject, switchMap} from 'rxjs';
import {AssetsService} from '../../assets.service';
import {AgGridInstanceService} from '../../../utils/agGrid/ag-grid-instance.service';
import {AgGridService} from '../../../utils/agGrid/ag-grid.service';
import {filter, takeUntil} from 'rxjs/operators';
import {GridInstance} from '../../../utils/agGrid/models/grid.model';

@Component({
  selector: 'app-quick-filter',
  templateUrl: './quick-filter.component.html',
  styleUrls: ['./quick-filter.component.scss']
})
export class QuickFilterComponent implements OnInit, OnDestroy {
  url!: string;
  filter: string = '';
  gridService!: AgGridService;
  unsubscribe: Subject<void> = new Subject<void>()

  constructor(private router: Router, private assetsService: AssetsService, private agGridInstanceService: AgGridInstanceService) {
  }

  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  ngOnInit(): void {
    this.agGridInstanceService.getGridInstance('assetList')
      .pipe(
        filter(e => !!e) as OperatorFunction<GridInstance | undefined, GridInstance>,
        switchMap(instance => {
          this.gridService = instance.gridService
          return this.router.events;
        }),
        takeUntil(this.unsubscribe)
      )
    .subscribe((data) => {
      if (data instanceof RoutesRecognized) {
        if (!this.url) {
          setTimeout(() => {
            this.url = data.url;
          });
        } else {
          this.url = data.url;
        }
      }
    });
  }


  quickFilterChanged($event: any): void {
    this.assetsService.setQuickFilter($event.target.value);
    if (this.url !== '/assets') {
      this.router.navigate(['/assets']).then(noop);
    }
  }

  switchMode(): void {
    // this.gridService.setAssetsSearchMode();
  }
}

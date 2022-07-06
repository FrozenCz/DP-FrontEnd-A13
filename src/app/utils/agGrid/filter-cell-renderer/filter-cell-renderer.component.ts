import {Component, OnDestroy} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {IAfterGuiAttachedParams, ICellRendererParams} from 'ag-grid-community';
import {Observable, Subject} from 'rxjs';
import {filter, shareReplay, takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-filter-cell-renderer',
  templateUrl: './filter-cell-renderer.component.html',
  styleUrls: ['./filter-cell-renderer.component.scss']
})
export class FilterCellRendererComponent implements ICellRendererAngularComp, OnDestroy {
  displayedValue = null;
  filter$!: Observable<string[]>;
  unsubscribe: Subject<boolean> = new Subject<boolean>();

  filteredStrings = [];

  afterGuiAttached(params?: IAfterGuiAttachedParams): void {
  }

  agInit(params: ICellRendererParams | any): void {
    this.displayedValue = params.value;
    this.filter$ = params.context.filter;
    this.filter$.pipe(
      takeUntil(this.unsubscribe),
      filter(rel => !!rel && rel.length > 0), shareReplay()).subscribe((filterParts) => {
      this.renderValue(params, filterParts);
    });
  }

  refresh(params: any): boolean {
    return false;
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
  }

  private renderValue(params: ICellRendererParams, filterParts: string[]): void {
    if (params.value) {
      let val = params.value.toString();
      const filteredParts = filterParts;
      if (filteredParts) {
        for (const mask of filteredParts) {
          const regex = new RegExp(mask, 'ig');
          const oldValPos = val.search(regex);
          val = val.replace(regex, '<mark>' + val.substr(oldValPos, mask.length) + '</mark>');
        }
      }
      this.displayedValue = val;
    }
  }

}

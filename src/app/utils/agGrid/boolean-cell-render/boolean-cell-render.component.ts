import {Component, ElementRef, ViewChild} from '@angular/core';
import {IAfterGuiAttachedParams, ICellRendererComp, ICellRendererParams} from 'ag-grid-community';

@Component({
  selector: 'app-boolean-cell-render',
  templateUrl: './boolean-cell-render.component.html',
  styleUrls: ['./boolean-cell-render.component.scss']
})
export class BooleanCellRenderComponent implements ICellRendererComp {
  icon: 'checkmark-circle-outline' | 'radio-button-off-outline' = 'radio-button-off-outline';
  status: 'success' | 'basic' = 'basic';
  @ViewChild('selfRef') selfRef!: ElementRef;

  constructor() { }

  agInit(params: ICellRendererParams): void {
    this.icon = params.value ? 'checkmark-circle-outline' : 'radio-button-off-outline';
    this.status = params.value ? 'success' : 'basic';
  }

  afterGuiAttached(params?: IAfterGuiAttachedParams): void {
  }

  destroy(): void {
  }

  getGui(): HTMLElement {
    return this.selfRef.nativeElement;
  }

  refresh(params: any): boolean {
    return false;
  }


}

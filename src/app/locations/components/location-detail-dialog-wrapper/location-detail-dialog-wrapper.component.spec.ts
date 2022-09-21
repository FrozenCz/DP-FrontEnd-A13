import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationDetailDialogWrapperComponent } from './location-detail-dialog-wrapper.component';

describe('LocatioDetailDialogWrapperComponent', () => {
  let component: LocationDetailDialogWrapperComponent;
  let fixture: ComponentFixture<LocationDetailDialogWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationDetailDialogWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationDetailDialogWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationDetailWrapperComponent } from './location-detail-wrapper.component';

describe('LocatioDetailDialogWrapperComponent', () => {
  let component: LocationDetailWrapperComponent;
  let fixture: ComponentFixture<LocationDetailWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationDetailWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationDetailWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

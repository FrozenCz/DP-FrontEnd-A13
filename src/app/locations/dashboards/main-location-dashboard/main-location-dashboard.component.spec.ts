import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLocationDashboardComponent } from './main-location-dashboard.component';

describe('MainLocationDashboardComponent', () => {
  let component: MainLocationDashboardComponent;
  let fixture: ComponentFixture<MainLocationDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainLocationDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainLocationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

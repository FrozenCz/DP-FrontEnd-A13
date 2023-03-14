import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTakingDetailComponent } from './stock-taking-detail.component';

describe('StockTakingDetailComponent', () => {
  let component: StockTakingDetailComponent;
  let fixture: ComponentFixture<StockTakingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockTakingDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockTakingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

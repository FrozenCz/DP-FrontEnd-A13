import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTakingListComponent } from './stock-taking-list.component';

describe('StockTakingListComponent', () => {
  let component: StockTakingListComponent;
  let fixture: ComponentFixture<StockTakingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockTakingListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockTakingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

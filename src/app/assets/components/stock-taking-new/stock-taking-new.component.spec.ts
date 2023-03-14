import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTakingNewComponent } from './stock-taking-new.component';

describe('StockTakingNewComponent', () => {
  let component: StockTakingNewComponent;
  let fixture: ComponentFixture<StockTakingNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockTakingNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockTakingNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

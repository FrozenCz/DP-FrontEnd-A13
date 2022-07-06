import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {UsersService} from './users/users.service';
import {DialogService} from './services/dialog.service';
import {UnitsService} from './units/units.service';
import {AgGridInstanceService} from './utils/agGrid/ag-grid-instance.service';
import {WebsocketService} from './services/websocket.service';
import {NbIconModule} from '@nebular/theme';

const mockProviders = () => ({});

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NbIconModule,
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        {provide: UsersService, useFactory: mockProviders},
        {provide: DialogService, useFactory: mockProviders},
        {provide: UnitsService, useFactory: mockProviders},
        {provide: AgGridInstanceService, useFactory: mockProviders},
        {provide: WebsocketService, useFactory: mockProviders},
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'bpProjekt-Frontend'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('bpProjekt-Frontend');
  });
});

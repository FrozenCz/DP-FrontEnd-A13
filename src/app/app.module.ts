import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeCs from '@angular/common/locales/cs';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthModule} from './auth/auth.module';
import {NavigationComponent} from './components/navigation/navigation.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  NbThemeModule,
  NbLayoutModule,
  NbButtonModule,
  NbTabsetModule,
  NbCardModule,
  NbIconModule,
  NbAlertModule,
  NbWindowModule,
  NbBadgeModule,
  NbInputModule,
  NbFormFieldModule,
  NbCheckboxModule,
  NbSidebarModule, NbSearchModule, NbDialogModule, NbToastrModule,
} from '@nebular/theme';
import {NbEvaIconsModule} from '@nebular/eva-icons';
import {FlexModule} from '@angular/flex-layout';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {UsersModule} from './users/users.module';
import {AuthInterceptor} from './auth/auth.interceptor';
import {CategoriesModule} from './categories/categories.module';
import { BooleanCellRenderComponent } from './utils/agGrid/boolean-cell-render/boolean-cell-render.component';
import {AssetsModule} from './assets/assets.module';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ThemeSelectorComponent } from './components/theme-selector/theme-selector.component';
import { FilterCellRendererComponent } from './utils/agGrid/filter-cell-renderer/filter-cell-renderer.component';
import { PredefinedViewsComponent } from './utils/agGrid/predefined-views/predefined-views.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProtocolsModule} from './protocols/protocols.module';
import { SectionWorkingListComponent } from './components/navigation/sections/section-working-list/section-working-list.component';
import {HowToComponent} from './components/how-to/how-to.component';
import {FilterPipe} from './pipes/filter.pipe';
import {VgBufferingModule, VgControlsModule, VgCoreModule, VgOverlayPlayModule} from 'ngx-videogular';

registerLocaleData(localeCs, 'cs');

@NgModule({
    declarations: [
        AppComponent,
        NavigationComponent,
        BooleanCellRenderComponent,
        PageNotFoundComponent,
        ThemeSelectorComponent,
        FilterCellRendererComponent,
        PredefinedViewsComponent,
        SectionWorkingListComponent,
      HowToComponent,
      FilterPipe
    ],
  imports: [
    AppRoutingModule,
    AuthModule,
    BrowserAnimationsModule,
    BrowserModule,
    FlexModule,
    HttpClientModule,
    NbButtonModule,
    NbCardModule,
    NbEvaIconsModule,
    NbIconModule,
    NbLayoutModule,
    NbTabsetModule,
    NbThemeModule.forRoot({name: 'dark-bp'}),
    UsersModule,
    CategoriesModule,
    AssetsModule,
    NbAlertModule,
    NbWindowModule.forRoot(),
    NbDialogModule.forRoot(),
    NbToastrModule.forRoot(),
    NbBadgeModule,
    NbInputModule,
    NbFormFieldModule,
    NbCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    NbSidebarModule.forRoot(),
    ProtocolsModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    NbSearchModule
  ],
    providers: [
        {
            provide: LOCALE_ID,
            useValue: 'cs'
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

import {NgModule} from '@angular/core';
import {SideNavComponent} from './components/side-nav/side-nav.component';
import {ToolbarComponent} from './components/toolbar/toolbar.component';
import {RibbonComponent} from './components/navigation/ribbon.component';
import {
  SectionWorkingListComponent
} from './components/navigation/sections/section-working-list/section-working-list.component';
import {FlexModule} from '@angular/flex-layout';
import {
    NbBadgeModule,
    NbButtonModule, NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule, NbTabsetModule,
    NbToggleModule
} from '@nebular/theme';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthModule} from '../../auth/auth.module';
import {ThemeSelectorComponent} from './components/theme-selector/theme-selector.component';

@NgModule({
  declarations: [SideNavComponent, ToolbarComponent, RibbonComponent, SectionWorkingListComponent, ThemeSelectorComponent],
  exports: [
    SideNavComponent,
    ToolbarComponent,
    RibbonComponent
  ],
    imports: [
        CommonModule,
        FlexModule,
        NbIconModule,
        NbInputModule,
        NbButtonModule,
        NbBadgeModule,
        NbSelectModule,
        NbToggleModule,
        RouterModule,
        AuthModule,
        NbTabsetModule,
        NbFormFieldModule
    ],
  providers: []
})
export class NavigationModule {
}

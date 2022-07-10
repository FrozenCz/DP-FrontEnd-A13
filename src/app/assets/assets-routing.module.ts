import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AssetsComponent} from './assets.component';
import {AssetDetailSinglePageWrapperComponent} from './components/asset-detail-single-page-wrapper/asset-detail-single-page-wrapper.component';
import {AssetsDashboardComponent} from './dashboards/assets-dashboard/assets-dashboard.component';

const routes: Routes = [
      {path: '', component: AssetsComponent, children: [
          {path: '', component: AssetsDashboardComponent},
          {path: 'detail/:id', component: AssetDetailSinglePageWrapperComponent}
        ]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AssetsRoutingModule {
}

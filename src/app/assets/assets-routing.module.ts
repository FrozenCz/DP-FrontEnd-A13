import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AssetsListComponent} from './components/assets-list/assets-list.component';
import {AssetsComponent} from './assets.component';
import {AssetDetailSinglePageWrapperComponent} from './components/asset-detail-single-page-wrapper/asset-detail-single-page-wrapper.component';

const routes: Routes = [
      {path: '', component: AssetsComponent, children: [
          {path: '', component: AssetsListComponent},
          {path: 'detail/:id', component: AssetDetailSinglePageWrapperComponent}
        ]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AssetsRoutingModule {
}

import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {HowToComponent} from './components/how-to/how-to.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: HowToComponent},
  {
    path: 'units',
    loadChildren: () => import ('./units/units.module').then(m => m.UnitsModule)
  },
  {
    path: 'lists',
    loadChildren: () => import('./lists/lists.module').then(m => m.ListsModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule)
  },
  {
    path: 'assets',
    loadChildren: () => import('./assets/assets.module').then(m => m.AssetsModule)
  },
  {
    path: 'locations',
    loadChildren: () => import('./locations/locations.module').then(m => m.LocationsModule)
  },
  {
    path: 'history',
    loadChildren: () => import('./history/history.module').then(m => m.HistoryModule)
  },
  {
    path: 'protocols',
    data: {protocols: true},
    loadChildren: () => import('./protocols/protocols.module').then(m => m.ProtocolsModule)
  },
  {path: '**', component: PageNotFoundComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

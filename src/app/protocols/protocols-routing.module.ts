
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProtocolsComponent} from './protocols.component';

const routes: Routes = [
  {path: ':protocolType/:userId', component: ProtocolsComponent},
  {path: ':protocolType', component: ProtocolsComponent, children: [
    ]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ProtocolsRoutingModule {

}

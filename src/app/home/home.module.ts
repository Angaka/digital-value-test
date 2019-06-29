import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    HomeRoutingModule,
    ChartsModule,
    SharedModule,
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }

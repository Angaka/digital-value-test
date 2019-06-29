import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { VolumeService } from './services/volume.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [
    HttpClientModule,
  ],
  providers: [
    VolumeService
  ],
})
export class CoreModule { }

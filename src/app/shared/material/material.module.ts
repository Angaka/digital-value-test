import { NgModule } from '@angular/core';

import { MatButtonModule, MatDatepickerModule, MatDividerModule, MatIconModule, MatCardModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTreeModule } from '@angular/material/tree';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [],
  exports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatTreeModule,
    MatDatepickerModule,
    MatDividerModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
  ],
})
export class MaterialModule { }

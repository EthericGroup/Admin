import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { CoinFormComponent } from './coin-form/coin-form.component';
import { CoinViewComponent } from './coin-view/coin-view.component';
import { CoinListComponent } from './coin-list/coin-list.component';

import { CoinService } from './services/coin.service';

const ROUTES:Routes = [
  {
    path: '', redirectTo: 'list', pathMatch:'full'
  },
  {
    path: 'list', component: CoinListComponent
  },
  {
    path: 'create', component: CoinFormComponent
  },
  {
    path: 'view/:coin', component: CoinViewComponent
  },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule
  ],
  declarations: [
    CoinFormComponent, 
    CoinViewComponent,
    CoinListComponent
  ],
  providers: [
    CoinService
  ]
})
export class CoinModule { }

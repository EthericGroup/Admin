import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CoinService } from '../services/coin.service';

@Component({
  selector: 'app-coin-list',
  templateUrl: './coin-list.component.html',
  styleUrls: ['./coin-list.component.scss']
})
export class CoinListComponent implements OnInit {

  coins = [];

  constructor(private coinService:CoinService, private router:Router) { }

  ngOnInit(){
    this.coinService.getAllCoins().valueChanges().subscribe((snap)=>{
      this.coins = snap;
    })
  }

  createCoin = () =>{
    this.router.navigate(['/coins/create']);
  }

  viewCoin = (coinId:string) =>{
    this.router.navigate(['/coins/view/'+coinId]);
  }



}

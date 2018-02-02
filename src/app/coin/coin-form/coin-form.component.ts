import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators , FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { CoinService } from '../services/coin.service';
@Component({
  selector: 'app-coin-form',
  templateUrl: './coin-form.component.html',
  styleUrls: ['./coin-form.component.scss']
})
export class CoinFormComponent implements OnInit {
  submitting:boolean = false;
  coinForm:FormGroup;

  constructor(private coinService:CoinService, private fb:FormBuilder,private router:Router) { 
    this.coinForm = fb.group({
      id: fb.control('',Validators.required),
      symbol: fb.control('',Validators.required),
      githubName: fb.control('',Validators.required)
    });
  }

  ngOnInit = () =>{

  }

  createCoin = () =>{
    this.submitting = true;
    var coin = {
      id: this.coinForm.controls['id'].value,
      symbol: this.coinForm.controls['symbol'].value,
      githubName: this.coinForm.controls['githubName'].value,
    }
    this.coinService.addCoin(coin)
    .then((obj)=>{
      this.submitting = false;
      this.router.navigate(['/coins/view/'+coin.id]);
    })
    .catch((e)=>{
      this.submitting = false;
    })
  }

}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { CoinService } from '../services/coin.service';

@Component({
  selector: 'app-coin-view',
  templateUrl: './coin-view.component.html',
  styleUrls: ['./coin-view.component.scss']
})
export class CoinViewComponent implements OnInit {

  coinId;
  coin;
  org;
  repos = [];
  members = [];

  constructor(private router:Router, private route:ActivatedRoute,private coinService:CoinService) { }

  ngOnInit() {
    this.route.params.forEach((params)=>{
      this.coinId = params['coin'];
      this.coinService.getCoin(this.coinId).valueChanges().subscribe((snap)=>{
        this.coin = snap;
      });
      this.coinService.getGithubOrg(this.coinId).valueChanges().subscribe((snap)=>{
        this.org = snap;
      });
      this.coinService.getGithubOrgRepos(this.coinId).valueChanges().subscribe((snap)=>{
        this.repos = snap;
      });
      this.coinService.getGithubOrgMembers(this.coinId).valueChanges().subscribe((snap)=>{
        this.members = snap;
      });

    });
  }

}

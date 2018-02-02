import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as firebase from 'firebase';

@Injectable()
export class CoinService {

  private coinsCollection: AngularFirestoreCollection<any>;
  private githubCollection: AngularFirestoreCollection<any>;

  constructor(private afs:AngularFirestore) { 
    this.coinsCollection = afs.collection<any>('coins');
    this.githubCollection = afs.collection<any>('github');
  }

  getAllCoins = () => {
    return this.coinsCollection;
  }

  getCoin = (coinId:string) => {
    return this.coinsCollection.doc(coinId);
  }

  getAllGithubOrg = () =>{
    return this.githubCollection.doc('organisations'); 
  }

  getGithubOrg = (coinId:string) => {
    return this.githubCollection.doc('organisations').collection(coinId).doc('information');
  }

  getGithubOrgRepos = (coinId:string) => {
    return this.githubCollection.doc('repos').collection(coinId);
  }

  getGithubOrgMembers = (coinId:string) => {
    return this.githubCollection.doc('organisations').collection(coinId).doc('members').collection('list');
  }

  addCoin = (coin:any) => {
    return this.coinsCollection.doc(coin.id).set(coin);
  }

  updateCoin = () => {

  }

  deleteCoin = () => {

  }

}

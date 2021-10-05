import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {delay, repeat, retryWhen, shareReplay} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class GameService {

  rootURL = 'http://127.0.0.1:8080/';
  joinURL =  this.rootURL + 'game/join/';
  gameURL =  this.rootURL + 'game/get/';
  startURL = this.rootURL + 'game/start/';
  playURL = this.rootURL + 'game/play/';
  resetURL = this.rootURL + 'game/reset/';

  MAX_PLAYERS = 3;
  hasJoinedGame = false;
  hasGameStarted = false;
  playerNo = 0;
  game:{[index: string]:any} = {};

  constructor(private httpClient: HttpClient) { }

  getGameRequest() {
    return this.httpClient.get(this.gameURL).pipe(
      // delay(5000),
      repeat(),
      shareReplay(),
      retryWhen(errors => {
        console.log(errors);
        this.reset();
        return errors.pipe(delay(10000));
      })
    );
  }

  makeJoinRequest() {
    return this.httpClient.post(this.joinURL, null);
  }

  makeStartRequest() {
    return this.httpClient.post(this.startURL, null);
  }

  makeResetGameRequest() {
    return this.httpClient.post(this.resetURL, null);
  }

  updatePlayerNo() {
    const playerNoString = localStorage.getItem('playerNo');
    if(playerNoString) {
      this.playerNo = +playerNoString;
      this.hasJoinedGame = true;
    }
  }

  reset() {
    localStorage.removeItem('playerNo');
    this.hasJoinedGame = false;
    this.hasGameStarted = false;
  }
}

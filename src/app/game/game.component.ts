import { Component, OnInit } from '@angular/core';
import {GameService} from "./game.service";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  game$ = this.gameService.getGameRequest();
  constructor(public gameService: GameService) { }

  ngOnInit(): void {
    const playerNoString = localStorage.getItem('playerNo');
    if(playerNoString) {
      this.gameService.playerNo = +playerNoString;
      this.gameService.hasJoinedGame = true;
    }
    this.game$.subscribe(response => {
      this.gameService.game = response;
    }, error => console.log(error));
  }

  joinGame(): void {
    this.gameService.makeJoinRequest().subscribe((response) => {
      this.gameService.game = response;
      const playerNoString = this.gameService.game['status'].split(" ")[1];
      if(!isNaN(+playerNoString)) {
        localStorage.setItem('playerNo', playerNoString);
        this.gameService.playerNo = +playerNoString;
        this.gameService.hasJoinedGame = true;
        console.log(this.gameService.game);
      }
    }, error => console.log(error));
  }

  startGame(): void {
    this.gameService.makeStartRequest()
      .subscribe(response => this.gameService.game = response,
          error => console.log(error));
  }

}

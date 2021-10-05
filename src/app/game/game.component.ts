import {Component, OnInit} from '@angular/core';
import {GameService} from "./game.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  game$ = this.gameService.getGameRequest();

  constructor(public gameService: GameService) {
  }

  ngOnInit(): void {
    this.gameService.updatePlayerNo();
    this.game$.subscribe(response => {
      this.gameService.game = response;
      if (this.gameService.game['totalPlayers'] == 0 || this.gameService.playerNo > this.gameService.game['totalPlayers']) {
        this.gameService.reset();
      } else if (this.gameService.game['totalPlayers'] == this.gameService.MAX_PLAYERS) {
        this.gameService.hasGameStarted = true;
      }
    }, error => console.log(error));
  }

  joinGame(): void {
    this.gameService.makeJoinRequest().subscribe((response) => {
      this.gameService.game = response;
      const playerNoString = this.gameService.game['status'].split(" ")[1];
      if (!isNaN(+playerNoString)) {
        localStorage.setItem('playerNo', playerNoString);
        this.gameService.playerNo = +playerNoString;
        this.gameService.hasJoinedGame = true;
        console.log(this.gameService.game);
        if (this.gameService.game['totalPlayers'] == this.gameService.MAX_PLAYERS) {
          this.startGame();
        }
      }
    }, error => console.log(error));
  }

  startGame(): void {
    this.gameService.makeStartRequest()
      .subscribe(response => {
        this.gameService.game = response;
        console.log(response);
        this.gameService.hasGameStarted = true;
      }, error => console.log(error));
  }

  playMove(): void {

  }

  draw(): void {

  }

  resetGame(): void {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "Quiting game will result in current game data being lost.",
      showCancelButton: true,
      confirmButtonText: "Yes, quit game.",
      confirmButtonColor: "#d33"
    }).then((result) => {
      if (result.isConfirmed) {
        this.gameService.makeResetGameRequest().subscribe(response => {
          this.gameService.game = response;
          this.gameService.reset();
        }, error => console.log(error));
      }
    });
  }

}

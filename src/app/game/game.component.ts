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
  showLoadingGameStatus = false;
  inHandTilesClass = 'disabled';
  boardTilesClass = 'disabled';
  commandString = '';
  tilesSelectedToPlayCounter = 0;
  btnDoneClass = 'visually-hidden';
  mergeIndexes = [-1, -1];
  mergeOrAddPosition = 'head';

  constructor(public gameService: GameService) {
  }

  ngOnInit(): void {
    this.gameService.updatePlayerNo();
    this.game$.subscribe(response => {
      this.gameService.game = response;
      if (this.gameService.game['totalPlayers'] == this.gameService.MAX_PLAYERS) {
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

  draw(): void {
    this.commandString = 'draw';
    this.executeTurn();
  }

  playTiles(): void {
    this.resetCommand();
    this.enableInHandTiles();
    this.commandString = 'play';
  }

  breakBoard(): void {
    this.resetCommand();
    this.enableBoardTiles();
    this.commandString = 'break';
  }

  mergeBoard(): void {
    this.resetCommand();
    this.enableBoardTiles();
    this.commandString = 'merge';
  }

  addToBoard(): void {
    this.resetCommand();
    this.enableInHandTiles();
    this.commandString = 'add';
  }

  replaceJoker(): void {
    this.resetCommand();
    this.enableBoardTiles();
    this.commandString = 'replace joker';
  }

  endTurn(): void {
    this.commandString = 'end';
    this.executeTurn();
  }

  executeTurn(): void {
    this.showLoadingGameStatus = true;
    this.gameService.makePlayMoveRequest(this.commandString).subscribe(
      () => {
        this.showLoadingGameStatus = false;
        this.resetCommand();
      },
      error => console.log(error)
    );
  }

  addTileToCommandString(tileIndex: number): void {
    const tile = this.gameService.game['playerList'][this.gameService.playerNo - 1]['inHand'][tileIndex];
    this.commandString += ' ' + tile;
    this.tilesSelectedToPlayCounter++;
    if(this.commandString.startsWith('play')) {
      if(this.tilesSelectedToPlayCounter >= 3) {
        this.btnDoneClass = '';
      }
    }
    else if(this.commandString.startsWith('add')) {
      this.btnDoneClass = '';
    }
    else if(this.commandString.startsWith('replace joker')) {
      this.executeTurn();
    }
  }

  doneSelectingInHandTiles(): void {
    if(this.commandString.startsWith('play')) {
      this.executeTurn();
    }
    else if(this.commandString.startsWith('add')) {
      this.resetTileCounterAndBtnDoneVisibility();
      this.enableBoardTiles();
      this.disableInHandTiles();
    }
  }

  resetTileCounterAndBtnDoneVisibility(): void {
    this.tilesSelectedToPlayCounter = 0;
    this.btnDoneClass = 'visually-hidden';
  }

  reorganizeBoard(meldIndex: number, tileIndex: number): void {
    const meldToBreak = this.gameService.game['board'][meldIndex];
    const tileToBreakAt = meldToBreak[tileIndex];
    if(this.commandString.startsWith('break')) {
      this.commandString = 'break ' + (meldIndex + 1) + ' at ' + tileToBreakAt;
      this.executeTurn();
    }
    else if(this.commandString.startsWith('merge')) {
      if(this.mergeIndexes[0] == -1) {
        this.mergeIndexes[0] = meldIndex;
        this.updateMergeOrAddPosition(tileIndex);
        this.commandString = 'merge ' + (this.mergeIndexes[0] + 1);
      }
      else if(this.mergeIndexes[1] == -1) {
        this.mergeIndexes[1] = meldIndex;
        this.commandString = 'merge ' + (this.mergeIndexes[0] + 1) + ' with ' + (this.mergeIndexes[1] + 1) + ' at ' + this.mergeOrAddPosition;
        this.executeTurn();
      }
    }
    else if(this.commandString.startsWith('add')) {
      this.updateMergeOrAddPosition(tileIndex);
      this.commandString += ' to ' + (meldIndex + 1) + ' at ' + this.mergeOrAddPosition;
      this.executeTurn();
    }
    else if(this.commandString.startsWith('replace joker')) {
      this.commandString += ' at ' + (meldIndex + 1) + ' ' + (tileIndex + 1) + ' with';
      this.disableBoardTiles();
      this.enableInHandTiles();
    }
  }

  updateMergeOrAddPosition(tileIndex: number): void {
    if(tileIndex == 0) {
      this.mergeOrAddPosition= 'head';
    }
    else {
      this.mergeOrAddPosition = 'tail';
    }
  }

  resetCommand(): void {
    this.commandString = '';
    this.resetTileCounterAndBtnDoneVisibility();
    this.resetMergeIndexes();
    this.disableInHandTiles();
    this.disableBoardTiles();
  }

  resetMergeIndexes(): void {
    this.mergeIndexes = [-1, -1];
  }

  disableInHandTiles(): void {
    this.inHandTilesClass = 'disabled';
  }

  enableInHandTiles(): void {
    this.inHandTilesClass = '';
  }

  disableBoardTiles(): void {
    this.boardTilesClass = 'disabled';
  }

  enableBoardTiles(): void {
    this.boardTilesClass = '';
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

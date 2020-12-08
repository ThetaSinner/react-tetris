import React, {useState} from 'react';
import DisplayGrid from "./DisplayGrid";
import {eventLoopStart} from "./Game";
import {
  Button,
  ButtonGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  makeStyles,
  Radio,
  RadioGroup,
  Typography
} from "@material-ui/core";
import PlayerScore from "./PlayerScore";

const useStyles = makeStyles({
  gameControls: {
    display: 'flex',
    "flex-direction": "column",
    position: 'absolute',
    left: '10%',
    top: '15%'
  },
  control: {
    "margin-bottom": "1rem"
  }
})

function createDefaultGrid() {
  return Array(15).fill([]).map(() => Array(10).fill(''))
}

function App() {
  const [gridModel, setGridModel] = useState(createDefaultGrid)
  const [gameSpeed, setGameSpeed] = useState('normal')
  const [gameRunning, setGameRunning] = useState(false)

  const styles = useStyles()

  function startGame() {
    eventLoopStart(gridModel, setGridModel, gameSpeed)
    setGameRunning(true)
  }

  function resetGame() {
    window.dispatchEvent(new Event('shutdown-game'))
    window.dispatchEvent(new CustomEvent('update-score', { detail: 0 }))
    setGridModel(createDefaultGrid)
    setGameRunning(false)
  }

  return (
      <div>
        <div className={styles.gameControls}>
          <Typography variant="h4" component="p">Let's play React Tetris!</Typography>
          <FormControl className={styles.control}>
            <ButtonGroup>
              <Button variant="contained" color="primary" disabled={gameRunning} onClick={startGame}>Start</Button>
              <Button variant="contained" color="primary" onClick={resetGame}>New Game</Button>
            </ButtonGroup>
          </FormControl>
          <FormControl className={styles.control} disabled={gameRunning}>
            <FormLabel component="legend">Game speed</FormLabel>
            <RadioGroup name="gameSpeed" value={gameSpeed} onChange={(e) => setGameSpeed(e.target.value)}>
              <FormControlLabel value="slow" control={<Radio/>} label="Slow"/>
              <FormControlLabel value="normal" control={<Radio/>} label="Normal"/>
              <FormControlLabel value="fast" control={<Radio/>} label="Fast"/>
            </RadioGroup>
          </FormControl>
        </div>
        <PlayerScore />
        <DisplayGrid gridModel={gridModel}/>
      </div>
  );
}

export default App;

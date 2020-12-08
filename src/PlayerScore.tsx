import {makeStyles, Typography} from "@material-ui/core";
import React, {useState} from "react";

const _makeStyles = makeStyles({
  scoreCard: {
    display: 'inline-block',
    position: 'absolute',
    right: '10%',
    top: '15%'
  }
})

export default function PlayerScore() {
  const [score, setScore] = useState(0)

  const styles = _makeStyles()

  window.addEventListener('update-score', (e) => {
    e.cancelBubble = true
    setScore((e as CustomEvent).detail)
  })

  return (
      <div className={styles.scoreCard}>
        <Typography variant="h4" component="p">Current score</Typography>
        <p>{score}</p>
      </div>
  )
}
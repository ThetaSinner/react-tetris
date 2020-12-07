import React, {useEffect, useState} from 'react';
import DisplayGrid from "./DisplayGrid";
import {eventLoopStart} from "./Game";

function App() {
  // const gridModel = [
  //     ['R', 'G', 'R', 'OR', 'B', 'R', 'G', 'R', 'OR', 'B'],
  //     ['B', 'OR', 'B', 'OR', 'B', 'OR', 'B', 'OR', 'B', 'OR'],
  //     ['R', 'G', 'R', 'OR', 'B', 'R', 'G', 'R', 'OR', 'B'],
  //     ['B', 'OR', 'B', 'OR', 'B', 'OR', 'B', 'OR', 'B', 'OR'],
  //     ['R', 'G', 'R', 'OR', 'B', 'R', 'G', 'R', 'OR', 'B'],
  //     ['B', 'OR', 'B', 'OR', 'B', 'OR', 'B', 'OR', 'B', 'OR'],
  //     ['R', 'G', 'R', 'OR', 'B', 'R', 'G', 'R', 'OR', 'B'],
  //     ['B', 'OR', 'B', 'OR', 'B', 'OR', 'B', 'OR', 'B', 'OR'],
  //     ['R', 'G', 'R', 'OR', 'B', 'R', 'G', 'R', 'OR', 'B'],
  //     ['B', 'OR', 'B', 'OR', 'B', 'OR', 'B', 'OR', 'B', 'OR']
  // ];

  const [gridModel, setGridModel] = useState(Array(15).fill([]).map(() => Array(10).fill('')))

  useEffect(() => {
      eventLoopStart(gridModel, setGridModel)
  }, [gridModel, setGridModel])

  return (
    <div>
      <DisplayGrid gridModel={gridModel} />
    </div>
  );
}

export default App;

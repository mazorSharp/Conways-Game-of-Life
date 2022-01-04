import React, { useState, useRef, useEffect} from 'react'
import produce from 'immer'
import './App.css';

function App() {

  const [running, setRunning] = useState(false)
  const [delay, setDelay] = useState(100)
  const [numRows, setNumRows] = useState(20)
  const [numCols, setNumCols] = useState(20)
  const color = '#111'
  
  // Node neighbors index
  const operations = [
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0]
  ]
  
  const generateEmptyGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numCols), () => 0))
    }
    return rows
  }  

  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  })

  const runningRef = useRef(running)
  runningRef.current = running

  const runSimulation = () => {
    if (!runningRef.current) {
      return;
    }
      /*
        1. Any live cell with fewer than two or more than three live neighbors dies 
        2. Any live cell with two or three live neighbors lives  
        3. Any dead cell with exactly three live neighbors become a live cell
      */
      setGrid(g => {
        return produce(g, gridCopy => {
          // For each cell 
          for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
              let neighbors = 0;

              // Get neighbors
              operations.forEach(([x, y]) => {
                const newI = i + x
                const newJ = j + y
                // Check neighbors boundaries
                if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
                  neighbors += g[newI][newJ]
                }
              })
              
              // *1 
              if (neighbors < 2 || neighbors > 3) {
                gridCopy[i][j] = 0;
              }
              // *3
              else if (g[i][j] === 0 && neighbors === 3) {
                gridCopy[i][j] = 1;
              }
            }
          }
        })
      }) 
    setTimeout(runSimulation, delay)
  }

  const startSimulationHandler = () => {
    setRunning(!running);
    if(!running) {
      runningRef.current = true
      runSimulation()
    }
  }
  
  // Generates new grid with new live cell
  const nodeClickHandler = (i,j) => {
    const newGrid = produce(grid, gridCopy => {
    gridCopy[i][j] = !grid[i][j] })
    setGrid(newGrid) 
  }

  // Generates random live cell pattern
  const randomGridHandler = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numCols), () => Math.random() > 0.5 ? 1 : 0))
    }
    setGrid(rows)
  }

  // Generate new grid size
  const [sizeCount, setSizeCount] = useState(0)

  useEffect(() => {
    setRunning(false)
    gridSizeHandler()
    setGrid(generateEmptyGrid())
  }, [numRows, numCols, sizeCount]);

  const gridSizeHandler = () => {
    if (sizeCount === 0) {
      setNumRows(20)
      setNumCols(20)
    } else if (sizeCount === 1) {
      setNumRows(40)
      setNumCols(40)
    } else if (sizeCount === 2) {
      setNumRows(60)
      setNumCols(60)
    } else if (sizeCount === 3) {
      setNumRows(80)
      setNumCols(80)
    } else if (sizeCount === 4) {
      setSizeCount(0)
    }
  }

  //Speed Handler
  const speedHandler = (e) => {
    setRunning(false)
    setDelay(e.target.value);
  }

  // RENDER
  return (
    <div className="page">
      <div className="title">
        <h1>
          Conway's Game Of Life
        </h1>
      </div>

      <div className="btns">
        <button  className="start-btn" 
          style={{
            backgroundColor: running ? "#EE3633" : "#18b62d",
            color: "#fff"
          }} 
          onClick={startSimulationHandler}> 
        {running ? "STOP" : "START"} 
        </button>

        <button 
          className="clear-btn" 
          onClick={() => {
            setGrid(generateEmptyGrid())
            setRunning(false);
        }}> 
          CLEAR
        </button>

        <button className="randomize-btn" onClick={randomGridHandler}>
          RANDOMIZE
        </button>

        <button className="size-btn" onClick={() => {setSizeCount(sizeCount + 1)}}>SIZE++</button>
        <button className="size-btn" onClick={() => {setSizeCount(sizeCount - 1)}}>SIZE--</button>

        <div className="slidecontainer">
        Fast
          <input type="range" min="1" max="200" value={delay} onChange={speedHandler} />
        Slow
        </div>
      </div>

      <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${numCols}, 20px)`
        }}>
        {grid.map((rows, i) => 
          rows.map((col, j) => 
            <div className="node"
            key={`${i}-${j}`}
            onClick={() => nodeClickHandler(i,j)}
            style={{
              width: 20,
              height: 20,
              border: 'solid 1px grey',
              backgroundColor: grid[i][j] ? color : undefined
            }} 
            />
          ))}
      </div>
    </div>
  );
}

export default App;
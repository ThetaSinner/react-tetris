enum RenderResponse {
    Success,
    IllegalMove,
    ShapeStopped
}

enum LoopCause {
    Tick,
    InputRight,
    InputLeft,
    InputRotate
}

enum LoopResponse {
    Success,
    SuccessMoveToNextShape,
    Crash,
    NoEffect,
    GameOver
}

enum Rotation {
    None,
    Clockwise1,
    Clockwise2,
    Clockwise3
}

enum ShapeColour {
    Red,
    Green,
    Blue,
    Orange,
}

export const eventLoopStart = (() => {
    let started = false
    return (gridModel: string[][], setGridModel: Function) => {
        if (!started) {
            const intervalHandle = setInterval(() => {
                const loopResponse = eventLoop(gridModel, setGridModel, LoopCause.Tick)
                if (loopResponse === LoopResponse.Crash) {
                    clearInterval(intervalHandle)
                    alert('Sorry, the game crashed :(')
                } else if (loopResponse === LoopResponse.GameOver) {
                    clearInterval(intervalHandle)
                    alert('Game over!')
                }
            }, 1000)

            window.addEventListener("keydown", (event) => {
                if (event.code === 'ArrowRight') {
                    const loopResponse = eventLoop(null, null, LoopCause.InputRight)

                    if (loopResponse === LoopResponse.Crash) {
                        clearInterval(intervalHandle)
                        alert('Sorry, the game crashed :(')
                    }
                }

                if (event.code === 'ArrowLeft') {
                    // TODO can send input after the game has ended?

                    const loopResponse = eventLoop(null, null, LoopCause.InputLeft)

                    if (loopResponse === LoopResponse.Crash) {
                        clearInterval(intervalHandle)
                        alert('Sorry, the game crashed :(')
                    }
                }

                if (event.code === 'ArrowUp') {
                    const loopResponse = eventLoop(null, null, LoopCause.InputRotate)

                    if (loopResponse === LoopResponse.Crash) {
                        clearInterval(intervalHandle)
                        alert('Sorry, the game crashed :(')
                    }
                }

                if (event.code === 'ArrowDown') {
                    // Run up to as many ticks as the height of the grid, until there is a collision
                    for (let i = 0; i < gridModel.length; i++) {
                        const loopResponse = eventLoop(null, null, LoopCause.Tick)
                        if (loopResponse === LoopResponse.Success) {
                            continue
                        } else if (loopResponse === LoopResponse.SuccessMoveToNextShape) {
                            break
                        }

                        // Should be one of the two statuses above, if not, shut down
                        clearInterval(intervalHandle)
                        console.error('Failed to send to bottom')
                        alert('Sorry, the game crashed :(')
                    }
                }
            })

            started = true
        }
    }
})();

const Paint = 'X'
const NoPaint = ''

function makeCross(): Shape {
    return {
        renderShape: [
            [NoPaint, Paint, NoPaint],
            [Paint, Paint, Paint],
            [NoPaint, Paint, NoPaint]
        ],
        center: [1, 1],
        position: [4, -1],
        rotation: Rotation.None,
        colour: ShapeColour.Blue
    }
}

function makeLineThree(): Shape {
    return {
        renderShape: [[Paint, Paint, Paint]],
        center: [1, 0],
        position: [4, 0],
        rotation: Rotation.None,
        colour: ShapeColour.Red
    }
}

function makeZigZag(): Shape {
    return {
        renderShape: [
            [Paint, Paint, NoPaint],
            [NoPaint, Paint, Paint]
        ],
        center: [1, 1],
        position: [4, 0],
        rotation: Rotation.None,
        colour: ShapeColour.Orange
    }
}

function makePyramid(): Shape {
    return {
        renderShape: [
            [NoPaint, Paint, NoPaint],
            [Paint, Paint, Paint],
        ],
        center: [1, 1],
        position: [4, 0],
        rotation: Rotation.None,
        colour: ShapeColour.Blue
    }
}

function copyShape(shape: Shape): Shape {
    return {
        renderShape: shape.renderShape, // const
        center: [...shape.center],
        position: [...shape.position],
        rotation: shape.rotation,
        colour: shape.colour
    }
}

const randomShape = (() => {
    const shapeOptions = [
        makeCross,
        makeZigZag,
        makeLineThree,
        makePyramid
    ]

    return () => {
        const choice = Math.floor(Math.random() * shapeOptions.length);
        return shapeOptions[choice]()
    }
})()

function copyGridModel(gridModel: string[][]) {
    return gridModel.map(row => [...row])
}

// Helps keep things looking like standard coordinates
const Row = 1
const Col = 0

type Shape = {
    renderShape: string[][];
    center: number[]; // Row, Col
    position: number[]; // Row, Col
    rotation: Rotation;
    colour: ShapeColour
}

const eventLoop = (() => {
    let gridModel: string[][] | null = null
    let setGridModel: Function | null = null

    let currentShape: Shape | null = null
    let spawnNewShape = false;

    return (gridModelInput: string[][] | null, setGridModelInput: Function | null, loopCause: LoopCause): LoopResponse => {
        if (gridModel === null || setGridModel === null) { // Run on first loop only
            if (gridModelInput !== null) {
                gridModel = gridModelInput
            }
            if (setGridModelInput !== null) {
                setGridModel = setGridModelInput
            }

            if (gridModel !== null && setGridModelInput !== null) {
                initialise()
                return LoopResponse.Success
            } else {
                console.error('Received event before initialisation?')
                return LoopResponse.Crash
            }
        }

        if (currentShape === null) {
            console.error('Attempt to render when current shape has not been initialised')
            return LoopResponse.Crash
        }

        // Make a new grid to work on
        const bufferGrid = copyGridModel(gridModel)

        // Copy the current shape, or generate a new one if the current one has stopped
        let nextShape: Shape | null
        let insertingNewShape = false
        if (spawnNewShape) {
            nextShape = randomShape()
            spawnNewShape = false
            insertingNewShape = true
        } else {
            clearShape(bufferGrid, currentShape)

            nextShape = copyShape(currentShape)

            switch (loopCause) {
                case LoopCause.Tick:
                    // Move down by one place
                    nextShape.position[Row]++
                    break
                case LoopCause.InputRight:
                    nextShape.position[Col]++
                    break
                case LoopCause.InputLeft:
                    nextShape.position[Col]--
                    break
                case LoopCause.InputRotate:
                    nextShape.rotation = (nextShape.rotation + 1) % 4
            }
        }

        const renderResponse = renderShape(bufferGrid, nextShape)

        if (renderResponse === RenderResponse.IllegalMove) {
            if (insertingNewShape) {
                // We ran a tick, the render ended up drawing on an existing cell and generating an illegal move, game over
                return LoopResponse.GameOver
            }

            if (loopCause === LoopCause.Tick) {
                console.error('Tried to move shape, but there was an error.')
                return LoopResponse.Crash
            } else {
                return LoopResponse.NoEffect
            }
        } else if (renderResponse === RenderResponse.ShapeStopped) {
            applyBuffer(bufferGrid, nextShape)

            if (insertingNewShape) {
                // Shape stopped immediately, game over
                return LoopResponse.GameOver
            }

            clearRows()

            spawnNewShape = true;
            return LoopResponse.SuccessMoveToNextShape
        } else if (renderResponse === RenderResponse.Success) {
            applyBuffer(bufferGrid, nextShape)
            return LoopResponse.Success
        }

        // Should never reach here, the statement block above is meant to take an action and return a response.
        return LoopResponse.Crash
    }

    function initialise() {
        if (gridModel === null || setGridModel === null) {
            console.error('Attempt to initialise the game without a grid')
            return
        }

        currentShape = randomShape()

        renderShape(gridModel, currentShape)
        setGridModel([...gridModel])
    }

    function applyBuffer(bufferGrid: string[][], drawnShape: Shape) {
        if (setGridModel === null) {
            console.error('Attempt to apply buffer without state update function')
            return
        }

        currentShape = drawnShape
        gridModel = bufferGrid
        setGridModel(gridModel)
    }

    function clearRows() {
        if (gridModel === null) {
            console.error('Failed to clear rows, there is not grid model')
            return
        }

        let fullRow = -1
        for (let row = gridModel.length - 1; row >= 0; row--) {
            if (gridModel[row].every(item => item !== '')) {
                fullRow = row
            }
        }

        if (fullRow === -1) {
            // No full rows
            return
        }

        for (let row = fullRow; row > 0; row--) {
            gridModel[row - 1].forEach((item, index) => {
                if (gridModel) {
                    gridModel[row][index] = item
                } else {
                    throw Error('Error accessing the grid while clearing rows')
                }
            })
        }

        // Replace the top row, all the other rows have been copied down but this could still have something drawn on it.
        // It shouldn't do after the shift down!
        gridModel[0] = Array(gridModel[0].length).fill('')

        if (fullRow == -1) {
            // Everything just shifted down, so there could be more work to do, call again!
            clearRows()
        }
    }
})();

function getColourString(shapeColor: ShapeColour): string {
    switch (shapeColor) {
        case ShapeColour.Blue:
            return 'B'
        case ShapeColour.Green:
            return 'G'
        case ShapeColour.Red:
            return 'R'
        case ShapeColour.Orange:
            return 'OR'
    }
}

function renderShape(gridModel: string[][], shape: Shape): RenderResponse {
    let renderResponse = RenderResponse.Success

    shape.renderShape.forEach((row, rowIndex) => {
        if (renderResponse === RenderResponse.IllegalMove) {
            // No need to do more work, cannot render this shape here
            return
        }

        row.forEach((item, colIndex) => {
            if (renderResponse === RenderResponse.IllegalMove) {
                return
            }

            if (item === NoPaint) {
                // Nothing to render, just part of the shape size information
                return
            }

            let mapCol = -1;
            let mapRow = -1
            switch (shape.rotation) {
                case Rotation.None:
                    mapCol = shape.position[Col] + (colIndex - shape.center[Col])
                    mapRow = shape.position[Row] + (rowIndex - shape.center[Row])
                    break
                case Rotation.Clockwise1:
                    mapCol = shape.position[Col] - (rowIndex - shape.center[Row])
                    mapRow = shape.position[Row] + (colIndex - shape.center[Col])
                    break
                case Rotation.Clockwise2:
                    mapCol = shape.position[Col] - (colIndex - shape.center[Col])
                    mapRow = shape.position[Row] - (rowIndex - shape.center[Row])
                    break
                case Rotation.Clockwise3:
                    mapCol = shape.position[Col] + (rowIndex - shape.center[Row])
                    mapRow = shape.position[Row] - (colIndex - shape.center[Col])
                    break
                default:
                    throw Error('oops')
            }

            if (mapRow < 0) {
                // Allow this, just don't render it. The shape is off the top of the grid, let it move down.
                return
            }

            if (mapCol < 0 || mapRow >= gridModel.length || mapCol >= gridModel[0].length) {
                renderResponse = RenderResponse.IllegalMove
                return
            }

            if (gridModel[mapRow][mapCol] !== '') {
                // The target cell isn't empty! Must be a collision while trying to move left, move right, or rotate
                renderResponse = RenderResponse.IllegalMove
                return
            }

            if (mapRow + 1 === gridModel.length) {
                // This cell has reached the bottom of the grid
                renderResponse = RenderResponse.ShapeStopped
            }

            if (mapRow + 1 < gridModel.length) {
                // It's safe to check the next row, does the next row have something in it?
                const cellBelow = gridModel[mapRow + 1][mapCol]
                if (cellBelow !== '' && cellBelow !== Paint) {
                    // The point under where we're rendering isn't empty, collision!
                    renderResponse = RenderResponse.ShapeStopped
                }
            }

            gridModel[mapRow][mapCol] = Paint
        })
    })

    // Paint the colour after determining its position and collisions to prevent confusion between other objects and
    // current object when determining collisions
    gridModel.forEach((row, rowIndex) =>
        row.forEach((item, colIndex) => {
            if (item === Paint) {
                gridModel[rowIndex][colIndex] = getColourString(shape.colour)
            }
        })
    )

    return renderResponse
}

function clearShape(gridModel: string[][], shape: Shape) {
    shape.renderShape.forEach((row, rowIndex) => {
        row.forEach((item, colIndex) => {
            let mapCol = -1;
            let mapRow = -1
            switch (shape.rotation) {
                case Rotation.None:
                    mapCol = shape.position[Col] + (colIndex - shape.center[Col])
                    mapRow = shape.position[Row] + (rowIndex - shape.center[Row])
                    break
                case Rotation.Clockwise1:
                    mapCol = shape.position[Col] - (rowIndex - shape.center[Row])
                    mapRow = shape.position[Row] + (colIndex - shape.center[Col])
                    break
                case Rotation.Clockwise2:
                    mapCol = shape.position[Col] - (colIndex - shape.center[Col])
                    mapRow = shape.position[Row] - (rowIndex - shape.center[Row])
                    break
                case Rotation.Clockwise3:
                    mapCol = shape.position[Col] + (rowIndex - shape.center[Row])
                    mapRow = shape.position[Row] - (colIndex - shape.center[Col])
                    break
                default:
                    throw Error('oops')
            }

            if (mapRow < 0) {
                // This can be allowed in render, so we mustn't try to clear it here.
                return;
            }

            if (item !== NoPaint) {
                gridModel[mapRow][mapCol] = NoPaint
            }
        })
    })

    return gridModel
}

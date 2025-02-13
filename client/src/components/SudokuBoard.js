import React, { useState, useEffect } from "react";
import "../styles.css";

const SudokuBoard = () => {
  const [board, setBoard] = useState(Array(9).fill(Array(9).fill(".")));
  const [selectedCell, setSelectedCell] = useState(null);
  const [lockedCells, setLockedCells] = useState(new Set());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.classList.contains("cell")) {
        setSelectedCell(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
  };

  const handleKeyPress = (event) => {
    if (selectedCell) {
      const num = event.key;
      if (/^[1-9]$/.test(num)) {
        const newBoard = board.map((r, i) =>
          i === selectedCell.row
            ? r.map((c, j) => (j === selectedCell.col ? num : c))
            : r
        );
        
        setBoard(newBoard);
        setLockedCells(new Set([...lockedCells, `${selectedCell.row}-${selectedCell.col}`]));
      } 
      else if (event.key === "Backspace" || event.key === "Delete") {
        const newBoard = board.map((r, i) =>
          i === selectedCell.row ? r.map((c, j) => (j === selectedCell.col ? "." : c)) : r
        );

        setBoard(newBoard);
        const newHighlights = new Set(lockedCells);
        newHighlights.delete(`${selectedCell.row}-${selectedCell.col}`);
        setLockedCells(newHighlights);
      }
    }
  };

  const fetchBoard = async () => {
    const response = await fetch("http://localhost:8000/generate");
    const data = await response.json();

    setBoard(data.board);
    setLockedCells(new Set(data.board.flatMap((row, rowIndex) => 
      row.map((cell, colIndex) => (cell !== "." ? `${rowIndex}-${colIndex}` : null)).filter(Boolean)
    )));
  };

  const solveBoard = async () => {
    const response = await fetch("http://localhost:8000/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board }),
    });

    const data = await response.json();
    if (data.solution) {
      setBoard(data.solution);
      //setLockedCells(new Set(data.solution.flatMap((row, rowIndex) => 
      //  row.map((cell, colIndex) => (cell !== "." ? `${rowIndex}-${colIndex}` : null)).filter(Boolean)
      //)));
    } 

    else {
      alert("Invalid Sudoku Board");
    }
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(Array(9).fill(".")));
    setLockedCells(new Set());
  };

  return (
    <div className="container" tabIndex={0} onKeyDown={handleKeyPress}>
      <div className="sudoku-board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${
                selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                  ? "selected"
                  : ""
              } ${
                lockedCells.has(`${rowIndex}-${colIndex}`)
                  ? "locked"
                  : ""
              } 
              ${rowIndex % 3 === 2 && rowIndex !== 8 ? "border-bottom-bold" : ""} ${colIndex % 3 === 2 && colIndex !== 8 ? "border-right-bold" : ""}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell !== "." ? cell : ""}
            </div>
          ))
        )}
      </div>
      <div className="right-panel">
        <div className="explanation">
          <h2>Sudoku Solver</h2>
          <p> A Sudoku solution satisfy all of the following rules: </p>
          <p> 1. Each of the digits 1-9 must occur exactly once in each row </p>
          <p> 2. Each of the digits 1-9 must occur exactly once in each column </p>
          <p> 3. Each of the digits 1-9 must occur exactly once in each 3x3 sub-boxes of the grid </p>
          <p> Select a cell and enter a number (1-9) to lock in a number (these spaces can still be edited) </p>
          <p> Click Generate to create a new board with locked numbers </p>
          <p> Select Reset to clear the current board. </p>
          <p> Press Solve to provide a solution to the current board and if your completed board is correct! </p>
          <p> *Note: Sudoku Board can have multiple solutions</p>
        </div>

        <br></br>
        <div className="buttons">
          <button onClick={fetchBoard}>Generate</button>
          <button onClick={resetBoard}>Reset</button>
          <button onClick={solveBoard}>Solve</button>
        </div>
      </div>
    </div>
  );
};

export default SudokuBoard;

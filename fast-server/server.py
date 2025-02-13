from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def is_valid(board, row, col, num): # Check valid for backtrack
    num = str(num)
    for i in range(9):
        if board[row][i] == num or board[i][col] == num:
            return False
    
    curr_row, curr_col = row - row % 3, col - col % 3
    for i in range(3):
        for j in range(3):
            if board[curr_row + i][curr_col + j] == num:
                return False

    return True

def backtrack_sudoku(board):
    for i in range(9):
        for j in range(9):
            if board[i][j] == '.':
                nums = list('123456789')
                random.shuffle(nums)
                for num in nums:
                    if is_valid(board, i, j, num):
                        board[i][j] = num
                        if backtrack_sudoku(board):
                            return True

                        board[i][j] = '.'

                return False

    return True

def remove_digits(board): # Removing Digits after generations
    counter = random.randint(40, 50)
    while counter > 0:
        row, col = random.randint(0, 8), random.randint(0, 8)
        if board[row][col] == '.':
            continue
        board[row][col] = '.'
        counter -= 1

def generate_random_sudoku(): # Create a random sudoku board
    board = [['.' for _ in range(9)] for _ in range(9)]
    backtrack_sudoku(board)
    remove_digits(board)
    return board

def is_valid_sudoku(board): # Before Solving Board check if it is solvable
    def is_valid_unit(unit):
        nums = [num for num in unit if num != "."]
        return len(nums) == len(set(nums))  # Check for dupes
    
    for row in board: # Checking rows
        if not is_valid_unit(row):
            return False
    
    for col in range(9): # Checking columns
        if not is_valid_unit([board[row][col] for row in range(9)]):
            return False

    for box_row in range(0, 9, 3): # Checking 3x3 grids
        for box_col in range(0, 9, 3):
            box = [board[r][c] for r in range(box_row, box_row + 3) for c in range(box_col, box_col + 3)]
            if not is_valid_unit(box):
                return False

    return True
    
def solve_sudoku(board): # Solve Soduku Board  
    if not is_valid_sudoku(board):
        raise HTTPException(status_code=400, detail="Invalid Sudoku Board") # Invalid

    def ans(i, j): # Solving Soduku Process Functions
        if i == 9:
            return True

        if j == 9:
            return ans(i + 1, 0)

        if board[i][j] != '.':
            return ans(i, j + 1)
        
        for num in map(str, range(1, 10)):
            if is_valid(board, i, j, num):
                board[i][j] = num
                if ans(i, j + 1):
                    return True

                board[i][j] = '.'

        return False
    
    if not ans(0, 0):
        raise HTTPException(status_code=400, detail="Invalid Sudoku Board") # Invalid

    return board

@app.get("/generate")
def generate_board():
    return {"board": generate_random_sudoku()}

@app.post("/solve")
def solve_board(request: dict):
    board = request.get("board")
    #print(board)

    if not board or len(board) != 9 or any(len(row) != 9 for row in board):
        raise HTTPException(status_code=400, detail="Invalid board format")

    return {"solution": solve_sudoku(board)}

    app.run(debug=True)
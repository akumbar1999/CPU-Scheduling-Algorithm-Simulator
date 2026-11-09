from fastapi import FastAPI

app = FastAPI()

students = [
    {"id": 1, "name": "Abhishek", "branch": "CSE"},
    {"id": 2, "name": "Rahul", "branch": "CSE"}
]

@app.get("/")
def home():
    return {"message": "FastAPI is working!"}

@app.get("/students")
def get_students():
    return students

@app.post("/students")
def add_student(student: dict):
    students.append(student)
    return {"message": "Student added", "student": student}
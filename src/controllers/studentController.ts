import { Request, Response } from "express";
import { Student, StudentModel } from "../models/student";
import logger from "../utils/logger";

export class StudentController {
  static async createStudent(req: Request, res: Response): Promise<void> {
    try {
      const student: Student = req.body;
      const newStudent = await StudentModel.create(student);
      res.status(201).json(newStudent);
    } catch (error) {
      logger.error("Error in createStudent:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getAllStudents(req: Request, res: Response): Promise<void> {
    try {
      const students = await StudentModel.findAll();
      res.status(200).json(students);
    } catch (error) {
      logger.error("Error in getAllStudents:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const student = await StudentModel.findById(id);

      if (!student) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      res.status(200).json(student);
    } catch (error) {
      logger.error("Error in getStudentById:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const studentData: Partial<Student> = req.body;

      const updatedStudent = await StudentModel.update(id, studentData);

      if (!updatedStudent) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      res.status(200).json(updatedStudent);
    } catch (error) {
      logger.error("Error in updateStudent:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const success = await StudentModel.delete(id);

      if (!success) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Error in deleteStudent:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

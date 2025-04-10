import pool from "../db/config";
import logger from "../utils/logger";

export interface Student {
  id?: number;
  name: string;
  email: string;
  age: number;
  created_at?: Date;
  updated_at?: Date;
}

export class StudentModel {
  static async create(student: Student): Promise<Student> {
    try {
      const { name, email, age } = student;
      const result = await pool.query(
        "INSERT INTO students (name, email, age) VALUES ($1, $2, $3) RETURNING *",
        [name, email, age]
      );
      logger.info("Student created successfully");
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating student:", error);
      throw error;
    }
  }

  static async findAll(): Promise<Student[]> {
    try {
      const result = await pool.query("SELECT * FROM students");
      logger.info("Retrieved all students successfully");
      return result.rows;
    } catch (error) {
      logger.error("Error retrieving students:", error);
      throw error;
    }
  }

  static async findById(id: number): Promise<Student | null> {
    try {
      const result = await pool.query("SELECT * FROM students WHERE id = $1", [
        id,
      ]);
      if (result.rows.length === 0) {
        logger.warn(`Student with id ${id} not found`);
        return null;
      }
      logger.info(`Retrieved student with id ${id} successfully`);
      return result.rows[0];
    } catch (error) {
      logger.error("Error retrieving student:", error);
      throw error;
    }
  }

  static async update(
    id: number,
    student: Partial<Student>
  ): Promise<Student | null> {
    try {
      const { name, email, age } = student;
      const result = await pool.query(
        "UPDATE students SET name = $1, email = $2, age = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
        [name, email, age, id]
      );
      if (result.rows.length === 0) {
        logger.warn(`Student with id ${id} not found for update`);
        return null;
      }
      logger.info(`Updated student with id ${id} successfully`);
      return result.rows[0];
    } catch (error) {
      logger.error("Error updating student:", error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const result = await pool.query("DELETE FROM students WHERE id = $1", [
        id,
      ]);
      if (result.rowCount === 0) {
        logger.warn(`Student with id ${id} not found for deletion`);
        return false;
      }
      logger.info(`Deleted student with id ${id} successfully`);
      return true;
    } catch (error) {
      logger.error("Error deleting student:", error);
      throw error;
    }
  }
}

import { Router } from "express";
import { StudentController } from "../controllers/studentController";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Student routes
router.post("/students", StudentController.createStudent);
router.get("/students", StudentController.getAllStudents);
router.get("/students/:id", StudentController.getStudentById);
router.put("/students/:id", StudentController.updateStudent);
router.delete("/students/:id", StudentController.deleteStudent);

export default router;

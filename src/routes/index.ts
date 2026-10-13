import { Router } from "express";
import authRoutes from "./auth.routes";
import usuarioRoutes from "./usuario.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);


export default router;
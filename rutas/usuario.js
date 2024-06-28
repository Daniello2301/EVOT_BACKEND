const { Router } = require("express");
const contrUsuario = require("../controladores/usuario");
const { jwtValidador, isAdmin } = require("../middleware/jwt_validador");
const { check } = require("express-validator");

const router = Router();

// listar todo y por Id
router.get("/users", [jwtValidador, isAdmin], contrUsuario.listarUsuarios);

router.get("/user/:id", [jwtValidador], contrUsuario.listPorId);

// Login
router.post(
  "/auth",
  [
    check("correo", "El correo es requerido").notEmpty(),
    check("correo", "El formato del correo es invalido").isEmail(),
    check("contraseña", "Contraseña requerida").notEmpty(),
  ],
  contrUsuario.login
);

// Registro
router.post(
  "/auth/register",
  [
    // middleware que valida el token y si es admin
    jwtValidador,
    isAdmin,
    [
      // middleware que valida los campos
      check("nombreUsuario", "El nombre de usuario es requerido").notEmpty(),
      check("correo", "El correo es requerido").notEmpty(),
      check("correo", "El formato del correo es invalido").isEmail(),
      check("rol", "El rol es requerido").notEmpty(),
    ],
  ],
  contrUsuario.register
);

// deshabilidar usario
router.put(
  "/deactivate/user/:id",
  [jwtValidador, isAdmin],
  contrUsuario.deshabilitarUsuario
);

// Activar Usuario
router.put(
  "/activate/user/:id",
  [jwtValidador, isAdmin],
  contrUsuario.activarUsuario
);

/* Reset password */
router.put("/auth/reset/password", [
  jwtValidador,
  check("viejaContraseña", "La antigua contraseña es requerida").notEmpty(),
  check("nuevaContraseña", "La nueva contraseña es requerida").notEmpty(),
], contrUsuario.resetPassword);

/* Refresh Token */
router.post("/auth/refresh/token", [jwtValidador], contrUsuario.refreshUserToken);

module.exports = router;

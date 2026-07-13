1. Login y Autenticación
Objetivo

Validar que la autenticación mediante Microsoft Entra ID funcione correctamente en el entorno de producción, incluyendo inicio de sesión, cierre de sesión, persistencia de sesión y control de permisos por rol.

Casos de prueba
AUTH-001 - Login exitoso de empleado

Precondiciones

Usuario empleado válido registrado en Entra ID.
Aplicación desplegada en Azure Static Web Apps.

Pasos

Abrir la URL de producción.
Presionar "Iniciar sesión".
Seleccionar una cuenta de empleado válida.
Completar el flujo de autenticación.

Resultado esperado

El usuario accede al sistema.
Se muestra el dashboard.
Se carga la información correspondiente al usuario.
No aparecen errores en consola.

Resultado obtenido

Éxitoso.
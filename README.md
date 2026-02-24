# Proyecto de Agendamiento de Citas

Este repositorio contiene dos proyectos:
- `front/`: proyecto Angular para el agendamiento de citas (interfaz web).
- `back/`: servicios/API en C# (.NET) para el mismo sistema.

## Ejecucion simultanea

Desde la raiz del repositorio, puedes levantar ambos proyectos en paralelo con:

```bash
( cd back/src/AppointmentApi && dotnet run ) & ( cd front && npm start ) && wait
```

Notas:
- Ejecuta `npm install` dentro de `front/` la primera vez.
- Si necesitas detener ambos procesos, usa `Ctrl+C` en la terminal.


Videos explicativos
https://drive.google.com/drive/folders/1Fpp-MKmCuvlW4gN68fo4fqAPTOTAw99v?usp=drive_link

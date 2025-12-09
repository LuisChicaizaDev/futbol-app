# Fútbol App ⚽

**Fútbol App** es una aplicación web para gestionar la información de un equipo de fútbol: jugadores, partidos, estadísticas, convocatorias y datos generales del club.  
El proyecto fue desarrollado como un **experimento personal**, con el objetivo de construir una aplicación completa utilizando **IA como copiloto de desarrollo**.

El proyecto comenzó con un **prototipo generado en [v0.dev](https://v0.dev)** usando datos estáticos.  
Ese prototipo sirvió como base visual, y posteriormente extendí y desarrollé toda la aplicación real utilizando **[Cursor](https://cursor.com/)** para acelerar el proceso.

<img width="1450" height="833" alt="Macbook-Air-futbol-app-mu vercel app" src="https://github.com/user-attachments/assets/2f648391-a2af-42ea-b908-5a9d0ec99752" />


## 🎯 Propósito del proyecto

- Aprender tecnologías modernas que nunca había usado:  
  **Next.js**, **Supabase**, y **shadcn/ui**  
- Poner en práctica un flujo de trabajo **IA-first**, en el que la IA me ayuda a generar, mejorar y refactorizar código.
- Comprobar si es posible construir una aplicación completa con IA en tiempos muy reducidos.
- Crear una herramienta real que pueda servir para gestionar cualquier equipo de barrio, incluido el equipo de mi familia.

## 🚀 Funcionalidades principales
Autenticación con Supabase (login).
### Área pública
- Próximo partido
- Estadísticas del equipo
- Resultados de partidos  
- Estadísticas de goleadores  
- Información del club
- Plantilla y disponibilidad  

### Área privada (admin)
- **CRUD** de jugadores  
- **CRUD** de partidos  
- Gestión de estadísticas por jugador  
- Convocatorias  
- Edición de información general del club  
- Subida de imágenes al almacenamiento de Supabase

### Arquitectura de acceso a datos:
  - `lib/db.js` centraliza consultas a Supabase ( `getPlayers`, `createPlayer`, `updatePlayer`, `deletePlayer`, `createMatch`, `updatePlayerStats`, `uploadLogo`, etc.)
  - `lib/supabase/client.ts` y `lib/supabase/server.ts` para cliente/servidor con manejo de cookies (SSR) usando `@supabase/ssr`.


## 🤖 IA utilizada en el desarrollo

- **v0.dev** → generó el prototipo inicial en frontend (datos estáticos).  
- **Cursor**  
  - **Modo Agent** → mejoras estructurales, refactorización de código.  
  - **Modo Ask** → resolver mis dudas, generar funciones específicas, mejorar código puntual.


## 🛠️ Tecnologías

- **Next.js (App Router)**  
- **React + JSX**  
- **Tailwind CSS**  
- **shadcn/ui**  
- **Supabase**  
  - Base de datos  
  - Autenticación  
  - Storage para imágenes

## 📚 Lo que aprendí durante este proyecto

Este proyecto fue también una experiencia de aprendizaje acelerado. Durante el desarrollo pude aprender y aplicar:

- Diseño de base de datos real en Supabase

- Uso de RLS (Row Level Security) y políticas de acceso

- Integración completa: CRUD → Supabase → UI

- Manejo de Supabase Storage para subir y mostrar imágenes

- Implementación de autenticación y protección de rutas

- Arquitectura con Next.js App Router

- Trabajo modular usando componentes de UI profesionales (shadcn/ui)

- Flujo de desarrollo moderno asistido por IA

- Resolver conflictos de dependencias y problemas de compilación

Estas competencias refuerzan mi perfil como desarrollador frontend capaz de aprender tecnologías nuevas rápidamente.



## ⚙️ Variables de entorno

El proyecto utiliza un archivo .env.local para definir las credenciales de Supabase: 

```sh
NEXT_PUBLIC_SUPABASE_URL=your_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

```

## 🚀 Instalación y ejecución

```bash

git clone https://github.com/LuisChicaizaDev/futbol-app.git
npm install
npm run dev

```


## ⚪ Prototipo inicial

El prototipo inicial (frontend con datos estáticos) fue generado automáticamente por [v0.dev](https://v0.dev) y me sirvió como base visual para empezar.

👉 Demo: [Ver prototipo inicial](https://v0-brasil-fc-app.vercel.app/)



## 🟢 Estado actual

La aplicación está completamente funcional:

- CRUD reales conectados a Supabase

- Panel público y panel admin totalmente operativos

- Subida de imágenes a Storage

- Autenticación básica para acceder al panel admin

- UI moderna y responsive


## 💡 Sobre el proyecto
Este proyecto me permitió:

- Aprender un stack moderno de forma acelerada

- Desarrollar una aplicación real en aproximadamente **dos semanas**.

- Utilizar la IA como herramienta de apoyo, sin dejar de entender y supervisar cada parte del código

- Combinar mi profesión con el deporte de mi familia, creando una herramienta útil para su equipo de barrio

## 💻 Demo
Este proyecto fue desplegado en [Vercel](https://vercel.com/).

Puedes visualizar e interactuar con este proyecto en el siguiente enlace : [Ver Fútbol App](https://futbol-app-mu.vercel.app/)

Puedes acceder con estas credenciales:

Correo:
```sh
admin@futbolapp.com
```
Contraseña:
```sh
admin123
```

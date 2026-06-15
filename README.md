### Aplikacja-finansowa
Projekt zaliczeniowy z przedmiotu "Projektowanie aplikacji internetowych"

## Temat projektu
Aplikacja webowa do zarządzania finansami osobistymi z modułem doradztwa finansowego opartym na LLM.
Pomaga użytkownikowi śledzić przychody i wydatki, planować budżet, realizować cele oszczędnościowe oraz podejmować świadome decyzje finansowe na podstawie spersonalizowanych rekomendacji AI.


## Funkcjonalności:

- **Zarządzanie transakcjami** — dodawanie, edycja i usuwanie przychodów oraz wydatków z przypisaniem do kategorii
- **Elastyczne kategorie** — użytkownik definiuje własne kategorie z kolorami, przechowywane w MongoDB dla pełnej elastyczności schematu
- **Budżety** — tworzenie limitów wydatków per kategoria z monitorowaniem realizacji i podglądem transakcji
- **Cele finansowe** — definiowanie celów oszczędnościowych z śledzeniem postępu i możliwością wpłat
- **Dashboard analityczny** — konfigurowalne wykresy: przychody vs wydatki, wydatki wg kategorii, trendy, porównania miesięczne, realizacja budżetów, predykcje AI
- **Doradca finansowy AI** — moduł oparty na LLM (Ollama/Llama 3.2) z predykcjami regresji liniowej, streamowaniem SSE i predefiniowanymi analizami
- **Kategorie chronione** — użytkownik oznacza kategorie, z których nie chce rezygnować — doradca AI respektuje te preferencje przy optymalizacji budżetu
- **Autentykacja JWT** — rejestracja, logowanie, httpOnly cookies
- **Observability** — Prometheus + Grafana, strukturalne logi JSON, metryki HTTP i biznesowe


## Stos technologiczny

| Warstwa | Technologia |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, Recharts, TanStack Query, Zustand, React Router, React Hook Form + Zod |
| Backend | Node.js, Express, TypeScript |
| Baza SQL | PostgreSQL + Prisma ORM |
| Baza dokumentowa | MongoDB + Mongoose |
| Autentykacja | JWT (httpOnly cookies) |
| LLM | Ollama (Llama 3.2) |
| Komunikacja real-time | Server-Sent Events (SSE) |
| Dokumentacja API | Swagger / OpenAPI |
| Observability | Prometheus + Grafana, strukturalne logi JSON |
| Testy | Jest |
| CI/CD | GitHub Actions |
| Konteneryzacja | Docker + docker-compose |
| Linting | Biome |


## Uruchomienie

### Wymagania

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 22+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Ollama](https://ollama.com/) (dla modułu doradcy AI)

### Szybki start (Docker)

```bash
# Sklonuj repo
git clone https://github.com/TWOJ-USERNAME/Aplikacja-finansowa.git
cd Aplikacja-finansowa

# Skopiuj zmienne środowiskowe
cp .env.example .env

# Uruchom całą aplikację
docker-compose up --build -d
```

Aplikacja dostępna na `http://localhost`

## Demo

https://github.com/user-attachments/assets/6971f570-5e12-42c2-95da-0f79f79fde6d

https://github.com/user-attachments/assets/9cbb59c8-7e3a-4404-afad-f31adb7a9eda

https://github.com/user-attachments/assets/60994543-a0eb-4cbc-9c1b-b39ece26c91b)





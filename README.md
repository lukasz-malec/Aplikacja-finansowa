# Projekt zaliczeniowy z przedmiotu "Projektowanie aplikacji internetowych"

## Temat projektu
Aplikacja webowa do zarządzania finansami osobistymi z modułem doradztwa finansowego opartym na LLM.
Pomaga użytkownikowi śledzić przychody i wydatki, planować budżet, realizować cele oszczędnościowe oraz podejmować świadome decyzje finansowe na podstawie spersonalizowanych rekomendacji AI.




# Link do prezentacji(pdf):
https://github.com/lukasz-malec/Aplikacja-finansowa/blob/main/Aplikacja%20bud%C5%BCetowa.pdf


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

</br>

https://github.com/user-attachments/assets/60994543-a0eb-4cbc-9c1b-b39ece26c91b

</br>

https://github.com/user-attachments/assets/9cbb59c8-7e3a-4404-afad-f31adb7a9eda

</br>

<img width="640" height="278" alt="obserrbality" src="https://github.com/user-attachments/assets/62f8e5e5-42b7-4d5d-af9d-3d57901e5fa7" />



## Wymagania minimalne

✅ **R1 — Backend API** — REST API (Express + TypeScript) z 6 zasobami powiązanymi relacjami: Users, Transactions, Categories, Budgets, Goals, Analytics. Paginacja, filtrowanie, sortowanie. Endpoint SSE dla doradcy AI.</br></br>
✅ **R2 — Baza danych** — Polyglot Persistence: PostgreSQL (Prisma ORM, migracje) dla danych relacyjnych + MongoDB (Mongoose) dla elastycznych kategorii użytkownika. Przemyślany schemat z relacjami User → Transactions, Budgets, Goals.</br></br>
✅ **R3 — Frontend** — SPA w React + Vite + TypeScript + Tailwind CSS. Dark theme, konfigurowalne wykresy (Recharts), kafelkowa nawigacja, formularz transakcji, zarządzanie kategoriami/budżetami/celami, panel doradcy AI z streamowaniem SSE.</br></br>
✅ **R4 — Autentykacja** — JWT w httpOnly cookies. Rejestracja, logowanie, wylogowanie. Middleware chroniący wszystkie endpointy poza auth. Rozróżnienie zalogowany/niezalogowany z przekierowaniem na stronę logowania.</br></br>
✅ **R5 — Konteneryzacja** — `docker-compose up --build -d` uruchamia całą aplikację: PostgreSQL, MongoDB, Backend, Frontend, Prometheus, Grafana. Dockerfile dla backendu i frontendu (multi-stage build z nginx).</br></br>
✅ **R6 — Repozytorium** — Publiczne repo na GitHub z historią commitów, README z instrukcją uruchomienia i opisem architektury, CI/CD (GitHub Actions).

## Elementy dodatkowe

:white_check_mark:**CI/CD** - GitHub Actions automatycznie odpala testy przy każdym pushu.</br></br>
:white_check_mark:**Seed data** - uruchomienie pnpm seed w \backend, który tworzy użytkownika i wypełnia baze danych przykładowymi danymi</br>
Login testowy: `jan@test.com` / `haslo123`</br></br>
:white_check_mark:**Observability** - Prometheus/Grafana, dashboardy z wykresami, metryki Http, strukturalne logi</br></br>
:white_check_mark:**API_DOCS/Swagger** - Dokumentacja interaktywna: `http://localhost:3000/api/docs` (Swagger)</br></br>
:white_check_mark:**Testy**:
- JWT (generowanie, weryfikacja, wygasanie tokenów)
- Hashowanie haseł (bcrypt)
- Predykcje (regresja liniowa, trendy rosnące/malejące/stabilne)
- Plan oszczędności (chronione kategorie, limit 30% cięć, priorytetyzacja)
- Walidacja transakcji
- Obliczenia budżetowe



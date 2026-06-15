# Projekt zaliczeniowy z przedmiotu "Projektowanie aplikacji internetowych"

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




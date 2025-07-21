# Insur.Cap - Avtonomni InsurTech Sistem

## 🎯 O projektu
Insur.Cap je napreden sistem za avtomatizacijo zavarovalniških procesov s poudarkom na trajnostnih praksah.

## 🚀 Ključne funkcionalnosti

### 1. MGA Analitik
- Avtomatska kategorizacija zavarovalniških povpraševanj
- Identifikacija ključnih tveganj
- Generiranje priporočil za zavarovanje
- Analiza vhodnih dokumentov (PDF, CSV, DOC)

### 2. Ocenjevalec tveganj (Underwriter)
- Izračun ocene tveganja
- Predlaganje ustreznih zavarovalnih polic
- Izračun premij
- Odkrivanje potencialnih prevar

### 3. Upravitelj polic
- Ustvarjanje osnutkov polic
- Določanje kritja in izključitev
- Generiranje pogojev zavarovanja
- Upravljanje posebnih pogojev

### 4. Analitik izpostavljenosti
- Izračun izpostavljenosti tveganjem
- Analiza faktorjev tveganja
- Predlogi za zmanjšanje tveganj
- Ocena zaupanja v analizo

### 5. ESG skladnost
- Analiza okoljskega vpliva
- Ocena ogljičnega odtisa
- Integracija z vremenskimi podatki
- Predlogi za trajnostno poslovanje

### 6. Orodje za sledenje ogljičnemu odtisu
- Izračun osebnega ogljičnega odtisa
- Shranjevanje in prikaz napredka preko Supabase
- Preprosto vodenje izzivov in nagrajevanje

## 💻 Tehnične specifikacije
- Python 3.8+
- Gradio UI
- Asyncio za asinhrono delovanje
- Integracija z zunanjimi API-ji (Climatiq, Weather API, Google API)
- Beleženje dogodkov (logging)
- Podatkovna baza PostgreSQL/Supabase

## 🛠️ Namestitev in zagon
1. Kloniraj repozitorij
2. Namesti odvisnosti z `pip install -r requirements.txt`
3. Nastavi okoljske spremenljivke za Supabase in druge API ključe
4. Zaženi glavno aplikacijo z `python main.py`

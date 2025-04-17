# Makefile

.PHONY: deps up

## 1️⃣ Install all dependencies
deps:
	@echo "Installing backend deps…"
	cd backend && \
		python3 -m venv venv && \
		. venv/bin/activate && \
		pip install --upgrade pip && \
		pip install -r requirements.txt
	@echo "Installing frontend deps…"
	cd frontend && npm ci

## 2️⃣ Start both servers (in two tabs)
up:
	@echo "→ Tab 1: Starting Django"
	cd backend && . venv/bin/activate && python manage.py migrate && python manage.py runserver
	@echo "→ Tab 2: Starting React"
	cd frontend && npm start

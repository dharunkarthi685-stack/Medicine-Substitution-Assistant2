#!/usr/bin/env bash
# Build script for Vercel Python 3.12 deployment
echo "Installing dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Applying migrations..."
python manage.py migrate --noinput

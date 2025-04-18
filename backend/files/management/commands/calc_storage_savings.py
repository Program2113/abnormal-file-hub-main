# files/management/commands/calc_storage_savings.py
from django.core.management.base import BaseCommand
from files.utils import calculate_storage_savings

class Command(BaseCommand):
    help = 'Calculates and displays storage savings due to file deduplication.'

    def handle(self, *args, **options):
        savings = calculate_storage_savings()
        self.stdout.write(f"Total storage savings: {savings} bytes")

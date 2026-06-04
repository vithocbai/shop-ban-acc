import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.payment.services.card import generate_cards
from django.contrib.auth import get_user_model
from apps.payment.models import Card

User = get_user_model()
admin_user = User.objects.filter(is_superuser=True).first()

if not admin_user:
    print("No admin user found. Create a superuser first!")
else:
    print("Creating mock data for Cards...")
    
    cards_100k = generate_cards(20, 100000, admin_user)
    print(f"Created {len(cards_100k)} cards (100k)")
    
    cards_50k = generate_cards(10, 50000, admin_user)
    print(f"Created {len(cards_50k)} cards (50k)")
    
    cards_500k = generate_cards(5, 500000, admin_user)
    print(f"Created {len(cards_500k)} VIP cards (500k)")
    
    import random
    from django.utils import timezone
    
    all_cards = list(Card.objects.all())
    
    normal_user = User.objects.filter(is_superuser=False).first()
    
    for i in range(5):
        if i < len(all_cards):
            card = all_cards[i]
            card.status = Card.Status.USED
            card.used_at = timezone.now()
            if normal_user:
                card.used_by = normal_user
            else:
                card.used_by = admin_user
            card.save()
            
    for i in range(5, 7):
        if i < len(all_cards):
            card = all_cards[i]
            card.status = Card.Status.LOCKED
            card.save()

    print(f"Done! Total cards in system: {Card.objects.count()}")

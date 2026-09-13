import uuid
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from medicines.models import Medicine
from orders.models import Order, OrderItem
from payments.models import Transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds complete demo environment: users, medicines, orders, transactions and analytics data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Beginning complete demo seeding...')

        # 1. Seed medicines first
        call_command('seed_medicines')

        # 2. Seed Admin User
        admin_email = 'admin@medassist.com'
        if not User.objects.filter(email=admin_email).exists():
            admin_user = User.objects.create_superuser(
                email=admin_email,
                password='adminpassword123',
                first_name='Medical',
                last_name='Director',
                phone='+91 98765 43210',
                role='admin'
            )
            self.stdout.write(self.style.SUCCESS(f"Created Admin account: {admin_email} / adminpassword123"))
        else:
            admin_user = User.objects.get(email=admin_email)
            admin_user.set_password('adminpassword123')
            admin_user.is_active = True
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.role = 'admin'
            admin_user.save(update_fields=['password', 'is_active', 'is_staff', 'is_superuser', 'role'])
            self.stdout.write(self.style.SUCCESS(f"Reset Admin demo credentials: {admin_email} / adminpassword123"))

        # 3. Seed Demo Patient User
        user_email = 'patient@example.com'
        if not User.objects.filter(email=user_email).exists():
            demo_user = User.objects.create_user(
                email=user_email,
                password='userpassword123',
                first_name='Rahul',
                last_name='Sharma',
                phone='+91 91234 56789',
                address='Flat 402, Green Meadows, Anna Nagar',
                city='Chennai',
                state='Tamil Nadu',
                pincode='600040',
                role='user'
            )
            self.stdout.write(self.style.SUCCESS(f"Created Demo User: {user_email} / userpassword123"))
        else:
            demo_user = User.objects.get(email=user_email)
            demo_user.set_password('userpassword123')
            demo_user.is_active = True
            demo_user.role = 'user'
            demo_user.save(update_fields=['password', 'is_active', 'role'])
            self.stdout.write(self.style.SUCCESS(f"Reset Patient demo credentials: {user_email} / userpassword123"))

        # 4. Seed sample historical orders for analytics and order tracking
        if Order.objects.count() < 3:
            dolo = Medicine.objects.filter(name='Dolo 650').first()
            augmentin = Medicine.objects.filter(name='Augmentin 625 Duo').first()
            telmikind = Medicine.objects.filter(name='Telmikind 40').first()
            pantodac = Medicine.objects.filter(name='Pantodac 40').first()

            if dolo and telmikind:
                order1 = Order.objects.create(
                    order_number=f"ORD-{uuid.uuid4().hex[:8].upper()}",
                    user=demo_user,
                    fulfillment_type='HOME_DELIVERY',
                    shipping_name=f"{demo_user.first_name} {demo_user.last_name}",
                    shipping_phone=demo_user.phone,
                    shipping_address=demo_user.address,
                    shipping_city=demo_user.city,
                    shipping_state=demo_user.state,
                    shipping_pincode=demo_user.pincode,
                    payment_method='RAZORPAY',
                    payment_status='PAID',
                    order_status='DELIVERED',
                    subtotal=Decimal('127.00'),
                    delivery_fee=Decimal('30.00'),
                    tax_amount=Decimal('6.35'),
                    total_amount=Decimal('163.35')
                )
                OrderItem.objects.create(
                    order=order1,
                    medicine=dolo,
                    medicine_name=dolo.name,
                    dosage_form=dolo.dosage_form,
                    strength=dolo.strength,
                    quantity=2,
                    unit_price=dolo.price,
                    total_price=dolo.price * 2
                )
                OrderItem.objects.create(
                    order=order1,
                    medicine=telmikind,
                    medicine_name=telmikind.name,
                    dosage_form=telmikind.dosage_form,
                    strength=telmikind.strength,
                    quantity=1,
                    unit_price=telmikind.price,
                    total_price=telmikind.price
                )
                Transaction.objects.create(
                    order=order1,
                    razorpay_order_id=f"order_{uuid.uuid4().hex[:14]}",
                    razorpay_payment_id=f"pay_{uuid.uuid4().hex[:14]}",
                    razorpay_signature="sig_demo_verified_hash_98374298374",
                    amount=order1.total_amount,
                    currency='INR',
                    status='SUCCESS'
                )

            if augmentin and pantodac:
                order2 = Order.objects.create(
                    order_number=f"ORD-{uuid.uuid4().hex[:8].upper()}",
                    user=demo_user,
                    fulfillment_type='PHARMACY_PICKUP',
                    shipping_name=f"{demo_user.first_name} {demo_user.last_name}",
                    shipping_phone=demo_user.phone,
                    shipping_address="Apollo Pharmacy Pickup Point, Anna Nagar Main Branch",
                    shipping_city="Chennai",
                    shipping_state="Tamil Nadu",
                    shipping_pincode="600040",
                    payment_method='COD',
                    payment_status='PAID',
                    order_status='CONFIRMED',
                    subtotal=Decimal('323.00'),
                    delivery_fee=Decimal('0.00'),
                    tax_amount=Decimal('16.15'),
                    total_amount=Decimal('339.15')
                )
                OrderItem.objects.create(
                    order=order2,
                    medicine=augmentin,
                    medicine_name=augmentin.name,
                    dosage_form=augmentin.dosage_form,
                    strength=augmentin.strength,
                    quantity=1,
                    unit_price=augmentin.price,
                    total_price=augmentin.price
                )
                OrderItem.objects.create(
                    order=order2,
                    medicine=pantodac,
                    medicine_name=pantodac.name,
                    dosage_form=pantodac.dosage_form,
                    strength=pantodac.strength,
                    quantity=1,
                    unit_price=pantodac.price,
                    total_price=pantodac.price
                )

            self.stdout.write(self.style.SUCCESS("Demo orders and transactions created successfully!"))

        self.stdout.write(self.style.SUCCESS("Complete demo setup finished!"))

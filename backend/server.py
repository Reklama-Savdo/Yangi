from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Request, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import shutil
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import pandas as pd
from io import BytesIO
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionResponse, CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'reklama_savdo_secret_key_2025')
JWT_ALGORITHM = "HS256"

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Mount uploads directory for serving static files
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# ===================== MODELS =====================

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    quantity: int = 0
    sku: str = ""
    image_url: str = ""

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    quantity: int = 0
    sku: str = ""
    image_url: str = ""
    sort_order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItem]
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    customer_address: str

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[OrderItem]
    total_amount: float
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    status: str = "pending"
    payment_status: str = "unpaid"
    payment_session_id: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str = ""
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    message: str = ""

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    session_id: str
    amount: float
    currency: str = "usd"
    status: str = "initiated"
    payment_status: str = "pending"
    metadata: Dict[str, Any] = {}
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProductSortUpdate(BaseModel):
    product_id: str
    sort_order: int

class SiteSettings(BaseModel):
    phone: str = "+998 (98) 177 36 33"
    email: str = "reklamasavdo4@gmail.com"
    address: str = "Andijan, Uzbekistan"
    working_hours_weekday: str = "Monday - Saturday: 9:00 AM - 7:00 PM"
    working_hours_weekend: str = "Sunday: 11:00 AM - 6:00 PM"
    map_lat: float = 40.7877600
    map_lng: float = 72.3417839

class AboutContent(BaseModel):
    hero_title: str = "REKLAMA SAVDO"
    hero_subtitle: str = "We are a leading provider of advertising signage and digital printing materials."
    story_title: str = "Building Brands Since Day One"
    story_content: str = "REKLAMA SAVDO was founded with a simple mission: to help businesses stand out."
    mission: str = "To deliver exceptional advertising solutions that make brands shine."
    vision: str = "To be the most trusted partner for businesses seeking quality signage."
    values: List[Dict[str, str]] = []

# ===================== AUTH HELPERS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(email: str) -> str:
    payload = {
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        admin = await db.admins.find_one({"email": email}, {"_id": 0})
        if not admin:
            raise HTTPException(status_code=401, detail="Invalid token")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===================== AUTH ROUTES =====================

@api_router.get("/auth/can-register")
async def can_register():
    admin_count = await db.admins.count_documents({})
    return {"can_register": admin_count == 0}

@api_router.post("/auth/register")
async def register_admin(admin: AdminCreate):
    admin_count = await db.admins.count_documents({})
    if admin_count > 0:
        raise HTTPException(status_code=403, detail="Registration is disabled. Admin already exists.")
    
    existing = await db.admins.find_one({"email": admin.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    admin_doc = {
        "id": str(uuid.uuid4()),
        "email": admin.email,
        "password": hash_password(admin.password),
        "name": admin.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admins.insert_one(admin_doc)
    token = create_token(admin.email)
    return {"token": token, "admin": {"email": admin.email, "name": admin.name}}

@api_router.post("/auth/login")
async def login_admin(login: AdminLogin):
    admin = await db.admins.find_one({"email": login.email}, {"_id": 0})
    if not admin or not verify_password(login.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(login.email)
    return {"token": token, "admin": {"email": admin["email"], "name": admin["name"]}}

@api_router.get("/auth/me")
async def get_me(admin = Depends(get_current_admin)):
    return {"email": admin["email"], "name": admin["name"]}

# ===================== IMAGE UPLOAD =====================

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), admin = Depends(get_current_admin)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = UPLOADS_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"filename": filename, "url": f"/uploads/{filename}"}

# ===================== PRODUCT ROUTES =====================

@api_router.get("/products")
async def get_products(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).sort("sort_order", 1).to_list(1000)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products")
async def create_product(product: ProductCreate, admin = Depends(get_current_admin)):
    product_doc = Product(**product.model_dump())
    doc = product_doc.model_dump()
    await db.products.insert_one(doc)
    return {"id": doc["id"], "message": "Product created"}

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductCreate, admin = Depends(get_current_admin)):
    update_data = product.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated"}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin = Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

@api_router.post("/products/upload-excel")
async def upload_products_excel(file: UploadFile = File(...), admin = Depends(get_current_admin)):
    contents = await file.read()
    try:
        if file.filename.endswith('.xlsx'):
            df = pd.read_excel(BytesIO(contents), engine='openpyxl')
        elif file.filename.endswith('.xls'):
            df = pd.read_excel(BytesIO(contents), engine='xlrd')
        else:
            df = pd.read_csv(BytesIO(contents))
        
        products_added = 0
        for _, row in df.iterrows():
            product_doc = Product(
                name=str(row.get('name', '')),
                description=str(row.get('description', '')),
                price=float(row.get('price', 0)),
                category=str(row.get('category', 'General')),
                quantity=int(row.get('quantity', 0)),
                sku=str(row.get('sku', '')),
                image_url=str(row.get('image_url', ''))
            )
            await db.products.insert_one(product_doc.model_dump())
            products_added += 1
        
        return {"message": f"Successfully added {products_added} products"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@api_router.put("/products/sort/update")
async def update_product_sort(updates: List[ProductSortUpdate], admin = Depends(get_current_admin)):
    for update in updates:
        await db.products.update_one(
            {"id": update.product_id},
            {"$set": {"sort_order": update.sort_order}}
        )
    return {"message": "Sort order updated"}

@api_router.get("/categories")
async def get_categories():
    categories = await db.products.distinct("category")
    return categories

# ===================== ORDER ROUTES =====================

@api_router.post("/orders")
async def create_order(order: OrderCreate):
    total = sum(item.price * item.quantity for item in order.items)
    order_doc = Order(
        items=[item.model_dump() for item in order.items],
        total_amount=total,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        customer_address=order.customer_address
    )
    doc = order_doc.model_dump()
    await db.orders.insert_one(doc)
    return {"id": doc["id"], "total_amount": total}

@api_router.get("/orders")
async def get_orders(status: Optional[str] = None, admin = Depends(get_current_admin)):
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, admin = Depends(get_current_admin)):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if status == "cancelled" and order.get("status") != "cancelled":
        for item in order.get("items", []):
            await db.products.update_one(
                {"id": item["product_id"]},
                {"$inc": {"quantity": item["quantity"]}}
            )
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Order status updated"}

# ===================== PAYMENT ROUTES =====================

@api_router.post("/payments/checkout")
async def create_checkout(order_id: str, request: Request, origin_url: Optional[str] = None):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    host_url = origin_url or str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{host_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/payment/cancel?order_id={order_id}"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(order["total_amount"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": order_id}
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    payment_doc = PaymentTransaction(
        order_id=order_id,
        session_id=session.session_id,
        amount=float(order["total_amount"]),
        currency="usd",
        status="initiated",
        payment_status="pending",
        metadata={"order_id": order_id}
    )
    await db.payment_transactions.insert_one(payment_doc.model_dump())
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"payment_session_id": session.session_id}}
    )
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        status = await stripe_checkout.get_checkout_status(session_id)
        
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        if transaction and transaction.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": status.status, "payment_status": status.payment_status}}
            )
            
            if status.payment_status == "paid":
                order = await db.orders.find_one({"payment_session_id": session_id})
                if order and order.get("payment_status") != "paid":
                    await db.orders.update_one(
                        {"payment_session_id": session_id},
                        {"$set": {
                            "payment_status": "paid",
                            "status": "confirmed",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }}
                    )
                    for item in order.get("items", []):
                        await db.products.update_one(
                            {"id": item["product_id"]},
                            {"$inc": {"quantity": -item["quantity"]}}
                        )
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            order_id = webhook_response.metadata.get("order_id")
            
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "completed", "payment_status": "paid"}}
            )
            
            order = await db.orders.find_one({"id": order_id})
            if order and order.get("payment_status") != "paid":
                await db.orders.update_one(
                    {"id": order_id},
                    {"$set": {
                        "payment_status": "paid",
                        "status": "confirmed",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                for item in order.get("items", []):
                    await db.products.update_one(
                        {"id": item["product_id"]},
                        {"$inc": {"quantity": -item["quantity"]}}
                    )
        
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ===================== CONTACT ROUTES =====================

@api_router.post("/contact")
async def create_contact(contact_data: ContactCreate):
    contact = ContactMessage(
        name=contact_data.name,
        email=contact_data.email,
        phone=contact_data.phone,
        message=contact_data.message
    )
    await db.contacts.insert_one(contact.model_dump())
    return {"message": "Message sent successfully"}

@api_router.get("/contacts")
async def get_contacts(admin = Depends(get_current_admin)):
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return contacts

# ===================== SITE SETTINGS ROUTES =====================

@api_router.get("/settings/contact")
async def get_contact_settings():
    settings = await db.site_settings.find_one({"type": "contact"}, {"_id": 0})
    if not settings:
        default = SiteSettings()
        return default.model_dump()
    return settings.get("data", SiteSettings().model_dump())

@api_router.put("/settings/contact")
async def update_contact_settings(settings: SiteSettings, admin = Depends(get_current_admin)):
    await db.site_settings.update_one(
        {"type": "contact"},
        {"$set": {"type": "contact", "data": settings.model_dump()}},
        upsert=True
    )
    return {"message": "Contact settings updated"}

@api_router.get("/settings/about")
async def get_about_settings():
    settings = await db.site_settings.find_one({"type": "about"}, {"_id": 0})
    if not settings:
        default = AboutContent()
        return default.model_dump()
    return settings.get("data", AboutContent().model_dump())

@api_router.put("/settings/about")
async def update_about_settings(content: AboutContent, admin = Depends(get_current_admin)):
    await db.site_settings.update_one(
        {"type": "about"},
        {"$set": {"type": "about", "data": content.model_dump()}},
        upsert=True
    )
    return {"message": "About content updated"}

# ===================== ANALYTICS ROUTES =====================

@api_router.get("/analytics")
async def get_analytics(admin = Depends(get_current_admin)):
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    confirmed_orders = await db.orders.count_documents({"status": "confirmed"})
    
    paid_orders = await db.orders.find({"payment_status": "paid"}, {"_id": 0}).to_list(1000)
    total_revenue = sum(order.get("total_amount", 0) for order in paid_orders)
    
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    low_stock = await db.products.find({"quantity": {"$lte": 5}}, {"_id": 0}).to_list(100)
    
    category_sales = {}
    for order in paid_orders:
        for item in order.get("items", []):
            product = await db.products.find_one({"id": item.get("product_id")}, {"_id": 0})
            if product:
                category = product.get("category", "Other")
                category_sales[category] = category_sales.get(category, 0) + (item.get("price", 0) * item.get("quantity", 0))
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "confirmed_orders": confirmed_orders,
        "total_revenue": total_revenue,
        "recent_orders": recent_orders,
        "low_stock_products": low_stock,
        "category_sales": category_sales
    }

# ===================== ROOT & HEALTH =====================

@api_router.get("/")
async def root():
    return {"message": "REKLAMA SAVDO API", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

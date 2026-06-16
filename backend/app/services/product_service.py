from sqlalchemy.orm import Session
from app.models import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

def get_products(db: Session, page: int = 1, page_size: int = 10, category: str = None):
    query = db.query(Product)
    
    if category:
        query = query.filter(Product.category == category)
    
    total = query.count()
    products = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "list": [ProductResponse.model_validate(p) for p in products],
        "total": total,
        "page": page,
        "page_size": page_size
    }

def get_categories(db: Session):
    categories = db.query(Product.category).distinct().filter(Product.category.isnot(None)).all()
    return [cat[0] for cat in categories if cat[0]]

def get_product(db: Session, product_id: int) -> Product | None:
    return db.query(Product).filter(Product.id == product_id).first()

def create_product(db: Session, product: ProductCreate) -> Product:
    db_product = Product(
        name=product.name,
        description=product.description,
        price_points=product.price_points,
        stock=product.stock,
        image_url=product.image_url,
        category=product.category
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: ProductUpdate) -> Product | None:
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db_product.name = product_update.name
        db_product.description = product_update.description
        db_product.price_points = product_update.price_points
        db_product.stock = product_update.stock
        db_product.category = product_update.category
        if product_update.image_url:
            db_product.image_url = product_update.image_url
        db_product.updated_at = __import__('sqlalchemy').sql.func.current_timestamp()
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int) -> bool:
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return True
    return False
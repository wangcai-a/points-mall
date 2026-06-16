import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import Product

def update_product_images():
    db = SessionLocal()
    
    product_images = {
        "笔记本": "https://neeko-copilot.bytedance.net/api/text2image?prompt=beautiful%20notebook%20stationery%20product%20photo%20white%20background&image_size=portrait_4_3",
        "钢笔": "https://neeko-copilot.bytedance.net/api/text2image?prompt=elegant%20fountain%20pen%20luxury%20stationery%20product%20photo&image_size=portrait_4_3",
        "书包": "https://neeko-copilot.bytedance.net/api/text2image?prompt=fashion%20backpack%20school%20bag%20product%20photo%20white%20background&image_size=portrait_4_3",
        "文具盒": "https://neeko-copilot.bytedance.net/api/text2image?prompt=multifunction%20pencil%20case%20stationery%20product%20photo&image_size=portrait_4_3",
        "运动水杯": "https://neeko-copilot.bytedance.net/api/text2image?prompt=sports%20water%20bottle%20large%20capacity%20product%20photo&image_size=portrait_4_3",
        "卡通贴纸": "https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20cartoon%20stickers%20colorful%20product%20photo&image_size=portrait_4_3",
        "书签": "https://neeko-copilot.bytedance.net/api/text2image?prompt=beautiful%20bookmarks%20set%20elegant%20product%20photo&image_size=portrait_4_3",
        "奖状": "https://neeko-copilot.bytedance.net/api/text2image?prompt=certificate%20award%20diploma%20golden%20product%20photo&image_size=portrait_4_3",
    }
    
    updated_count = 0
    for product_name, image_url in product_images.items():
        product = db.query(Product).filter(Product.name == product_name).first()
        if product:
            if not product.image_url or product.image_url == "":
                product.image_url = image_url
                updated_count += 1
                print(f"✓ 更新商品 '{product_name}' 的图片")
            else:
                print(f"✓ 商品 '{product_name}' 已有图片，跳过")
        else:
            print(f"✗ 未找到商品 '{product_name}'")
    
    db.commit()
    db.close()
    
    print(f"\n更新完成！共更新了 {updated_count} 个商品的图片。")

if __name__ == "__main__":
    update_product_images()
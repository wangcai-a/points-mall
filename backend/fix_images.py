import sqlite3

conn = sqlite3.connect('test.db')
cursor = conn.cursor()

product_images = {
    "笔记本": "https://picsum.photos/seed/notebook/400/400",
    "钢笔": "https://picsum.photos/seed/pen/400/400",
    "书包": "https://picsum.photos/seed/bag/400/400",
    "文具盒": "https://picsum.photos/seed/pencilcase/400/400",
    "运动水杯": "https://picsum.photos/seed/bottle/400/400",
    "卡通贴纸": "https://picsum.photos/seed/stickers/400/400",
    "书签": "https://picsum.photos/seed/bookmark/400/400",
    "奖状": "https://picsum.photos/seed/certificate/400/400",
}

for name, url in product_images.items():
    cursor.execute("UPDATE products SET image_url = ? WHERE name = ?", (url, name))
    print(f"Updated {name}: {url}")

conn.commit()
conn.close()
print("\nDone!")

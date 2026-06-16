import sqlite3
conn = sqlite3.connect('../test.db')
cursor = conn.cursor()
cursor.execute('SELECT name, image_url FROM products')
results = cursor.fetchall()
for row in results:
    print(f"{row[0]}: {row[1]}")
conn.close()

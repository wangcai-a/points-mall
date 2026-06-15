# 商品管理接口测试案例

## 1. 功能概述

商品管理模块负责商品信息的增删改查操作，包含商品列表查询、分类获取、详情获取、创建、更新和删除功能。

## 2. 测试用例

### 2.1 GET /api/products - 获取商品列表

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| PRO-001 | 获取全部商品列表 | 1. 登录获取token<br>2. 发送GET请求到 `/api/products` | 返回状态码200<br>`code: 200`<br>`data.list` 包含商品列表<br>`data.total` > 0 |
| PRO-002 | 分页查询 | 1. 登录获取token<br>2. 发送GET请求到 `/api/products?page=1&pageSize=5` | 返回状态码200<br>`data.list` 长度不超过5<br>`data.page` = 1 |
| PRO-003 | 按分类筛选 | 1. 登录获取token<br>2. 发送GET请求到 `/api/products?category=学习用品` | 返回状态码200<br>`data.list` 只包含学习用品分类的商品 |
| PRO-004 | 未登录访问（公开接口） | 1. 发送GET请求到 `/api/products`<br>2. 不携带token | 返回状态码200<br>正常返回商品列表（公开接口） |

### 2.2 GET /api/products/categories - 获取商品分类列表

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| PRO-005 | 获取分类列表 | 1. 登录获取token<br>2. 发送GET请求到 `/api/products/categories` | 返回状态码200<br>`code: 200`<br>`data` 为分类数组 |
| PRO-006 | 未登录访问（公开接口） | 1. 发送GET请求到 `/api/products/categories`<br>2. 不携带token | 返回状态码200<br>正常返回分类列表（公开接口） |

### 2.3 GET /api/products/:id - 获取商品详情

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| PRO-007 | 获取存在的商品详情 | 1. 登录获取token<br>2. 发送GET请求到 `/api/products/1` | 返回状态码200<br>`code: 200`<br>`data.id` = 1<br>`data.name` 不为空 |
| PRO-008 | 获取不存在的商品 | 1. 登录获取token<br>2. 发送GET请求到 `/api/products/9999` | 返回状态码404<br>`code: 404`<br>`message` 包含"商品不存在" |
| PRO-009 | 未登录访问商品详情 | 1. 发送GET请求到 `/api/products/1`<br>2. 不携带token | 返回状态码200<br>正常返回商品详情（公开接口） |

### 2.4 POST /api/products - 创建商品

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| PRO-010 | 正常创建商品 | 1. 登录获取token<br>2. 发送POST请求到 `/api/products`<br>3. 请求体：`{"name": "测试商品", "description": "描述", "price_points": 50, "stock": 100, "image_url": "/images/test.jpg", "category": "学习用品"}` | 返回状态码200<br>`code: 200`<br>`message` = "创建成功"<br>`data.id` 不为空 |
| PRO-011 | 创建失败 - 缺少名称 | 1. 登录获取token<br>2. 发送POST请求到 `/api/products`<br>3. 请求体：`{"description": "描述", "price_points": 50}` | 返回状态码400<br>`code: 400`<br>`message` 包含"商品名称不能为空" |
| PRO-012 | 创建失败 - 积分负数 | 1. 登录获取token<br>2. 发送POST请求到 `/api/products`<br>3. 请求体：`{"name": "测试", "description": "描述", "price_points": -10}` | 返回状态码400<br>`code: 400`<br>`message` 包含"积分不能为负数" |
| PRO-013 | 创建失败 - 库存负数 | 1. 登录获取token<br>2. 发送POST请求到 `/api/products`<br>3. 请求体：`{"name": "测试", "description": "描述", "price_points": 50, "stock": -5}` | 返回状态码400<br>`code: 400`<br>`message` 包含"库存不能为负数" |
| PRO-014 | 未登录创建商品 | 1. 发送POST请求到 `/api/products`<br>2. 不携带token | 返回状态码401<br>`code: 401`<br>`message` 包含"未登录" |

### 2.5 PUT /api/products/:id - 更新商品信息

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| PRO-015 | 正常更新商品 | 1. 登录获取token<br>2. 发送PUT请求到 `/api/products/1`<br>3. 请求体：`{"name": "更新名称", "price_points": 60}` | 返回状态码200<br>`code: 200`<br>`message` = "更新成功" |
| PRO-016 | 更新不存在的商品 | 1. 登录获取token<br>2. 发送PUT请求到 `/api/products/9999`<br>3. 请求体：`{"name": "测试"}` | 返回状态码404<br>`code: 404`<br>`message` 包含"商品不存在" |
| PRO-017 | 更新部分字段 | 1. 登录获取token<br>2. 发送PUT请求到 `/api/products/1`<br>3. 请求体：`{"stock": 50}` | 返回状态码200<br>`code: 200`<br>仅更新库存字段 |

### 2.6 DELETE /api/products/:id - 删除商品

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| PRO-018 | 正常删除商品 | 1. 登录获取token<br>2. 发送DELETE请求到 `/api/products/1` | 返回状态码200<br>`code: 200`<br>`message` = "删除成功" |
| PRO-019 | 删除不存在的商品 | 1. 登录获取token<br>2. 发送DELETE请求到 `/api/products/9999` | 返回状态码404<br>`code: 404`<br>`message` 包含"商品不存在" |
| PRO-020 | 删除有订单关联的商品 | 1. 登录获取token<br>2. 创建订单关联商品ID为1<br>3. 发送DELETE请求到 `/api/products/1` | 返回状态码400<br>`code: 400`<br>`message` 包含"存在关联订单，无法删除" |

## 3. 测试数据

### 3.1 创建商品测试数据

| 商品名称 | 描述 | 所需积分 | 库存 | 分类 | 预期结果 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 笔记本 | 精美笔记本 | 50 | 100 | 学习用品 | 创建成功 |
| 钢笔 | 高档钢笔 | 100 | 50 | 学习用品 | 创建成功 |
| (空) | 描述 | 50 | 100 | 学习用品 | 参数错误 |
| 测试商品 | 描述 | -10 | 100 | 学习用品 | 参数错误 |
| 测试商品 | 描述 | 50 | -5 | 学习用品 | 参数错误 |

## 4. 注意事项

1. 删除商品前需要检查是否存在关联订单
2. 商品积分和库存不允许为负数
3. GET接口为公开接口，学生和教师均可访问
4. POST/PUT/DELETE接口需要教师权限
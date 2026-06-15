# 订单管理接口测试案例

## 1. 功能概述

订单管理模块负责积分兑换订单的创建和状态管理，包含订单列表查询、详情获取、创建订单和更新订单状态功能。

## 2. 测试用例

### 2.1 GET /api/orders - 获取订单列表

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| ORD-001 | 获取全部订单列表 | 1. 登录获取token<br>2. 发送GET请求到 `/api/orders` | 返回状态码200<br>`code: 200`<br>`data.list` 包含订单列表<br>`data.total` >= 0 |
| ORD-002 | 分页查询 | 1. 登录获取token<br>2. 发送GET请求到 `/api/orders?page=1&pageSize=10` | 返回状态码200<br>`data.list` 长度不超过10 |
| ORD-003 | 按状态筛选 - pending | 1. 登录获取token<br>2. 发送GET请求到 `/api/orders?status=pending` | 返回状态码200<br>`data.list` 只包含待处理订单 |
| ORD-004 | 按状态筛选 - completed | 1. 登录获取token<br>2. 发送GET请求到 `/api/orders?status=completed` | 返回状态码200<br>`data.list` 只包含已完成订单 |
| ORD-005 | 按学生ID筛选 | 1. 登录获取token<br>2. 发送GET请求到 `/api/orders?student_id=1` | 返回状态码200<br>`data.list` 只包含学生ID为1的订单 |
| ORD-006 | 组合条件查询 | 1. 登录获取token<br>2. 发送GET请求到 `/api/orders?status=pending&student_id=1&page=1` | 返回状态码200<br>返回符合条件的分页结果 |

### 2.2 POST /api/orders - 创建订单（兑换商品）

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| ORD-007 | 正常创建订单 | 1. 登录获取token<br>2. 确保学生有足够积分（>=商品所需积分）<br>3. 发送POST请求到 `/api/orders`<br>4. 请求体：`{"student_id": 1, "product_id": 1}` | 返回状态码200<br>`code: 200`<br>`message` = "兑换成功"<br>`data.order_id` 不为空 |
| ORD-008 | 创建失败 - 学生不存在 | 1. 登录获取token<br>2. 发送POST请求到 `/api/orders`<br>3. 请求体：`{"student_id": 9999, "product_id": 1}` | 返回状态码404<br>`code: 404`<br>`message` 包含"学生不存在" |
| ORD-009 | 创建失败 - 商品不存在 | 1. 登录获取token<br>2. 发送POST请求到 `/api/orders`<br>3. 请求体：`{"student_id": 1, "product_id": 9999}` | 返回状态码404<br>`code: 404`<br>`message` 包含"商品不存在" |
| ORD-010 | 创建失败 - 积分不足 | 1. 登录获取token<br>2. 确保学生积分 < 商品所需积分<br>3. 发送POST请求到 `/api/orders`<br>4. 请求体：`{"student_id": 1, "product_id": 1}` | 返回状态码400<br>`code: 400`<br>`message` 包含"积分不足" |
| ORD-011 | 创建失败 - 库存不足 | 1. 登录获取token<br>2. 设置商品库存为0<br>3. 发送POST请求到 `/api/orders`<br>4. 请求体：`{"student_id": 1, "product_id": 1}` | 返回状态码400<br>`code: 400`<br>`message` 包含"库存不足" |
| ORD-012 | 创建失败 - 缺少参数 | 1. 登录获取token<br>2. 发送POST请求到 `/api/orders`<br>3. 请求体：`{"student_id": 1}` | 返回状态码400<br>`code: 400`<br>`message` 包含"缺少必要参数" |

### 2.3 GET /api/orders/:id - 获取订单详情

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| ORD-013 | 获取存在的订单详情 | 1. 登录获取token<br>2. 发送GET请求到 `/api/orders/1` | 返回状态码200<br>`code: 200`<br>`data.id` = 1<br>`data.student` 不为空<br>`data.product` 不为空 |
| ORD-014 | 获取不存在的订单 | 1. 登录获取token<br>2. 发送GET请求到 `/api/orders/9999` | 返回状态码404<br>`code: 404`<br>`message` 包含"订单不存在" |

### 2.4 PUT /api/orders/:id - 更新订单状态

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| ORD-015 | 更新订单状态为completed | 1. 登录获取token<br>2. 发送PUT请求到 `/api/orders/1`<br>3. 请求体：`{"status": "completed"}` | 返回状态码200<br>`code: 200`<br>`message` = "更新成功" |
| ORD-016 | 更新订单状态为cancelled | 1. 登录获取token<br>2. 发送PUT请求到 `/api/orders/1`<br>3. 请求体：`{"status": "cancelled"}` | 返回状态码200<br>`code: 200`<br>`message` = "更新成功" |
| ORD-017 | 更新不存在的订单 | 1. 登录获取token<br>2. 发送PUT请求到 `/api/orders/9999`<br>3. 请求体：`{"status": "completed"}` | 返回状态码404<br>`code: 404`<br>`message` 包含"订单不存在" |
| ORD-018 | 更新失败 - 无效状态 | 1. 登录获取token<br>2. 发送PUT请求到 `/api/orders/1`<br>3. 请求体：`{"status": "invalid"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"无效状态" |
| ORD-019 | 重复更新已完成订单 | 1. 登录获取token<br>2. 创建订单并更新为completed<br>3. 再次发送PUT请求到 `/api/orders/1`<br>4. 请求体：`{"status": "completed"}` | 返回状态码200<br>`code: 200`<br>`message` = "更新成功"（幂等性） |

## 3. 测试数据

### 3.1 创建订单测试数据

| 学生ID | 商品ID | 学生积分 | 商品所需积分 | 商品库存 | 预期结果 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | 100 | 50 | 100 | 兑换成功 |
| 1 | 2 | 50 | 100 | 50 | 积分不足 |
| 1 | 1 | 100 | 50 | 0 | 库存不足 |
| 9999 | 1 | - | 50 | 100 | 学生不存在 |
| 1 | 9999 | 100 | - | - | 商品不存在 |

## 4. 业务流程验证

### 4.1 积分兑换流程

| 步骤 | 操作 | 预期状态 |
| :--- | :--- | :--- |
| 1 | 查询学生积分 | student.total_points = 100 |
| 2 | 查询商品信息 | product.price_points = 50, product.stock = 100 |
| 3 | 创建订单 | order.status = pending |
| 4 | 验证学生积分 | student.total_points = 50（扣除后） |
| 5 | 验证商品库存 | product.stock = 99（扣减后） |
| 6 | 更新订单状态为completed | order.status = completed |

### 4.2 订单取消流程

| 步骤 | 操作 | 预期状态 |
| :--- | :--- | :--- |
| 1 | 创建订单 | order.status = pending |
| 2 | 更新订单状态为cancelled | order.status = cancelled |
| 3 | 验证学生积分 | 积分应退回（恢复扣除的积分） |
| 4 | 验证商品库存 | 库存应恢复 |

## 5. 注意事项

1. 创建订单时需要保证事务一致性（积分扣除、库存扣减、订单创建）
2. 取消订单时需要回滚积分和库存
3. 订单状态流转：pending -> completed 或 pending -> cancelled
4. 已完成订单不允许修改状态
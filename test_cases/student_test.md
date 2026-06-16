# 学生管理接口测试案例

## 1. 功能概述

学生管理模块负责学生信息的增删改查操作，包含学生列表查询、详情获取、创建、更新和删除功能。

## 2. 测试用例

### 2.1 GET /api/students - 获取学生列表

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| STU-001 | 获取全部学生列表 | 1. 登录获取token<br>2. 发送GET请求到 `/api/students` | 返回状态码200<br>`code: 200`<br>`data.list` 包含学生列表<br>`data.total` > 0 |
| STU-002 | 分页查询 - 默认参数 | 1. 登录获取token<br>2. 发送GET请求到 `/api/students?page=1&pageSize=10` | 返回状态码200<br>`data.list` 长度不超过10<br>`data.page` = 1<br>`data.pageSize` = 10 |
| STU-003 | 按姓名搜索 | 1. 登录获取token<br>2. 发送GET请求到 `/api/students?name=张三` | 返回状态码200<br>`data.list` 只包含姓名含"张三"的学生 |
| STU-004 | 按班级筛选 | 1. 登录获取token<br>2. 发送GET请求到 `/api/students?class=一年级一班` | 返回状态码200<br>`data.list` 只包含一年级一班的学生 |
| STU-005 | 组合条件查询 | 1. 登录获取token<br>2. 发送GET请求到 `/api/students?name=张&class=一年级&page=1&pageSize=5` | 返回状态码200<br>返回符合条件的分页结果 |
| STU-006 | 未登录访问 | 1. 发送GET请求到 `/api/students`<br>2. 不携带token | 返回状态码401<br>`code: 401`<br>`message` 包含"未登录" |

### 2.2 POST /api/students - 创建学生

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| STU-007 | 正常创建学生 | 1. 登录获取token<br>2. 发送POST请求到 `/api/students`<br>3. 请求体：`{"name": "测试学生", "class": "一年级三班", "total_points": 0}` | 返回状态码200<br>`code: 200`<br>`message` = "创建成功"<br>`data.id` 不为空 |
| STU-008 | 创建失败 - 缺少姓名 | 1. 登录获取token<br>2. 发送POST请求到 `/api/students`<br>3. 请求体：`{"class": "一年级三班"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"姓名不能为空" |
| STU-009 | 创建失败 - 缺少班级 | 1. 登录获取token<br>2. 发送POST请求到 `/api/students`<br>3. 请求体：`{"name": "测试学生"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"班级不能为空" |
| STU-010 | 创建失败 - 积分值为负数 | 1. 登录获取token<br>2. 发送POST请求到 `/api/students`<br>3. 请求体：`{"name": "测试学生", "class": "一年级三班", "total_points": -10}` | 返回状态码400<br>`code: 400`<br>`message` 包含"积分不能为负数" |

### 2.3 GET /api/students/:id - 获取学生详情

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| STU-011 | 获取存在的学生详情 | 1. 登录获取token<br>2. 发送GET请求到 `/api/students/1` | 返回状态码200<br>`code: 200`<br>`data.id` = 1<br>`data.name` 不为空 |
| STU-012 | 获取不存在的学生 | 1. 登录获取token<br>2. 发送GET请求到 `/api/students/9999` | 返回状态码404<br>`code: 404`<br>`message` 包含"学生不存在" |

### 2.4 PUT /api/students/:id - 更新学生信息

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| STU-013 | 正常更新学生信息 | 1. 登录获取token<br>2. 发送PUT请求到 `/api/students/1`<br>3. 请求体：`{"name": "张三", "class": "一年级一班"}` | 返回状态码200<br>`code: 200`<br>`message` = "更新成功" |
| STU-014 | 更新不存在的学生 | 1. 登录获取token<br>2. 发送PUT请求到 `/api/students/9999`<br>3. 请求体：`{"name": "测试"}` | 返回状态码404<br>`code: 404`<br>`message` 包含"学生不存在" |
| STU-015 | 更新部分字段 | 1. 登录获取token<br>2. 发送PUT请求到 `/api/students/1`<br>3. 请求体：`{"name": "张三"}` | 返回状态码200<br>`code: 200`<br>仅更新姓名字段 |

### 2.5 DELETE /api/students/:id - 删除学生

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| STU-016 | 正常删除学生 | 1. 登录获取token<br>2. 发送DELETE请求到 `/api/students/1` | 返回状态码200<br>`code: 200`<br>`message` = "删除成功" |
| STU-017 | 删除不存在的学生 | 1. 登录获取token<br>2. 发送DELETE请求到 `/api/students/9999` | 返回状态码404<br>`code: 404`<br>`message` 包含"学生不存在" |
| STU-018 | 删除有订单记录的学生 | 1. 登录获取token<br>2. 创建订单关联学生ID为1<br>3. 发送DELETE请求到 `/api/students/1` | 返回状态码400<br>`code: 400`<br>`message` 包含"存在关联订单，无法删除" |

### 2.6 GET /api/students/:id/points-history - 获取学生积分变动历史

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| STU-019 | 获取存在学生的积分历史 | 1. 登录获取token<br>2. 发送GET请求到 `/api/students/1/points-history` | 返回状态码200<br>`code: 200`<br>`data.list` 包含积分变动记录 |
| STU-020 | 获取不存在学生的积分历史 | 1. 登录获取token<br>2. 发送GET请求到 `/api/students/9999/points-history` | 返回状态码404<br>`code: 404`<br>`message` 包含"学生不存在" |

## 3. 测试数据

### 3.1 创建学生测试数据

| 姓名 | 班级 | 初始积分 | 预期结果 |
| :--- | :--- | :--- | :--- |
| 张三 | 一年级一班 | 0 | 创建成功 |
| 李四 | 一年级二班 | 100 | 创建成功 |
| (空) | 一年级一班 | 0 | 参数错误 |
| 王五 | (空) | 0 | 参数错误 |
| 赵六 | 一年级三班 | -10 | 参数错误 |

## 4. 注意事项

1. 删除学生前需要检查是否存在关联的订单和积分记录
2. 学生积分可为负数（允许扣除），但创建时不允许负数
3. 分页参数page从1开始，pageSize默认10
4. 更新接口只更新传入的字段，未传入的字段保持不变
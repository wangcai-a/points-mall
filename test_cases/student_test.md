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
| STU-008 | 创建失败 - 缺少姓名 | 1. 登录获取
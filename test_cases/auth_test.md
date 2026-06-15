# 认证接口测试案例

## 1. 功能概述

认证模块负责教师用户的登录验证和身份信息管理，包含登录接口和获取当前用户信息接口。

## 2. 测试用例

### 2.1 POST /api/auth/login - 教师登录

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| AUTH-001 | 正常登录 - 管理员账号 | 1. 发送POST请求到 `/api/auth/login`<br>2. 请求体：`{"username": "admin", "password": "admin123"}` | 返回状态码200<br>返回token和教师信息<br>`code: 200`<br>`data.token` 不为空<br>`data.teacher.id` = 1 |
| AUTH-002 | 登录失败 - 用户名错误 | 1. 发送POST请求到 `/api/auth/login`<br>2. 请求体：`{"username": "wrong", "password": "admin123"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"用户名或密码错误" |
| AUTH-003 | 登录失败 - 密码错误 | 1. 发送POST请求到 `/api/auth/login`<br>2. 请求体：`{"username": "admin", "password": "wrong"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"用户名或密码错误" |
| AUTH-004 | 登录失败 - 用户名为空 | 1. 发送POST请求到 `/api/auth/login`<br>2. 请求体：`{"username": "", "password": "admin123"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"用户名不能为空" |
| AUTH-005 | 登录失败 - 密码为空 | 1. 发送POST请求到 `/api/auth/login`<br>2. 请求体：`{"username": "admin", "password": ""}` | 返回状态码400<br>`code: 400`<br>`message` 包含"密码不能为空" |
| AUTH-006 | 登录失败 - 请求体缺少字段 | 1. 发送POST请求到 `/api/auth/login`<br>2. 请求体：`{"username": "admin"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"缺少必要参数" |

### 2.2 GET /api/auth/me - 获取当前登录教师信息

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| AUTH-007 | 正常获取用户信息 | 1. 先登录获取token<br>2. 发送GET请求到 `/api/auth/me`<br>3. 请求头：`Authorization: Bearer {token}` | 返回状态码200<br>`code: 200`<br>`data.id` = 1<br>`data.username` = "admin" |
| AUTH-008 | 获取失败 - 未登录 | 1. 发送GET请求到 `/api/auth/me`<br>2. 不携带Authorization头 | 返回状态码401<br>`code: 401`<br>`message` 包含"未登录" |
| AUTH-009 | 获取失败 - Token无效 | 1. 发送GET请求到 `/api/auth/me`<br>2. 请求头：`Authorization: Bearer invalid_token` | 返回状态码401<br>`code: 401`<br>`message` 包含"Token无效" |
| AUTH-010 | 获取失败 - Token过期 | 1. 使用过期token发送GET请求到 `/api/auth/me`<br>2. 请求头：`Authorization: Bearer expired_token` | 返回状态码401<br>`code: 401`<br>`message` 包含"Token已过期" |

## 3. 测试数据

### 3.1 登录测试数据

| 用户名 | 密码 | 预期结果 |
| :--- | :--- | :--- |
| admin | admin123 | 登录成功 |
| admin | wrong | 密码错误 |
| wrong | admin123 | 用户名错误 |
| (空) | admin123 | 参数错误 |
| admin | (空) | 参数错误 |

## 4. 注意事项

1. Token有效期为24小时，过期后需要重新登录
2. 密码采用bcrypt哈希存储，不应以明文形式存储或传输
3. 所有敏感操作都需要携带有效的JWT Token
4. Token应存储在安全位置，避免泄露
# 抽奖接口测试案例

## 1. 功能概述

抽奖模块负责抽奖功能的实现，包含奖品列表查询、抽奖操作和抽奖记录查询功能。

## 2. 测试用例

### 2.1 GET /api/lottery/prizes - 获取奖品列表

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| LOT-001 | 获取奖品列表 | 1. 登录获取token<br>2. 发送GET请求到 `/api/lottery/prizes` | 返回状态码200<br>`code: 200`<br>`data` 为奖品数组<br>奖品包含id、name、probability、stock |

### 2.2 POST /api/lottery/draw - 执行抽奖

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| LOT-002 | 正常抽奖 - 中奖 | 1. 登录获取token<br>2. 确保学生有足够积分<br>3. 发送POST请求到 `/api/lottery/draw`<br>4. 请求体：`{"student_id": 1, "cost_points": 20}` | 返回状态码200<br>`code: 200`<br>`message` = "恭喜中奖！"<br>`data.is_win` = true<br>`data.prize_name` 不为空 |
| LOT-003 | 正常抽奖 - 未中奖 | 1. 登录获取token<br>2. 确保学生有足够积分<br>3. 发送POST请求到 `/api/lottery/draw`<br>4. 请求体：`{"student_id": 1, "cost_points": 20}` | 返回状态码200<br>`code: 200`<br>`message` = "很遗憾，未中奖"<br>`data.is_win` = false<br>`data.prize_name` = null |
| LOT-004 | 抽奖失败 - 学生不存在 | 1. 登录获取token<br>2. 发送POST请求到 `/api/lottery/draw`<br>3. 请求体：`{"student_id": 9999, "cost_points": 20}` | 返回状态码404<br>`code: 404`<br>`message` 包含"学生不存在" |
| LOT-005 | 抽奖失败 - 积分不足 | 1. 登录获取token<br>2. 确保学生积分 < 消耗积分<br>3. 发送POST请求到 `/api/lottery/draw`<br>4. 请求体：`{"student_id": 1, "cost_points": 20}` | 返回状态码400<br>`code: 400`<br>`message` 包含"积分不足" |
| LOT-006 | 抽奖失败 - 消耗积分为负数 | 1. 登录获取token<br>2. 发送POST请求到 `/api/lottery/draw`<br>3. 请求体：`{"student_id": 1, "cost_points": -10}` | 返回状态码400<br>`code: 400`<br>`message` 包含"消耗积分不能为负数" |
| LOT-007 | 抽奖失败 - 缺少参数 | 1. 登录获取token<br>2. 发送POST请求到 `/api/lottery/draw`<br>3. 请求体：`{"student_id": 1}` | 返回状态码400<br>`code: 400`<br>`message` 包含"缺少必要参数" |
| LOT-008 | 中奖后库存扣减 | 1. 登录获取token<br>2. 设置奖品库存为1<br>3. 执行抽奖并中奖<br>4. 再次执行抽奖 | 返回状态码200（第一次）<br>奖品库存变为0<br>后续抽奖不再获得该奖品 |

### 2.3 GET /api/lottery/records - 获取抽奖记录

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| LOT-009 | 获取全部抽奖记录 | 1. 登录获取token<br>2. 发送GET请求到 `/api/lottery/records` | 返回状态码200<br>`code: 200`<br>`data.list` 包含抽奖记录<br>`data.total` >= 0 |
| LOT-010 | 分页查询 | 1. 登录获取token<br>2. 发送GET请求到 `/api/lottery/records?page=1&pageSize=10` | 返回状态码200<br>`data.list` 长度不超过10 |
| LOT-011 | 按学生ID筛选 | 1. 登录获取token<br>2. 发送GET请求到 `/api/lottery/records?student_id=1` | 返回状态码200<br>`data.list` 只包含学生ID为1的抽奖记录 |

## 3. 测试数据

### 3.1 抽奖测试数据

| 学生ID | 学生积分 | 消耗积分 | 预期结果 |
| :--- | :--- | :--- | :--- |
| 1 | 100 | 20 | 抽奖成功（中奖/未中奖随机） |
| 1 | 10 | 20 | 积分不足 |
| 9999 | 100 | 20 | 学生不存在 |
| 1 | 100 | -10 | 参数错误 |

### 3.2 奖品配置数据

| 奖品名称 | 中奖概率 | 库存 | 说明 |
| :--- | :--- | :--- | :--- |
| 笔记本 | 0.3 | 50 | 高概率奖品 |
| 钢笔 | 0.2 | 30 | 中概率奖品 |
| 书包 | 0.1 | 10 | 低概率奖品 |
| 谢谢参与 | 0.4 | - | 未中奖（无需库存） |

## 4. 业务流程验证

### 4.1 抽奖流程

| 步骤 | 操作 | 预期状态 |
| :--- | :--- | :--- |
| 1 | 查询学生积分 | student.total_points = 100 |
| 2 | 执行抽奖（消耗20积分） | 扣除积分，生成抽奖记录 |
| 3 | 验证学生积分 | student.total_points = 80 |
| 4 | 验证抽奖记录 | lottery_record.cost_points = 20 |
| 5 | 中奖情况验证 | 若中奖：lottery_record.is_win = true，奖品库存扣减 |

### 4.2 概率验证（统计测试）

| 测试项 | 测试方法 | 预期结果 |
| :--- | :--- | :--- |
| 概率分布 | 执行1000次抽奖 | 各奖品中奖次数符合配置概率 |
| 库存限制 | 某奖品库存为0后抽奖 | 不再抽中该奖品 |
| 随机公平性 | 多次抽奖结果分析 | 结果符合随机分布 |

## 5. 注意事项

1. 抽奖消耗积分后无论是否中奖，积分不予退还
2. 中奖后需要扣减对应奖品库存
3. 奖品库存为0时不应被抽中
4. 抽奖记录需要记录操作教师信息
# 积分管理接口测试案例

## 1. 功能概述

积分管理模块负责学生积分的发放、扣除和批量导入操作，包含发放积分、扣除积分、Excel导入和确认导入功能。

## 2. 测试用例

### 2.1 POST /api/points/award - 发放积分

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| PTS-001 | 正常发放积分 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/award`<br>3. 请求体：`{"student_id": 1, "amount": 100, "reason": "考试成绩优秀"}` | 返回状态码200<br>`code: 200`<br>`message` = "积分发放成功"<br>`data.total_points` 增加100 |
| PTS-002 | 发放失败 - 学生不存在 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/award`<br>3. 请求体：`{"student_id": 9999, "amount": 100, "reason": "奖励"}` | 返回状态码404<br>`code: 404`<br>`message` 包含"学生不存在" |
| PTS-003 | 发放失败 - 金额为负数 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/award`<br>3. 请求体：`{"student_id": 1, "amount": -50, "reason": "奖励"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"发放金额不能为负数" |
| PTS-004 | 发放失败 - 金额为0 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/award`<br>3. 请求体：`{"student_id": 1, "amount": 0, "reason": "奖励"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"发放金额必须大于0" |
| PTS-005 | 发放失败 - 缺少原因 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/award`<br>3. 请求体：`{"student_id": 1, "amount": 100}` | 返回状态码400<br>`code: 400`<br>`message` 包含"请填写发放原因" |

### 2.2 POST /api/points/deduct - 扣除积分

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| PTS-006 | 正常扣除积分 | 1. 登录获取token<br>2. 确保学生积分 >= 扣除金额<br>3. 发送POST请求到 `/api/points/deduct`<br>4. 请求体：`{"student_id": 1, "amount": 50, "reason": "损坏公物"}` | 返回状态码200<br>`code: 200`<br>`message` = "积分扣除成功"<br>`data.total_points` 减少50 |
| PTS-007 | 扣除失败 - 学生不存在 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/deduct`<br>3. 请求体：`{"student_id": 9999, "amount": 50, "reason": "惩罚"}` | 返回状态码404<br>`code: 404`<br>`message` 包含"学生不存在" |
| PTS-008 | 扣除失败 - 金额为负数 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/deduct`<br>3. 请求体：`{"student_id": 1, "amount": -30, "reason": "惩罚"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"扣除金额不能为负数" |
| PTS-009 | 扣除失败 - 金额为0 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/deduct`<br>3. 请求体：`{"student_id": 1, "amount": 0, "reason": "惩罚"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"扣除金额必须大于0" |
| PTS-010 | 扣除失败 - 积分不足 | 1. 登录获取token<br>2. 确保学生积分 < 扣除金额<br>3. 发送POST请求到 `/api/points/deduct`<br>4. 请求体：`{"student_id": 1, "amount": 1000, "reason": "惩罚"}` | 返回状态码400<br>`code: 400`<br>`message` 包含"积分不足，无法扣除" |

### 2.3 POST /api/points/import - 上传Excel文件并解析

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| PTS-011 | 正常上传并解析 | 1. 登录获取token<br>2. 准备有效Excel文件<br>3. 发送POST请求到 `/api/points/import`<br>4. 请求体：multipart/form-data，包含file字段 | 返回状态码200<br>`code: 200`<br>`message` = "解析成功"<br>`data.preview` 包含解析数据 |
| PTS-012 | 上传失败 - 文件格式错误 | 1. 登录获取token<br>2. 上传非Excel文件（如txt）<br>3. 发送POST请求到 `/api/points/import` | 返回状态码400<br>`code: 400`<br>`message` 包含"文件格式错误" |
| PTS-013 | 上传失败 - 文件为空 | 1. 登录获取token<br>2. 上传空文件<br>3. 发送POST请求到 `/api/points/import` | 返回状态码400<br>`code: 400`<br>`message` 包含"文件不能为空" |
| PTS-014 | 解析失败 - 缺少必要列 | 1. 登录获取token<br>2. 上传缺少列的Excel文件<br>3. 发送POST请求到 `/api/points/import` | 返回状态码400<br>`code: 400`<br>`message` 包含"文件格式不正确" |

### 2.4 POST /api/points/import/confirm - 确认导入并更新积分

| 测试编号 | 测试场景 | 测试步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| PTS-015 | 正常确认导入 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/import/confirm`<br>3. 请求体：`{"records": [{"student_id": 1, "change_amount": 100, "reason": "考试奖励"}]}` | 返回状态码200<br>`code: 200`<br>`message` = "导入成功"<br>`data.success_count` = 1 |
| PTS-016 | 导入失败 - 学生不存在 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/import/confirm`<br>3. 请求体：`{"records": [{"student_id": 9999, "change_amount": 100, "reason": "奖励"}]}` | 返回状态码200<br>`code: 200`<br>`data.success_count` = 0<br>`data.fail_count` = 1 |
| PTS-017 | 批量导入 - 部分成功 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/import/confirm`<br>3. 请求体：`{"records": [{"student_id": 1, "change_amount": 100}, {"student_id": 9999, "change_amount": 50}]}` | 返回状态码200<br>`code: 200`<br>`data.success_count` = 1<br>`data.fail_count` = 1 |
| PTS-018 | 导入失败 - 记录为空 | 1. 登录获取token<br>2. 发送POST请求到 `/api/points/import/confirm`<br>3. 请求体：`{"records": []}` | 返回状态码400<br>`code: 400`<br>`message` 包含"导入记录不能为空" |

## 3. 测试数据

### 3.1 发放/扣除积分测试数据

| 学生ID | 操作类型 | 金额 | 原因 | 学生当前积分 | 预期结果 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | award | 100 | 考试优秀 | 0 | 成功，积分变为100 |
| 1 | deduct | 50 | 惩罚 | 100 | 成功，积分变为50 |
| 1 | deduct | 100 | 惩罚 | 50 | 积分不足 |
| 9999 | award | 100 | 奖励 | - | 学生不存在 |
| 1 | award | -50 | 奖励 | 100 | 参数错误 |
| 1 | deduct | -30 | 惩罚 | 100 | 参数错误 |

### 3.2 Excel导入文件格式

| 学号 | 姓名 | 班级 | 积分变动 | 原因 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 张三 | 一年级一班 | +100 | 考试成绩优秀 |
| 2 | 李四 | 一年级二班 | +50 | 作业优秀 |
| 3 | 王五 | 一年级三班 | -20 | 迟到 |

## 4. 业务流程验证

### 4.1 积分变动流程

| 步骤 | 操作 | 预期状态 |
| :--- | :--- | :--- |
| 1 | 查询学生当前积分 | student.total_points = 100 |
| 2 | 发放100积分 | 生成积分记录，type=award |
| 3 | 验证学生积分 | student.total_points = 200 |
| 4 | 查询积分变动记录 | points_record.change_amount = 100 |
| 5 | 扣除50积分 | 生成积分记录，type=deduct |
| 6 | 验证学生积分 | student.total_points = 150 |

### 4.2 Excel导入流程

| 步骤 | 操作 | 预期状态 |
| :--- | :--- | :--- |
| 1 | 上传Excel文件 | 解析文件内容 |
| 2 | 返回预览数据 | 显示valid_count和invalid_count |
| 3 | 确认导入 | 批量更新学生积分 |
| 4 | 生成积分记录 | type=import |
| 5 | 返回导入结果 | 显示success_count和fail_count |

## 5. 注意事项

1. 积分变动需要记录操作教师信息
2. 发放积分不限制上限
3. 扣除积分需要检查积分是否充足（业务规则）
4. Excel导入支持正数（发放）和负数（扣除）
5. 导入失败的记录不影响其他成功记录的导入
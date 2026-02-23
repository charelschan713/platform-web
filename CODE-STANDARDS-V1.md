# 平台代码标准 v1.0
# 所有之后的代码必须严格遵循此标准
# 不得使用其他变量名称

## 重要声明
这是平台的唯一命名标准。
所有新代码、修改代码必须使用以下变量名。
不得自创变量名，不得使用缩写（除非标准里有）。

---

## 一、用户相关

```typescript
user_id                   // 用户UUID
first_name                // 名
last_name                 // 姓
full_name                 // 全名（first+last拼接，不存库）
email                     // 邮箱
phone                     // 电话
role                      // 角色
avatar_url                // 头像URL
stripe_customer_id        // Stripe客户ID
stripe_payment_method_id  // Stripe支付方式ID
```

## 二、租户相关

```typescript
tenant_id             // 租户UUID
tenant_name           // 租户公司名称
tenant_slug           // 租户标识符
tenant_status         // 租户状态
tenant_domain         // 租户自定义域名
stripe_secret_key     // Stripe密钥（加密存储）
resend_api_key        // Resend密钥（加密存储）
twilio_account_sid    // Twilio SID（加密存储）
twilio_auth_token     // Twilio Token（加密存储）
twilio_from_number    // Twilio发件号码
```

## 三、订单相关

```typescript
booking_id            // 订单UUID
booking_number        // 订单显示编号（#ABC12345）
booking_status        // 订单主状态
driver_status         // 司机子状态
payment_status        // 支付子状态
service_type          // 服务类型
trip_type             // 行程类型
vehicle_class         // 平台车型代码
vehicle_type_id       // 租户自定义车型ID
service_city_id       // 服务城市ID
```

## 四、时间相关

```typescript
pickup_datetime         // 接送时间（UTC存库）
pickup_timezone         // 接送时区（Australia/Sydney）
pickup_datetime_local   // 接送本地时间（显示用，不存库）
return_datetime         // 回程时间
duration_hours          // 包车小时数
created_at              // 创建时间（UTC）
updated_at              // 更新时间（UTC）
created_timezone        // 下单时用户IP时区
```

## 五、地址相关

```typescript
pickup_address      // 接送地址
pickup_lat          // 接送纬度
pickup_lng          // 接送经度
dropoff_address     // 目的地址
dropoff_lat         // 目的纬度
dropoff_lng         // 目的经度
waypoints           // 途经点数组
distance_km         // 距离公里数
duration_minutes    // 行程分钟数
```

## 六、乘客相关

```typescript
booker_id           // 下单人ID
booker_name         // 下单人姓名
booker_email        // 下单人邮箱
booker_phone        // 下单人电话
passenger_name      // 乘车人姓名
passenger_phone     // 乘车人电话
passenger_email     // 乘车人邮件
passenger_count     // 乘客人数
flight_number       // 航班号
special_requests    // 特殊要求
```

## 七、金额相关

```typescript
fare                    // 基本车费
toll                    // 过路费
extras                  // 额外费用
surcharge_amount        // 时段加价金额
surcharge_percentage    // 时段加价百分比
discount_type           // 折扣类型
discount_value          // 折扣值
discount_amount         // 折扣金额
discount_applies_to     // 折扣适用范围
subtotal                // 小计（折扣前）
total_price             // 总价（最终）
currency                // 货币代码（AUD/USD）
```

## 八、司机收入相关

```typescript
driver_fare         // 司机基本费
driver_toll         // 司机过路费
driver_extras       // 司机额外费
driver_total        // 司机总收入
driver_gst          // 司机GST金额
driver_subtotal     // 司机小计（含GST前）
```

## 九、支付相关

```typescript
payment_id                  // 支付记录ID
payment_type                // 支付类型
payment_status              // 支付状态
stripe_payment_intent_id    // Stripe支付意图ID
stripe_payment_method_id    // Stripe支付方式ID
charged_amount              // 实际扣款金额
refunded_amount             // 退款金额
supplement_amount           // 补收金额
credit_amount               // Credit Note金额
```

## 十、司机相关

```typescript
driver_id               // 司机UUID
license_number          // 驾照号码
license_expiry          // 驾照到期日
abn                     // 澳洲商业号码
abn_name                // ABN注册名称
is_gst_registered       // 是否注册GST
bank_bsb                // 银行BSB
bank_account            // 银行账号
bank_name               // 银行名称
rating                  // 评分
total_trips             // 总行程数
is_available            // 是否可接单
platform_verified       // 平台审核状态
```

## 十一、车辆相关

```typescript
vehicle_id          // 车辆UUID
make                // 品牌（Toyota）
model               // 型号（Camry）
year                // 年份
color               // 颜色
plate_number        // 车牌号
capacity            // 载客量
platform_class      // 平台车型代码
vehicle_type_id     // 租户自定义车型ID
is_active           // 是否在用
```

## 十二、定价相关

```typescript
pricing_rule_id         // 定价规则ID
base_fare               // 起步价
price_per_km            // 每公里价格
price_per_minute        // 每分钟价格
hourly_rate             // 时薪
minimum_fare            // 最低收费
minimum_hours           // 最少小时数
included_km_per_hour    // 每小时包含公里数
extra_km_rate           // 超出公里单价
surcharge_rules         // 时段加价规则（JSONB）
```

## 十三、Invoice相关

```typescript
invoice_id              // 发票UUID
invoice_number          // 发票编号（INV-2026-0001）
invoice_status          // 发票状态
invoice_subtotal        // 发票小计
invoice_gst             // GST金额
invoice_total           // 发票总额
invoice_period_from     // 发票起始日期
invoice_period_to       // 发票结束日期
paid_at                 // 付款时间
```

## 十四、通知相关

```typescript
notification_type       // 通知类型
notification_channel    // 通知渠道
recipient_type          // 收件人类型
template_id             // 模版ID
sent_at                 // 发送时间
```

## 十五、Connection相关

```typescript
connection_id           // Connection UUID
requester_id            // 发起方租户ID
receiver_id             // 接收方租户ID
connection_status       // 连接状态
```

## 十六、转单相关

```typescript
transfer_id             // 转单UUID
original_booking_id     // 原始订单ID
from_tenant_id          // 原始租户ID
to_tenant_id            // 目标租户ID
transfer_status         // 转单状态
from_percentage         // 原始租户分润%
to_percentage           // 目标租户分润%
transfer_note           // 转单备注
```

---

## 枚举值标准

### booking_status
```
PENDING               // 等待确认
CONFIRMED             // 已确认
IN_PROGRESS           // 进行中
COMPLETED             // 已完成
CANCELLED             // 已取消
NO_SHOW               // 未出现
```

### driver_status（子状态）
```
UNASSIGNED            // 未派单
ASSIGNED              // 已派单
ACCEPTED              // 已接受
DECLINED              // 已拒绝
ON_THE_WAY            // 前往中
ARRIVED               // 已到达
PASSENGER_ON_BOARD    // 乘客已上车
JOB_DONE              // 行程完成
```

### payment_status
```
UNPAID                // 未付款
PAID                  // 已付款
PARTIALLY_REFUNDED    // 部分退款
REFUNDED              // 已退款
NO_SHOW_CHARGED       // No Show已收费
```

### service_type
```
POINT_TO_POINT        // 点对点
HOURLY_CHARTER        // 按小时包车
```

### trip_type
```
ONE_WAY               // 单程
RETURN                // 来回
```

### vehicle_class / platform_class
```
BUSINESS              // 商务级
FIRST                 // 头等级
VAN                   // 厢型车
ELECTRIC              // 电动车
```

### tenant_status
```
PENDING               // 待审核
ACTIVE                // 已激活
SUSPENDED             // 已暂停
```

### driver账号status
```
PENDING               // 待审核
ACTIVE                // 已激活
SUSPENDED             // 已暂停
```

### platform_verified
```
UNVERIFIED            // 未验证
VERIFIED              // 已验证
REJECTED              // 已拒绝
```

### notification_channel
```
EMAIL                 // 邮件
SMS                   // 短信
PUSH                  // 推送通知
```

### recipient_type
```
BOOKER                // 下单人
PASSENGER             // 乘车人
DRIVER                // 司机
TENANT                // 租户
```

### discount_type
```
PROMO                 // 优惠码
MEMBERSHIP            // 会员折扣
MANUAL                // 手动折扣
CORPORATE             // 企业折扣
```

### discount_applies_to
```
FARE_ONLY             // 只折基本车费
TOTAL                 // 折总价
```

### connection_status
```
PENDING               // 待确认
ACTIVE                // 已建立
TERMINATED            // 已解除
```

### transfer_status
```
PENDING               // 待接受
ACCEPTED              // 已接受
REJECTED              // 已拒绝
```

### invoice_status
```
DRAFT                 // 草稿
SENT                  // 已发送
PAID                  // 已付款
```

---

## 命名规则

1. 全部小写+下划线（snake_case）
2. 布尔值用 `is_` 开头: `is_active` / `is_available` / `is_gst_registered`
3. 时间戳用 `_at` 结尾: `created_at` / `updated_at` / `sent_at` / `paid_at`
4. 日期用 `_date` 结尾（如不含时间）: `license_expiry_date`
5. ID用 `_id` 结尾: `booking_id` / `tenant_id` / `driver_id`
6. 数组用复数: `waypoints` / `surcharge_rules` / `allowed_platform_classes`
7. 金额不加货币单位（用currency字段单独存）
8. 不得使用缩写:
   - ❌ `pax` → ✅ `passenger_count`
   - ❌ `addr` → ✅ `address`
   - ❌ `qty` → ✅ `quantity`
9. 前端显示用的拼接字段不存库: `full_name` / `pickup_datetime_local`
10. 加密字段存库时加 `_encrypted` 后缀: `stripe_secret_key_encrypted`

---

## 时间显示格式标准

所有界面统一格式：
```
01 Mar 2026 · 10:40 PM (Sydney)
```

- 数据库存储：UTC
- 显示转换：根据 `pickup_timezone`
- 括号内显示城市名，不用UTC偏移

---

## API Response标准

```json
// 成功
{
  "data": { ... },
  "message": "Success"
}

// 列表
{
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 20
}

// 错误
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}

// 带标签的字段（租户自定义名称）
{
  "vehicle_class": "BUSINESS",
  "vehicle_class_label": "豪华轿车",
  "booking_status": "CONFIRMED",
  "booking_status_label": "已确认"
}
```

---

## 文件命名标准

```
# 后端
模块文件：     kebab-case
  bookings.service.ts
  vehicle-types.service.ts
  tenant-keys.service.ts

# 前端
组件文件：     PascalCase
  BookingCard.tsx
  TenantSidebar.tsx

页面文件：     小写
  page.tsx
  layout.tsx

# 数据库
表名：         snake_case复数
  bookings
  tenant_vehicle_types
  system_constants

字段名：       snake_case
  booking_id
  pickup_datetime
  total_price
```

---

## 重要声明（再次强调）

从现在开始：
- ✅ 所有新代码必须使用以上变量名
- ✅ 修改现有代码时顺便统一变量名
- ✅ 数据库新字段必须遵循此标准
- ✅ API endpoint和response必须遵循此标准
- ❌ 不得自创变量名
- ❌ 不得使用缩写
- ❌ 不得用驼峰（camelCase）在数据库字段

# SYSTEM OVERVIEW

> 代码基于实际文件阅读生成（不依赖猜测）。
> 
> 分析范围：
> 1) `aschauffeur-elite-docs`（主站）
> 2) `car_ios/project`（ASDriver）

---

## 1. 总体架构

### 1.1 主站（aschauffeur-elite-docs）
- 前端：React + React Router + TanStack Query + Supabase JS
- 后端能力：Supabase Edge Functions（`supabase/functions/*`）
- 数据层：Supabase Postgres（类型定义在 `src/integrations/supabase/types.ts`）
- 支付：Stripe（SetupIntent、PaymentIntent、Webhook）
- 通知：Resend（邮件）+ Twilio（短信）
- 角色：Customer / Driver / Admin（`user_roles` + 多套鉴权入口）

### 1.2 ASDriver（car_ios/project）
- 前端：React + React Router（Capacitor/iOS 壳）
- 数据与认证：同一套 Supabase
- 核心：司机任务列表、任务状态推进、GPS 上报、乘客短信消息、本地缓存（SWR）

---

## 2. 主站路由与页面（public / account / admin）

路由定义来源：`aschauffeur-elite-docs/src/App.tsx`

### 2.1 Public 路由
- `/` 首页
- `/contact` 联系
- `/fleet`, `/fleet/:slug` 车队列表/详情
- `/faq`, `/services`, `/about`
- `/cookies`, `/disclaimer`, `/terms`, `/privacy`
- `/locations/:slug` 城市/地点页
- `/thank-you`
- `/offers/online-booking-10-off`
- `/auth`, `/login`, `/auth/callback`, `/reset-password`
- `/confirm-booking`（客户确认改价等）
- `/track`（乘客追踪）
- `/complete-profile`
- `/driver/onboard`（司机 onboarding）
- `/driver-job`, `/d/:code`（司机 job 链接页）
- `/driver-invoice`, `/driver/earnings`

### 2.2 Account 路由
- `/account`（layout）
- `/account/profile`
- `/account/passenger`
- `/account/bookings`
- `/account/bookings/:id`
- `/account/payment`
- `/account/settings`

### 2.3 Admin 路由
- `/admin/bookings`
- `/admin/bookings/:id`
- `/admin/drivers`
- `/admin/vehicles`
- `/admin/dispatch`
- `/admin/audit`
- `/admin/customers`
- `/admin/pricing`
- `/admin/system`
- `/admin/company-profile`
- `/admin/new-booking`
- `/admin/templates`
- `/admin/sync`
- `/admin/export`
- `/admin/driver-invoices`
- `/admin/driver-job-review`

---

## 3. `supabase/functions/` Edge Functions 用途

下面按业务分组（所有函数名均来自代码目录；用途来自对应 `index.ts` 中实际操作对象/调用链）。

### 3.1 支付与 Stripe
- `create-setup-intent`：创建 SetupIntent + 建 booking（`pending_payment`），保存 Stripe customer 关联。
- `add-card` / `remove-card` / `update-payment-nickname`：管理客户已保存卡。
- `book-with-saved-card`：用已保存卡下单，尝试 `PaymentIntent(confirm + off_session + manual capture)`；成功置 `authorized`，失败置 `charge_failed`。
- `create-quote-payment-intent`：报价支付 intent。
- `create-payment-auth`：按服务日期是否<=7天决定是否预授权；并触发 estimate 文档生成。
- `renew-authorization`：续授权（延长/重建授权）。
- `capture-quote-payment`：捕获预授权（`requires_capture -> captured`），并触发确认通知。
- `admin-charge`：后台人工扣款（带 lock/idempotency），处理 `pending_payment|charge_failed`。
- `admin-refund` / `admin-settlement-action`：退款或差额结算（增收/退款）。
- `cancel-quote-payment`：取消支付并联动 booking/assignment 状态。
- `stripe-webhook`：验证签名、幂等去重、处理 `setup_intent.succeeded` / `payment_intent.*` 并写 audit + payment method。

### 3.2 预订与改价
- `create-booking-v2`：新版建单流程（含 pricing/discount/customer/passenger 处理）。
- `quote-and-pay`：报价并支付。
- `confirm-booking`：客户确认 booking。
- `confirm-price-change`：客户确认改价后重建/替换支付 intent。
- `modify-customer-booking` / `admin-modify-booking`：客户/后台改单。
- `customer-requote` / `admin-requote`：重新报价。
- `cancel-customer-booking`：客户取消 booking。
- `admin-create-booking` / `admin-new-booking`相关后端：后台建单。

### 3.3 调度与司机执行
- `admin-dispatch`：分配司机/车辆、生成 dispatch link、推送/短信。
- `send-driver-dispatch-sms`：发送司机派单短信。
- `verify-driver-identity`：司机链接验证（token/short code/device token），返回任务数据。
- `update-driver-status`：司机状态推进（含审计、位置、通知）。
- `report-driver-location`：司机 GPS 上报，写 `driver_locations`。
- `tracking-info`：乘客公开追踪信息（有限字段）。
- `send-tracking-link`：发送追踪链接。
- `report-no-show`：司机报 no-show，通知 admin。
- `upload-driver-photo`：司机现场图片上传并绑定 assignment。

### 3.4 司机账号与资料
- `send-driver-onboarding-link`：司机 onboarding 邀请（SMS/Email）。
- `complete-driver-profile`：司机补全档案。
- `admin-create-driver-auth`：后台创建司机 auth 账号。
- `admin-sync-driver-phones`：同步 driver phone 到 auth 侧。
- `check-driver-compliance`：司机证照到期巡检提醒。

### 3.5 客户账号与资料
- `complete-customer-profile`：客户档案补全。
- `admin-create-minimal-customer`：后台最小客户档案创建。
- `admin-customers`：后台客户管理入口函数。
- `guest-activate-account`：guest 下单后激活账户（invite link）。

### 3.6 OTP / 验证 / 安全
- `send-phone-otp` / `verify-phone-otp`
- `send-email-otp` / `verify-email-otp`
- `send-reset-otp` / `verify-reset-otp`
- `verify-admin-otp`
- `verify-phone-for-profile`
- `verify-recaptcha`

### 3.7 通知与消息
- `send-contact-email`：官网联系表单邮件。
- `send-booking-confirmation`：发送 booking 确认邮件。
- `notify-booking-cancelled`：取消通知。
- `send-passenger-reminder`：乘客行前提醒（短信/偏好控制/日志）。
- `send-driver-message`：司机→乘客短信消息并写 `booking_messages`。
- `receive-passenger-sms`：Twilio 回调接收乘客短信。
- `send-driver-push`：司机 push（设备 token 表）。
- `notify-admin-job-complete`：完单通知 admin。

### 3.8 对账/诊断/文档
- `generate-billing-document` / `render-billing-document` / `generate-invoice`
- `driver-invoice`：司机开票流程。
- `get-driver-schedule` / `get-driver-earnings`
- `generate-route-map` / `google-maps-proxy`
- `data-consistency-check` / `health-check`
- `admin-setup`

---

## 4. 数据库表结构（`src/integrations/supabase/types.ts`）

已定义的 `public.Tables` 共 **36** 张：

1. billing_documents
2. billing_items
3. booking_assignments
4. booking_audit_logs
5. booking_messages
6. booking_settlements
7. bookings
8. company_settings
9. customer_profile_tokens
10. customers
11. discount_rules
12. dispatch_links
13. driver_devices
14. driver_invoice_items
15. driver_invoices
16. driver_locations
17. driver_onboarding_tokens
18. driver_sessions
19. driver_verify_attempts
20. drivers
21. email_templates
22. feature_flags
23. notification_preferences
24. passenger_reminder_logs
25. passengers
26. payment_methods
27. phone_otps
28. pricing_rules
29. processed_webhook_events
30. profiles
31. route_cache
32. system_config
33. template_versions
34. user_roles
35. vehicle_tags
36. vehicles

### 4.1 核心业务表关系（高频）
- `bookings`：主订单实体（支付、行程、乘客、定价快照、tracking token 等）
- `booking_assignments`：订单-司机-车辆派单实体（含 `driver_execution_status`、driver pay、状态定位）
- `booking_audit_logs`：关键动作审计
- `payment_methods`：用户绑卡
- `driver_locations`：司机实时定位
- `booking_messages`：司机/乘客短信消息存档
- `booking_settlements` + `billing_documents/items`：结算与账单

---

## 5. `src/data/pricingData.ts` 定价逻辑

### 5.1 车型与基础参数
- `vehiclePricing[]` 定义每车型：
  - `basePrice`
  - `extraKmRate`
  - `extraMinuteRate`
  - `waitingRate`
  - `hourlyRate`

### 5.2 点到点规则
- 含：前 `10km` + `30min`
- 超出按 `extraKmRate` / `extraMinuteRate`
- waypoint 费：`basePrice * 10% * stopCount`
- 夜间：23:00–04:59，加 20%
- 节假日：加 15%
- 活动：
  - 单程 +100%
  - 往返每程 +50%
- surcharge 叠加是乘法链（先 event，再 night，再 holiday）
- toll 叠加到 subtotal
- GST：按含税价反推 `subtotal * 0.1 / 1.1`

### 5.3 包车规则（hourly）
- 最低 2 小时
- 每小时含 20km
- 超公里计费
- 不加夜间/节假日 surcharge（代码注释明确）

### 5.4 往返
- 双程分别算 `FareEstimate`，再 `grandTotal = outbound + return`

---

## 6. Booking 状态机（`payment_status` + `driver_execution_status`）

### 6.1 Payment 侧（主站统一标签源：`src/lib/booking-status.ts`）
常见状态集合：
- 前置：`draft`, `pending`, `pending_payment`, `card_saved`, `authorized`, `requires_capture`, `pending_customer_confirmation`
- 中间：`confirmed`, `price_locked`, `processing`
- 完成：`charged`, `captured`
- 异常/终态：`charge_failed`, `failed`, `canceled`, `voided`, `refunded`, `partially_refunded`, `expired`, `abandoned`, `no_show`

代码中的关键流转（来自 edge functions）示例：
- 绑卡成功：`setup_intent.succeeded` -> 保存 `payment_method_id`
- 预授权确认：`payment_intent.amount_capturable_updated` -> `authorized`
- 人工/自动扣款成功：`... -> charged`（webhook `payment_intent.succeeded`）
- 扣款失败：`... -> charge_failed`
- 取消：`... -> canceled`
- capture 路径：`requires_capture -> captured`

### 6.2 Driver 执行侧
统一标签：`EXEC_STATUS_LABEL` + ASDriver `VALID_TRANSITIONS`

标准流程：
`assigned -> accepted -> on_the_way -> arrived -> passenger_on_board -> job_done`

分支终态：
- `arrived -> no_show`
- admin 可置 `cancelled_by_admin`
- 司机端也存在 `declined`

### 6.3 双状态联动
- Admin 列表页按 `payment_status + assignment.exec_status` 组合分阶段：
  - waiting_actions / confirmed / assigned / in_progress / job_done / fulfilled / cancelled
- `price_locked` 常被视为“已完单待结算”
- driver `job_done` 但 payment 未 `price_locked/charged/captured` 时，客户侧 next step 显示 “Awaiting Price Lock”

---

## 7. SMS / Email 通知系统

### 7.1 渠道
- Email：Resend API（模板表 `email_templates`）
- SMS：Twilio API + webhook（`receive-passenger-sms`）

### 7.2 发送触发点（典型）
- 下单/授权成功（客户确认邮件、admin 通知邮件、客户短信）
- 派单（司机 dispatch 短信）
- 司机状态推进（到达/在途等由 `update-driver-status` 触发）
- 取消、改价、行前提醒、结算通知

### 7.3 存档与审计
- `booking_messages`：消息正文 + sms 状态
- `booking_audit_logs`：动作级审计
- `passenger_reminder_logs`：提醒发送记录

---

## 8. 认证系统（客户 / 司机 / Admin）

### 8.1 客户（Web）
- 路径：`AuthPage.tsx`
- 方式：
  - 邮箱密码 `signUp/signInWithPassword`
  - Google/Apple OAuth
  - SMS OTP（`OtpLoginForm` + `send/verify-*otp`）
  - 忘记密码 OTP（`send-reset-otp` / `verify-reset-otp`）
- 账号区守卫：`AccountLayout`，无 session 重定向 `/login`

### 8.2 Admin（Web）
- 守卫：`AdminGuard.tsx`
- 先登录，再查 `user_roles` 中 role=admin
- 非 admin 显示 denied

### 8.3 司机
- 主站司机链接流程：`DriverJobPage` + `verify-driver-identity`
  - token/shortCode + device token（`driver_sessions`）
  - 可附加二次验证因子（姓氏/手机号后四位）
- ASDriver App：
  - `useAuth.ts` 登录（密码或 OTP）
  - session + drivers 表 profile 映射

---

## 9. Stripe 支付流程（端到端）

### 9.1 首次绑卡下单
1. 前端调用 `create-setup-intent`
2. Stripe Elements `confirmSetup`
3. webhook `setup_intent.succeeded` 保存卡信息
4. booking 留在可继续收费/确认链路

### 9.2 已保存卡直接下单
1. 调 `book-with-saved-card`
2. 服务端创建 `PaymentIntent`（off_session+confirm）
3. 成功 `requires_capture` 时 booking -> `authorized`
4. 失败 -> `charge_failed`
5. 发邮件/SMS通知

### 9.3 后台扣款/捕获/退款
- `admin-charge`：针对待扣款状态执行扣款
- `capture-quote-payment`：捕获已授权款
- `admin-refund` / `admin-settlement-action`：退款或补扣/结算

### 9.4 webhook 一致性
- `stripe-webhook` 做签名校验 + `processed_webhook_events` 幂等去重
- 最终以 webhook 更新 booking 支付状态并打审计日志

---

## 10. ASDriver 代码分析（Screen、认证、缓存、GPS、消息）

## 10.1 Screen / 导航
来源：`src/navigation/AppRouter.tsx`, `TabNavigator.tsx`

### 顶层路由
- `/job/:assignmentId` -> JobDetailScreen
- `/profile` -> ProfileScreen
- `/vehicle` -> VehicleDetailsScreen
- `/earnings` -> EarningsScreen
- `/invoices` -> InvoicesScreen
- `/notifications` -> NotificationsScreen
- 其余进入 TabNavigator

### Tab 页
- `/dashboard` DashboardScreen
- `/jobs` BookingsScreen
- `/history` HistoryScreen
- `/more` MoreScreen

## 10.2 认证
来源：`useAuth.ts`
- Supabase session 恢复（带 3s timeout）
- 本地 profile cache：`asdriver_cached_profile`（24h）
- 登录方式：
  - `signInWithPassword`
  - OTP：`send-phone-otp/send-email-otp` + `verify-phone-otp/verify-email-otp`
- OTP 验证成功后通过 `supabase.auth.verifyOtp({token_hash, type:'magiclink'})` 建 session
- 登出清缓存并 `supabase.auth.signOut()`

## 10.3 缓存
来源：`src/lib/cache.ts`, `bookings.ts`
- localStorage SWR 缓存键：`swr_*`
- 默认 TTL：5 分钟
- Dashboard 首屏优先读缓存，再后台刷新
- assignment 拉取后 `setCache(bookings_${driverId})`

## 10.4 GPS
- `useLocationReporting`（App 内司机端）：有 active job 时 geolocation watch，上报 `report-driver-location`
- 速度/移动阈值控制上报节奏：移动 15s，静止 30s（hook 内）
- 状态变更时会抓一次定位并随 `update-driver-status` 一起发

## 10.5 消息
- `MessagePanel` + `lib/messages.ts`
- 拉取：`booking_messages`
- 发送：edge function `send-driver-message`（实际发 SMS）
- UI 30s 轮询刷新，显示 sent/delivered 状态

## 10.6 司机任务状态推进
- 客户端有限状态机（`bookings.ts`）
  - `assigned -> accepted -> on_the_way -> arrived -> passenger_on_board -> job_done`
  - arrived 可 `no_show`
- 优先调 `update-driver-status` edge function；失败降级 RPC/直接表更新
- `reportNoShow` 会额外调用 `report-no-show` 通知后台

---

## 11. 关键观察（架构层）

1. **状态与审计做得比较完整**：`booking_audit_logs` + webhook 去重 + admin lock/idempotency。
2. **支付链路分层清晰**：绑卡、授权、扣款、capture、refund、settlement 均有独立函数。
3. **司机侧双入口并存**：
   - Web dispatch link（临时/一次性会话）
   - ASDriver App（持久账号会话）
4. **通知渠道统一走模板/日志**：邮件模板 DB 化，短信回执可追踪。
5. **风险点**：函数数量多、职责交叉较多，长期建议做“流程编排图 + 状态枚举单一源”防止漂移。

---

## 12. 附：本次重点读取文件

- 主站：
  - `src/App.tsx`
  - `src/lib/booking-status.ts`
  - `src/data/pricingData.ts`
  - `src/integrations/supabase/types.ts`
  - `src/pages/AdminPaymentsPage.tsx`
  - `src/components/admin/AdminGuard.tsx`
  - `src/pages/AuthPage.tsx`
  - `src/components/account/AccountLayout.tsx`
  - `src/pages/DriverJobPage.tsx`
  - `src/hooks/useDriverLocationReporting.ts`
  - 以及 `supabase/functions/*/index.ts` 全量目录扫描（按函数名逐项确认用途）

- ASDriver：
  - `src/App.tsx`
  - `src/navigation/AppRouter.tsx`
  - `src/navigation/TabNavigator.tsx`
  - `src/hooks/useAuth.ts`
  - `src/hooks/useLocationReporting.ts`
  - `src/lib/bookings.ts`
  - `src/lib/cache.ts`
  - `src/lib/messages.ts`
  - `src/screens/*.tsx` 全部页面

---

（完）

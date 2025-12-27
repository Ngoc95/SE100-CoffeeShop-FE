# Kiến trúc Cơ sở Dữ liệu - Coffee Shop Management System

## Tổng quan

Hệ thống quản lý quán café với 3 loại hàng hóa:
- **ready_made**: Hàng bán sẵn (Coca Cola, Bánh...)
- **composite**: Hàng cấu thành từ nguyên liệu (Cà phê Latte, Trà sữa...)
- **ingredient**: Nguyên liệu (Cà phê hạt, Sữa tươi, Đường...)

---

## ERD Diagram (Eraser Syntax)

```eraser
// Styling
colorMode bold
typeface clean
notation crows-feet

// ===========================================
// 1. QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN
// ===========================================

users [icon: user, color: blue] {
  id int pk auto_increment
  username varchar unique
  password_hash varchar
  full_name varchar
  role_id int fk
  status varchar
  custom_permissions jsonb
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp  // Soft delete
  last_login timestamp
}

roles [icon: shield, color: blue] {
  id int pk auto_increment
  name varchar unique
  description text
  is_system boolean
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

permissions [icon: key, color: blue] {
  id varchar pk
  name varchar
  category varchar
  description text
  created_at timestamp
}

role_permissions [icon: link, color: blue] {
  role_id int pk, fk
  permission_id varchar pk, fk
}

users.role_id > roles.id
role_permissions.role_id > roles.id
role_permissions.permission_id > permissions.id

// ===========================================
// 2. HÀNG HÓA & KHO (UNIFIED INVENTORY)
// ===========================================

categories [icon: folder, color: green] {
  id int pk auto_increment
  name varchar
  description text
  display_order int
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

units [icon: ruler, color: green] {
  id int pk auto_increment
  name varchar
  symbol varchar
  description text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

// Bảng loại hàng hóa (thay cho type varchar)
item_types [icon: tag, color: green] {
  id int pk auto_increment
  code varchar unique  // 'ready_made' | 'composite' | 'ingredient'
  name varchar
  description text
}

// Bảng thống nhất cho cả 3 loại hàng hóa
inventory_items [icon: package, color: green] {
  id int pk auto_increment
  name varchar
  item_type_id int fk  // FK thay cho type varchar
  category_id int fk
  unit_id int fk
  current_stock decimal
  min_stock decimal
  max_stock decimal
  avg_unit_cost decimal
  total_value decimal
  selling_price decimal
  status varchar  // 'good' | 'low' | 'expiring' | 'expired' | 'critical'
  product_status varchar  // 'selling' | 'paused' | 'not_running' | 'hot'
  is_topping boolean
  image_url varchar
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

inventory_batches [icon: box, color: green] {
  id int pk auto_increment
  item_id int fk
  batch_code varchar
  supplier_id int fk
  quantity decimal
  remaining_quantity decimal
  unit varchar
  unit_cost decimal
  entry_date timestamp
  expiry_date date
  purchase_order_id int fk
}

item_ingredients [icon: list, color: green] {
  id int pk auto_increment
  composite_item_id int fk
  ingredient_item_id int fk
  quantity decimal
  unit varchar
}

item_toppings [icon: plus-circle, color: green] {
  id int pk auto_increment
  product_id int fk
  topping_id int fk
}

inventory_items.item_type_id > item_types.id
inventory_items.category_id > categories.id
inventory_items.unit_id > units.id
inventory_batches.item_id > inventory_items.id
item_ingredients.composite_item_id > inventory_items.id
item_ingredients.ingredient_item_id > inventory_items.id
item_toppings.product_id > inventory_items.id
item_toppings.topping_id > inventory_items.id

// ===========================================
// 3. KHÁCH HÀNG
// ===========================================

customer_groups [icon: users, color: purple] {
  id int pk auto_increment
  name varchar
  description text
  discount_percent decimal
  min_points int
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

customers [icon: user-check, color: purple] {
  id int pk auto_increment
  code varchar unique
  name varchar
  gender varchar
  birthday date
  phone varchar
  email varchar
  address text
  city varchar
  group_id int fk
  loyalty_points int
  total_orders int
  total_spent decimal
  status varchar
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

customers.group_id > customer_groups.id

// ===========================================
// 4. BÁN HÀNG & ĐƠN HÀNG
// ===========================================

tables [icon: layout, color: orange] {
  id int pk auto_increment
  table_number int
  area varchar
  capacity int
  status varchar
  current_order_id int fk
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

orders [icon: shopping-cart, color: orange] {
  id int pk auto_increment
  order_code varchar unique
  table_id int fk  // NULL = mang đi
  customer_id int fk  // NULL nếu khách vãng lai
  staff_id int fk
  promotion_id int fk  // NULL nếu không có khuyến mãi
  status varchar
  subtotal decimal
  discount_amount decimal
  tax_amount decimal
  total_amount decimal
  payment_method varchar
  payment_status varchar
  paid_amount decimal
  notes text
  created_at timestamp
  completed_at timestamp
  updated_at timestamp
}

order_items [icon: list, color: orange] {
  id int pk auto_increment
  order_id int fk
  item_id int fk
  combo_id int fk
  name varchar
  quantity int
  unit_price decimal
  discount_amount decimal
  total_price decimal
  status varchar
  customization jsonb
  notes text
  is_topping boolean
  parent_item_id int fk
  created_at timestamp
  updated_at timestamp
}

orders.table_id > tables.id
orders.customer_id > customers.id
orders.promotion_id > promotions.id
order_items.order_id > orders.id
order_items.item_id > inventory_items.id
order_items.parent_item_id > order_items.id

// ===========================================
// 5. KHUYẾN MÃI & COMBO
// ===========================================

promotion_types [icon: tag, color: pink] {
  id int pk auto_increment
  name varchar
  description text
}

promotions [icon: percent, color: pink] {
  id int pk auto_increment
  name varchar
  description text
  type_id int fk
  discount_value decimal
  min_order_value decimal
  max_discount decimal
  start_date date
  end_date date
  start_time time
  end_time time
  is_active boolean
  usage_limit int
  usage_count int
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

promotion_applicable_items [icon: link, color: pink] {
  promotion_id int fk
  item_id int fk
}

promotion_applicable_categories [icon: link, color: pink] {
  promotion_id int fk
  category_id int fk
}

promotion_applicable_combos [icon: link, color: pink] {
  promotion_id int fk
  combo_id int fk
}

promotion_applicable_customers [icon: link, color: pink] {
  promotion_id int fk
  customer_id int fk
}

promotion_applicable_customer_groups [icon: link, color: pink] {
  promotion_id int fk
  customer_group_id int fk
}

promotions.type_id > promotion_types.id
promotion_applicable_items.promotion_id > promotions.id
promotion_applicable_items.item_id > inventory_items.id
promotion_applicable_categories.promotion_id > promotions.id
promotion_applicable_categories.category_id > categories.id
promotion_applicable_combos.promotion_id > promotions.id
promotion_applicable_combos.combo_id > combos.id
promotion_applicable_customers.promotion_id > promotions.id
promotion_applicable_customers.customer_id > customers.id
promotion_applicable_customer_groups.promotion_id > promotions.id
promotion_applicable_customer_groups.customer_group_id > customer_groups.id

combos [icon: gift, color: pink] {
  id int pk auto_increment
  name varchar
  description text
  image_url varchar
  original_price decimal
  combo_price decimal
  savings decimal
  is_active boolean
  start_date timestamp
  end_date timestamp
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

combo_items [icon: list, color: pink] {
  id int pk auto_increment
  combo_id int fk
  item_id int fk
  quantity int
  group_name varchar
  is_required boolean
}

combo_items.combo_id > combos.id
combo_items.item_id > inventory_items.id
order_items.combo_id > combos.id

// ===========================================
// 6. NHÀ CUNG CẤP & MUA HÀNG
// ===========================================

suppliers [icon: truck, color: cyan] {
  id int pk auto_increment
  code varchar unique
  name varchar
  contact_person varchar
  phone varchar
  email varchar
  address text
  tax_code varchar
  category varchar
  total_purchases decimal
  total_debt decimal
  status varchar
  notes text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

purchase_orders [icon: file-text, color: cyan] {
  id int pk auto_increment
  code varchar unique
  supplier_id int fk
  staff_id int fk
  order_date timestamp
  expected_delivery date
  actual_delivery date
  status varchar
  subtotal decimal
  discount_amount decimal
  tax_amount decimal
  total_amount decimal
  paid_amount decimal
  debt_amount decimal
  payment_status varchar
  notes text
  created_at timestamp
  updated_at timestamp
}

purchase_order_items [icon: list, color: cyan] {
  id int pk auto_increment
  purchase_order_id int fk
  item_id int fk
  batch_code varchar
  quantity decimal
  unit varchar
  unit_price decimal
  discount_percent decimal
  discount_amount decimal
  total_price decimal
  expiry_date date
}

// Thanh toán NCC: tạo finance_transaction với reference_type='purchase_order'

purchase_orders.supplier_id > suppliers.id
purchase_order_items.purchase_order_id > purchase_orders.id
purchase_order_items.item_id > inventory_items.id
inventory_batches.supplier_id > suppliers.id
inventory_batches.purchase_order_id > purchase_orders.id

// ===========================================
// 7. NHÂN VIÊN & LƯƠNG
// ===========================================

staff [icon: user, color: yellow] {
  id int pk auto_increment
  code varchar unique
  full_name varchar
  gender varchar
  birthday date
  phone varchar
  email varchar
  address text
  city varchar
  id_card varchar
  position varchar
  department varchar
  hire_date date
  status varchar
  user_id int fk
  avatar_url varchar
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

staff_salary_settings [icon: settings, color: yellow] {
  id int pk auto_increment
  staff_id int fk
  salary_type varchar
  base_rate decimal
  overtime_rate decimal
  allowances jsonb
  effective_from date
  effective_to date
}

shifts [icon: clock, color: yellow] {
  id int pk auto_increment
  name varchar
  start_time time
  end_time time
  is_active boolean
}

staff_schedules [icon: calendar, color: yellow] {
  id int pk auto_increment
  staff_id int fk
  shift_id int fk
  work_date date
  status varchar
  notes text
  created_at timestamp
  updated_at timestamp
}

timekeeping [icon: check-circle, color: yellow] {
  id int pk auto_increment
  staff_id int fk
  schedule_id int fk
  work_date date
  shift_id int fk
  clock_in timestamp
  clock_out timestamp
  total_hours decimal
  overtime_hours decimal
  status varchar
  notes text
}

payroll [icon: file-text, color: yellow] {
  id int pk auto_increment
  code varchar unique
  period_start date
  period_end date
  status varchar
  total_amount decimal
  created_by int fk
  finalized_at timestamp
  created_at timestamp
  updated_at timestamp
}

payslips [icon: file, color: yellow] {
  id int pk auto_increment
  payroll_id int fk
  staff_id int fk
  base_salary decimal
  overtime_pay decimal
  allowances decimal
  bonuses decimal
  deductions decimal
  total_salary decimal
  work_days int
  overtime_hours decimal
  notes text
  created_at timestamp
}

staff.user_id > users.id
staff_salary_settings.staff_id > staff.id
staff_schedules.staff_id > staff.id
staff_schedules.shift_id > shifts.id
timekeeping.staff_id > staff.id
timekeeping.schedule_id > staff_schedules.id
timekeeping.shift_id > shifts.id
payroll.created_by > staff.id
payslips.payroll_id > payroll.id
payslips.staff_id > staff.id
orders.staff_id > staff.id
purchase_orders.staff_id > staff.id

// ===========================================
// 8. TÀI CHÍNH
// ===========================================

// Loại thu chi (thu / chi)
finance_types [icon: tag, color: red] {
  id int pk auto_increment
  name varchar  // 'Thu' | 'Chi'
}

// Danh mục thu chi
finance_categories [icon: folder, color: red] {
  id int pk auto_increment
  name varchar
  type_id int fk  // FK đến finance_types
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

finance_categories.type_id > finance_types.id

bank_accounts [icon: credit-card, color: red] {
  id int pk auto_increment
  account_name varchar
  account_number varchar
  bank_name varchar
  branch varchar
  balance decimal
  is_active boolean
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

finance_transactions [icon: activity, color: red] {
  id int pk auto_increment
  code varchar unique
  category_id int fk
  amount decimal
  payment_method varchar
  bank_account_id int fk
  person_type varchar
  person_id int
  person_name varchar
  description text
  transaction_date timestamp
  created_by int fk
  reference_type varchar
  reference_id int
  notes text
  created_at timestamp
  updated_at timestamp
}

finance_transactions.category_id > finance_categories.id
finance_transactions.bank_account_id > bank_accounts.id
finance_transactions.created_by > staff.id

// ===========================================
// 9. QUẢN LÝ KHO
// ===========================================

stock_checks [icon: clipboard, color: teal] {
  id int pk auto_increment
  code varchar unique
  check_date timestamp
  staff_id int fk
  status varchar
  total_items int
  discrepancy_count int
  notes text
  created_at timestamp
  updated_at timestamp
}

stock_check_items [icon: list, color: teal] {
  id int pk auto_increment
  stock_check_id int fk
  item_id int fk
  system_quantity decimal
  actual_quantity decimal
  difference decimal
  unit varchar
  notes text
}

write_offs [icon: trash-2, color: teal] {
  id int pk auto_increment
  code varchar unique
  write_off_date timestamp
  reason varchar
  staff_id int fk
  approved_by int fk
  status varchar
  total_value decimal
  notes text
  created_at timestamp
  updated_at timestamp
}

write_off_items [icon: list, color: teal] {
  id int pk auto_increment
  write_off_id int fk
  item_id int fk
  batch_id int fk
  quantity decimal
  unit varchar
  unit_cost decimal
  total_value decimal
}

new_item_requests [icon: plus-square, color: teal] {
  id int pk auto_increment
  name varchar
  category varchar
  description text
  image_url varchar
  requested_by int fk
  status varchar
  reviewed_by int fk
  rejection_reason text
  notes text
  created_at timestamp
  updated_at timestamp
}

stock_checks.staff_id > staff.id
stock_check_items.stock_check_id > stock_checks.id
stock_check_items.item_id > inventory_items.id
write_offs.staff_id > staff.id
write_offs.approved_by > staff.id
write_off_items.write_off_id > write_offs.id
write_off_items.item_id > inventory_items.id
write_off_items.batch_id > inventory_batches.id
new_item_requests.requested_by > staff.id
new_item_requests.reviewed_by > staff.id

// ===========================================
// 10. LOGS & SETTINGS
// ===========================================

activity_logs [icon: file-text, color: gray] {
  id int pk auto_increment
  user_id int fk
  action varchar
  entity_type varchar
  entity_id int
  description text
  ip_address varchar
  user_agent text
  created_at timestamp
}

system_settings [icon: settings, color: gray] {
  id int pk auto_increment
  key varchar unique
  value text
  data_type varchar
  description text
  updated_at timestamp
}

activity_logs.user_id > users.id
```

---

## Danh sách Tables (49 bảng)

1. **Users & Auth**: `users`, `roles`, `permissions`, `role_permissions`
2. **Inventory**: `categories`, `units`, `item_types`, `inventory_items`, `inventory_batches`, `item_ingredients`, `item_toppings`
3. **Customers**: `customer_groups`, `customers`
4. **Sales**: `tables`, `orders`, `order_items`
5. **Promotions**: `promotion_types`, `promotions`, `promotion_applicable_items`, `promotion_applicable_categories`, `promotion_applicable_combos`, `promotion_applicable_customers`, `promotion_applicable_customer_groups`, `combos`, `combo_items`
6. **Purchasing**: `suppliers`, `purchase_orders`, `purchase_order_items`
7. **Staff**: `staff`, `staff_salary_settings`, `shifts`, `staff_schedules`, `timekeeping`, `payroll`, `payslips`
8. **Finance**: `finance_types`, `finance_categories`, `bank_accounts`, `finance_transactions`
9. **Stock**: `stock_checks`, `stock_check_items`, `write_offs`, `write_off_items`, `new_item_requests`
10. **System**: `activity_logs`, `system_settings`

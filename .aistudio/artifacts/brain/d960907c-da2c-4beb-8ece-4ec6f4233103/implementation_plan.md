# Kế hoạch Nâng cấp Toàn diện Nova Việt Mẫu: Onboarding, Tính tuổi thai tự động & Hệ thống Miễn phí / VIP

Ứng dụng đồng hành chăm sóc thai kỳ toàn diện Nova Việt Mẫu được nâng cấp từ khoảnh khắc mở ứng dụng lần đầu cho đến khi thiết lập hồ sơ thai kỳ, tự động tính tuổi thai theo ngày thực tế, đồng bộ Trang chủ động theo từng tuần phát triển của bé và phân định minh bạch quyền lợi Miễn phí & gói VIP nâng cao.

## Quyết định Thiết kế & Khảo sát Người dùng

> [!IMPORTANT]
> **Các nguyên tắc kiến trúc cốt lõi:**
> - **Khởi động thân thiện & Quyền tự do**: Người dùng mở ứng dụng có thể chọn *"Bắt đầu hành trình thai kỳ"* (thiết lập hồ sơ), *"Tôi đã có tài khoản"* (đăng nhập) hoặc *"Khám phá ứng dụng trước"* (dùng thử ngay mà không bắt buộc điền thông tin).
> - **Độ chính xác lâm sàng**: Tích hợp thuật toán tính tuổi thai chuẩn sản khoa (Naegele 280 ngày từ kỳ kinh cuối, hoặc đảo ngược từ ngày dự sinh của bác sĩ, hoặc tham chiếu siêu âm), tự động tăng ngày/tuần theo lịch thực tế.
> - **Trang chủ động**: Trang chủ hiển thị đúng tuần thai và em bé của mẹ (không còn bị gán cứng cố định Tuần 12 cho mọi mẹ bầu).
> - **Miễn phí trọn đời cho chức năng cơ bản**: Toàn bộ theo dõi nước uống, hoạt động chăm sóc, nhắc nhở thông báo, tính tuổi thai, cẩm nang theo tuần và xuất dữ liệu đều hoạt động 100% miễn phí. VIP là tiện ích mở rộng tùy chọn, không tường phí gây áp lực.

---

## 1. Tổng quan & Luồng Trải nghiệm Người dùng (UX Flows)

### 1.1. Màn hình Khởi động (Welcome Splash)
- **Nhận diện thương hiệu**: Logo Nova Việt Mẫu cùng tranh vẽ minh họa nghệ thuật bàn tay mẹ nâng niu bàn chân bé yêu.
- **3 Lựa chọn rõ ràng**:
  1. `Bắt đầu hành trình thai kỳ`: Kích hoạt trình thiết lập hồ sơ thai kỳ 4 bước.
  2. `Tôi đã có tài khoản`: Mở màn hình đăng nhập nhanh bằng số điện thoại / email.
  3. `Khám phá ứng dụng trước`: Vào thẳng Trang chủ với hồ sơ khách để trải nghiệm giao diện và các tiện ích trước khi lưu thông tin.
- **Tự động ghi nhớ**: Nếu người dùng đã hoàn thành thiết lập hồ sơ trước đó, ứng dụng tự động mở thẳng Trang chủ (có nút *"Thiết lập lại hồ sơ"* trong trang Hồ sơ cá nhân khi mẹ cần cập nhật).

### 1.2. Quy trình 4 Bước Thiết lập Hồ sơ Thai kỳ (Onboarding Flow)
Thanh tiến trình phía trên cùng nút *"Quay lại"* ở mọi bước, cho phép chuyển đổi mượt mà không mất dữ liệu đã nhập:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     QUY TRÌNH ONBOARDING 4 BƯỚC                         │
├─────────────┬──────────────────────────┬──────────────┬─────────────────┤
│   BƯỚC 1    │          BƯỚC 2          │    BƯỚC 3    │     BƯỚC 4      │
│  Tình trạng │   Thông tin thai kỳ      │ Thông tin mẹ │    Xác nhận     │
├─────────────┼──────────────────────────┼──────────────┼─────────────────┤
│ • Đang mang │ • Ngày đầu kỳ kinh cuối  │ • Tên gọi mẹ │ • Tóm tắt tuần, │
│   thai      │   (LMP)                  │ • Tên bé     │   ngày dự sinh, │
│ • Chuẩn bị  │ • Ngày dự sinh bác sĩ    │ • Múi giờ    │   tam cá nguyệt │
│   mang thai │ • Tuổi thai qua siêu âm  │ • Nhắc nhở   │ • Nút "Vào app" │
│ • Tìm hiểu  │ • Nguồn & cách tính      │   yêu thích  │   ngay miễn phí │
└─────────────┴──────────────────────────┴──────────────┴─────────────────┘
```

- **Bước 1 — Xác định tình trạng**:
  - `Tôi đang mang thai`: Kích hoạt tiếp Bước 2 nhập dữ liệu sản khoa.
  - `Tôi đang chuẩn bị mang thai`: Thiết lập chế độ tiền thai kỳ, dinh dưỡng bổ sung axit folic & canh ngày rụng trứng.
  - `Tôi muốn tìm hiểu kiến thức thai kỳ`: Chế độ tra cứu cẩm nang y tế tổng quan.
- **Bước 2 — Nhập thông tin thai kỳ** (nếu đang mang thai):
  - Phương pháp 1: *Ngày đầu tiên của kỳ kinh cuối (LMP)*.
  - Phương pháp 2: *Ngày dự sinh do bác sĩ / siêu âm xác định (EDD)*.
  - Phương pháp 3: *Tuổi thai hiện tại xác định qua khám (Tuần + Ngày)* kèm ngày siêu âm.
  - Ghi chú y khoa rõ ràng về giả định chu kỳ 28 ngày và ưu tiên chỉ số siêu âm 3 tháng đầu.
- **Bước 3 — Thông tin cá nhân tùy chọn**:
  - Tên gọi của mẹ (ví dụ: *"Khánh Băng"* hoặc biệt danh mẹ muốn Nova xưng hô).
  - Biệt danh con yêu (ví dụ: *"Bé Bơ"*, *"Bé Dâu"*, *"Thiên Thần Nhỏ"*).
  - Tùy chọn giờ nhắc uống nước đầu ngày.
  - Không yêu cầu số CCCD, định vị hay thông tin nhạy cảm.
- **Bước 4 — Xác nhận & Hoàn tất**:
  - Tóm tắt hồ sơ trực quan: Tuổi thai tính toán được, ngày dự sinh ước tính, tam cá nguyệt, phương pháp áp dụng.
  - Nút *"Chỉnh sửa"* nếu cần điều chỉnh lại.
  - Nút *"Hoàn tất và vào ứng dụng"* đưa người dùng vào thẳng Trang chủ miễn phí (không bật popup mua VIP ép buộc).

---

## 2. Module Tính Tuổi Thai Tự Động Chuẩn Sản Khoa

Triển khai module `src/services/pregnancyCalculator.ts` với độ chính xác cao:

```
                                  [ DỮ LIỆU ĐẦU VÀO ]
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
           [ 1. Ngày LMP ]        [ 2. Ngày Dự Sinh EDD ]   [ 3. Tuổi thai SA ]
                  │                       │                       │
           Naegele rule:           Tuổi thai = 280 ngày -    Tuổi thai hôm nay =
           EDD = LMP + 280 ngày     (EDD - Hôm nay)          Tuổi SA + (Hôm nay - Ngày SA)
                  └───────────────────────┼───────────────────────┘
                                          ▼
                             [ BỘ TÍNH TOÁN TRUNG TÂM ]
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
            { Tuổi thai: Tuần + Ngày }                 { Ngày Dự Sinh Ước Tính }
            { Tam cá nguyệt: 1, 2, 3 }                 { Số ngày còn lại (Countdown) }
            { % Tiến trình 40 tuần }                  { Kích thước quả so sánh }
```

### Nguyên tắc tính toán lâm sàng:
1. **LMP (Kỳ kinh cuối)**: Tuổi thai = `Math.floor((Hôm nay - LMP) / 7)` tuần và `(Hôm nay - LMP) % 7` ngày. Ngày dự sinh = `LMP + 280 ngày`.
2. **EDD (Bác sĩ xác định)**: Tuổi thai = `280 - Math.floor((EDD - Hôm nay) / 1 ngày)`. Nếu có cả hai, ưu tiên ngày dự sinh lâm sàng của bác sĩ.
3. **Cập nhật theo lịch thực tế**: Dựa trên hàm `new Date()` thực tế của thiết bị, tự động tăng ngày khi sang 00:00 và chuyển tuần khi đủ 7 ngày; không tăng tuổi thai giả tạo khi người dùng tắt/mở app liên tục.
4. **Kiểm tra dữ liệu ngoại lệ**: Nếu tuổi thai tính ra âm (ngày trong tương lai) hoặc vượt quá 42 tuần, hiển thị thông báo hướng dẫn mẹ kiểm tra lại ngày thay vì âm thầm lưu sai.

---

## 3. Nội dung Cẩm nang 40 Tuần Thai Phát triển Toàn diện

Tạo kho dữ liệu `src/data/pregnancyMilestones.ts` cung cấp đầy đủ thông tin cho từng tuần thai:
- **Kích thước & Trọng lượng bé**: So sánh trực quan theo loại quả thân thuộc (Tuần 4 hạt mè, Tuần 8 quả mâm xôi, Tuần 12 quả chanh, Tuần 20 quả chuối, Tuần 24 bắp ngô, Tuần 32 dừa xiêm, Tuần 40 quả dưa hấu).
- **Phát triển của thai nhi**: Tim thai, phản xạ nuốt, mầm răng, chu kỳ ngủ - thức, lớp sáp bảo vệ da.
- **Thay đổi cơ thể mẹ**: Cảm giác nghén, áp lực tử cung, đau mỏi thắt lưng, lưu lượng máu tăng.
- **Dinh dưỡng & Lối sống**: Vi chất vàng theo giai đoạn (Sắt, Canxi, DHA, Axit Folic), tư thế ngủ nghiêng trái.
- **Cột mốc khám thai quan trọng**:
  - Tuần 11 – 13w6d: Đo độ mờ da gáy NT, Double Test / NIPT.
  - Tuần 18 – 22: Siêu âm 4D hình thái học chi tiết.
  - Tuần 24 – 28: Nghiệm pháp dung nạp đường huyết thai kỳ (OGTT).
  - Tuần 32 – 36: Siêu âm màu Doppler đánh giá dinh dưỡng bánh nhau & nước ối.
  - Tuần 36+: Khám tiền sản hàng tuần và theo dõi cơn gò.
- **Câu hỏi gợi ý hỏi bác sĩ**: Soạn sẵn 3 câu hỏi thực tế cho buổi khám kế tiếp.
- **Nguồn y khoa tham chiếu**: Trích dẫn nguồn Bộ Y tế Việt Nam và WHO kèm ngày cập nhật.

---

## 4. Tái cấu trúc Trang Chủ Động & Hệ Thống Miễn phí / VIP

### 4.1. Trang Chủ Động theo Tuần Thai Thực Tế
- **Header**: Lời chào thân thương theo tên mẹ (ví dụ: *"Chào mẹ Khánh Băng"*), tuần thai và số ngày thực tế (ví dụ: *"Tuần 8 ngày 3"*), ngày dự sinh (ví dụ: *"Dự sinh: 15/06/2027"*), thanh tiến trình tam cá nguyệt.
- **Thẻ Hành trình tuần này**: Hiển thị kích thước quả so sánh và mô tả phát triển đúng tuần thai của mẹ (không còn bị gán cứng tuần 12).
- **Hoạt động hôm nay**:
  - Thẻ Uống nước: hiển thị số liệu uống thực tế (`current / target ml`).
  - Thẻ Thư giãn & Vận động: khuyến nghị an toàn phù hợp tuần thai (đi bộ nhẹ, giãn cơ cat-cow, hít thở).
  - Thẻ Thai giáo & Nghe nhạc thư giãn 432Hz.
  - Thẻ Lịch khám thai: nhắc mốc khám kế tiếp tương ứng tuần thai mẹ.
- **Nút nổi Trợ lý Nova AI & SOS cấp cứu** luôn sẵn sàng.

### 4.2. Phân định Minh bạch Miễn phí & VIP
- **Bản Miễn phí trọn đời (100% người dùng)**:
  - Tạo và sửa hồ sơ thai kỳ không giới hạn.
  - Tự động tính tuổi thai & đếm ngược ngày dự sinh.
  - Theo dõi lượng nước uống, hoàn tác, lịch sử cữ uống, đổi mục tiêu.
  - Quản lý hoạt động chăm sóc sức khỏe, bấm giờ yoga, nghe nhạc 432Hz.
  - Tạo lịch nhắc nhở & báo thức bằng chuông 528Hz và thông báo thiết bị.
  - Tra cứu cẩm nang 40 tuần thai đầy đủ.
  - Sao lưu và xuất dữ liệu JSON cá nhân.
- **Gói VIP nâng cao (Lựa chọn mở rộng)**:
  - Báo cáo phân tích thai kỳ chuyên sâu và biểu đồ cân nặng mẹ & bé chuẩn bách phân vị WHO.
  - Khóa học video yoga bầu cao cấp cùng chuyên gia thể lực sản khoa.
  - Không bao giờ đặt các cảnh báo y tế khẩn cấp, thông tin an toàn hoặc dữ liệu của người dùng sau tường phí.
  - Màn hình VIP minh bạch: Nút *"Tiếp tục dùng bản Miễn phí"* nổi bật, không có đồng hồ đếm ngược ảo gây áp lực.

---

## 5. Kiến trúc Hệ thống & Luồng Dữ liệu (System Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KIẾN TRÚC ỨNG DỤNG                              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ localStorage: Dữ liệu Khách & Người dùng ]                         │
│   ├── Hồ sơ thai kỳ (User Profile & Pregnancy Status)                  │
│   ├── Bản ghi nước uống theo ngày (Daily Water Records)                │
│   ├── Hoạt động chăm sóc theo ngày (Care Activities)                   │
│   ├── Lịch nhắc nhở & Báo thức (Health Reminders)                      │
│   └── Lịch sử trò chuyện Nova AI & Đơn hàng                            │
│           ▲                                                            │
│           │ Đồng bộ trạng thái 2 chiều qua CustomEvent                 │
│           ▼                                                            │
│   [ Services Layer ]                                                   │
│   ├── storageService.ts (Quản lý persistence, sao lưu JSON)            │
│   ├── pregnancyCalculator.ts (Tính tuổi thai, ngày dự sinh, tuần)      │
│   └── notificationService.ts (Web Notification & Web Audio 528Hz)      │
│           ▲                                                            │
│           ▼                                                            │
│   [ UI Layer (React 19 + Framer Motion + Tailwind v4) ]                │
│   ├── OnboardingScreen: 4 bước thiết lập hồ sơ & chào đón              │
│   ├── HomeScreen: Trang chủ động hiển thị tuần & bé của mẹ            │
│   ├── CarePlanScreen: Kế hoạch chăm sóc & biểu đồ tiến độ thật        │
│   ├── ProfileScreen: Xem & sửa hồ sơ thai kỳ, sao lưu dữ liệu         │
│   └── VipSubscriptionModal: Minh bạch, không gây áp lực                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Kế hoạch Kiểm thử (Verification & Test Cases)

1. **Khởi động lần đầu**: Mở app với localStorage trống -> hiển thị Splash chào mừng -> chọn *"Khám phá trước"* vào thẳng Home -> quay lại Onboarding thiết lập hồ sơ thành công.
2. **Tính tuổi thai theo LMP**: Nhập LMP cách hôm nay 59 ngày -> hệ thống tính chính xác `Tuần 8 ngày 3`, Tam cá nguyệt 1, ngày dự sinh cách LMP 280 ngày.
3. **Tính tuổi thai theo EDD bác sĩ**: Nhập ngày dự sinh của bác sĩ -> hệ thống ưu tiên ngày của bác sĩ và tính ngược tuổi thai chuẩn xác.
4. **Đồng bộ Trang chủ**: Kiểm tra thẻ *"Hành trình tuần này"* hiển thị đúng tuần thai vừa tính, so sánh đúng loại quả, không bị kẹt ở tuần 12.
5. **Đóng và mở lại app**: Refresh trang -> toàn bộ tuổi thai, lượng nước đã uống, lịch nhắc nhở và hoạt động vẫn được bảo toàn nguyên vẹn.
6. **Lượng nước uống**: Uống 500ml -> tổng tăng 500ml -> hoàn tác -> xóa -> đổi mục tiêu 3000ml -> chuyển ngày mới dữ liệu cũ còn nguyên.
7. **Thông báo & Chuông**: Bấm *"Thử chuông ngay"* -> chuông 528Hz phát ngân vang mượt mà, thông báo trình duyệt xuất hiện.
8. **Kiểm tra VIP**: Mở modal VIP -> bấm *"Tiếp tục dùng bản Miễn phí"* -> đóng modal êm dịu, không gián đoạn trải nghiệm người dùng.
9. **Biên dịch & Lint**: Chạy `lint_applet` (`tsc --noEmit`) và `compile_applet` đạt 100% build success.

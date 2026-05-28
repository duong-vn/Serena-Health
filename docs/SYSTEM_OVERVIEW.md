# Giới thiệu hệ thống

Hệ thống là prototype giao diện cho chatbot hỗ trợ chuỗi phòng khám gia đình.
Chatbot hỗ trợ khảo sát tình trạng ban đầu của bệnh nhân, đưa ra định hướng xử lý
ban đầu và hỗ trợ đặt lịch khám khi phù hợp.

## Mục tiêu

- Giúp người dùng mô tả triệu chứng và nhận tư vấn ban đầu nhanh hơn.
- Phân loại trường hợp cần tự theo dõi, cần gặp bác sĩ, cần khám sớm hoặc cần xử lý khẩn cấp.
- Hỗ trợ chuyển ca tư vấn sang bác sĩ khi chatbot không đủ điều kiện xử lý.
- Hỗ trợ quản lý phòng khám theo dõi lịch hẹn, hiệu suất vận hành và dữ liệu tư vấn.
- Hỗ trợ chuyên gia rà soát chất lượng câu trả lời của chatbot và cập nhật kho tri thức.

## Nhóm vai trò

### Người dùng

Người cần tư vấn hoặc cần khám bệnh. Giao diện được thiết kế theo hướng mobile-first,
tập trung vào hội thoại chatbot, kết quả phân loại và đặt lịch khám.

### Bác sĩ

Bác sĩ sử dụng giao diện desktop để nhận ca tư vấn, chat với bệnh nhân, xem tóm tắt
từ chatbot, xem hồ sơ bệnh nhân và hoàn tất ca tư vấn.

### Chuyên gia

Chuyên gia sử dụng giao diện desktop để rà soát hội thoại chatbot, đánh dấu lỗi, xử lý
lỗi, quản lý kho tri thức y khoa và dữ liệu cải thiện chatbot.

### Quản lý phòng khám

Quản lý sử dụng giao diện desktop để xem dashboard, báo cáo, quản lý bác sĩ, dịch vụ,
lịch hẹn và các chỉ số vận hành của chuỗi phòng khám.

## Nguyên tắc an toàn

- Chatbot chỉ tư vấn ban đầu, không chẩn đoán thay bác sĩ.
- Chatbot không kê đơn thuốc cho người dùng.
- Các dấu hiệu nguy hiểm phải được ưu tiên cảnh báo và chuyển hướng đi bệnh viện hoặc gặp bác sĩ.
- Các ca không chắc chắn hoặc có rủi ro cao phải được chuyển sang bác sĩ hoặc chuyên gia phù hợp.


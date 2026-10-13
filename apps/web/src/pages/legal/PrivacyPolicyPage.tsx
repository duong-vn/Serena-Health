import { Link } from 'react-router-dom'
import { SystemLogo } from '../../components/brand/SystemLogo'
import './LegalPages.css'

export function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="legal-header-inner">
          <Link to="/" className="legal-brand-link">
            <SystemLogo className="legal-brand-logo" />
            <span>Serene Health</span>
          </Link>
          <Link to="/login" className="legal-back-link">
            ← Về đăng nhập
          </Link>
        </div>
      </header>

      <main className="legal-container">
        <article className="legal-card">
          <header className="legal-title-section">
            <h1>Serene Health — Chính sách bảo mật (Privacy Policy)</h1>
            <p className="legal-meta">Cập nhật lần cuối: 13 tháng 10, 2026</p>
          </header>

          <div className="legal-content">
            <div className="legal-callout">
              <p>
                <strong>Serene Health</strong> cam kết bảo vệ dữ liệu cá nhân và quyền riêng tư của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin khi bạn sử dụng nền tảng <strong>Serene Health</strong>.
              </p>
            </div>

            <h2>1. Giới thiệu về ứng dụng</h2>
            <p>
              <strong>Serene Health</strong> là nền tảng trợ lý sức khỏe thông minh và quản lý tư vấn y tế, hỗ trợ kết nối bệnh nhân với các dịch vụ chăm sóc sức khỏe ban đầu.
            </p>

            <h2>2. Thông tin chúng tôi thu thập</h2>
            <p>Chúng tôi chỉ thu thập các thông tin cần thiết để cung cấp và cải thiện dịch vụ:</p>
            <ul>
              <li><strong>Thông tin tài khoản:</strong> Họ và tên, địa chỉ email, số điện thoại, ngày sinh và giới tính khi bạn đăng ký trực tiếp.</li>
              <li><strong>Thông tin từ Google Sign-In (OAuth):</strong> Khi bạn chọn đăng nhập bằng Google vào ứng dụng <strong>Serene Health</strong>, chúng tôi chỉ nhận từ Google các thông tin cơ bản: Google ID (định danh duy nhất), địa chỉ email và họ tên hiển thị. Chúng tôi không yêu cầu và không truy cập vào danh bạ, Google Drive hay bất kỳ dữ liệu nhạy cảm nào khác từ tài khoản Google của bạn.</li>
              <li><strong>Dữ liệu sức khỏe và tương tác:</strong> Lịch sử trò chuyện với trợ lý AI, thông tin đặt hẹn khám và hồ sơ bệnh án cơ bản do bạn chủ động cung cấp.</li>
            </ul>

            <h2>3. Mục đích sử dụng dữ liệu</h2>
            <p>Dữ liệu người dùng thu thập qua <strong>Serene Health</strong> chỉ được sử dụng cho các mục đích:</p>
            <ul>
              <li>Xác thực danh tính và duy trì phiên đăng nhập an toàn của bạn.</li>
              <li>Cung cấp hỗ trợ tư vấn sức khỏe cá nhân hóa và nhắc lịch hẹn khám bệnh.</li>
              <li>Cải thiện độ chính xác và chất lượng phản hồi y tế.</li>
              <li>Liên hệ khi có thông báo quan trọng về dịch vụ hoặc thay đổi lịch hẹn.</li>
            </ul>

            <h2>4. Tuân thủ chính sách dữ liệu người dùng Google API (Google User Data Policy)</h2>
            <p>
              Việc <strong>Serene Health</strong> sử dụng và chuyển giao cho bất kỳ ứng dụng nào khác bất kỳ thông tin nào nhận được từ Google API sẽ tuân thủ nghiêm ngặt <em>Google API Services User Data Policy</em>, bao gồm các yêu cầu về Sử dụng có giới hạn (Limited Use):
            </p>
            <ul>
              <li>Chúng tôi không sử dụng dữ liệu người dùng nhận từ Google để quảng cáo hoặc tiếp thị lại.</li>
              <li>Chúng tôi không bán hay chia sẻ dữ liệu người dùng Google cho bên thứ ba vì bất kỳ mục đích thương mại nào.</li>
              <li>Con người không đọc dữ liệu cá nhân của bạn trừ khi có sự đồng ý rõ ràng của bạn để hỗ trợ kỹ thuật hoặc theo yêu cầu bắt buộc của pháp luật.</li>
            </ul>

            <h2>5. Lưu trữ và bảo mật dữ liệu</h2>
            <p>
              Mọi dữ liệu truyền tải giữa thiết bị của bạn và máy chủ <strong>Serene Health</strong> đều được mã hóa bằng giao thức HTTPS/TLS hiện đại. Mật khẩu được băm an toàn (scrypt), phiên xác thực được bảo vệ bằng JWT và mã thông báo bảo mật cao.
            </p>

            <h2>6. Quyền của người dùng</h2>
            <p>Bạn luôn có quyền kiểm soát đối với dữ liệu của mình tại <strong>Serene Health</strong>:</p>
            <ul>
              <li>Xem, chỉnh sửa hoặc cập nhật thông tin cá nhân trong phần quản lý tài khoản.</li>
              <li>Yêu cầu xóa toàn bộ tài khoản và dữ liệu liên quan khỏi hệ thống bất cứ lúc nào.</li>
              <li>Hủy liên kết tài khoản Google khỏi Serene Health thông qua trang quản lý bảo mật của Google.</li>
            </ul>

            <h2>7. Thông tin liên hệ</h2>
            <p>Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật của <strong>Serene Health</strong>, xin vui lòng liên hệ:</p>
            <ul>
              <li><strong>Ứng dụng:</strong> Serene Health</li>
              <li><strong>Email hỗ trợ:</strong> support@serenehealth.vn</li>
            </ul>
          </div>
        </article>
      </main>

      <footer className="legal-footer">
        <div className="legal-footer-links">
          <Link to="/terms">Điều khoản sử dụng</Link>
          <Link to="/privacy">Chính sách bảo mật</Link>
          <Link to="/login">Đăng nhập</Link>
        </div>
        <p>© 2026 Serene Health. Bản quyền được bảo lưu.</p>
      </footer>
    </div>
  )
}

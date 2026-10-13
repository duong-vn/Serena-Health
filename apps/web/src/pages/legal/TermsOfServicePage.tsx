import { Link } from 'react-router-dom'
import { SystemLogo } from '../../components/brand/SystemLogo'
import './LegalPages.css'

export function TermsOfServicePage() {
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
            <h1>Serene Health — Điều khoản dịch vụ (Terms of Service)</h1>
            <p className="legal-meta">Cập nhật lần cuối: 13 tháng 10, 2026</p>
          </header>

          <div className="legal-content">
            <div className="legal-callout">
              <p>
                Chào mừng bạn đến với <strong>Serene Health</strong>. Bằng việc truy cập hoặc sử dụng ứng dụng <strong>Serene Health</strong>, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản dịch vụ này.
              </p>
            </div>

            <h2>1. Định nghĩa và Phạm vi dịch vụ</h2>
            <p>
              <strong>Serene Health</strong> là nền tảng công nghệ y tế cung cấp các dịch vụ: trợ lý AI tư vấn y tế ban đầu, hỗ trợ đặt lịch khám tại phòng khám và liên lạc với bác sĩ chuyên môn.
            </p>

            <h2>2. Khước từ trách nhiệm y tế quan trọng (Medical Disclaimer)</h2>
            <div className="legal-callout">
              <p>
                <strong>CHÚ Ý QUAN TRỌNG:</strong> Ứng dụng <strong>Serene Health</strong> và trợ lý thông minh Serene Bot cung cấp thông tin hỗ trợ và hướng dẫn sức khỏe dựa trên triệu chứng bạn chia sẻ. Thông tin này <strong>KHÔNG</strong> thay thế cho chẩn đoán y khoa chuyên nghiệp, lời khuyên của bác sĩ, hoặc chỉ định điều trị y tế trực tiếp.
              </p>
              <p>
                Trong trường hợp bạn gặp phải các triệu chứng khẩn cấp (như đau ngực dữ dội, khó thở cấp tính, mất ý thức, tai nạn nghiêm trọng), vui lòng gọi ngay cấp cứu <strong>115</strong> hoặc đến cơ sở y tế gần nhất.
              </p>
            </div>

            <h2>3. Tài khoản và Bảo mật</h2>
            <ul>
              <li>Bạn có thể đăng ký tài khoản bệnh nhân trực tiếp hoặc đăng nhập thông qua tài khoản Google của bạn.</li>
              <li>Bạn có trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của bạn tại <strong>Serene Health</strong>.</li>
              <li>Bạn cam kết cung cấp thông tin chính xác, trung thực khi khai báo triệu chứng hoặc thông tin cá nhân.</li>
            </ul>

            <h2>4. Quyền và Trách nhiệm của Người dùng</h2>
            <p>Khi sử dụng dịch vụ của <strong>Serene Health</strong>, bạn đồng ý không:</p>
            <ul>
              <li>Sử dụng ứng dụng cho các mục đích bất hợp pháp hoặc gây hại cho người khác.</li>
              <li>Can thiệp, phá hoại hoặc cố ý làm gián đoạn hạ tầng máy chủ và bảo mật của hệ thống.</li>
              <li>Cố ý truyền tải các tệp tin chứa virus, mã độc hoặc dữ liệu độc hại.</li>
            </ul>

            <h2>5. Sở hữu trí tuệ</h2>
            <p>
              Toàn bộ bản quyền, thương hiệu <strong>Serene Health</strong>, thiết kế giao diện, mã nguồn, nội dung tài liệu và biểu tượng logo đều thuộc quyền sở hữu của <strong>Serene Health</strong> và được bảo hộ theo luật sở hữu trí tuệ hiện hành.
            </p>

            <h2>6. Chấm dứt dịch vụ</h2>
            <p>
              Chúng tôi bảo lưu quyền đình chỉ hoặc chấm dứt quyền truy cập của bạn vào <strong>Serene Health</strong> nếu bạn vi phạm nghiêm trọng các Điều khoản dịch vụ này hoặc có hành vi gian lận, phá hoại hệ thống.
            </p>

            <h2>7. Sửa đổi điều khoản</h2>
            <p>
              <strong>Serene Health</strong> có thể cập nhật các Điều khoản này theo thời gian. Mọi thay đổi sẽ có hiệu lực ngay khi được đăng tải trên ứng dụng. Việc bạn tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp thuận các thay đổi đó.
            </p>

            <h2>8. Liên hệ</h2>
            <p>Mọi thắc mắc về Điều khoản dịch vụ của <strong>Serene Health</strong>, xin vui lòng gửi về:</p>
            <ul>
              <li><strong>Ứng dụng:</strong> Serene Health</li>
              <li><strong>Email:</strong> terms@serenehealth.vn</li>
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

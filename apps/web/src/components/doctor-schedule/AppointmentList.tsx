import { Patient } from '../../data/scheduleData';
import './AppointmentList.css';

interface AppointmentListProps {
    shiftTitle: string;
    timeRange: string;
    count: number;
    patients: Patient[];
}


const AppointmentList = ({ shiftTitle, timeRange, count, patients }: AppointmentListProps) => {
    return (
        <div className="appointment-container">
            <h3 className="detail-title">Chi tiết ca làm việc</h3>
            <div className="shift-info-row">
                <span>Ca làm việc:</span> <strong>{shiftTitle}</strong>
            </div>
            <div className="shift-info-row">
                <span>Thời gian:</span> <strong>{timeRange}</strong>
            </div>
            <div className="shift-info-row">
                <span>Tổng số lịch hẹn:</span> <strong>{count} lịch hẹn</strong>
            </div>

            <p className="list-label">Danh sách lịch hẹn</p>
            <div className="patient-list">
                {patients.length > 0 ? (
                    patients.map((p, idx) => (
                        <div key={idx} className="patient-item">
                            <div className="patient-avatar"></div>
                            <div className="patient-info">
                                <p className="p-name">{p.name}</p>
                                <p className="p-id">Mã BN: {p.id}</p>
                            </div>
                            <span className="p-time">{p.time}</span>
                        </div>
                    ))
                ) : (
                    <div className="empty-state-container">
                        <p>Không có yêu cầu thăm khám nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AppointmentList;
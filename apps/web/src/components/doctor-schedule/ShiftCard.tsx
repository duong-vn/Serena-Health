import './ShiftCard.css';
interface ShiftCardProps {
    title: string;
    time: string;
    count: number;
    status?: string;
    onViewDetail: () => void;
    isSelected: boolean
}

const ShiftCard = ({ title, time, count, status, onViewDetail, isSelected }: ShiftCardProps) => (
    <div className={`shift-card ${isSelected ? 'selected' : ''}`}>
        <div className="shift-main">
            <div>
                <h4 className="shift-title">{title}</h4>
                <p className="shift-time">{time}</p>
            </div>
            {status && <span className="shift-badge">{status}</span>}
        </div>
        <div className="shift-footer">
            <span>{count} lịch hẹn</span>
            <div onClick={onViewDetail} className="view-detail-text">Xem chi tiết</div>
        </div>
    </div>
);

export default ShiftCard;
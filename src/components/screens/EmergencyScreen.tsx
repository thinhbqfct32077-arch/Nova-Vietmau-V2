import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  Plus,
  Heart,
  Hospital,
  User,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  Ambulance,
  PhoneForwarded,
} from 'lucide-react';
import { EmergencyContact } from '../../types';

interface EmergencyScreenProps {
  contacts: EmergencyContact[];
  onAddContact: (contact: EmergencyContact) => void;
  onBack: () => void;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({
  contacts,
  onAddContact,
  onBack,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newRelationship, setNewRelationship] = useState('Chồng / Người thân');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCall = (phoneNumber: string, name: string) => {
    triggerToast(`Đang kết nối cuộc gọi tới: ${name} (${phoneNumber})`);
    window.location.href = `tel:${phoneNumber.replace(/\s+/g, '')}`;
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newPhone.trim()) {
      triggerToast('Vui lòng điền họ tên và số điện thoại');
      return;
    }

    const contact: EmergencyContact = {
      id: `em-${Date.now()}`,
      name: newContactName,
      relationship: newRelationship,
      phone: newPhone,
      notes: newNotes,
    };

    onAddContact(contact);
    setShowAddModal(false);
    setNewContactName('');
    setNewPhone('');
    setNewNotes('');
    triggerToast('Đã thêm số người thân khẩn cấp!');
  };

  const nationalHospitals = [
    {
      name: 'BV Phụ Sản Từ Dũ (TP.HCM)',
      phone: '028 5404 2829',
      address: '284 Cống Quỳnh, Q.1, TP.HCM',
      badge: 'Trực cấp cứu 24/24',
    },
    {
      name: 'BV Phụ Sản Trung Ương (Hà Nội)',
      phone: '024 3825 2161',
      address: '43 Tràng Thi, Hoàn Kiếm, Hà Nội',
      badge: 'Cấp cứu Sản TW',
    },
    {
      name: 'BV Phụ Sản Hà Nội',
      phone: '1900 6922',
      address: '929 La Thành, Ba Đình, Hà Nội',
      badge: 'Tổng đài cấp cứu',
    },
    {
      name: 'BV Hùng Vương (TP.HCM)',
      phone: '028 3855 8582',
      address: '128 Hồng Bàng, Q.5, TP.HCM',
      badge: 'Cấp cứu 24/7',
    },
    {
      name: 'Hotline Bác sĩ Nova Care SOS',
      phone: '1800 6868',
      address: 'Tổng đài hỗ trợ thai kỳ khẩn cấp',
      badge: 'Miễn phí cước',
    },
  ];

  const warningSigns = [
    {
      title: 'Ra máu âm đạo bất thường',
      desc: 'Bất kể lượng máu ít hay nhiều, máu đỏ tươi hoặc kèm cục máu đông, cần đi viện ngay.',
    },
    {
      title: 'Vỡ ối hoặc rỉ dịch ối',
      desc: 'Dịch trong suốt hoặc ngả xanh/vàng chảy nhiều từ vùng kín không kiểm soát được.',
    },
    {
      title: 'Đau bụng dữ dội hoặc gò cứng',
      desc: 'Cơn co thắt dồn dập trên 3 cơn trong 10 phút hoặc bụng gò cứng như gỗ.',
    },
    {
      title: 'Thai máy yếu hoặc ngưng đạp',
      desc: 'Em bé cử động dưới 4 lần/giờ sau khi mẹ đã ăn nhẹ và nằm nghiêng trái nghỉ ngơi.',
    },
    {
      title: 'Dấu hiệu tiền sản giật cấp',
      desc: 'Đau đầu dữ dội không giảm, hoa mắt nhìn mờ, đau tức vùng thượng vị, sưng phù tay chân.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBF7] overflow-y-auto no-scrollbar select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#3A2E2B] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
          <PhoneCall className="w-3.5 h-3.5 text-[#2ECC71]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-[#F0ECE6]/60 sticky top-0 bg-[#FFFBF7]/90 backdrop-blur-md z-20">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-[#EFEAE5] shadow-xs flex items-center justify-center text-[#5E4E49] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[14px] font-bold text-[#E74C3C] flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" />
          <span>Số khẩn cấp SOS</span>
        </span>
        <div className="flex items-center gap-1 bg-[#FDF2F0] text-[#E74C3C] px-2 py-0.5 rounded-full text-[10.5px] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#E74C3C] animate-ping" />
          <span>Trực 24/7</span>
        </div>
      </div>

      <div className="px-5 pt-3 pb-8 space-y-4">
        {/* GIANT SOS 115 BUTTON */}
        <motion.div
          whileTap={{ scale: 0.96 }}
          onClick={() => handleCall('115', 'Cấp cứu Y tế Toàn quốc')}
          className="relative p-5 bg-gradient-to-tr from-[#D63031] via-[#E17055] to-[#D63031] text-white rounded-3xl shadow-lg shadow-[#D63031]/30 flex flex-col items-center text-center cursor-pointer overflow-hidden border-2 border-white/30"
        >
          {/* Subtle pulse background */}
          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-white text-[#D63031] flex items-center justify-center shadow-md mb-2">
            <Ambulance className="w-8 h-8 animate-bounce" />
          </div>

          <span className="text-[28px] font-black tracking-tight leading-none mb-1">
            GỌI 115 CẤP CỨU
          </span>
          <span className="text-[12.5px] font-bold text-white/90">
            Cấp cứu Y tế Toàn quốc · Miễn cước 24/7
          </span>
          <p className="text-[11px] text-white/75 mt-1 max-w-[260px]">
            Chạm ngay để quay số điều xe cấp cứu và nhân viên y tế đến hỗ trợ tức thì
          </p>
        </motion.div>

        {/* Người thân khẩn cấp */}
        <div className="p-4 bg-white rounded-3xl border border-[#EFEAE5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#C84B4B]" />
              <h3 className="text-[13.5px] font-extrabold text-[#3A2E2B]">
                Người thân & Bác sĩ riêng
              </h3>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-[#C84B4B] bg-[#FFF2EE] px-2.5 py-1 rounded-full hover:bg-[#FFE6E0] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm số</span>
            </button>
          </div>

          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 bg-[#FAF7F4] rounded-2xl border border-[#F0ECE6] flex items-center justify-between hover:border-[#C84B4B]/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#3A2E2B]">{contact.name}</span>
                    <span className="text-[10px] font-semibold bg-[#EFEAE5] text-[#5E4E49] px-2 py-0.2 rounded-full">
                      {contact.relationship}
                    </span>
                  </div>
                  <span className="text-[12px] font-mono font-bold text-[#C84B4B]">
                    {contact.phone}
                  </span>
                  {contact.notes && (
                    <p className="text-[10px] text-[#8C7B75] mt-0.5">{contact.notes}</p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleCall(contact.phone, contact.name)}
                  className="w-10 h-10 rounded-full bg-[#2ECC71] text-white flex items-center justify-center shadow-md hover:bg-[#27AE60] transition-colors cursor-pointer shrink-0"
                  title="Gọi ngay"
                >
                  <PhoneCall className="w-5 h-5" />
                </motion.button>
              </div>
            ))}
          </div>
        </div>

        {/* Bệnh viện phụ sản khẩn cấp */}
        <div className="p-4 bg-white rounded-3xl border border-[#EFEAE5] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Hospital className="w-4 h-4 text-[#C84B4B]" />
            <h3 className="text-[13.5px] font-extrabold text-[#3A2E2B]">
              Hotline Bệnh viện Phụ Sản Cấp cứu
            </h3>
          </div>

          <div className="space-y-2">
            {nationalHospitals.map((hosp, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#FAF7F4] rounded-2xl border border-[#F0ECE6] flex items-center justify-between"
              >
                <div className="max-w-[200px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-[12.5px] font-bold text-[#3A2E2B]">{hosp.name}</h4>
                    <span className="text-[9.5px] font-bold text-[#E74C3C] bg-[#FDF2F0] px-1.5 py-0.2 rounded-full">
                      {hosp.badge}
                    </span>
                  </div>
                  <span className="text-[12px] font-mono font-bold text-[#C84B4B] block mt-0.5">
                    {hosp.phone}
                  </span>
                  <p className="text-[10px] text-[#8C7B75] truncate">{hosp.address}</p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleCall(hosp.phone, hosp.name)}
                  className="w-9 h-9 rounded-full bg-[#C84B4B] text-white flex items-center justify-center shadow-sm hover:bg-[#B84040] transition-colors cursor-pointer shrink-0"
                  title={`Gọi ${hosp.name}`}
                >
                  <PhoneForwarded className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          </div>
        </div>

        {/* Cẩm nang Dấu hiệu nguy hiểm */}
        <div className="p-4 bg-[#FFF5F2] rounded-3xl border border-[#F2DDD7] space-y-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E74C3C]" />
            <h3 className="text-[13px] font-extrabold text-[#3A2E2B]">
              5 Dấu hiệu mẹ cần vào viện CẤP CỨU ngay
            </h3>
          </div>

          <div className="space-y-2">
            {warningSigns.map((sign, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-xl border border-[#F0ECE6]">
                <h4 className="text-[12px] font-bold text-[#E74C3C] mb-0.5">
                  ⚠️ {sign.title}
                </h4>
                <p className="text-[11px] text-[#5E4E49] leading-relaxed">
                  {sign.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Giấy tờ cần chuẩn bị */}
        <div className="p-4 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#8C7B75]" />
            <h3 className="text-[12.5px] font-bold text-[#3A2E2B]">
              Giấy tờ cần mang ngay khi vào viện
            </h3>
          </div>
          <ul className="text-[11.5px] text-[#5E4E49] space-y-1 pl-4 list-disc">
            <li>CCCD gắn chip & Thẻ BHYT (hoặc ứng dụng VNeID / VssID).</li>
            <li>Sổ theo dõi khám thai và toàn bộ hồ sơ siêu âm, xét nghiệm.</li>
            <li>Hợp đồng sinh con / Bảo hiểm sức khỏe tư nhân (nếu có).</li>
          </ul>
        </div>
      </div>

      {/* Modal Thêm người thân */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-[340px] bg-[#FFFBF7] rounded-3xl p-5 shadow-2xl border border-[#EFEAE5]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#EFEAE5]">
              <h3 className="text-[15px] font-bold text-[#3A2E2B]">Thêm số người thân</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-[#EFEAE5] flex items-center justify-center text-[#5E4E49]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="VD: Anh Đức (Chồng)"
                  className="w-full px-3 py-2 bg-white border border-[#E8DFD5] rounded-xl text-[12.5px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Mối quan hệ</label>
                <select
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E8DFD5] rounded-xl text-[12.5px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                >
                  <option value="Chồng">Chồng</option>
                  <option value="Mẹ ruột / Mẹ chồng">Mẹ ruột / Mẹ chồng</option>
                  <option value="Bố">Bố</option>
                  <option value="Bác sĩ riêng">Bác sĩ riêng</option>
                  <option value="Anh / Chị em">Anh / Chị em</option>
                  <option value="Người thân khác">Người thân khác</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full px-3 py-2 bg-white border border-[#E8DFD5] rounded-xl text-[12.5px] font-mono text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Ghi chú (Tùy chọn)</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="VD: Liên hệ đầu tiên khi chuyển dạ"
                  className="w-full px-3 py-2 bg-white border border-[#E8DFD5] rounded-xl text-[12.5px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E2DAD0] text-[#5E4E49] text-[12px] font-bold hover:bg-[#F8F5F2]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#C84B4B] text-white text-[12px] font-bold hover:bg-[#B84040]"
                >
                  Lưu số
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

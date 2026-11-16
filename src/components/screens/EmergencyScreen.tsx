import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  Plus,
  Hospital,
  User,
  X,
  FileText,
  Ambulance,
  PhoneForwarded,
  Trash2,
} from 'lucide-react';
import { EmergencyContact } from '../../types';

interface EmergencyScreenProps {
  contacts: EmergencyContact[];
  onAddContact: (contact: EmergencyContact) => void;
  onDeleteContact?: (id: string) => void;
  onBack: () => void;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  onBack,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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
    <div className="flex-1 flex flex-col bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6] overflow-y-auto no-scrollbar select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#161311] text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2">
          <PhoneCall className="w-3.5 h-3.5 text-[#8DA892] dark:text-[#4F6B56] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="px-4 sm:px-6 pt-3 pb-3 flex items-center justify-between border-b border-[#E6DDD1] dark:border-[#362E2A] sticky top-0 bg-[#FAF6F0]/95 dark:bg-[#161311]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] shadow-xs flex items-center justify-center text-[#6B5D56] dark:text-[#C5B9B0] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B] transition-colors cursor-pointer shrink-0"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-editorial text-[17px] font-bold text-[#A9422D] dark:text-[#E5927D] flex items-center gap-1.5 truncate">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>Số khẩn cấp SOS</span>
            </h1>
            <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate">
              Kết nối nhanh cấp cứu và người thân
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] text-[#A9422D] dark:text-[#E5927D] px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap shrink-0">
          Hỗ trợ 24/7
        </span>
      </header>

      <div className="px-4 sm:px-6 pt-4 pb-10 space-y-4 max-w-4xl mx-auto w-full">
        {/* GIANT SOS 115 BUTTON */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCall('115', 'Cấp cứu Y tế Toàn quốc')}
          className="w-full relative p-5 sm:p-6 bg-gradient-to-br from-[#A9422D] via-[#9D3C28] to-[#933825] text-white rounded-3xl shadow-md flex flex-col items-center text-center cursor-pointer overflow-hidden border border-[#C66C57]/40"
        >
          <div className="w-16 h-16 rounded-full bg-white text-[#A9422D] flex items-center justify-center shadow-sm mb-2.5">
            <Ambulance className="w-8 h-8" />
          </div>

          <span className="font-editorial text-[26px] sm:text-[28px] font-bold tracking-tight leading-none mb-1.5 tabular-nums">
            GỌI 115 CẤP CỨU
          </span>
          <span className="text-[12.5px] font-bold text-white/95 tabular-nums">
            Cấp cứu Y tế Toàn quốc · Miễn cước 24/7
          </span>
          <p className="text-[11.5px] text-white/85 mt-1.5 max-w-[300px] leading-relaxed">
            Chạm ngay để quay số điều xe cấp cứu và nhân viên y tế đến hỗ trợ tức thì
          </p>
        </motion.button>

        {/* Người thân khẩn cấp */}
        <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <User className="w-4 h-4 text-[#B55841] dark:text-[#D47A63] shrink-0" />
              <h2 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6] truncate">
                Người thân & Bác sĩ riêng
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="min-h-[38px] flex items-center gap-1 text-[11.5px] font-bold text-[#B55841] dark:text-[#D47A63] bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] px-3 py-1.5 rounded-full hover:bg-[#EFE0D9] dark:hover:bg-[#412B25] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm số</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {contacts.map((contact) => {
              const isConfirming = confirmDeleteId === contact.id;
              return (
                <div
                  key={contact.id}
                  className="p-3.5 bg-[#FAF6F0] dark:bg-[#231E1B] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13.5px] font-bold text-[#322622] dark:text-[#F4EDE6]">{contact.name}</span>
                      <span className="text-[10.5px] font-semibold bg-[#F2ECE3] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0] px-2 py-0.5 rounded-full whitespace-nowrap">
                        {contact.relationship}
                      </span>
                    </div>
                    <span className="text-[13px] font-mono font-bold text-[#B55841] dark:text-[#D47A63] block mt-0.5 tabular-nums">
                      {contact.phone}
                    </span>
                    {contact.notes && (
                      <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] mt-0.5 leading-relaxed">{contact.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onDeleteContact && contacts.length > 1 && (
                      isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteContact(contact.id);
                              setConfirmDeleteId(null);
                              triggerToast('Đã xóa số liên hệ!');
                            }}
                            className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#A9422D] text-white text-[11px] font-bold cursor-pointer whitespace-nowrap"
                          >
                            Xác nhận
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#F2ECE3] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0] text-[11px] font-bold cursor-pointer whitespace-nowrap"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(contact.id)}
                          className="w-10 h-10 rounded-full bg-[#F2ECE3] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F] hover:text-[#A9422D] dark:hover:text-[#E5927D] flex items-center justify-center transition-colors cursor-pointer"
                          title="Xóa liên hệ"
                          aria-label={`Xóa liên hệ ${contact.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleCall(contact.phone, contact.name)}
                      className="w-11 h-11 rounded-full bg-[#4F6B56] hover:bg-[#3F5745] text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer shrink-0"
                      title="Gọi ngay"
                      aria-label={`Gọi ${contact.name}`}
                    >
                      <PhoneCall className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="pt-2 border-t border-[#E6DDD1] dark:border-[#362E2A] text-[11px] text-[#786962] dark:text-[#B5A89F]">
            Danh bạ người thân được lưu sẵn trên thiết bị để mẹ gọi nhanh khi cần hỗ trợ.
          </p>
        </section>

        {/* Bệnh viện phụ sản khẩn cấp */}
        <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Hospital className="w-4 h-4 text-[#B55841] dark:text-[#D47A63] shrink-0" />
            <h2 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6]">
              Hotline Bệnh viện Phụ Sản Cấp cứu
            </h2>
          </div>

          <div className="space-y-2.5">
            {nationalHospitals.map((hosp, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#FAF6F0] dark:bg-[#231E1B] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-[13px] font-bold text-[#322622] dark:text-[#F4EDE6]">{hosp.name}</h3>
                    <span className="text-[10px] font-bold text-[#A9422D] dark:text-[#E5927D] bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] px-2 py-0.5 rounded-full whitespace-nowrap">
                      {hosp.badge}
                    </span>
                  </div>
                  <span className="text-[12.5px] font-mono font-bold text-[#B55841] dark:text-[#D47A63] block mt-0.5 tabular-nums">
                    {hosp.phone}
                  </span>
                  <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate">{hosp.address}</p>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleCall(hosp.phone, hosp.name)}
                  className="w-11 h-11 rounded-full bg-[#B55841] hover:bg-[#9E4A35] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0"
                  title={`Gọi ${hosp.name}`}
                  aria-label={`Gọi ${hosp.name}`}
                >
                  <PhoneForwarded className="w-4.5 h-4.5" />
                </motion.button>
              </div>
            ))}
          </div>
        </section>

        {/* Cẩm nang Dấu hiệu nguy hiểm */}
        <section className="p-4 sm:p-5 bg-[#F7EAE5] dark:bg-[#35231E] rounded-3xl border border-[#EBCDC2] dark:border-[#52352D] space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#A9422D] dark:text-[#E5927D] shrink-0" />
            <h2 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6]">
              5 Dấu hiệu mẹ cần vào viện CẤP CỨU ngay
            </h2>
          </div>

          <div className="space-y-2">
            {warningSigns.map((sign, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A]"
              >
                <h3 className="text-[12.5px] font-bold text-[#A9422D] dark:text-[#E5927D] mb-0.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{sign.title}</span>
                </h3>
                <p className="text-[11.5px] text-[#6B5D56] dark:text-[#C5B9B0] leading-relaxed">
                  {sign.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Giấy tờ cần chuẩn bị */}
        <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] shadow-xs">
          <div className="flex items-center gap-2 mb-2.5">
            <FileText className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892] shrink-0" />
            <h2 className="font-editorial text-[14px] font-bold text-[#322622] dark:text-[#F4EDE6]">
              Giấy tờ cần mang ngay khi vào viện
            </h2>
          </div>
          <ul className="text-[12px] text-[#6B5D56] dark:text-[#C5B9B0] space-y-1.5 pl-4 list-disc leading-relaxed">
            <li>CCCD gắn chip & Thẻ BHYT (hoặc ứng dụng VNeID / VssID).</li>
            <li>Sổ theo dõi khám thai và toàn bộ hồ sơ siêu âm, xét nghiệm.</li>
            <li>Hợp đồng sinh con / Bảo hiểm sức khỏe tư nhân (nếu có).</li>
          </ul>
        </section>
      </div>

      {/* Modal Thêm người thân */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-[360px] bg-[#FAF6F0] dark:bg-[#1E1A17] rounded-3xl p-5 shadow-2xl border border-[#E6DDD1] dark:border-[#362E2A]">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#E6DDD1] dark:border-[#362E2A]">
              <h3 className="font-editorial text-[16px] font-bold text-[#322622] dark:text-[#F4EDE6]">Thêm số người thân</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#6B5D56] dark:text-[#C5B9B0] cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#786962] dark:text-[#B5A89F] mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="VD: Anh Đức (Chồng)"
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[12.5px] text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] dark:placeholder:text-[#B5A89F] focus:outline-none focus:border-[#B55841] dark:focus:border-[#D47A63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#786962] dark:text-[#B5A89F] mb-1">Mối quan hệ</label>
                <select
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[12.5px] text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841] dark:focus:border-[#D47A63]"
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
                <label className="block text-[11px] font-bold text-[#786962] dark:text-[#B5A89F] mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[12.5px] font-mono text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] dark:placeholder:text-[#B5A89F] tabular-nums focus:outline-none focus:border-[#B55841] dark:focus:border-[#D47A63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#786962] dark:text-[#B5A89F] mb-1">Ghi chú (Tùy chọn)</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="VD: Liên hệ đầu tiên khi chuyển dạ"
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[12.5px] text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] dark:placeholder:text-[#B5A89F] focus:outline-none focus:border-[#B55841] dark:focus:border-[#D47A63]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0] text-[12.5px] font-bold hover:bg-[#F2ECE3] dark:hover:bg-[#2B2521] cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-[12.5px] font-bold cursor-pointer transition-colors"
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

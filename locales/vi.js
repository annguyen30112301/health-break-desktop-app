'use strict';

module.exports = {
  subtitle: 'Nhắc nhở sức khỏe khi làm việc với máy tính',

  testing: {
    badge:      'TESTING MODE — giới hạn tối thiểu hạ xuống 1 phút',
    clearCache: 'Xóa cache',
    exit:       'Thoát testing',
  },

  reminders: {
    water: {
      name: 'Uống nước',
      desc: (m) => `Mỗi <strong>${m} phút</strong> · 250ml mỗi lần`,
      body: 'Đã đến giờ uống nước! Hãy uống 1 ly nước (khoảng 250ml) nhé.',
      info: {
        benefits: [
          'Tăng khả năng tập trung — mất nước chỉ 1–2% đã làm giảm đáng kể hiệu suất nhận thức',
          'Hỗ trợ thận đào thải chất thải, giảm nguy cơ sỏi thận và nhiễm trùng tiết niệu',
          'Duy trì năng lượng ổn định suốt ngày, ngăn tình trạng mệt mỏi đột ngột buổi chiều',
          'Bôi trơn khớp và đệm cột sống, giảm đau mỏi do ngồi làm việc lâu giờ',
          'Giữ ẩm cho da, cải thiện sức khỏe làn da và làm chậm quá trình lão hóa',
        ],
        risks: [
          'Thiếu nước mãn tính làm tăng đáng kể nguy cơ sỏi thận và viêm đường tiết niệu',
          'Suy giảm trí nhớ ngắn hạn, mất tập trung và phản xạ chậm trong công việc',
          'Đau đầu và đau nửa đầu thường xuyên do mất cân bằng chất lỏng trong não',
          'Khớp cứng và đau nhức khi sụn mất đi lớp dịch bôi trơn bảo vệ',
          'Gây áp lực lên tim lâu dài — máu đặc hơn khiến tim phải bơm mạnh hơn mỗi nhịp',
        ],
      },
    },

    move: {
      name: 'Vận động nhẹ',
      desc: (m) => `Mỗi <strong>${m} phút</strong> · Đứng dậy 5 phút`,
      body: 'Bạn đã ngồi quá lâu rồi! Hãy đứng dậy đi lại 5 phút cho lưng khỏe.',
      info: {
        benefits: [
          'Cải thiện tuần hoàn máu, giảm nguy cơ mắc các bệnh tim mạch',
          'Giải phóng căng cơ lưng, cổ và vai gáy tích tụ do ngồi lâu',
          'Kích thích giải phóng endorphin, cải thiện tâm trạng và năng suất làm việc',
          'Duy trì chuyển hóa hoạt động, ngăn tình trạng tăng cân từ từ theo thời gian',
          'Giảm nguy cơ huyết khối tĩnh mạch sâu (DVT) — cục máu đông nguy hiểm do ngồi bất động',
        ],
        risks: [
          'Ngồi 8+ giờ/ngày liên quan đến nguy cơ mắc bệnh tim mạch cao hơn 40%, kể cả khi vẫn tập thể dục',
          'Cơ lưng và cơ core suy yếu dần, gây đau thắt lưng mãn tính và cong vẹo cột sống',
          'Tăng nguy cơ tiểu đường type 2 và hội chứng chuyển hóa do ít hoạt động kéo dài',
          'Nguy cơ lo âu và trầm cảm cao hơn gắn liền với lối sống tĩnh tại',
          'Giảm tuổi thọ — nghiên cứu chứng minh ngồi quá nhiều liên quan đến tử vong sớm',
        ],
      },
    },

    eyes: {
      name: 'Nghỉ mắt',
      desc: (m) => `Mỗi <strong>${m} phút</strong> · Quy tắc 20-20-20`,
      body: 'Quy tắc 20-20-20: Nhìn vào vật cách 6m trong 20 giây để mắt nghỉ ngơi.',
      info: {
        benefits: [
          'Ngăn ngừa Hội chứng Thị giác Máy tính (CVS): giảm mỏi mắt, khô mắt và mờ mắt',
          'Giảm đau đầu do nhìn tập trung liên tục vào màn hình trong thời gian dài',
          'Tập luyện cơ điều tiết mắt, giữ mắt linh hoạt và phản ứng tốt hơn',
          'Làm chậm tiến triển cận thị — đặc biệt quan trọng với người trẻ trong độ tuổi đi học và làm việc',
          'Cải thiện sự tập trung và độ chính xác khi quay lại công việc sau mỗi lần nghỉ',
        ],
        risks: [
          'Nhìn màn hình liên tục làm giảm tần suất chớp mắt tới 60%, gây khô mắt mãn tính',
          'Đẩy nhanh tiến triển cận thị — thời gian nhìn màn hình là một trong những nguyên nhân hàng đầu toàn cầu',
          'Đau đầu, căng cơ cổ và vai dai dẳng do mắt phải gắng sức và tư thế cúi người về phía trước',
          'Tăng nhạy cảm với ánh sáng theo thời gian, khó điều chỉnh giữa ánh sáng màn hình và ánh sáng tự nhiên',
          'Mỏi mắt kỹ thuật số tích lũy dần thành tổn thương thị lực và khó chịu lâu dài',
        ],
      },
    },
  },

  editBtn:  'Chỉnh',
  saveBtn:  'Lưu & Khởi động lại bộ đếm',
  minShort: 'p',     // slider bounds labels  e.g. "20p"
  minFull:  'phút',  // slider value display  e.g. "30 phút"

  autoLaunch: {
    name: 'Tự khởi động cùng hệ thống',
    desc: 'Chạy nền khi đăng nhập máy tính',
  },

  dashboard: {
    btnOpen:       'Thống kê',
    title:         'Thống kê sức khỏe',
    subtitle:      'Hoạt động của bạn trong',
    days:          'ngày qua',
    toggle7:       '7 ngày',
    toggle30:      '30 ngày',
    water:         'Lượng nước uống',
    waterUnit:     'ml',
    eyes:          'Thời gian nghỉ mắt',
    eyesUnit:      'phút',
    move:          'Vận động nhẹ',
    moveUnitTimes: 'lần',
    moveUnitMin:   'phút',
    skipRate:      'Tỷ lệ bỏ qua',
    skipRateDesc:  'Tỷ lệ nhắc nhở bạn đã bỏ qua',
    noData:        'Chưa có dữ liệu',
    confirms:      'lần xác nhận',
    skips:         'lần bỏ qua',
  },

  status: {
    running: (n) => `Đang chạy · <span>${n} nhắc nhở</span> đang hoạt động`,
    allOff:  'Tất cả nhắc nhở đang <span style="color:#ccc">tắt</span>',
  },

  tray: {
    tooltip: 'HealthBreak — đang chạy nền',
    open:    'Mở HealthBreak',
    quit:    'Thoát hoàn toàn',
  },

  infoModal: {
    benefitsTitle: 'Lợi ích với sức khỏe',
    risksTitle:    'Tác hại lâu dài nếu bỏ qua',
  },

  popup: {
    confirm:    '✓ Xác nhận đã thực hiện',
    skip:       'Tôi đang bận, bỏ qua lần này',
    queueBadge: (n) => `+${n} nhắc nhở đang chờ`,
  },

  stats: {
    water: (n) => `Đã uống ${n} lần hôm nay`,
    move:  (n) => `Đã vận động ${n} lần hôm nay`,
    eyes:  (n) => `Đã nghỉ mắt ${n} lần hôm nay`,
  },

  onboarding: {
    step1Title: 'Chào mừng đến với HealthBreak',
    step1Desc:  'Nhắc nhở sức khỏe thông minh giúp bạn luôn khỏe mạnh trong ngày làm việc.',
    startBtn:   'Bắt đầu →',
    step2Title: 'Thiết lập mục tiêu uống nước',
    step2Desc:  'Nhập thông tin cơ thể để tính lượng nước phù hợp nhất cho bạn mỗi ngày.',
    applyBtn:    '✓ Áp dụng & Tiếp tục',
    skipBtn:     'Bỏ qua — tôi sẽ thiết lập sau',
    step3Title:  'Quyền riêng tư & Đồng bộ đám mây',
    step3Desc:   'HealthBreak mặc định hoạt động hoàn toàn ngoại tuyến.\n\nNếu bạn đăng nhập Google, cài đặt sẽ được đồng bộ lên đám mây để khôi phục trên bất kỳ thiết bị nào. Chúng tôi lưu:\n• Khoảng thời gian và tuỳ chọn nhắc nhở của bạn\n• Lịch sử xác nhận/bỏ qua hàng ngày (30 ngày gần nhất)\n\nChúng tôi không chia sẻ dữ liệu với bên thứ ba.',
    privacyOk:   'Đã hiểu — bắt đầu thôi!',
    privacySkip: 'Bắt đầu mà không cần đăng nhập',
  },

  waterGoal: {
    heightLabel:    'Chiều cao (cm)',
    weightLabel:    'Cân nặng (kg)',
    saveBtn:        'Lưu mục tiêu uống nước',
    recommendation: (sessions, ml) =>
      `Gợi ý: ${sessions} lần/ngày · ~${Math.round(ml)}ml mỗi lần`,
    invalidWeight:  'Vui lòng nhập cân nặng hợp lệ (30–200 kg)',
    statsWithGoal:  (intakeMl, goalMl) =>
      `${intakeMl}ml / ${goalMl}ml hôm nay · còn ${Math.max(0, goalMl - intakeMl)}ml`,
    popupBody:      (ml, remainingMl) => remainingMl > 0
      ? `Uống ${Math.round(ml)}ml ngay! Còn ~${remainingMl}ml để đạt mục tiêu.`
      : `Uống ${Math.round(ml)}ml ngay! 🎉 Bạn đã đạt mục tiêu hôm nay!`,
  },

  auth: {
    cardName:       'Đồng bộ đám mây',
    cardDescOff:    'Đăng nhập Google để đồng bộ cài đặt giữa các thiết bị',
    cardDescOn:     (email) => `Đã đăng nhập: ${email}`,
    badgeOffline:   'Ngoại tuyến',
    badgeOnline:    'Trực tuyến',
    btnSignIn:      'Đăng nhập với Google',
    btnSignOut:     'Đăng xuất',
    signingIn:      'Đang mở trình duyệt…',
    signingInWait:  'Đang chờ đăng nhập Google…',
    signInError:    'Đăng nhập thất bại. Vui lòng thử lại.',
    notConfigured:  'Chưa cấu hình đồng bộ. Xem firebase-config.example.js.',

    migrationTitle: 'Đồng bộ dữ liệu hiện có?',
    migrationDesc:  'Bạn có cài đặt đã lưu trên máy. Đồng bộ lên đám mây hay bắt đầu mới?',
    migrationSync:  '⬆ Đồng bộ lên đám mây',
    migrationFresh: 'Bắt đầu mới',

    restoreTitle:   'Tìm thấy cài đặt trên đám mây',
    restoreDesc:    'Bạn có muốn khôi phục cài đặt từ đám mây không?',
    restoreYes:     '⬇ Khôi phục cài đặt',
    restoreSkip:    'Giữ cài đặt hiện tại',

    syncOk:         'Đã đồng bộ ✓',
    syncError:      'Lỗi đồng bộ — đã lưu cục bộ',
  },

  account: {
    cardName:     'Tài khoản',
    email:        (email) => email,
    joined:       (date) => `Ngày tham gia: ${date}`,
    btnDelete:    'Xoá tài khoản',
    deleteTitle:  'Xoá tài khoản?',
    deleteDesc:   'Toàn bộ dữ liệu Firestore của bạn sẽ bị xoá vĩnh viễn và bạn sẽ bị đăng xuất. Không thể hoàn tác.',
    deleteConfirm:'Xoá vĩnh viễn',
    deleteCancel: 'Huỷ',
    deleting:     'Đang xoá…',
    deleteOk:     'Đã xoá tài khoản.',
    deleteError:  'Xoá thất bại. Vui lòng thử lại.',
  },

  feedback: {
    cardName:     'Gửi phản hồi',
    cardDesc:     'Giúp chúng tôi cải thiện HealthBreak',
    btnOpen:      'Viết phản hồi',
    dialogTitle:  'Gửi phản hồi',
    dialogDesc:   'Chia sẻ ý kiến của bạn (1–500 ký tự)',
    btnSend:      'Gửi',
    btnCancel:    'Huỷ',
    sending:      'Đang gửi…',
    sent:         'Đã gửi phản hồi — cảm ơn bạn!',
    tooShort:     'Vui lòng nhập ít nhất 1 ký tự.',
    tooLong:      'Phản hồi không được vượt quá 500 ký tự.',
    error:        'Gửi thất bại. Vui lòng thử lại.',
  },
};

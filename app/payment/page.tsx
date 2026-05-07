
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Danh sách gói dịch vụ
  const packages = {
    'vip': {
      id: 'vip',
      name: 'Tin VIP',
      price: 50000,
      duration: '30 ngày',
      description: 'Ưu tiên hiển thị trên đầu với khung viền màu vàng'
    },
    'premium': {
      id: 'premium',
      name: 'Tin Premium',
      price: 100000,
      duration: '45 ngày',
      description: 'Hiển thị nổi bật nhất với đầy đủ tính năng'
    },
    'basic_member': {
      id: 'basic_member',
      name: 'Thành viên Cơ bản',
      price: 99000,
      duration: '1 tháng',
      description: 'Đăng 20 tin/tháng với nhiều ưu đãi'
    },
    'pro_member': {
      id: 'pro_member',
      name: 'Thành viên Pro',
      price: 199000,
      duration: '1 tháng',
      description: 'Đăng không giới hạn với giảm giá 40%'
    },
    'business_member': {
      id: 'business_member',
      name: 'Thành viên Doanh nghiệp',
      price: 399000,
      duration: '1 tháng',
      description: 'Tất cả tính năng Pro + trang cửa hàng riêng'
    },
    'video_basic': {
      id: 'video_basic',
      name: 'Video Cơ bản',
      price: 30000,
      duration: 'Một lần',
      description: 'Video HD 30-60 giây cho tin đăng'
    },
    'video_premium': {
      id: 'video_premium',
      name: 'Video Premium',
      price: 50000,
      duration: 'Một lần',
      description: 'Video Full HD 60-120 giây với hiệu ứng'
    }
  };

  useEffect(() => {
    const packageId = searchParams.get('package');
    if (packageId && packages[packageId as keyof typeof packages]) {
      setSelectedPackage(packages[packageId as keyof typeof packages]);
    }
  }, [searchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate full name
    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    } else if (customerInfo.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    // Validate phone number (Vietnamese format)
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(customerInfo.phone.trim())) {
      newErrors.phone = 'Số điện thoại không đúng định dạng (VD: 0912345678)';
    }

    // Validate email (optional but must be correct format if provided)
    if (customerInfo.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email.trim())) {
      newErrors.email = 'Email không đúng định dạng';
    }

    // Check terms agreement
    const termsCheckbox = document.getElementById('terms') as HTMLInputElement;
    if (!termsCheckbox?.checked) {
      newErrors.terms = 'Vui lòng đồng ý với điều khoản dịch vụ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const banks = [
    { id: 'vcb', name: 'Vietcombank', logo: '🏦' },
    { id: 'tcb', name: 'Techcombank', logo: '🏛️' },
    { id: 'acb', name: 'ACB', logo: '🏪' },
    { id: 'mb', name: 'MB Bank', logo: '🏬' },
    { id: 'vib', name: 'VIB', logo: '🏢' },
    { id: 'tpb', name: 'TPBank', logo: '🏭' }
  ];

  const handlePayment = async () => {
    if (!selectedPackage) return;

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Save payment info to localStorage for profile page
      const paymentData = {
        packageName: selectedPackage.name,
        amount: selectedPackage.price * 1.1,
        date: new Date().toISOString(),
        customerInfo: customerInfo
      };

      // Update user balance
      const existingBalance = localStorage.getItem('cho_nhan_co_balance');
      const currentBalance = existingBalance ? parseFloat(existingBalance) : 0;
      const newBalance = currentBalance + (selectedPackage.price * 1.1);
      localStorage.setItem('cho_nhan_co_balance', newBalance.toString());

      // Save payment history
      const existingHistory = localStorage.getItem('cho_nhan_co_payment_history');
      const paymentHistory = existingHistory ? JSON.parse(existingHistory) : [];
      paymentHistory.unshift(paymentData);
      localStorage.setItem('cho_nhan_co_payment_history', JSON.stringify(paymentHistory));

      setIsProcessing(false);
      setShowSuccess(true);
      
      // Redirect after success using Next.js router
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      setErrors({ general: 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.' });
    }
  };

  if (!selectedPackage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-red-600 text-2xl w-8 h-8 flex items-center justify-center"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy gói dịch vụ</h2>
          <p className="text-gray-600 mb-4">Vui lòng chọn gói dịch vụ từ trang bảng giá</p>
          <Link
            href="/pricing"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            Quay lại bảng giá
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <i className="ri-store-2-line text-white text-xl"></i>
                </div>
                <div>
                  <h1 className="font-['Pacifico'] text-2xl text-green-700">Chợ Nhân Cơ</h1>
                  <p className="text-sm text-gray-600">Thanh toán dịch vụ</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/pricing" className="text-gray-700 hover:text-green-600 transition-colors cursor-pointer">
                <i className="ri-arrow-left-line mr-2"></i>
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-vip-crown-line text-green-600 text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{selectedPackage.name}</h3>
                    <p className="text-sm text-gray-600">{selectedPackage.description}</p>
                    <div className="text-sm text-gray-500 mt-1">
                      Thời hạn: {selectedPackage.duration}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Giá gói:</span>
                    <span className="font-medium">{formatPrice(selectedPackage.price)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">VAT (10%):</span>
                    <span className="font-medium">{formatPrice(selectedPackage.price * 0.1)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(selectedPackage.price * 1.1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <i className="ri-information-line text-blue-600 flex-shrink-0 mt-0.5"></i>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Ưu đãi đặc biệt:</p>
                      <p>Thanh toán ngay hôm nay được tặng thêm 7 ngày sử dụng miễn phí!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Chọn phương thức thanh toán</h2>
              
              <div className="space-y-4">
                {/* MoMo */}
                <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                  paymentMethod === 'momo' 
                    ? 'border-pink-500 bg-pink-50' 
                    : 'border-gray-200 hover:border-pink-300'
                }`}>
                  <div className="flex items-center space-x-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">💳</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Ví MoMo</h3>
                        <p className="text-sm text-gray-600">Thanh toán nhanh chóng với ví điện tử MoMo</p>
                      </div>
                    </div>
                    <div className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                      Phổ biến
                    </div>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                  paymentMethod === 'bank' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                  <div className="flex items-center space-x-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="ri-bank-line text-blue-600 text-xl"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Chuyển khoản ngân hàng</h3>
                        <p className="text-sm text-gray-600">Thanh toán qua Internet Banking hoặc ATM</p>
                      </div>
                    </div>
                  </div>
                </label>

                {/* QR Code */}
                <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                  paymentMethod === 'qr' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}>
                  <div className="flex items-center space-x-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="qr"
                      checked={paymentMethod === 'qr'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="ri-qr-code-line text-green-600 text-xl"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Quét mã QR</h3>
                        <p className="text-sm text-gray-600">Quét mã QR bằng app ngân hàng để thanh toán</p>
                      </div>
                    </div>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Nhanh nhất
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* MoMo Payment Details */}
            {paymentMethod === 'momo' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chuyển khoản MoMo</h3>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💳</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Ví MoMo</h4>
                      <p className="text-sm text-gray-600">Chuyển khoản qua số điện thoại</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-pink-600">0888317289</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText('0888317289')}
                          className="text-pink-600 hover:text-pink-700 cursor-pointer"
                          title="Sao chép"
                        >
                          <i className="ri-file-copy-line"></i>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600">Chủ tài khoản:</span>
                      <span className="font-semibold text-gray-900">Nguyễn Anh Tấn</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-bold text-pink-600">{formatPrice(selectedPackage.price * 1.1)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600">Nội dung:</span>
                      <span className="font-medium text-gray-900">Thanh toan {selectedPackage.name}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <i className="ri-information-line text-yellow-600 flex-shrink-0 mt-0.5"></i>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Hướng dẫn thanh toán:</p>
                        <ul className="space-y-1 text-xs">
                          <li>1. Mở ứng dụng MoMo trên điện thoại</li>
                          <li>2. Chọn "Chuyển tiền" → "Đến số điện thoại"</li>
                          <li>3. Nhập số điện thoại và số tiền chính xác</li>
                          <li>4. Nhập nội dung chuyển khoản như trên</li>
                          <li>5. Xác nhận và hoàn tất giao dịch</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Details */}
            {paymentMethod === 'bank' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chuyển khoản ngân hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Agribank */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="ri-bank-line text-green-600 text-xl"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Agribank</h4>
                        <p className="text-sm text-gray-600">Ngân hàng Nông nghiệp</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Số tài khoản:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-green-600">5300205746694</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText('5300205746694')}
                            className="text-green-600 hover:text-green-700 cursor-pointer"
                            title="Sao chép"
                          >
                            <i className="ri-file-copy-line text-sm"></i>
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Chủ tài khoản:</span>
                        <span className="font-semibold text-gray-900 text-sm">Nguyễn Anh Tấn</span>
                      </div>
                    </div>
                  </div>

                  {/* MB Bank */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="ri-bank-line text-blue-600 text-xl"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">MB Bank</h4>
                        <p className="text-sm text-gray-600">Ngân hàng Quân đội</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Số tài khoản:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-blue-600">0888317289</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText('0888317289')}
                            className="text-blue-600 hover:text-blue-700 cursor-pointer"
                            title="Sao chép"
                          >
                            <i className="ri-file-copy-line text-sm"></i>
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Chủ tài khoản:</span>
                        <span className="font-semibold text-gray-900 text-sm">Nguyễn Anh Tấn</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Số tiền chuyển:</span>
                      <span className="font-bold text-blue-600">{formatPrice(selectedPackage.price * 1.1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Nội dung:</span>
                      <span className="font-medium text-gray-900">Thanh toan {selectedPackage.name}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <i className="ri-information-line text-yellow-600 flex-shrink-0 mt-0.5"></i>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Chuyển khoản đúng số tiền: <strong>{formatPrice(selectedPackage.price * 1.1)}</strong></li>
                          <li>• Ghi đúng nội dung: <strong>Thanh toan {selectedPackage.name}</strong></li>
                          <li>• Sau khi chuyển khoản, vui lòng chụp ảnh biên lai gửi cho chúng tôi</li>
                          <li>• Giao dịch sẽ được xử lý trong vòng 15-30 phút</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Payment */}
            {paymentMethod === 'qr' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quét mã QR để thanh toán</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-xl shadow-sm mb-4">
                      <img
                        src="https://readdy.ai/api/search-image?query=Vietnamese%20QR%20code%20payment%20banking%20app%20mobile%20payment%20square%20format%20clean%20white%20background%20modern%20design&width=200&height=200&seq=qrcode1&orientation=squarish"
                        alt="Mã QR thanh toán"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Quét mã QR bằng app ngân hàng</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Sử dụng camera của app ngân hàng để quét mã QR và thanh toán
                    </p>
                    
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-left">
                          <span className="text-gray-600">Số tiền:</span>
                          <div className="font-bold text-green-600">{formatPrice(selectedPackage.price * 1.1)}</div>
                        </div>
                        <div className="text-left">
                          <span className="text-gray-600">Nội dung:</span>
                          <div className="font-medium text-gray-900">Thanh toan {selectedPackage.name}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                      <div className="flex items-start space-x-2">
                        <i className="ri-smartphone-line text-blue-600 flex-shrink-0 mt-0.5"></i>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Hướng dẫn thanh toán QR:</p>
                          <ul className="space-y-1 text-xs">
                            <li>1. Mở app ngân hàng trên điện thoại</li>
                            <li>2. Chọn tính năng "Quét QR" hoặc "Thanh toán QR"</li>
                            <li>3. Quét mã QR phía trên</li>
                            <li>4. Kiểm tra thông tin và xác nhận thanh toán</li>
                            <li>5. Nhập mã PIN để hoàn tất giao dịch</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0912345678"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  Tôi đồng ý với{' '}
                  <Link href="#" className="text-green-600 hover:text-green-700">
                    điều khoản dịch vụ
                  </Link>{' '}
                  và{' '}
                  <Link href="#" className="text-green-600 hover:text-green-700">
                    chính sách bảo mật
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="mb-4 text-sm text-red-600">{errors.terms}</p>
              )}
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  <>
                    <i className="ri-secure-payment-line mr-2"></i>
                    Thanh toán {formatPrice(selectedPackage.price * 1.1)}
                  </>
                )}
              </button>

              <div className="text-center mt-4">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <i className="ri-shield-check-line text-green-500"></i>
                    <span>Bảo mật SSL</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <i className="ri-time-line text-blue-500"></i>
                    <span>Xử lý tức thì</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <i className="ri-customer-service-line text-orange-500"></i>
                    <span>Hỗ trợ 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-green-600 text-3xl w-10 h-10 flex items-center justify-center"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Thanh toán thành công!
            </h3>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã sử dụng dịch vụ. Gói <strong>{selectedPackage.name}</strong> đã được kích hoạt thành công.
            </p>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Thông tin gói dịch vụ:</p>
                  <p>• Tên gói: {selectedPackage.name}</p>
                  <p>• Thời hạn: {selectedPackage.duration}</p>
                  <p>• Số tiền: {formatPrice(selectedPackage.price * 1.1)}</p>
                  <p>• Trạng thái: Đã kích hoạt</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                Đang chuyển đến trang cá nhân...
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                Đi đến trang cá nhân ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export page with Suspense fallback
export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}

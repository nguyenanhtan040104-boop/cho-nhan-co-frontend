
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { products as productsApi, realEstate, jobs, forum, advertisements, marketPrices as marketPricesApi } from '../lib/api';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Real data state
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [liveMarketPrices, setLiveMarketPrices] = useState<any[]>([]);
  const [featuredAds, setFeaturedAds] = useState<any[]>([]);

  useEffect(() => {
    // Load featured posts: mix of products, real-estate, jobs
    Promise.allSettled([
      productsApi.getAll({ limit: 2, sortBy: 'popular' }),
      realEstate.getAll({ limit: 1 }),
      jobs.getAll({ limit: 1 }),
    ]).then(([prodRes, reRes, jobRes]) => {
      const items: any[] = [];
      if (prodRes.status === 'fulfilled') {
        (prodRes.value.data || []).forEach((p: any) => items.push({ ...p, _type: 'product' }));
      }
      if (reRes.status === 'fulfilled') {
        (reRes.value.data || []).forEach((p: any) => items.push({ ...p, _type: 'real-estate' }));
      }
      if (jobRes.status === 'fulfilled') {
        (jobRes.value.data || []).forEach((p: any) => items.push({ ...p, _type: 'job' }));
      }
      setFeaturedItems(items);
    });

    // Load latest news: mix of forum + ads
    Promise.allSettled([
      forum.getAll({ limit: 3 }),
    ]).then(([forumRes]) => {
      const news: any[] = [];
      if (forumRes.status === 'fulfilled') {
        (forumRes.value.data || []).forEach((p: any) => news.push({ ...p, _type: 'forum', _category: 'Diễn đàn', _link: `/forum/${p.id}` }));
      }
      setLatestNews(news);
    });

    // Load market prices
    marketPricesApi.getAll({ limit: 4 }).then((res: any) => {
      setLiveMarketPrices(res.data || []);
    }).catch(() => {});

    // Load featured ads
    advertisements.getAll({ limit: 6, sortBy: 'newest' }).then((res: any) => {
      setFeaturedAds(res.data || []);
    }).catch(() => {});
  }, []);

  // Thêm dữ liệu sản phẩm mẫu
  const mockProducts = [
    {
      id: 1,
      title: 'Gạo Tám Xoan ngon',
      price: '25,000đ/kg',
      category: 'Nông sản',
      location: 'An Giang',
      image: 'https://readdy.ai/api/search-image?query=Premium%20Vietnamese%20rice%20grains%20in%20white%20cloth%20bag%2C%20simple%20clean%20background%2C%20product%20photography%20style%2C%20natural%20lighting%2C%20minimalist%20composition&width=300&height=300&seq=rice001&orientation=squarish',
      timeAgo: '2 giờ trước',
      hashtag: '#SanPhamDiaPhuong',
      description: 'Gạo tám xoan thơm ngon, hạt dài, nấu cơm mềm dẻo'
    },
    {
      id: 2,
      title: 'Heo thịt sạch 15kg',
      price: '180,000đ/kg',
      category: 'Thịt sạch',
      location: 'Đồng Tháp',
      image: 'https://readdy.ai/api/search-image?query=Fresh%20pork%20meat%20cuts%20on%20clean%20white%20surface%2C%20butcher%20shop%20style%2C%20professional%20food%20photography%2C%20clean%20background%2C%20good%20lighting&width=300&height=300&seq=pork001&orientation=squarish',
      timeAgo: '3 giờ trước',
      hashtag: '#SanPhamDiaPhuong',
      description: 'Thịt heo sạch, nuôi tự nhiên không chất tăng trọng'
    },
    {
      id: 3,
      title: 'Đất vườn 2000m² mặt tiền',
      price: '450 triệu',
      category: 'Bất động sản',
      location: 'Đường Nhân Cơ - Đăk Tô',
      image: 'https://readdy.ai/api/search-image?query=Rural%20Vietnamese%20farmland%20plot%20with%20road%20frontage%2C%20green%20fields%2C%20coconut%20palm%20trees%2C%20traditional%20Vietnamese%20village%20in%20background%2C%20peaceful%20countryside%20landscape%2C%20clear%20blue%20sky&width=300&height=300&seq=land001&orientation=squarish',
      timeAgo: '5 giờ trước',
      hashtag: '#BatDongSanNongThon',
      description: 'Đất vườn đẹp, mặt tiền đường liên xã, thích hợp làm nhà vườn'
    },
    {
      id: 4,
      title: 'Rau xanh hữu cơ',
      price: '35,000đ/kg',
      category: 'Rau củ',
      location: 'Lâm Đồng',
      image: 'https://readdy.ai/api/search-image?query=Fresh%20organic%20green%20vegetables%20leafy%20greens%20in%20basket%2C%20farm%20fresh%20produce%2C%20natural%20lighting%2C%20clean%20background%2C%20healthy%20food%20photography&width=300&height=300&seq=vegetables001&orientation=squarish',
      timeAgo: '1 ngày trước',
      hashtag: '#SanPhamDiaPhuong',
      description: 'Rau xanh hữu cơ, không thuốc trừ sâu, tươi ngon'
    },
    {
      id: 5,
      title: 'Nhà cấp 4 có vườn 500m²',
      price: '280 triệu',
      category: 'Nhà ở',
      location: 'Trung tâm xã Nhân Cơ',
      image: 'https://readdy.ai/api/search-image?query=Traditional%20Vietnamese%20rural%20house%20with%20garden%2C%20single%20story%20home%2C%20green%20yard%2C%20peaceful%20countryside%20setting%2C%20authentic%20village%20architecture&width=300&height=300&seq=house001&orientation=squarish',
      timeAgo: '1 ngày trước',
      hashtag: '#BatDongSanNongThon',
      description: 'Nhà cấp 4 kiên cố, có vườn rộng, gần chợ, trường học'
    },
    {
      id: 6,
      title: 'Cà phê Robusta loại 1',
      price: '45,000đ/kg',
      category: 'Cà phê',
      location: 'Xã Nhân Cơ, Kon Tum',
      image: 'https://readdy.ai/api/search-image?query=Fresh%20robusta%20coffee%20beans%20in%20traditional%20Vietnamese%20woven%20basket%2C%20green%20coffee%20cherries%2C%20simple%20rural%20background%20with%20morning%20sunlight%2C%20authentic%20Vietnamese%20coffee%20farm%20setting%2C%20natural%20organic%20appearance&width=300&height=300&seq=coffee001&orientation=squarish',
      timeAgo: '2 ngày trước',
      hashtag: '#SanPhamDiaPhuong',
      description: 'Cà phê Robusta loại 1, thu hoạch tháng 11, hạt đều đẹp'
    }
  ];

  const categories = [
    {
      title: 'Sản phẩm',
      icon: 'ri-plant-line',
      description: 'Nông sản, thực phẩm sạch địa phương',
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      hashtag: '#SanPhamDiaPhuong',
      image: 'https://readdy.ai/api/search-image?query=Traditional%20Vietnamese%20vegetable%20basket%20with%20fresh%20local%20produce%2C%20rural%20market%20setting%2C%20green%20leafy%20vegetables%2C%20tomatoes%2C%20herbs%2C%20natural%20woven%20basket%2C%20morning%20sunlight%2C%20authentic%20countryside%20atmosphere&width=400&height=300&seq=vegetables1&orientation=landscape'
    },
    {
      title: 'Bất động sản',
      icon: 'ri-home-4-line',
      description: 'Đất vườn, nhà cửa, cho thuê nông thôn',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      hashtag: '#BatDongSanNongThon',
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20rural%20farmland%20with%20traditional%20house%2C%20green%20rice%20fields%2C%20coconut%20palm%20trees%2C%20peaceful%20countryside%20landscape%2C%20clear%20blue%20sky%2C%20authentic%20rural%20property%20setting&width=400&height=300&seq=realestate1&orientation=landscape'
    },
    {
      title: 'Tuyển dụng',
      icon: 'ri-briefcase-line',
      description: 'Tìm việc, thuê nhân công trong nhiều lĩnh vực',
      color: 'bg-indigo-50 border-indigo-200',
      iconColor: 'text-indigo-600',
      hashtag: '#TuyenDungNongNghiep',
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20agricultural%20workers%20in%20coffee%20plantation%2C%20farmers%20working%20together%2C%20rural%20employment%2C%20traditional%20farming%20community%2C%20people%20collaborating%20in%20countryside%20setting&width=400&height=300&seq=jobs1&orientation=landscape'
    },
    {
      title: 'Giá thị trường',
      icon: 'ri-line-chart-line',
      description: 'Cập nhật giá cà phê, hồ tiêu, nông sản',
      color: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
      hashtag: '#GiaThiTruong',
      image: 'https://readdy.ai/api/search-image?query=Coffee%20and%20pepper%20price%20chart%20display%2C%20Vietnamese%20agricultural%20market%20data%2C%20coffee%20beans%2C%20black%20pepper%20corns%2C%20price%20graphs%2C%20rural%20market%20analysis%2C%20natural%20lighting&width=400&height=300&seq=market1&orientation=landscape'
    },
    {
      title: 'Diễn đàn',
      icon: 'ri-chat-3-line',
      description: 'Trao đổi kinh nghiệm, hỏi đáp cộng đồng',
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      hashtag: '#DienDanCongDong',
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20farmers%20discussing%20and%20sharing%20knowledge%2C%20rural%20community%20meeting%2C%20traditional%20setting%2C%20people%20talking%20and%20exchanging%20ideas%2C%20friendly%20atmosphere&width=400&height=300&seq=forum1&orientation=landscape'
    },
    {
      title: 'Quảng cáo',
      icon: 'ri-megaphone-line',
      description: 'Khai trương, khuyến mãi, dịch vụ mới',
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      hashtag: '#QuangCaoKhaiTruong',
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20business%20grand%20opening%20celebration%20with%20promotional%20banners%2C%20colorful%20decorations%2C%20new%20store%20launch%2C%20festive%20atmosphere%2C%20traditional%20business%20opening%20ceremony&width=400&height=300&seq=ads1&orientation=landscape'
    }
  ];

  const featuredPosts = [
    {
      id: 1,
      title: 'Cần thuê 5 người thu hoạch cà phê',
      category: 'Tuyển dụng',
      urgency: '350,000đ/ngày',
      location: 'Vườn cà phê Nhân Cơ',
      timeAgo: '30 phút trước',
      hashtag: '#TuyenDungNongNghiep',
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20coffee%20harvest%20workers%20picking%20coffee%20beans%20in%20plantation%2C%20traditional%20farming%2C%20rural%20setting%2C%20people%20working%20together%2C%20authentic%20agricultural%20scene&width=300&height=200&seq=coffeejob1&orientation=landscape',
      link: '/jobs',
      isVip: true,
      vipType: 'premium',
      viewCount: 156,
      contactCount: 23
    },
    {
      id: 2,
      title: 'Giá cà phê tăng mạnh do thời tiết khô hạn',
      category: 'Tin tức',
      urgency: 'Tin nóng',
      location: 'Toàn khu vực',
      timeAgo: '45 phút trước',
      hashtag: '#GiaThiTruong',
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20coffee%20price%20increase%20news%20display%2C%20coffee%20beans%2C%20price%20charts%2C%20drought%20effects%20on%20coffee%20plantation%2C%20news%20report%20style&width=300&height=200&seq=news1&orientation=landscape',
      link: '/market-prices',
      isVip: false,
      viewCount: 89,
      contactCount: 5
    },
    {
      id: 3,
      title: 'Cà phê Robusta loại 1 - Thu hoạch tháng 11',
      category: 'Nông sản',
      urgency: '45,000đ/kg',
      location: 'Xã Nhân Cơ, Kon Tum',
      timeAgo: '2 giờ trước',
      hashtag: '#SanPhamDiaPhuong',
      image: 'https://readdy.ai/api/search-image?query=Fresh%20robusta%20coffee%20beans%20in%20traditional%20Vietnamese%20woven%20basket%2C%20green%20coffee%20cherries%2C%20simple%20rural%20background%20with%20morning%20sunlight%2C%20authentic%20Vietnamese%20coffee%20farm%20setting%2C%20natural%20organic%20appearance&width=300&height=200&seq=coffee1&orientation=landscape',
      link: '/products',
      isVip: true,
      vipType: 'vip',
      viewCount: 234,
      contactCount: 45
    },
    {
      id: 4,
      title: 'Đất vườn 2000m² mặt tiền đường liên xã',
      category: 'Bất động sản',
      urgency: '450 triệu',
      location: 'Đường Nhân Cơ - Đăk Tô',
      timeAgo: '5 giờ trước',
      hashtag: '#BatDongSanNongThon',
      image: 'https://readdy.ai/api/search-image?query=Rural%20Vietnamese%20farmland%20plot%20with%20road%20frontage%2C%20green%20fields%2C%20coconut%20palm%20trees%2C%20traditional%20Vietnamese%20village%20in%20background%2C%20peaceful%20countryside%20landscape%2C%20clear%20blue%20sky&width=300&height=200&seq=land1&orientation=landscape',
      link: '/real-estate',
      isVip: true,
      vipType: 'hot',
      viewCount: 178,
      contactCount: 32
    }
  ];

  const marketPrices = [
    { product: 'Cà phê Robusta', price: '45,000đ/kg', change: '+2%', trend: 'up' },
    { product: 'Hồ tiêu đen', price: '85,000đ/kg', change: '-1%', trend: 'down' },
    { product: 'Cao su khô', price: '28,000đ/kg', change: '+3%', trend: 'up' },
    { product: 'Lúa tẻ', price: '8,500đ/kg', change: '0%', trend: 'stable' }
  ];

  const news = [
    {
      title: 'Giá cà phê tăng mạnh do thời tiết khô hạn',
      time: '30 phút trước',
      category: 'Thị trường',
      link: '/market-prices'
    },
    {
      title: 'Cần thuê 10 người thu hoạch cà phê tại Nhân Cơ',
      time: '1 giờ trước',
      category: 'Tuyển dụng',
      link: '/jobs'
    },
    {
      title: 'Khai trương cửa hàng nông sản sạch Green Farm',
      time: '2 giờ trước',
      category: 'Quảng cáo',
      link: '/advertisements'
    }
  ];

  // Dữ liệu tìm kiếm theo hashtag
  const searchResultsByHashtag = {
    '#TuyenDungNongNghiep': [
      {
        title: 'Cần thuê 5 người thu hoạch cà phê',
        price: '350,000đ/ngày',
        location: 'Vườn cà phê Nhân Cơ',
        image: 'https://readdy.ai/api/search-image?query=Vietnamese%20coffee%20harvest%20workers%20picking%20coffee%20beans%20in%20plantation%2C%20traditional%20farming%2C%20rural%20setting%2C%20people%20working%20together%2C%20authentic%20agricultural%20scene&width=300&height=200&seq=coffeejob1&orientation=landscape',
        category: 'Tuyển dụng',
        time: '30 phút trước',
        hashtag: '#TuyenDungNongNghiep'
      },
      {
        title: 'Tìm việc làm thợ xây có kinh nghiệm',
        price: '400,000đ/ngày',
        location: 'Sẵn sàng đi xa trong xã',
        image: 'https://readdy.ai/api/search-image?query=Vietnamese%20construction%20worker%20portrait%20with%20tools%2C%20experienced%20builder%2C%20rural%20construction%20site%2C%20professional%20appearance%2C%20traditional%20work%20clothes&width=300&height=200&seq=builder1&orientation=landscape',
        category: 'Tuyển dụng',
        time: '1 giờ trước',
        hashtag: '#TuyenDungNongNghiep'
      },
      {
        title: 'Cần người dọn vệ sinh nhà cửa',
        price: '200,000đ/lần',
        location: 'Trung tâm xã Nhân Cơ',
        image: 'https://readdy.ai/api/search-image?query=Vietnamese%20house%20cleaning%20service%2C%20woman%20cleaning%20traditional%20rural%20house%2C%20domestic%20work%2C%20clean%20organized%20home%20interior%2C%20professional%20cleaning&width=300&height=200&seq=cleaning1&orientation=landscape',
        category: 'Tuyển dụng',
        time: '2 giờ trước',
        hashtag: '#TuyenDungNongNghiep'
      }
    ],
    '#SanPhamDiaPhuong': [
      {
        title: 'Cà phê Robusta loại 1 - Thu hoạch tháng 11',
        price: '45,000đ/kg',
        location: 'Xã Nhân Cơ, Kon Tum',
        image: 'https://readdy.ai/api/search-image?query=Fresh%20robusta%20coffee%20beans%20in%20traditional%20Vietnamese%20woven%20basket%2C%20green%20coffee%20cherries%2C%20simple%20rural%20background%20with%20morning%20sunlight%2C%20authentic%20Vietnamese%20coffee%20farm%20setting%2C%20natural%20organic%20appearance&width=300&height=200&seq=coffee1&orientation=landscape',
        category: 'Nông sản',
        time: '2 giờ trước',
        hashtag: '#SanPhamDiaPhuong'
      },
      {
        title: 'Rau xanh hữu cơ tươi ngon',
        price: '35,000đ/kg',
        location: 'Vườn rau Nhân Cơ',
        image: 'https://readdy.ai/api/search-image?query=Fresh%20organic%20green%20vegetables%20leafy%20greens%20in%20basket%2C%20farm%20fresh%20produce%2C%20natural%20lighting%2C%20clean%20background%2C%20healthy%20food%20photography&width=300&height=200&seq=vegetables2&orientation=landscape',
        category: 'Nông sản',
        time: '4 giờ trước',
        hashtag: '#SanPhamDiaPhuong'
      },
      {
        title: 'Gạo Tám Xoan thơm ngon',
        price: '25,000đ/kg',
        location: 'An Giang',
        image: 'https://readdy.ai/api/search-image?query=Premium%20Vietnamese%20rice%20grains%20in%20white%20cloth%20bag%2C%20simple%20clean%20background%2C%20product%20photography%20style%2C%20natural%20lighting%2C%20minimalist%20composition&width=300&height=200&seq=rice2&orientation=landscape',
        category: 'Nông sản',
        time: '6 giờ trước',
        hashtag: '#SanPhamDiaPhuong'
      }
    ],
    '#BatDongSanNongThon': [
      {
        title: 'Đất vườn 2000m² mặt tiền đường liên xã',
        price: '450 triệu',
        location: 'Đường Nhân Cơ - Đăk Tô',
        image: 'https://readdy.ai/api/search-image?query=Rural%20Vietnamese%20farmland%20plot%20with%20road%20frontage%2C%20green%20fields%2C%20coconut%20palm%20trees%2C%20traditional%20Vietnamese%20village%20in%20background%2C%20peaceful%20countryside%20landscape%2C%20clear%20blue%20sky&width=300&height=200&seq=land1&orientation=landscape',
        category: 'Bất động sản',
        time: '5 giờ trước',
        hashtag: '#BatDongSanNongThon'
      },
      {
        title: 'Nhà cấp 4 có vườn 500m²',
        price: '280 triệu',
        location: 'Trung tâm xã Nhân Cơ',
        image: 'https://readdy.ai/api/search-image?query=Traditional%20Vietnamese%20rural%20house%20with%20garden%2C%20single%20story%20home%2C%20green%20yard%2C%20peaceful%20countryside%20setting%2C%20authentic%20village%20architecture&width=300&height=200&seq=house1&orientation=landscape',
        category: 'Bất động sản',
        time: '1 ngày trước',
        hashtag: '#BatDongSanNongThon'
      },
      {
        title: 'Phòng trọ cho thuê gần chợ',
        price: '800,000đ/tháng',
        location: 'Gần chợ Nhân Cơ',
        image: 'https://readdy.ai/api/search-image?query=Simple%20rental%20room%20in%20Vietnamese%20rural%20area%2C%20clean%20interior%2C%20basic%20furniture%2C%20affordable%20housing%2C%20countryside%20accommodation&width=300&height=200&seq=room1&orientation=landscape',
        category: 'Bất động sản',
        time: '2 ngày trước',
        hashtag: '#BatDongSanNongThon'
      }
    ],
    '#GiaThiTruong': [
      {
        title: 'Giá cà phê tăng mạnh do thời tiết khô hạn',
        price: 'Tin nóng',
        location: 'Toàn khu vực',
        image: 'https://readdy.ai/api/search-image?query=Vietnamese%20coffee%20price%20increase%20news%20display%2C%20coffee%20beans%2C%20price%20charts%2C%20drought%20effects%20on%20coffee%20plantation%2C%20news%20report%20style&width=300&height=200&seq=news1&orientation=landscape',
        category: 'Tin tức',
        time: '45 phút trước',
        hashtag: '#GiaThiTruong'
      },
      {
        title: 'Hồ tiêu đen giá ổn định tuần này',
        price: 'Thông tin',
        location: 'Thị trường địa phương',
        image: 'https://readdy.ai/api/search-image?query=Black%20pepper%20price%20stability%20news%2C%20pepper%20corns%2C%20market%20analysis%2C%20Vietnamese%20spice%20trade%20information&width=300&height=200&seq=pepper1&orientation=landscape',
        category: 'Tin tức',
        time: '2 giờ trước',
        hashtag: '#GiaThiTruong'
      },
      {
        title: 'Cao su khô tăng giá nhẹ',
        price: 'Cập nhật',
        location: 'Khu vực trồng cao su',
        image: 'https://readdy.ai/api/search-image?query=Rubber%20price%20increase%20news%2C%20dried%20rubber%20sheets%2C%20plantation%20background%2C%20Vietnamese%20agricultural%20market%20update&width=300&height=200&seq=rubber1&orientation=landscape',
        category: 'Tin tức',
        time: '4 giờ trước',
        hashtag: '#GiaThiTruong'
      }
    ]
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleHashtagClick = (hashtag) => {
    setSearchQuery(hashtag);
    setShowSearchResults(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Lấy kết quả tìm kiếm dựa trên hashtag
  const getSearchResults = () => {
    const normalizedQuery = searchQuery.toLowerCase().replace(/\s+/g, '');
    
    // Kiểm tra hashtag chính xác
    for (const [key, results] of Object.entries(searchResultsByHashtag)) {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
      if (normalizedQuery === normalizedKey || normalizedQuery === normalizedKey.substring(1)) {
        return results;
      }
    }
    
    // Tìm kiếm theo từ khóa trong hashtag
    if (normalizedQuery.includes('tuyendung') || normalizedQuery.includes('vieclam')) {
      return searchResultsByHashtag['#TuyenDungNongNghiep'];
    }
    if (normalizedQuery.includes('sanphamdiaphuong') || normalizedQuery.includes('sanpham')) {
      return searchResultsByHashtag['#SanPhamDiaPhuong'];
    }
    if (normalizedQuery.includes('batdongsannongthon') || normalizedQuery.includes('batdongsan')) {
      return searchResultsByHashtag['#BatDongSanNongThon'];
    }
    if (normalizedQuery.includes('giathitruong') || normalizedQuery.includes('gia')) {
      return searchResultsByHashtag['#GiaThiTruong'];
    }
    
    // Mặc định trả về kết quả sản phẩm địa phương
    return searchResultsByHashtag['#SanPhamDiaPhuong'];
  };

  const searchResults = getSearchResults();

  // Cập nhật logic tìm kiếm sản phẩm
  const filteredProducts = searchQuery 
    ? mockProducts.filter(product => {
        const searchLower = searchQuery.toLowerCase().trim();
        const titleMatch = product.title.toLowerCase().includes(searchLower);
        const categoryMatch = product.category.toLowerCase().includes(searchLower);
        const locationMatch = product.location.toLowerCase().includes(searchLower);
        const hashtagMatch = product.hashtag.toLowerCase().includes(searchLower);
        const descriptionMatch = product.description && product.description.toLowerCase().includes(searchLower);
        return titleMatch || categoryMatch || locationMatch || hashtagMatch || descriptionMatch;
      }).slice(0, 6)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section 
        className="relative py-12 sm:py-16 lg:py-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/chonhanco.jpg')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6">
            Chợ Nhân Cơ
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl mb-2 lg:mb-4 text-gray-200">
            Kết nối giao thương, gắn kết cộng đồng
          </p>
          
          <p className="text-base lg:text-lg mb-6 lg:mb-8 text-gray-300">
            Nền tảng mua bán và trao đổi thông tin cho cộng đồng nông thôn
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, dịch vụ, hashtag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-gray-900 rounded-full text-base lg:text-lg focus:outline-none focus:ring-4 focus:ring-green-300"
                suppressHydrationWarning={true}
              />
              <button 
                onClick={handleSearch}
                className="absolute right-1 sm:right-2 top-1 sm:top-2 bg-green-600 text-white p-2 sm:p-3 rounded-full hover:bg-green-700 transition-colors cursor-pointer"
                suppressHydrationWarning={true}
              >
                <i className="ri-search-line text-base lg:text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchQuery && (
        <section className="py-8 lg:py-16 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6 lg:mb-8">
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Kết quả tìm kiếm cho "{searchQuery}"
                </h3>
                <p className="text-gray-600">
                  {filteredProducts.length > 0 
                    ? `Tìm thấy ${filteredProducts.length} kết quả${filteredProducts.length === 6 ? ' (hiển thị 6 đầu tiên)' : ''}`
                    : 'Không tìm thấy kết quả nào'
                  }
                </p>
              </div>
              <button 
                onClick={clearSearch}
                className="text-gray-600 hover:text-gray-800 cursor-pointer p-2"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden cursor-pointer border border-gray-200" data-product-shop>
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-40 sm:h-48 object-cover object-top"
                      />
                      <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                          <span className="text-gray-500 text-sm">{product.timeAgo}</span>
                        </div>
                        <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.title}
                        </h4>
                        <p className="text-lg lg:text-2xl font-bold text-green-600 mb-2">
                          {product.price}
                        </p>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <i className="ri-map-pin-line text-gray-400 mr-1"></i>
                          <span className="truncate">{product.location}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer">
                          {product.hashtag}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredProducts.length === 6 && (
                  <div className="text-center mt-8">
                    <Link 
                      href={`/products?search=${encodeURIComponent(searchQuery)}`}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer"
                    >
                      Xem tất cả kết quả tìm kiếm
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <i className="ri-search-line text-gray-300 text-6xl mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                <p className="text-gray-600 mb-6">
                  Thử tìm kiếm với từ khóa khác hoặc duyệt qua các danh mục sản phẩm
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Nông sản', 'Thực phẩm', 'Nhà ở', 'Đất nền', 'Tuyển dụng'].map(keyword => (
                    <button
                      key={keyword}
                      onClick={() => setSearchQuery(keyword)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm cursor-pointer"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-8 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-4">Danh mục nổi bật</h3>
            <p className="text-gray-600">Chọn danh mục phù hợp để tìm kiếm hoặc đăng tin</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={
                  category.title === 'Sản phẩm' ? '/products' :
                  category.title === 'Bất động sản' ? '/real-estate' :
                  category.title === 'Tuyển dụng' ? '/jobs' :
                  category.title === 'Giá thị trường' ? '/market-prices' :
                  category.title === 'Diễn đàn' ? '/forum' :
                  category.title === 'Quảng cáo' ? '/advertisements' : '/'
                }
                className={`${category.color} border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group block`}
              >
                <div className="relative h-24 sm:h-32 lg:h-48">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className={`absolute top-2 left-2 lg:top-3 lg:left-3 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white rounded-lg ${category.iconColor}`}>
                    <i className={`${category.icon} text-base sm:text-lg lg:text-2xl`}></i>
                  </div>
                </div>
                <div className="p-3 sm:p-4 lg:p-6">
                  <h4 className="text-sm sm:text-base lg:text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors mb-1 sm:mb-2">
                    {category.title}
                  </h4>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{category.description}</p>
                  <button
                    onClick={() => handleHashtagClick(category.hashtag)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm cursor-pointer"
                    suppressHydrationWarning={true}
                  >
                    {category.hashtag}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-8 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 lg:mb-12">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Tin đăng nổi bật</h3>
              <p className="text-gray-600 text-sm lg:text-base">Những sản phẩm và dịch vụ được quan tâm nhiều nhất</p>
            </div>
            <Link href="/products" className="text-green-600 hover:text-green-700 font-medium cursor-pointer text-sm lg:text-base">
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {featuredItems.length === 0 ? (
              // Skeleton loading
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              featuredItems.map((post) => {
                const link = post._type === 'product' ? `/products/${post.id}`
                  : post._type === 'real-estate' ? `/real-estate/${post.id}`
                  : `/jobs/${post.id}`;
                const categoryLabel = post._type === 'product' ? 'Sản phẩm'
                  : post._type === 'real-estate' ? 'Bất động sản' : 'Tuyển dụng';
                const categoryColor = post._type === 'product' ? 'bg-green-100 text-green-800'
                  : post._type === 'real-estate' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800';
                const priceText = post._type === 'product'
                  ? `${Number(post.price).toLocaleString('vi-VN')}đ/${post.unit}`
                  : post._type === 'real-estate'
                  ? (Number(post.price) >= 1e9 ? (Number(post.price)/1e9).toFixed(1)+' tỷ' : (Number(post.price)/1e6).toFixed(0)+' triệu')
                  : post.salary || 'Thỏa thuận';
                const imgUrl = post.images?.[0]?.url || post.images?.[0] || null;
                const timeAgo = post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : '';

                return (
                  <Link key={post.id} href={link}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer block group relative ${post.isVip ? 'transform hover:scale-105' : ''}`}>
                    {post.isVip && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <i className="ri-vip-crown-fill"></i> VIP
                        </div>
                      </div>
                    )}
                    <div className="relative h-40 sm:h-48 bg-gray-100">
                      {imgUrl ? (
                        <img src={imgUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className={`text-5xl text-gray-300 ${post._type === 'product' ? 'ri-plant-line' : post._type === 'real-estate' ? 'ri-home-4-line' : 'ri-briefcase-line'}`}></i>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColor}`}>{categoryLabel}</span>
                        <span className="text-gray-400 text-xs">{timeAgo}</span>
                      </div>
                      <h4 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">{post.title}</h4>
                      <p className="text-base lg:text-lg font-bold text-green-600 mb-1">{priceText}</p>
                      {(post.location || post.address) && (
                        <div className="flex items-center text-gray-500 text-xs">
                          <i className="ri-map-pin-line mr-1"></i>
                          <span className="truncate">{post.location || post.address}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* VIP Benefits Banner */}
          <div className="mt-12 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-8 text-white text-center">
            <div className="flex items-center justify-center mb-4">
              <i className="ri-vip-crown-2-fill text-4xl mr-3"></i>
              <h3 className="text-2xl font-bold">Nâng cấp tin đăng VIP</h3>
            </div>
            <p className="text-lg mb-6 opacity-90">
              Tin của bạn sẽ được ưu tiên hiển thị, thiết kế nổi bật và thu hút nhiều người xem hơn
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/20 rounded-lg p-4">
                <i className="ri-arrow-up-circle-fill text-3xl mb-2"></i>
                <h4 className="font-semibold mb-1">Ưu tiên hiển thị</h4>
                <p className="text-sm opacity-80">Tin của bạn luôn ở vị trí đầu tiên</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <i className="ri-eye-fill text-3xl mb-2"></i>
                <h4 className="font-semibold mb-1">Tăng lượt xem</h4>
                <p className="text-sm opacity-80">Nhiều người xem hơn 300% so với tin thường</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <i className="ri-phone-fill text-3xl mb-2"></i>
                <h4 className="font-semibold mb-1">Nhiều liên hệ</h4>
                <p className="text-sm opacity-80">Khách hàng dễ dàng liên hệ với bạn hơn</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing" className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
                Xem bảng giá VIP
              </Link>
              <Link href="/products/create" className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors cursor-pointer">
                Đăng tin VIP ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Market Prices */}
      <section className="py-8 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 lg:mb-12">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Giá thị trường hôm nay</h3>
              <p className="text-gray-600 text-sm lg:text-base">Cập nhật giá nông sản mới nhất trong khu vực</p>
            </div>
            <Link href="/market-prices" className="text-green-600 hover:text-green-700 font-medium cursor-pointer text-sm lg:text-base">
              Xem chi tiết →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {(liveMarketPrices.length > 0 ? liveMarketPrices : [
              { productName: 'Cà phê Robusta', price: 45000, unit: 'kg', trend: 'up', changePercent: 2 },
              { productName: 'Hồ tiêu đen', price: 85000, unit: 'kg', trend: 'down', changePercent: -1 },
              { productName: 'Cao su khô', price: 28000, unit: 'kg', trend: 'up', changePercent: 3 },
              { productName: 'Lúa tẻ', price: 8500, unit: 'kg', trend: 'stable', changePercent: 0 },
            ]).map((item: any, index: number) => {
              const trend = item.trend || (item.changePercent > 0 ? 'up' : item.changePercent < 0 ? 'down' : 'stable');
              const priceDisplay = item.price ? `${Number(item.price).toLocaleString('vi-VN')}đ/${item.unit || 'kg'}` : item.priceDisplay || '—';
              const changePct = item.changePercent != null ? (item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`) : item.change || '0%';
              return (
                <Link key={index} href="/market-prices" className="bg-gray-50 rounded-xl p-4 lg:p-6 hover:shadow-md hover:bg-white transition-all block">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm lg:text-base">{item.productName || item.product}</h4>
                    <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                      <i className={`${trend === 'up' ? 'ri-arrow-up-line' : trend === 'down' ? 'ri-arrow-down-line' : 'ri-subtract-line'} text-sm`}></i>
                      <span className="text-sm">{changePct}</span>
                    </div>
                  </div>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{priceDisplay}</p>
                  <p className="text-xs text-gray-400 mt-1">Nhấn để xem chi tiết →</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Advertisements */}
      <section className="py-8 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-3 py-1 rounded-full mr-3 align-middle">MỚI</span>
                Quảng cáo & Khuyến mãi
              </h3>
              <p className="text-gray-600 text-sm lg:text-base">Khai trương, ưu đãi và sự kiện nổi bật trong khu vực</p>
            </div>
            <Link href="/advertisements" className="text-orange-500 hover:text-orange-600 font-medium text-sm lg:text-base">
              Xem tất cả →
            </Link>
          </div>

          {featuredAds.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {featuredAds.map((ad: any) => {
                const catColors: any = {
                  KHAI_TRUONG: 'bg-green-100 text-green-700',
                  KHUYEN_MAI: 'bg-red-100 text-red-600',
                  SAN_PHAM_MOI: 'bg-blue-100 text-blue-700',
                  DICH_VU: 'bg-purple-100 text-purple-700',
                  SU_KIEN: 'bg-yellow-100 text-yellow-700',
                  KHAC: 'bg-gray-100 text-gray-600',
                };
                const catLabels: any = {
                  KHAI_TRUONG: 'Khai trương', KHUYEN_MAI: 'Khuyến mãi',
                  SAN_PHAM_MOI: 'Sản phẩm mới', DICH_VU: 'Dịch vụ',
                  SU_KIEN: 'Sự kiện', KHAC: 'Khác',
                };
                const imgUrl = ad.images?.[0] || null;
                return (
                  <Link key={ad.id} href={`/advertisements/${ad.id}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group block border border-gray-100 hover:border-orange-200">
                    {/* Image */}
                    <div className="relative h-44 bg-orange-50 overflow-hidden">
                      {imgUrl ? (
                        <img src={imgUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <i className="ri-megaphone-line text-4xl text-orange-300"></i>
                        </div>
                      )}
                      {ad.isVip && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                          VIP
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catColors[ad.category] || 'bg-gray-100 text-gray-600'}`}>
                          {catLabels[ad.category] || ad.category}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(ad.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-2 mb-1">
                        {ad.title}
                      </h4>
                      {ad.businessName && (
                        <p className="text-sm text-orange-600 font-medium truncate">{ad.businessName}</p>
                      )}
                      {(ad.startDate || ad.endDate) && (
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                          <i className="ri-calendar-event-line text-orange-400"></i>
                          {ad.startDate && new Date(ad.startDate).toLocaleDateString('vi-VN')}
                          {ad.startDate && ad.endDate && ' – '}
                          {ad.endDate && new Date(ad.endDate).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                      {ad.location && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <i className="ri-map-pin-line text-orange-400"></i>
                          {ad.location}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* CTA banner */}
          <div className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div>
              <h4 className="text-lg font-bold mb-1">Muốn quảng bá cửa hàng của bạn?</h4>
              <p className="text-sm text-orange-100">Đăng quảng cáo khai trương, khuyến mãi đến hàng nghìn người trong khu vực</p>
            </div>
            <Link href="/advertisements/create"
              className="flex-shrink-0 bg-white text-orange-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-orange-50 transition-colors text-sm whitespace-nowrap">
              + Đăng quảng cáo ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-8 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-4">Tin tức mới nhất</h3>
            <p className="text-gray-600">Cập nhật thông tin và thông báo quan trọng</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {latestNews.length === 0 ? (
              // Fallback static + skeleton
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 lg:p-6 shadow-sm animate-pulse">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))
            ) : (
              latestNews.map((item: any, index: number) => {
                const catColor = item._type === 'forum' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
                const timeDisplay = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '';
                return (
                  <Link key={index} href={item._link}
                    className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer block group">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${catColor}`}>{item._category}</span>
                      <span className="text-gray-500 text-sm">{timeDisplay}</span>
                    </div>
                    <h4 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 lg:py-14 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">Bắt đầu ngay hôm nay</h3>
          <p className="text-green-100 mb-6 text-sm lg:text-base">Tham gia cộng đồng và kết nối với hàng nghìn người dân</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products/create" className="bg-white text-green-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
              <i className="ri-add-circle-line mr-2"></i>Đăng tin miễn phí
            </Link>
            <Link href="/forum" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
              <i className="ri-chat-3-line mr-2"></i>Tham gia diễn đàn
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <i className="ri-store-2-line text-white text-xl"></i>
                </div>
                <h3 className="font-['Pacifico'] text-2xl text-green-400">Chợ Nhân Cơ</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Kết nối giao thương, gắn kết cộng đồng nông thôn Việt Nam.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/trungnguyenanhtan" className="text-gray-400 hover:text-green-400 cursor-pointer">
                  <i className="ri-facebook-circle-line text-2xl"></i>
                </a>
                <a href="tel:0888317289" className="text-gray-400 hover:text-green-400 cursor-pointer">
                  <i className="ri-phone-line text-2xl"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Danh mục</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-green-400 cursor-pointer">Sản phẩm</Link></li>
                <li><Link href="/real-estate" className="hover:text-green-400 cursor-pointer">Bất động sản</Link></li>
                <li><Link href="/forum" className="hover:text-green-400 cursor-pointer">Diễn đàn</Link></li>
                <li><Link href="/market-prices" className="hover:text-green-400 cursor-pointer">Giá thị trường</Link></li>
                <li><Link href="/advertisements" className="hover:text-green-400 cursor-pointer">Quảng cáo</Link></li>
                <li><Link href="/jobs" className="hover:text-green-400 cursor-pointer">Tuyển dụng</Link></li>
                <li><Link href="/pricing" className="hover:text-green-400 cursor-pointer">Bảng giá</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-2">
                  <i className="ri-phone-line"></i>
                  <span>0888.317.289</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-mail-line"></i>
                  <span>chonhanco41@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-map-pin-line"></i>
                  <span>Xã Nhân Cơ, Lâm Đồng</span>
                </div>
                <div className="mt-4">
                  <h5 className="font-semibold text-white mb-2">Fanpage & Group Facebook</h5>
                  <p className="text-sm text-gray-400">
                    "Chợ Nhân Cơ – Diễn đàn cộng đồng"
                  </p>
                  <a href="https://www.facebook.com/share/g/1Gwg2sziS1/" className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer">
                    Tham gia nhóm Facebook →
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2025 Chợ Nhân Cơ. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
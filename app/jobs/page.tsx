'use client';

import ListPage, { nearParams } from '../components/list/ListPage';
import { jobs as jobsApi } from '../../lib/api';

export default function JobsPage() {
  return (
    <ListPage
      basePath="/jobs"
      subParam="type"
      title="Việc làm tại Nhân Cơ"
      crumb="Việc làm"
      noun="tin tuyển dụng"
      entity="tin tuyển dụng"
      createHref="/jobs/create"
      createLabel="Đăng tin tuyển dụng"
      placeholder="Tìm công việc, nơi làm, kỹ năng..."
      type="job"
      logKind="jobs"
      subCats={[
        { value: '', name: 'Tất cả' },
        { value: 'EMPLOYER', name: 'Tuyển dụng' },
        { value: 'JOB_SEEKER', name: 'Tìm việc' },
        { value: 'Nông nghiệp', name: 'Nông nghiệp' },
        { value: 'Xây dựng', name: 'Xây dựng' },
        { value: 'Dịch vụ', name: 'Dịch vụ' },
        { value: 'Văn phòng', name: 'Văn phòng' },
      ]}
      quickFilters={[
        { value: '', label: 'Tất cả' },
        { value: 'urgent', label: 'Gấp' },
        { value: 'employer', label: 'Tuyển dụng' },
        { value: 'seeker', label: 'Tìm việc' },
        { value: 'near', label: 'Gần bạn' },
        { value: 'today', label: 'Mới hôm nay' },
      ]}
      popular={['Tuyển công nhân', 'Làm vườn thuê', 'Tài xế xe tải', 'Bán hàng', 'Thợ xây', 'Gia sư toán', 'Phụ hồ', 'Bảo vệ']}
      safety="Không đóng phí hay tiền cọc để xin việc, hỏi rõ nơi làm và tiền công trước khi đi."
      matchQuick={(i, q) => q === 'urgent' ? !!i.isUrgent : q === 'employer' ? i.type === 'EMPLOYER' : q === 'seeker' ? i.type === 'JOB_SEEKER' : true}
      load={({ search, sub, quick, sortBy, page, userLoc }) => {
        const p: any = { page, limit: 12, sortBy, ...nearParams(quick, userLoc) };
        const kw = search;
        if (sub === 'EMPLOYER' || sub === 'JOB_SEEKER') p.type = sub;
        else if (sub) p.search = [kw, sub].filter(Boolean).join(' ');
        if (kw && !p.search) p.search = kw;
        if (quick === 'urgent') p.isUrgent = true;
        if (quick === 'employer') p.type = 'EMPLOYER';
        if (quick === 'seeker') p.type = 'JOB_SEEKER';
        return jobsApi.getAll(p);
      }}
    />
  );
}

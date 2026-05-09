import JobDetail from './JobDetail';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return <JobDetail jobId={params.id} />;
}

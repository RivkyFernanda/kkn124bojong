import NewsDetailClient from './NewsDetailClient';

export default function Page({ params }) {
  return <NewsDetailClient id={params.id} />;
}

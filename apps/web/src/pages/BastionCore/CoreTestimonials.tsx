import { testimonialApi } from '@/api/content';
import { useQuery } from '@tanstack/react-query';
import snapshot from './testimonials-snapshot.json';

type Review = { id: string | number; name: string; position?: string; title: string; review?: string; text?: string };
const preferred = [3, 5, 2];
function Quote({ review }: { review: Review }) {
  const position = review.position?.trim();
  return <li><figure className="quote">
    <svg className="ic" aria-hidden="true"><use href="#bc-quote" /></svg>
    <h3 className="quote-title">{review.title.trim()}</h3>
    <blockquote><p style={{ whiteSpace: 'pre-line' }}>{review.text ?? review.review}</p></blockquote>
    <figcaption>{review.name.trim()}<span>{!position || position.toLowerCase() === 'subscriber' ? 'Community Member' : position}</span></figcaption>
  </figure></li>;
}

export default function CoreTestimonials() {
  const { data = snapshot } = useQuery<Review[]>({
    queryKey: ['core-community-testimonials'],
    queryFn: async () => {
      const reviews = await testimonialApi.getAll();
      if (!Array.isArray(reviews)) throw new Error('Invalid testimonial data');
      return reviews.filter((review) => typeof review.name === 'string' && typeof review.title === 'string' && typeof (review.text ?? review.review) === 'string');
    },
    initialData: snapshot,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const ordered = [...data].sort((a, b) => {
    const rank = (id: string | number) => { const index = preferred.indexOf(Number(id)); return index < 0 ? preferred.length : index; };
    return rank(a.id) - rank(b.id);
  });
  if (!ordered.length) return <p className="testimonial-note">Community feedback will appear here when available.</p>;
  return <>
    <ul className="quotes">{ordered.slice(0, 3).map((review) => <Quote key={review.id} review={review} />)}</ul>
    {ordered.length > 3 && <details className="more-reviews">
      <summary>Read {ordered.length - 3} more community reviews</summary>
      <ul className="quotes">{ordered.slice(3).map((review) => <Quote key={review.id} review={review} />)}</ul>
    </details>}
    <p className="testimonial-note">Feedback reproduced from the existing Bastion Research website. Individual experiences do not guarantee future outcomes.</p>
  </>;
}

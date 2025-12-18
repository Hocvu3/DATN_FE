import { redirect } from 'next/navigation';

export default function HomePage() {
  // Server-side redirect - instant, no loading screen
  redirect('/documents');
}

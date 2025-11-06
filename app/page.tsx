import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to todos page (will handle auth redirect there)
  redirect('/todos');
}

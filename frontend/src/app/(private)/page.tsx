import { getLessons } from '../../apis/lessons.server';
import HomeClient from './components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialLessons = await getLessons();

  return (
    <HomeClient initialLessons={initialLessons} />
  );
}
